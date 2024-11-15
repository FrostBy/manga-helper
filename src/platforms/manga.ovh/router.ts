import BaseRouter from '../../common/baseRouter';
import config from './config';
import routes from './routes';
import DB from '../../common/DB';

export default class Router extends BaseRouter {
  static readonly config = config;
  static readonly routesConfig = routes;

  protected async preInit(): Promise<void> {
    DB.set(
      Router.config.key,
      '_GLOBAL',
      `token`,
      JSON.parse(localStorage.getItem('gwt')),
    );
  }
}
