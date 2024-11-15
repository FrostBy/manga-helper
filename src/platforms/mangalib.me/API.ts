import BasePlatformAPI from '../../common/basePlatformAPI';
import config from './config';
import DB from '../../common/DB';

class API extends BasePlatformAPI {
  static config = config;

  static async getMeta(mangaSlug: string): Promise<Record<string, any>> {
    const baseUrl = `https://api.cdnlibs.org/api/manga/${mangaSlug}`;

    let headers = {};
    const token = DB.get(this.config.key, '_GLOBAL', `token`, '');
    if (token) headers = { authorization: `Bearer ${token}` };

    const fields = ['eng_name', 'otherNames'];

    const url = new URL(baseUrl);
    fields.forEach((field) => url.searchParams.append('fields[]', field));

    return (await this.fetch(url.toString(), { headers }))?.data;
  }

  static async getChapters(mangaSlug: string): Promise<any> {
    const url = `https://api.cdnlibs.org/api/manga/${mangaSlug}/chapters`;

    let headers = {};
    const token = DB.get(this.config.key, '_GLOBAL', `token`, '');
    if (token) headers = { authorization: `Bearer ${token}` };

    return this.fetch(url, { headers });
  }

  static async getBookmark(mangaSlug: string): Promise<any> {
    const url = `https://api.cdnlibs.org/api/manga/${mangaSlug}/bookmark`;
    let headers = {};
    const token = DB.get(this.config.key, '_GLOBAL', `token`, '');
    if (token) headers = { authorization: `Bearer ${token}` };
    return this.fetch(url, { headers });
  }
}

export default API;
