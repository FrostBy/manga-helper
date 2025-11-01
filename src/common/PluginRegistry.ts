import BasePlatformAPI from './basePlatformAPI';
import BaseRouter from './baseRouter';
import { Logger } from './Logger';

/**
 * Central registry for platform plugins
 * Allows platforms to self-register and eliminates hardcoded platform lists
 */
export class PluginRegistry {
  private static platforms = new Map<string, typeof BasePlatformAPI>();
  private static routers = new Map<string, typeof BaseRouter>();

  /**
   * Register a platform plugin
   * @param api Platform API class
   * @param router Platform Router class
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
   * Find router by domain name
   * @param domain Current page domain
   * @returns Router class constructor or undefined
   */
  static findRouterByDomain(
    domain: string,
  ): (new () => BaseRouter) | undefined {
    // Direct match
    if (this.routers.has(domain)) {
      return this.routers.get(domain) as unknown as new () => BaseRouter;
    }

    // Subdomain match (e.g., "sub.mangalib.me" matches "mangalib.me")
    for (const [registeredDomain, router] of this.routers.entries()) {
      if (domain.endsWith('.' + registeredDomain)) {
        return router as unknown as new () => BaseRouter;
      }
    }

    return undefined;
  }

  /**
   * Get platform API by key
   * @param key Platform key (e.g., "mangalib")
   * @returns Platform API class or undefined
   */
  static getPlatform(key: string): typeof BasePlatformAPI | undefined {
    return this.platforms.get(key);
  }

  /**
   * Get all registered platform APIs
   * @returns Map of all platforms
   */
  static getAllPlatforms(): Map<string, typeof BasePlatformAPI> {
    return new Map(this.platforms);
  }

  /**
   * Get all registered platform keys
   * @returns Array of platform keys
   */
  static getPlatformKeys(): string[] {
    return Array.from(this.platforms.keys());
  }

  /**
   * Check if platform is registered
   * @param key Platform key
   * @returns true if registered
   */
  static hasPlatform(key: string): boolean {
    return this.platforms.has(key);
  }
}
