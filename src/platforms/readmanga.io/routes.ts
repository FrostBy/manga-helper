import ChapterPage from './pages/ChapterPage';
import MangaPage from './pages/MangaPage';
import { IRoutesConfig } from '../../common/IConfig';

const routes: IRoutesConfig = {
  manga: {
    path: () => Boolean($('body').find('h1.names').length),
    page: MangaPage,
  },
  chapter: {
    path: () => $('body').is('.page-reader'),
    page: ChapterPage,
  },
};
export default routes;
