import BasePlatformAPI from '../../common/basePlatformAPI';
import config from './config';
import DB from '../../common/DB';

export default class API extends BasePlatformAPI {
  static readonly config = config;
  static readonly link = (slug: string) =>
    `https://manga.ovh/content/${slug}?tab=chapters`;

  static async search(platform: string, slug: string, titles: string[]) {
    let websiteSlug = await DB.get(platform, slug, this.config.key);
    if (websiteSlug === false) return false;
    const cache = await DB._getCache(this.config.key, websiteSlug);
    if (cache)
      return this.prepareResponse(
        this.link,
        websiteSlug,
        cache.chapter,
        cache.lastChapterRead,
      );

    if (!websiteSlug) {
      const requests = titles.map((title) =>
        this.fetch(`https://manga.ovh/yamiko/v2/books?search=${title}`).then(
          (data) => {
            return data.find((book: Record<string, any>) => {
              const altMatch = book.altNames?.some(
                (alt: Record<string, any>) => alt.name === title,
              );
              const nameMatch = Object.values(book.name).some(
                (name: string) => name === title,
              );
              return altMatch || nameMatch;
            })?.slug;
          },
        ),
      );
      websiteSlug = (await Promise.all(requests)).filter(Boolean).pop();
    }

    if (websiteSlug) {
      const { chapter, lastChapterRead } = await this.getManga(websiteSlug);
      if (chapter) {
        await DB.set(
          this.config.key,
          websiteSlug,
          'cache',
          {
            chapter,
            lastChapterRead,
          },
          true,
        );
        await DB.set(platform, slug, this.config.key, websiteSlug);
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

  static async getManga(slug: string) {
    const DOM = await this.fetch(
      `https://manga.ovh/content/${slug}?tab=chapters`,
    );

    const tabs = $(DOM).find('astro-island[component-export="FlexibleTabs"]');
    const propsStr = tabs.attr('props');
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
  }
}
