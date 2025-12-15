import BasePlatformAPI from '../../common/basePlatformAPI';
import config from './config';
import DB from '../../common/DB';
import type { MangaData, SearchResult } from '../../common/types';

export default class API extends BasePlatformAPI {
  static readonly config = config;
  static readonly link = (slug: string) =>
    `https://inkstory.net/content/${slug}?tab=chapters`;

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
        this.fetch(
          `https://api.inkstory.net/v2/books?search=${title}&ignoreUserScopedContentStatus=true&serviceName=inkstory`,
        ).then((data) => {
          if (!data || !Array.isArray(data)) {
            return null;
          }
          return data.find((book: Record<string, any>) => {
            const altMatch = book.altNames?.some(
              (alt: Record<string, any>) => alt.name === title,
            );
            const nameMatch = Object.values<string>(book.name).some(
              (name) => name === title,
            );
            return altMatch || nameMatch;
          })?.slug;
        }),
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
    const DOM = await this.fetch(
      `https://inkstory.net/content/${slug}?tab=chapters`,
    );

    if (!DOM) {
      return { chapter: 0, lastChapterRead: 0 };
    }

    const tabs = $(DOM).find('astro-island[component-export="FlexibleTabs"]');
    const propsStr = tabs.attr('props');

    if (!propsStr) {
      return { chapter: 0, lastChapterRead: 0 };
    }

    try {
      const propsObj = JSON.parse(propsStr);
      const chapter = propsObj.tabs[1][1][1].counter[1];

      const $parent = $(DOM).find(
        'astro-slot[name="chapters"] > astro-island > div > div:last-child',
      );
      const allChildren = $parent.children().toArray();

      const normalEls = allChildren.filter((el) => {
        return !$(el).hasClass('rounded-full');
      });

      const index = normalEls.findIndex((el) => {
        return $(el).find('svg.text-amber-500').length > 0;
      });

      return {
        chapter,
        lastChapterRead: index > 0 ? chapter - index : 0,
      };
    } catch (e) {
      return { chapter: 0, lastChapterRead: 0 };
    }
  }
}
