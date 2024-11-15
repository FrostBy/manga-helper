import ChapterPage from './pages/ChapterPage';
import MangaPage from './pages/MangaPage';
import { IRoutesConfig } from '../../common/IConfig';

const routes: IRoutesConfig = {
  manga: {
    path: (url: string) => /^\/manga\/[^\/]+$/.test(url),
    page: MangaPage,
  },
  chapter: {
    path: (url: string) => /^\/manga\/[^\/]+\/\d+\/\d+$/.test(url),
    page: ChapterPage,
  },
};
export default routes;
