import formDataToString from 'formdata-to-string-frontend';
import BasePlatformAPI from '../../common/basePlatformAPI';
import config from './config';
import DB from '../../common/DB';

export default class API extends BasePlatformAPI {
  static readonly config = config;
  static readonly link = (slug: string) =>
    `https://readmanga.io/${slug}#chapters-list`;

  static async search(platform: string, slug: string, titles: string[]) {
    let websiteSlug = await DB.get(platform, slug, this.config.key);
    if (websiteSlug === false) return false;
    const cache = await DB._getCache(this.config.key, websiteSlug);
    // if (cache) return this.prepareResponse(this.link, websiteSlug, cache.chapter, cache.lastChapterRead);

    if (!websiteSlug) {
      const requests = titles.map((title) =>
        this.fetch(
          `https://readmanga.io/search/suggestion?query=${title}`,
        ).then((data) => {
          return data.suggestions
            ?.find((suggestion: Record<string, any>) =>
              [suggestion.value, ...(suggestion.names || [])].includes(title),
            )
            ?.link.replace('/', '');
        }),
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
    const token = DB.get(this.config.key, '_GLOBAL', `token`, '');
    if (!token) return {};

    const boundary = 'formdata-' + Math.random().toString(36).slice(2);
    const headers = {
      authorization: `Bearer ${token}`,
      'content-type': `multipart/form-data; boundary=${boundary}`,
    };

    const response = await this.fetch(this.link(slug));
    const chapter = +$(response)
      .find('#chapters-list td.item-title')
      .eq(0)
      .data('num');
    const externalId = $(response).find('div#chapters-list').data('id');
    const type = $(response).find('div#chapters-list').data('type');
    const variables = this.extractServerVariables(response);

    const responseBookmarks = await this.fetch(
      `${variables.xApiUrl}/api/bookmark/progress`,
      {
        method: 'POST',
        body: (await formDataToString(
          this.createFormData({
            siteId: variables.siteId,
            type,
            externalId,
          }),
          { boundary: boundary },
        )) as unknown as BodyInit,
        headers,
      },
    );

    return {
      chapter: chapter / 10,
      lastChapterRead: (responseBookmarks?.progress?.num || 0) / 10,
    };
  }

  private static extractServerVariables(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const $page = $(doc);
    const script = $page.find('head script:contains("SERVER_URL")').text();

    const variables = Object.fromEntries(
      script
        .split('\n')
        .filter((line) => line.trim().startsWith('var '))
        .map((line) => {
          const [left, right] = line.split('=');
          const name = left.replace('var', '').trim();
          const value = right.replace(/[;'"]/g, '').trim();
          return [name, value];
        }),
    );

    return {
      siteId: variables.RM_site_id,
      serverUrl: variables.SERVER_URL,
      serverApiUrl: variables.SERVER_API_URL,
      xUrl: variables.X_URL,
      xApiUrl: variables.X_API_URL,
    };
  }
}
