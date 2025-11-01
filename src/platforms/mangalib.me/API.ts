import BasePlatformAPI from '../../common/basePlatformAPI';
import config from './config';
import { Manga, ChaptersResponse, Bookmark } from '../../common/types';

class API extends BasePlatformAPI {
  static config = config;

  static async getMeta(mangaSlug: string): Promise<Manga | null> {
    const baseUrl = `https://api.cdnlibs.org/api/manga/${mangaSlug}`;

    const headers: Record<string, string> = {
      'site-id': '1',
      Referer: 'https://mangalib.me/',
    };

    const token = this.getToken();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const fields = ['eng_name', 'otherNames'];

    const url = new URL(baseUrl);
    fields.forEach((field) => url.searchParams.append('fields[]', field));

    const response = await this.fetch(url.toString(), { headers });
    return response?.data || null;
  }

  static async getChapters(
    mangaSlug: string,
  ): Promise<ChaptersResponse | null> {
    const url = `https://api.cdnlibs.org/api/manga/${mangaSlug}/chapters`;

    const headers: Record<string, string> = {
      'site-id': '1',
      Referer: 'https://mangalib.me/',
    };

    const token = this.getToken();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    return this.fetch(url, { headers });
  }

  static async getBookmark(mangaSlug: string): Promise<Bookmark | null> {
    const url = `https://api.cdnlibs.org/api/manga/${mangaSlug}/bookmark`;

    const headers: Record<string, string> = {
      'site-id': '1',
      Referer: 'https://mangalib.me/',
    };

    const token = this.getToken();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    return this.fetch(url, { headers });
  }
}

export default API;
