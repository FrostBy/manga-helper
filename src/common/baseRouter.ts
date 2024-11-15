import { IConfig, IRoutesConfig } from './IConfig';
import BasePage from './basePage';

export default abstract class BaseRouter {
  static readonly routesConfig: IRoutesConfig;
  static readonly config: IConfig;
  private prevPage: BasePage;

  protected abstract preInit(): Promise<void>;

  async init() {
    await this.preInit(); // Выполняем кастомный код перед инициализацией

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

    if (route) {
      await this.prevPage?.destroy();
      const pageInstance = await route.page.createInstance();
      this.prevPage = pageInstance;
      await pageInstance.render();
    } else {
      console.error('Page not found');
    }
  }
}
