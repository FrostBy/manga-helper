import { IConfig, IRoutesConfig } from './IConfig';
import BasePage from './basePage';
import PlatformManager from './PlatformManager';
import { Logger } from './Logger';

export default abstract class BaseRouter {
  static readonly routesConfig: IRoutesConfig;
  static readonly config: IConfig;

  private prevPage!: BasePage;
  protected platformManager: PlatformManager;

  constructor() {
    // Use singleton PlatformManager for all pages
    this.platformManager = PlatformManager.getInstance();
  }

  protected abstract preInit(): Promise<void>;

  async init() {
    await this.preInit(); // Execute custom code before initialization

    const currentPath = window.location.pathname;
    const queryParams = Object.fromEntries(
      new URLSearchParams(window.location.search),
    );

    const route = Object.values(
      (this.constructor as typeof BaseRouter).routesConfig,
    ).find((route) => {
      if (typeof route.path === 'string') return route.path === currentPath;
      else if (typeof route.path === 'function')
        return route.path(currentPath, queryParams);
      return false;
    });

    // Always destroy previous page before creating new one
    await this.prevPage?.destroy();

    if (route) {
      // Pass PlatformManager to page via dependency injection
      const pageInstance = await route.page.createInstance(
        this.platformManager,
      );
      this.prevPage = pageInstance;
      await pageInstance.render();
    } else {
      Logger.error('Router', 'Page not found');
    }
  }
}
