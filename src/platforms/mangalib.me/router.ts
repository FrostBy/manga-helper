import BaseRouter from '../../common/baseRouter';
import config from './config';
import routes from './routes';
import DB from '../../common/DB';

export default class Router extends BaseRouter {
  static routesConfig = routes;
  static config = config;

  protected async preInit(): Promise<void> {
    $('body').addClass('mangalib');
    DB.set(
      Router.config.key,
      '_GLOBAL',
      `token`,
      JSON.parse(localStorage.getItem('auth') || '{}')?.token.access_token,
    );
  }
}
