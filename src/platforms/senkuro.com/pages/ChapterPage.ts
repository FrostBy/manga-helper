import BasePage from '../../../common/basePage';
import config from '../config';
import DB from '../../../common/DB';
import MetaData from '../MetaData';

export default class ChapterPage extends BasePage {
  private setInvalidateCache!: () => void;

  protected async initialize() {
    this.setInvalidateCache = async () => {
      const slug = MetaData.getSlug();
      DB.set(config.key, slug, 'invalidate', true);
    };
  }

  async render() {
    this.setInvalidateCache();
    $(window).on('locationchange', this.setInvalidateCache);
  }

  async destroy() {
    $(window).off('locationchange', this.setInvalidateCache);
  }
}
