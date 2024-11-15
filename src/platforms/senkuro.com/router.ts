import BaseRouter from '../../common/baseRouter';
import config from './config';
import routes from './routes';
import DB from '../../common/DB';

export default class Router extends BaseRouter {
  static config = config;
  static routesConfig = routes;

  protected async preInit(): Promise<void> {
    const cookies = await GM.cookie.list({ name: 'access_token' });
    DB.set(Router.config.key, '_GLOBAL', `token`, cookies?.[0]?.value);
  }
}
