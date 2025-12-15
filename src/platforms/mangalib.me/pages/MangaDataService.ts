import API from '../API';
import config from '../config';
import PlatformManager from '../../../common/PlatformManager';
import { SearchResult } from '../../../common/types';
import { Logger } from '../../../common/Logger';
import DB from '../../../common/DB';

/**
 * Service для работы с данными манги
 * Отвечает за все запросы к API и другим платформам
 */
export class MangaDataService {
  constructor(private platformManager: PlatformManager) {}

  /**
   * Получить все данные о манге
   */
  async fetchMangaData(slug: string) {
    const [chapters, meta, bookmark] = await Promise.all([
      API.getChapters(slug),
      API.getMeta(slug),
      API.getBookmark(slug),
    ]);

    const lastChapterRead = +(bookmark?.data?.item?.number || 0);

    const titles = [
      meta?.rus_name,
      meta?.name,
      meta?.eng_name,
      ...(meta?.otherNames || []),
    ].filter(Boolean) as string[];

    return {
      chapters,
      meta,
      lastChapterRead,
      titles,
    };
  }

  /**
   * Поиск манги на одной платформе с кешированием
   * Возвращает данные из кеша если есть, иначе делает запрос
   */
  async searchOnSinglePlatform(
    platformKey: string,
    titles: string[],
    currentSlug: string,
  ): Promise<SearchResult> {
    const apis = this.platformManager.getPlatforms();
    const PlatformAPI = apis[platformKey];

    if (!PlatformAPI) {
      throw new Error(`Platform ${platformKey} not found`);
    }

    // Сначала проверяем кеш (TTL: 1 час)
    const cacheKey = `search_${platformKey}`;
    const cached = DB.get<SearchResult | null>(
      config.key,
      currentSlug,
      cacheKey,
      null,
    );
    if (cached) {
      Logger.debug('MangaDataService', `Cache hit for ${platformKey}`);
      return cached;
    }

    try {
      const data = await PlatformAPI.search(config.key, currentSlug, titles);

      let result: SearchResult;

      if (!data) {
        // Не найдено - открываем главную платформы
        result = {
          platform: PlatformAPI.config.title,
          platformKey,
          slug: '',
          url: `https://${PlatformAPI.config.domain}`,
          chapter: 0,
          lastChapterRead: 0,
        };
      } else {
        // Добавляем название и ключ платформы
        data.platform = PlatformAPI.config.title;
        data.platformKey = platformKey;
        result = data;
      }

      // Кешируем на 1 час
      DB.set(config.key, currentSlug, cacheKey, result, true);
      return result;
    } catch (e: unknown) {
      Logger.error('MangaDataService', `Error searching on ${platformKey}`, e);
      // При ошибке - открываем главную платформы (ошибки не кешируем)
      return {
        platform: PlatformAPI.config.title,
        platformKey,
        slug: '',
        url: `https://${PlatformAPI.config.domain}`,
        chapter: 0,
        lastChapterRead: 0,
      };
    }
  }

  /**
   * Поиск манги на других платформах (deprecated - используй searchOnSinglePlatform)
   */
  async searchOnPlatforms(
    titles: string[],
    currentSlug: string,
  ): Promise<SearchResult[]> {
    const apis = this.platformManager.getPlatforms();

    const results = await Promise.all(
      Object.keys(apis).map(async (platform) => {
        // Пропускаем текущую платформу
        if (platform === config.key) return null;

        try {
          const data = await apis[platform].search(
            config.key,
            currentSlug,
            titles,
          );

          if (!data) {
            // Не найдено - открываем главную платформы
            return {
              platform: apis[platform].config.title,
              platformKey: platform,
              slug: '',
              url: `https://${apis[platform].config.domain}`,
              chapter: 0,
              lastChapterRead: 0,
            } as SearchResult;
          }

          // Добавляем название и ключ платформы
          data.platform = apis[platform].config.title;
          data.platformKey = platform;

          return data;
        } catch (e: unknown) {
          Logger.error('MangaDataService', `Error searching on ${platform}`, e);
          // При ошибке - открываем главную платформы
          return {
            platform: apis[platform].config.title,
            platformKey: platform,
            slug: '',
            url: `https://${apis[platform].config.domain}`,
            chapter: 0,
            lastChapterRead: 0,
          } as SearchResult;
        }
      }),
    );

    // Фильтруем null (текущая платформа) и сортируем
    const validResults = results.filter(
      (item): item is SearchResult => item !== null,
    );

    validResults.sort((a, b) => {
      if (!b.chapter) return -1;
      return b.chapter - a.chapter || b.lastChapterRead - a.lastChapterRead;
    });

    return validResults;
  }

  /**
   * Получить вручную сохранённый slug для платформы
   */
  async getSavedSlug(
    sourceSlug: string,
    platformKey: string,
  ): Promise<string | null> {
    return DB.get(config.key, sourceSlug, platformKey, null);
  }

  /**
   * Сохранить ручной slug для платформы
   * Сохраняется без TTL (перманентно)
   */
  async saveSlug(
    sourceSlug: string,
    platformKey: string,
    targetSlug: string,
  ): Promise<void> {
    DB.set(config.key, sourceSlug, platformKey, targetSlug);
    // Чистим кеш поиска чтобы перезапросить с новым slug
    const cacheKey = `search_${platformKey}`;
    DB.delete(config.key, sourceSlug, cacheKey);
  }

  /**
   * Удалить ручной slug для платформы
   */
  async deleteSlug(sourceSlug: string, platformKey: string): Promise<void> {
    DB.delete(config.key, sourceSlug, platformKey);
    const cacheKey = `search_${platformKey}`;
    DB.delete(config.key, sourceSlug, cacheKey);
  }

  /**
   * Очистить кеш платформы и перезапросить данные
   * Сохраняет ручной slug, чистит только кеш
   */
  async refreshPlatformData(
    platformKey: string,
    titles: string[],
    currentSlug: string,
  ): Promise<SearchResult> {
    // Получаем сохранённый slug (ручной) - его НЕ удаляем
    const savedSlug = await this.getSavedSlug(currentSlug, platformKey);

    // Если есть сохранённый slug, инвалидируем внутренний кеш платформы
    if (savedSlug) {
      DB.set(platformKey, savedSlug, 'invalidate', true);
    }

    // Удаляем кеш поиска MangaDataService
    const cacheKey = `search_${platformKey}`;
    DB.delete(config.key, currentSlug, cacheKey);

    // Перезапрашиваем (использует сохранённый slug если есть, иначе ищет по названиям)
    return this.searchOnSinglePlatform(platformKey, titles, currentSlug);
  }
}
