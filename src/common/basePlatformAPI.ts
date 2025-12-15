import GM_fetch from '@trim21/gm-fetch';
import { IConfig } from './IConfig';
import { SearchResult } from './types';
import { Logger } from './Logger';
import DB from './DB';

export default abstract class BasePlatformAPI {
  static readonly config: IConfig;
  static readonly link: (slug: string) => string;

  /**
   * Извлечь slug из URL платформы
   * Переопределить в API конкретной платформы
   * @param url Полный URL страницы манги
   * @returns Slug или пустая строка если невалидный
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
   * Поиск манги на платформе (опционально, переопределить если поддерживается)
   * @param _sourcePlatform Платформа-источник где манга найдена
   * @param _slug Slug манги на платформе-источнике
   * @param _titles Массив альтернативных названий для поиска
   * @returns SearchResult или false если не найдено
   */
  static async search(
    _sourcePlatform: string,
    _slug: string,
    _titles: string[],
  ): Promise<SearchResult | false> {
    // Платформа не поддерживает поиск
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
   * Fetch с retry и exponential backoff
   * @param url URL для запроса
   * @param options Опции fetch
   * @param timeout Таймаут в миллисекундах (по умолчанию: 10000)
   * @param maxRetries Максимум попыток (по умолчанию: 3)
   * @returns Данные ответа или null при ошибке
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

          // Проверка HTTP статуса
          if (!response.ok) {
            const errorMsg = `HTTP ${response.status} ${response.statusText}`;
            Logger.warn('BasePlatformAPI', errorMsg, {
              url,
              status: response.status,
            });

            // Не ретраим клиентские ошибки (4xx), только серверные (5xx)
            if (response.status >= 400 && response.status < 500) {
              Logger.error('BasePlatformAPI', 'Client error, not retrying', {
                url,
                status: response.status,
              });
              return null;
            }

            // Ретраим серверные ошибки
            throw new Error(errorMsg);
          }

          // Парсим ответ
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

          // Retry с exponential backoff
          if (attempt < maxRetries) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000); // Макс 10с
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

        // Последняя попытка - не ретраим
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
   * Получить токен авторизации для платформы
   * @returns Токен или пустая строка если не найден
   */
  protected static getToken(): string {
    return DB.get(this.config.key, '_GLOBAL', 'token', '') || '';
  }
}
