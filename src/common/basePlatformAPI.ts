import GM_fetch from '@trim21/gm-fetch';

export default abstract class BasePlatformAPI {
  static readonly config: Record<string, any>;

  //abstract getMangaData(slug: string): Promise<any>;
  static prepareResponse(
    urlFunc: Function,
    slug: string,
    chapter: number,
    lastChapterRead: number,
  ) {
    return { url: urlFunc(slug), slug, chapter, lastChapterRead };
  }

  static createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    return formData;
  }

  static async fetch(
    url: string,
    options?: RequestInit,
    timeout: number = 10000,
  ): Promise<any> {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
      controller.abort(); // Отменяем запрос при превышении таймаута
    }, timeout);

    try {
      const response = await GM_fetch(url, { ...options, signal });
      try {
        return await response.clone().json(); // Или другой способ обработки ответа
      } catch (e) {
        return await response.clone().text();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Fetch request timed out');
        return null; // Возвращаем null при таймауте
      }
      throw error; // Пробрасываем другие ошибки
    } finally {
      clearTimeout(timeoutId); // Очищаем таймер
    }
  }
}
