import BasePage from '../../../common/basePage';
import { waitForElm } from '../../../common/DOM';
import MetaData from '../MetaData';
import tippy, { Instance } from 'tippy.js';
import API from '../API';
import config from '../config';

export default class MangaPage extends BasePage {
  // language=HTML
  private static loaderDOM: string = `
    <div class="loader-wrapper _size-sm btn__loader">
      <svg class="loader size-sm" viewBox="25 25 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle class="path" fill="none" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" cx="50" cy="50"
                r="20"></circle>
      </svg>
    </div>`;

  private static dropdownButtonDOM = () => {
    const group = $('.fade.container .btns._group').clone();
    group.find('span').text('Открыть на сайте');
    group.find('.fa-bookmark').remove();
    group.find('.fa-plus').remove();
    group.addClass('platforms');
    return group;
  };

  // language=HTML
  private static dropdownListDOM: string = `
    <div class="dropdown-menu">
      <div class="platforms-dropdown">
        <div class="menu">
          <div class="menu-list scrollable">
            <div class="menu-item">
              <div class="menu-item__text"><a href="#"></a></div>
              <svg class="svg-inline--fa fa-plus menu-item__icon menu-item__icon_right" aria-hidden="true"
                   focusable="false" data-prefix="fas"
                   data-icon="plus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <title>Добавить ссылку</title>
                <path class="" fill="currentColor"
                      d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // language=HTML
  private static modalDOM: string = `
    <div class="modal" id="edit-link-modal">
      <div class="modal__inner">
        <div class="modal__content" data-size="small">
          <div class="modal__header">
            <div class="modal__title text-center">Изменить ссылку</div>
            <div class="modal__close" data-close-modal>
              <svg class="modal__close-icon">
                <use xlink:href="#icon-close"></use>
              </svg>
            </div>
          </div>
          <div class="modal__body">
            <form>
              <div class="form__field">
                <div class="form__label flex justify_between align-items_end">
                  <span>Ссылка на произведение</span>
                </div>
                <input type="url" name="link" class="form__input" placeholder="Ссылка на произведение" />
              </div>
              <div class="form__footer">
                <button class="button button_md button_green button_save" type="submit"
                        data-close-modal>
                  <i class="fa fa-floppy-o far fa-save fa-fw"></i>
                  Сохранить
                </button>
                <button class="button button_md button_red button_clean" data-close-modal>
                  <i class="fa fa-trash-o far fa-trash-alt fa-fw fa-sm"></i>
                  Удалить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  private selectTab(tab: JQuery<HTMLElement>) {
    tab.rawClick();
    switch (this.state) {
      case 'Читаю':
      case 'Senkuro':
      case 'Readmanga':
      case 'Mangabuff':
        tab.rawClick();
    }
  }

  private async renderChaptersInTab(tab: JQuery<HTMLElement>) {
    const totalChapters = this.chapters.data.length;
    const lastChapter = this.chapters.data.at(-1)?.number;
    const totalChaptersDOM = `<small class="chapters-all">[${this.chapters.data.length + 1}]</small>`;
    tab.html(
      tab.text() +
        ` <span>(${this.chapters.data.at(-1)?.number || 0}${lastChapter === totalChapters ? totalChaptersDOM : ''})</span>`,
    );
  }

  private toggleLoader(element: JQuery<HTMLElement>) {
    element.has('.loader-wrapper').length
      ? element.find('.loader-wrapper').remove()
      : element.prepend(MangaPage.loaderDOM);
  }

  private async renderPlatformList() {
    const buttonGroup = $('.fade.container .btns._group');
    const openOnPlatforms = MangaPage.dropdownButtonDOM();
    buttonGroup.after(openOnPlatforms);

    this.toggleLoader(openOnPlatforms.find('button').eq(0));

    const content = $(MangaPage.dropdownListDOM);
    const listItem = content.find('.menu-item').clone();
    content.find('.menu-item').remove();

    let moreChapters = false;
    const apis = this.platformManager.getPlatforms();
    let dataArr = await Promise.all(
      Object.keys(apis).map(async (platform) => {
        if (platform === config.key) return;
        try {
          const data = await apis[platform].search(
            config.key,
            this.slug,
            this.titles,
          );
          if (!data) return false;
          data.platform = apis[platform].config.title;
          moreChapters =
            moreChapters ||
            this.chapters.data.at(-1)?.number < data.lastChapterRead;
          return data;
        } catch (e: unknown) {
          console.error(e);
        }
      }),
    );

    dataArr = dataArr.filter(Boolean).sort((a, b) => {
      if (!b.chapter) return -1;
      return b.chapter - a.chapter || b.lastChapterRead - a.lastChapterRead;
    });

    for (const { chapter, lastChapterRead, platform, url } of dataArr) {
      const item = listItem.clone();
      item
        .find('a')
        .text(`${platform} | ${chapter || '0'} (${lastChapterRead || '0'})`)
        .attr('href', `${url || '#'}`);
      content.find('.menu-list').append(item);
    }

    if (moreChapters) openOnPlatforms.addClass('new');

    this.tippy = tippy('.platforms', {
      content: content.prop('outerHTML'),
      allowHTML: true,
      trigger: 'click',
      interactive: true,
      arrow: false,
      placement: 'bottom-start',
      animation: 'shift-toward',
      duration: 200,
      offset: [0, 7],
      theme: 'dropdown',
      appendTo: document.body,
      hideOnClick: 'toggle',
    })[0];
    this.tippy.show();
    this.toggleLoader(openOnPlatforms.find('button').eq(0));
  }

  private tippy: Instance;
  private slug: string;
  private meta: Record<string, any>;
  private state: string;
  private lastChapterRead: number;
  private titles: string[];
  private chapters: Record<string, any>;

  protected async initialize() {
    await waitForElm('.tabs-menu');
    this.slug = MetaData.getSlug();
    this.chapters = await API.getChapters(this.slug);
    this.meta = await API.getMeta(this.slug);
    this.lastChapterRead =
      +(await API.getBookmark(this.slug))?.data?.item?.number || 0;
    this.titles = [
      this.meta.rus_name,
      this.meta.name,
      this.meta.eng_name,
      ...(this.meta.otherNames || []),
    ];
    this.state = $('.fade.container .btns._group span').text().trim();
  }

  async render() {
    const tabsWrapper = $('.tabs-menu');
    const chaptersTab = tabsWrapper.find('.tabs-item .tabs-item__inner').eq(1);

    this.selectTab(chaptersTab);
    await this.renderChaptersInTab(chaptersTab);
    await this.renderPlatformList();
  }

  async destroy() {
    const tabsWrapper = $('.tabs-menu');
    const chaptersTab = tabsWrapper.find('.tabs-item .tabs-item__inner').eq(1);
    chaptersTab.find('span').remove();
    this.tippy?.unmount();
  }
}
