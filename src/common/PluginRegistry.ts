import BasePlatformAPI from './basePlatformAPI';
import BaseRouter from './baseRouter';
import { Logger } from './Logger';

/**
 * Центральный реестр плагинов платформ
 * Позволяет платформам саморегистрироваться, исключая хардкод списков
 */
export class PluginRegistry {
  private static platforms = new Map<string, typeof BasePlatformAPI>();
  private static routers = new Map<string, typeof BaseRouter>();

  /**
   * Зарегистрировать плагин платформы
   * @param api Класс API платформы
   * @param router Класс Router платформы
   */
  static register(
    api: typeof BasePlatformAPI,
    router: typeof BaseRouter,
  ): void {
    const { key, domain } = api.config;

    if (this.platforms.has(key)) {
      Logger.warn(
        'PluginRegistry',
        `Platform "${key}" is already registered. Overwriting.`,
      );
    }

    this.platforms.set(key, api);
    this.routers.set(domain, router);

    Logger.info('PluginRegistry', `Registered platform: ${key} (${domain})`);
  }

  /**
   * Найти роутер по доменному имени
   * @param domain Домен текущей страницы
   * @returns Конструктор класса Router или undefined
   */
  static findRouterByDomain(
    domain: string,
  ): (new () => BaseRouter) | undefined {
    // Прямое совпадение
    if (this.routers.has(domain)) {
      return this.routers.get(domain) as unknown as new () => BaseRouter;
    }

    // Совпадение субдомена (напр. "sub.mangalib.me" совпадает с "mangalib.me")
    for (const [registeredDomain, router] of this.routers.entries()) {
      if (domain.endsWith('.' + registeredDomain)) {
        return router as unknown as new () => BaseRouter;
      }
    }

    return undefined;
  }

  /**
   * Получить API платформы по ключу
   * @param key Ключ платформы (напр. "mangalib")
   * @returns Класс API платформы или undefined
   */
  static getPlatform(key: string): typeof BasePlatformAPI | undefined {
    return this.platforms.get(key);
  }

  /**
   * Получить все зарегистрированные API платформ
   * @returns Map всех платформ
   */
  static getAllPlatforms(): Map<string, typeof BasePlatformAPI> {
    return new Map(this.platforms);
  }

  /**
   * Получить все зарегистрированные ключи платформ
   * @returns Массив ключей платформ
   */
  static getPlatformKeys(): string[] {
    return Array.from(this.platforms.keys());
  }

  /**
   * Проверить зарегистрирована ли платформа
   * @param key Ключ платформы
   * @returns true если зарегистрирована
   */
  static hasPlatform(key: string): boolean {
    return this.platforms.has(key);
  }
}
