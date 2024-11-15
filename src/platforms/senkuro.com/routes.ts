import ChapterPage from './pages/ChapterPage';
import MangaPage from './pages/MangaPage';
import { IRoutesConfig } from '../../common/IConfig';

const routes: IRoutesConfig = {
  manga: {
    path: (url: string) => /^\/manga\/[^\/]+(\/[a-zA-Z0-9-]*)?$/.test(url),
    page: MangaPage,
  },
  chapter: {
    path: (url: string) => /chapters\/\d+\/pages\/\d+/.test(url),
    page: ChapterPage,
  },
};
export default routes;
