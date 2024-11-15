import BasePage from './basePage';

export interface IPageConstructor<T extends BasePage> {
  new (): T; // Конструктор, возвращающий экземпляр BasePage
  createInstance(): Promise<T>; // Статический метод
}
export interface IRoute {
  path: (url: string, query: Record<string, any>) => boolean;
  page: IPageConstructor<BasePage>; // Используем интерфейс конструктора
}

export interface IRoutesConfig {
  [key: string]: IRoute; // Индексный тип для маршрутов
}

export interface IConfig {
  domain: string;
  title: string;
  key: string;
}
