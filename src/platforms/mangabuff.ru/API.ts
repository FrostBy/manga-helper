import BasePlatformAPI from '../../common/basePlatformAPI';
import config from './config';
import DB from '../../common/DB';
import type { MangaData, SearchResult } from '../../common/types';

export default class API extends BasePlatformAPI {
  static config = config;
  static link = (slug: string) => `https://mangabuff.ru/manga/${slug}`;

  static getSlugFromURL(url: string): string {
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes(this.config.domain)) {
        return '';
      }
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return pathParts[1] || '';
    } catch (e) {
      return '';
    }
  }

  static async search(
    platform: string,
    slug: string,
    titles: string[],
  ): Promise<SearchResult | false> {
    let websiteSlug = DB.get(platform, slug, this.config.key, '');
    if (websiteSlug === false) return false;

    const cache = DB._getCache(this.config.key, websiteSlug) as MangaData;

    if (cache)
      return this.prepareResponse(
        this.link,
        websiteSlug,
        cache.chapter,
        cache.lastChapterRead,
      );

    if (!websiteSlug) {
      const requests = titles.map((title) =>
        this.fetch(`https://mangabuff.ru/search/suggestions?q=${title}`).then(
          (data) => {
            if (!data || !Array.isArray(data)) {
              return null;
            }
            const entity = data.find(
              (entity: Record<string, any>) => title === entity.name,
            );
            return entity?.slug;
          },
        ),
      );
      websiteSlug = (await Promise.all(requests)).filter(Boolean).pop();
    }

    if (websiteSlug) {
      const { chapter, lastChapterRead } = await this.getManga(websiteSlug);
      if (chapter) {
        DB.set(
          this.config.key,
          websiteSlug,
          'cache',
          {
            chapter,
            lastChapterRead,
          },
          true,
        );
        DB.set(platform, slug, this.config.key, websiteSlug, true);
        return this.prepareResponse(
          this.link,
          websiteSlug,
          chapter,
          lastChapterRead,
        );
      }
    }

    return DB.set(platform, slug, this.config.key, false, true);
  }

  static async getManga(slug: string): Promise<MangaData> {
    const response = await this.fetch(this.link(slug));

    if (!response) {
      return { chapter: 0, lastChapterRead: 0 };
    }

    const chapterElement = $(response)
      .find('.hot-chapters__wrapper .hot-chapters__number')
      .eq(0)[0];
    const chapterValue = chapterElement?.firstChild?.nodeValue?.trim();

    return {
      chapter: +chapterValue || 0,
      lastChapterRead: DB.get(this.config.key, slug, `lastChapterRead`, 0),
    };
  }
}
