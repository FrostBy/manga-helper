import GM_fetch from '@trim21/gm-fetch';
import { IConfig } from './IConfig';
import { SearchResult } from './types';
import { Logger } from './Logger';
import DB from './DB';

export default abstract class BasePlatformAPI {
  static readonly config: IConfig;
  static readonly link: (slug: string) => string;

  /**
   * Extract slug from platform URL
   * Override this method in platform-specific API class
   * @param url Full URL to the manga page
   * @returns Slug string or empty string if invalid
   */
  static getSlugFromURL(url: string): string {
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes(this.config.domain)) {
        return '';
      }
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return pathParts[0] || '';
    } catch (e) {
      return '';
    }
  }

  /**
   * Search for manga on this platform (optional, override if supported)
   * @param _sourcePlatform The platform where the manga was found
   * @param _slug Slug of the manga on source platform
   * @param _titles Array of alternative titles to search
   * @returns SearchResult or false if not found
   */
  static async search(
    _sourcePlatform: string,
    _slug: string,
    _titles: string[],
  ): Promise<SearchResult | false> {
    // Default implementation - platform doesn't support search
    return false;
  }

  static prepareResponse(
    urlFunc: (slug: string) => string,
    slug: string,
    chapter: number,
    lastChapterRead: number,
  ): SearchResult {
    return {
      url: urlFunc(slug),
      slug,
      chapter,
      lastChapterRead,
      platform: this.config.title,
      platformKey: this.config.key,
    };
  }

  static createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    return formData;
  }

  /**
   * Fetch with retry logic and exponential backoff
   * @param url URL to fetch
   * @param options Fetch options
   * @param timeout Timeout in milliseconds (default: 10000)
   * @param maxRetries Maximum number of retry attempts (default: 3)
   * @returns Response data or null on failure
   */
  static async fetch(
    url: string,
    options?: RequestInit,
    timeout: number = 10000,
    maxRetries: number = 3,
  ): Promise<any> {
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const signal = controller.signal;

        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);

        try {
          Logger.debug(
            'BasePlatformAPI',
            `Fetching ${url} (attempt ${attempt + 1}/${maxRetries + 1})`,
          );

          const response = await GM_fetch(url, { ...options, signal });

          clearTimeout(timeoutId);

          // Check HTTP status
          if (!response.ok) {
            const errorMsg = `HTTP ${response.status} ${response.statusText}`;
            Logger.warn('BasePlatformAPI', errorMsg, {
              url,
              status: response.status,
            });

            // Don't retry client errors (4xx), but retry server errors (5xx)
            if (response.status >= 400 && response.status < 500) {
              Logger.error('BasePlatformAPI', 'Client error, not retrying', {
                url,
                status: response.status,
              });
              return null;
            }

            // Retry server errors
            throw new Error(errorMsg);
          }

          // Parse response
          try {
            const data = await response.clone().json();
            Logger.debug('BasePlatformAPI', 'Fetch successful', { url });
            return data;
          } catch (e) {
            const text = await response.clone().text();
            Logger.debug('BasePlatformAPI', 'Fetch successful (text)', { url });
            return text;
          }
        } catch (error: any) {
          clearTimeout(timeoutId);

          if (error.name === 'AbortError') {
            Logger.warn('BasePlatformAPI', `Request timeout (${timeout}ms)`, {
              url,
              attempt: attempt + 1,
            });
            lastError = new Error(`Request timeout after ${timeout}ms`);
          } else {
            Logger.error('BasePlatformAPI', 'Fetch error', {
              url,
              error: error.message,
              attempt: attempt + 1,
            });
            lastError = error;
          }

          // Retry with exponential backoff
          if (attempt < maxRetries) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s
            Logger.info('BasePlatformAPI', `Retrying in ${backoffMs}ms...`, {
              url,
            });
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }

          throw lastError;
        }
      } catch (error: any) {
        lastError = error;

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          Logger.error(
            'BasePlatformAPI',
            `All retry attempts failed for ${url}`,
            error,
          );
          return null;
        }
      }
    }

    return null;
  }

  /**
   * Get authentication token for this platform
   * @returns Token string or empty string if not found
   */
  protected static getToken(): string {
    return DB.get(this.config.key, '_GLOBAL', 'token', '') || '';
  }
}
