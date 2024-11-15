import PlatformManager from './PlatformManager';

export default abstract class BasePage {
  protected platformManager: PlatformManager;

  constructor() {
    this.platformManager = new PlatformManager();
  }

  protected abstract initialize(): Promise<void>;

  abstract render(): Promise<void>;
  abstract destroy(): Promise<void>;

  static async createInstance<T extends BasePage>(
    this: new () => T,
  ): Promise<T> {
    const instance = new this();
    await instance.initialize();
    return instance;
  }
}
