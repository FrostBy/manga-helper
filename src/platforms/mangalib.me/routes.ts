import ChapterPage from './pages/ChapterPage';
import MangaPage from './pages/MangaPage';
import { IRoutesConfig } from '../../common/IConfig';

const routes: IRoutesConfig = {
  manga: {
    path: (url: string) => /^\/ru\/manga\/\d+--.*$/.test(url),
    page: MangaPage,
  },
  chapter: {
    path: (url: string) => /\/read\//.test(url),
    page: ChapterPage,
  },
};
export default routes;
