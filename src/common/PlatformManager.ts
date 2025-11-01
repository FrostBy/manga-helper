import { PluginRegistry } from './PluginRegistry';
import BasePlatformAPI from './basePlatformAPI';

/**
 * Platform Manager - provides access to registered platform APIs
 * Implemented as a Singleton to avoid multiple instances
 */
export default class PlatformManager {
  private static instance: PlatformManager;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {}

  /**
   * Get the singleton instance of PlatformManager
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
