import BasePlatformAPI from '../../common/basePlatformAPI';
import config from './config';
import { Logger } from '../../common/Logger';
import type { MangaData, SearchResult } from '../../common/types';
import DB from '../../common/DB';

export default class API extends BasePlatformAPI {
  static readonly config = config;
  static readonly link = (slug: string) =>
    `https://senkuro.me/manga/${slug}/chapters`;

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

    let slugs: string[] = [websiteSlug];

    if (!websiteSlug) {
      const response = await this.fetch('https://api.senkuro.me/graphql', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          extensions: {
            persistedQuery: {
              sha256Hash:
                'e64937b4fc9c921c2141f2995473161bed921c75855c5de934752392175936bc',
              version: 1,
            },
          },
          operationName: 'search',
          variables: { query: titles[0], type: 'MANGA' },
        }),
      });

      if (!response || !response.data?.search?.edges) {
        return false;
      }

      const tempSlugs: string[] = [];
      let entity = response.data.search.edges.find(
        (entity: Record<string, any>) => {
          tempSlugs.push(entity.node.slug);
          const entityTitles = [
            entity.node.originalName,
            ...entity.node.titles.map(
              (title: Record<string, any>) => title.content,
            ),
          ];
          return entityTitles.filter((value) => titles.includes(value)).length;
        },
      );

      slugs = entity?.node.slug ? [entity.node.slug] : tempSlugs;
    }

    for (const entitySlug of slugs) {
      const data = await this.getManga(entitySlug);
      Logger.debug('SenkuroAPI', 'Manga data fetched', data);

      if (!data || !data.manga) {
        continue;
      }

      if (
        data.manga.alternativeNames?.some((name: Record<string, any>) =>
          titles.includes(name.content),
        )
      ) {
        DB.set(
          this.config.key,
          data.manga.slug,
          'cache',
          {
            chapter: data.chapter,
            lastChapterRead: data.lastChapterRead,
          },
          true,
        );

        DB.set(platform, slug, this.config.key, data.manga.slug, true);

        return this.prepareResponse(
          this.link,
          data.manga.slug,
          data.chapter,
          data.lastChapterRead,
        );
      }
    }

    return DB.set(platform, slug, this.config.key, false, true);
  }

  static async getManga(
    slug: string,
  ): Promise<(MangaData & { manga: any }) | undefined> {
    let headers = {};

    const token = this.getToken();
    if (token) headers = { authorization: `Bearer ${token}` };

    const response = await this.fetch('https://api.senkuro.me/graphql', {
      method: 'POST',
      body: JSON.stringify({
        extensions: {
          persistedQuery: {
            sha256Hash:
              '6d8b28abb9a9ee3199f6553d8f0a61c005da8f5c56a88ebcf3778eff28d45bd5',
            version: 1,
          },
        },
        operationName: 'fetchManga',
        variables: { slug: slug },
      }),
      headers: { ...headers, 'content-type': 'application/json' },
    });

    const manga = response?.data?.manga;
    if (!manga) return;

    const chapter =
      Math.max(
        ...manga.branches
          .map((branch: Record<string, any>) =>
            branch.primaryTeamActivities?.[0].ranges?.map(
              (range: Record<string, any>) => range.end,
            ),
          )
          .flat(),
      ) || manga.chapters;
    const lastChapterRead = +manga.viewerBookmark?.number || 0;

    return {
      chapter,
      lastChapterRead: lastChapterRead > chapter ? chapter : lastChapterRead,
      manga,
    };
  }
}
