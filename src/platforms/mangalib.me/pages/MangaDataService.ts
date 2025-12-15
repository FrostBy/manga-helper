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

    // Check cache first (TTL: 1 hour)
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
        // If not found - open platform homepage
        result = {
          platform: PlatformAPI.config.title,
          platformKey,
          slug: '',
          url: `https://${PlatformAPI.config.domain}`,
          chapter: 0,
          lastChapterRead: 0,
        };
      } else {
        // Add platform title and key
        data.platform = PlatformAPI.config.title;
        data.platformKey = platformKey;
        result = data;
      }

      // Cache for 1 hour
      DB.set(config.key, currentSlug, cacheKey, result, true);
      return result;
    } catch (e: unknown) {
      Logger.error('MangaDataService', `Error searching on ${platformKey}`, e);
      // On error - open platform homepage (don't cache errors)
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
        // Skip current platform
        if (platform === config.key) return null;

        try {
          const data = await apis[platform].search(
            config.key,
            currentSlug,
            titles,
          );

          if (!data) {
            // If not found - open platform homepage
            return {
              platform: apis[platform].config.title,
              platformKey: platform,
              slug: '',
              url: `https://${apis[platform].config.domain}`,
              chapter: 0,
              lastChapterRead: 0,
            } as SearchResult;
          }

          // Add platform title and key
          data.platform = apis[platform].config.title;
          data.platformKey = platform;

          return data;
        } catch (e: unknown) {
          Logger.error('MangaDataService', `Error searching on ${platform}`, e);
          // On error - open platform homepage
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

    // Filter out null (current platform) and sort
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
   * Get manually saved slug for platform
   */
  async getSavedSlug(
    sourceSlug: string,
    platformKey: string,
  ): Promise<string | null> {
    return DB.get(config.key, sourceSlug, platformKey, null);
  }

  /**
   * Save manual slug override for platform
   * Saves permanently without TTL
   */
  async saveSlug(
    sourceSlug: string,
    platformKey: string,
    targetSlug: string,
  ): Promise<void> {
    DB.set(config.key, sourceSlug, platformKey, targetSlug);
  }

  /**
   * Delete manual slug override for platform
   */
  async deleteSlug(sourceSlug: string, platformKey: string): Promise<void> {
    DB.delete(config.key, sourceSlug, platformKey);
  }

  /**
   * Clear cache for platform and re-fetch data
   * Preserves manually saved slug, only clears cached data
   */
  async refreshPlatformData(
    platformKey: string,
    titles: string[],
    currentSlug: string,
  ): Promise<SearchResult> {
    // Get saved slug (manual override) - this should NOT be deleted
    const savedSlug = await this.getSavedSlug(currentSlug, platformKey);

    // If there's a saved slug, invalidate platform's internal cache for it
    if (savedSlug) {
      DB.set(platformKey, savedSlug, 'invalidate', true);
    }

    // Delete MangaDataService's cached search result
    const cacheKey = `search_${platformKey}`;
    DB.delete(config.key, currentSlug, cacheKey);

    // Re-fetch (will use saved slug if exists, otherwise search by titles)
    return this.searchOnSinglePlatform(platformKey, titles, currentSlug);
  }
}
