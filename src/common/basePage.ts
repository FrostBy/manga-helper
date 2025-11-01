import PlatformManager from './PlatformManager';

export default abstract class BasePage {
  protected platformManager: PlatformManager;

  /**
   * Constructor with optional dependency injection
   * @param platformManager Optional PlatformManager instance (defaults to singleton)
   */
  constructor(platformManager?: PlatformManager) {
    this.platformManager = platformManager || PlatformManager.getInstance();
  }

  protected abstract initialize(): Promise<void>;

  abstract render(): Promise<void>;
  abstract destroy(): Promise<void>;

  /**
   * Create and initialize a page instance
   * @param platformManager Optional PlatformManager to inject
   */
  static async createInstance<T extends BasePage>(
    this: new (platformManager?: PlatformManager) => T,
    platformManager?: PlatformManager,
  ): Promise<T> {
    const instance = new this(platformManager);
    await instance.initialize();
    return instance;
  }
}
