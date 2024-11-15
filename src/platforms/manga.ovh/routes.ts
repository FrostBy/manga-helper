import ChapterPage from './pages/ChapterPage';
import MangaPage from './pages/MangaPage';
import { IRoutesConfig } from '../../common/IConfig';

const routes: IRoutesConfig = {
  manga: {
    path: (url: string) => /^\/content\/((?!page=).)*$/.test(url),
    page: MangaPage,
  },
  chapter: {
    path: (url: string) => /\/content\/.*\?[^]*page=/.test(url),
    page: ChapterPage,
  },
};
export default routes;
