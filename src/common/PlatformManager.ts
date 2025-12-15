import { PluginRegistry } from './PluginRegistry';
import BasePlatformAPI from './basePlatformAPI';

/**
 * Platform Manager - доступ к зарегистрированным API платформ
 * Реализован как Singleton чтобы избежать множественных инстансов
 */
export default class PlatformManager {
  private static instance: PlatformManager;

  /**
   * Приватный конструктор для предотвращения прямого создания
   */
  private constructor() {}

  /**
   * Получить singleton инстанс PlatformManager
   */
  public static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  public getPlatform(platformKey: string): typeof BasePlatformAPI | null {
    return PluginRegistry.getPlatform(platformKey) || null;
  }

  public getPlatformKeys(): string[] {
    return PluginRegistry.getPlatformKeys();
  }

  public getPlatforms(): Record<string, typeof BasePlatformAPI> {
    const platforms: Record<string, typeof BasePlatformAPI> = {};
    for (const [key, api] of PluginRegistry.getAllPlatforms()) {
      platforms[key] = api;
    }
    return platforms;
  }
}
