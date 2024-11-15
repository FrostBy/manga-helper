import BasePage from '../../../common/basePage';
import { waitForElm } from '../../../common/DOM';

export default class ChapterPage extends BasePage {
  private scrollListener: () => void;
  private isScrollbarDragging = false;
  private mouseDownListener: JQuery.EventHandlerBase<
    Window,
    JQuery.MouseDownEvent<Window>
  >;
  private mouseUpListener: JQuery.EventHandlerBase<
    Window,
    JQuery.MouseUpEvent<Window>
  >;

  protected async initialize() {
    await waitForElm('svg.fa-bookmark');

    this.scrollListener = () => {
      const scrolledTo = window.scrollY + window.innerHeight;
      const isReachBottom = document.body.scrollHeight === scrolledTo;

      if (isReachBottom) {
        if (this.isScrollbarDragging) return;

        const bookmark = $('svg.fa-bookmark').eq(0);
        if (bookmark.data().prefix === 'far')
          bookmark.parent().trigger('click');
        $('header a + div + a')[0]?.click();
      }
    };

    this.mouseDownListener = (event) => {
      const target = event.target as HTMLElement;
      if (target.scrollHeight > target.clientHeight)
        this.isScrollbarDragging = true;
    };

    this.mouseUpListener = () => {
      this.isScrollbarDragging = false;
    };
  }

  async render() {
    $(window).on('scroll', this.scrollListener);
    $(window).on('mousedown', this.mouseDownListener);
    $(window).on('mouseup', this.mouseUpListener);
  }

  async destroy() {
    $(window).off('scroll', this.scrollListener);
    $(window).off('mousedown', this.mouseDownListener);
    $(window).off('mouseup', this.mouseUpListener);
  }
}
