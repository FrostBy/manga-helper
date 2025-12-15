import PlatformManager from './PlatformManager';

export default abstract class BasePage {
  protected platformManager: PlatformManager;

  /**
   * Конструктор с опциональной инъекцией зависимости
   * @param platformManager Опциональный PlatformManager (по умолчанию singleton)
   */
  constructor(platformManager?: PlatformManager) {
    this.platformManager = platformManager || PlatformManager.getInstance();
  }

  protected abstract initialize(): Promise<void>;

  abstract render(): Promise<void>;
  abstract destroy(): Promise<void>;

  /**
   * Создать и инициализировать экземпляр страницы
   * @param platformManager Опциональный PlatformManager для инъекции
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
