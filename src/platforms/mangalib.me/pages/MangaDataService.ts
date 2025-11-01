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
   * Поиск манги на других платформах
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
}
