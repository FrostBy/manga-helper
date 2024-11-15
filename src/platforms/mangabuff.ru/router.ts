import BaseRouter from '../../common/baseRouter';
import config from './config';
import routes from './routes';
import DB from '../../common/DB';
import MetaData from './MetaData';

export default class Router extends BaseRouter {
  static readonly config = config;
  static readonly routesConfig = routes;

  protected async preInit(): Promise<void> {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const slug = MetaData.getSlug();
    const existingVisit = history.find(
      (visit: Record<string, any>) => visit.slug === slug,
    );
    DB.set(config.key, slug, 'invalidate', true);
    if (existingVisit)
      DB.set(config.key, slug, 'lastChapterRead', +existingVisit.chapter);
  }
}
