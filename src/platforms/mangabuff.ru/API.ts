import BasePlatformAPI from '../../common/basePlatformAPI';
import config from './config';
import DB from '../../common/DB';

export default class API extends BasePlatformAPI {
  static config = config;
  static link = (slug: string) => `https://mangabuff.ru/manga/${slug}`;

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
        this.fetch(`https://mangabuff.ru/search/suggestions?q=${title}`).then(
          (data) => {
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
    const response = await this.fetch(this.link(slug));
    return {
      chapter: +$(response)
        .find('.hot-chapters__wrapper .hot-chapters__number')
        .eq(0)[0]
        ?.firstChild.nodeValue.trim(),
      lastChapterRead: await DB.get(
        this.config.key,
        slug,
        `lastChapterRead`,
        0,
      ),
    };
  }
}
