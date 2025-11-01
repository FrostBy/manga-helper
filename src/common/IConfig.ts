import BasePage from './basePage';
import PlatformManager from './PlatformManager';

export interface IPageConstructor<T extends BasePage> {
  new (platformManager?: PlatformManager): T;
  createInstance(platformManager?: PlatformManager): Promise<T>;
}

export type RoutePathMatcher =
  | string
  | ((url: string, query: Record<string, string>) => boolean);

export interface IRoute {
  path: RoutePathMatcher;
  page: IPageConstructor<BasePage>;
}

export interface IRoutesConfig {
  [key: string]: IRoute;
}

export interface IConfig {
  domain: string;
  title: string;
  key: string;
}
