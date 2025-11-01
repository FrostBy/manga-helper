import tippy, { Instance } from 'tippy.js';
import { ChaptersResponse, SearchResult } from '../../../common/types';
import {
  loaderTemplate,
  dropdownListTemplate,
  createDropdownButton,
  editLinkModalTemplate,
} from './templates';

/**
 * UI класс для MangaPage
 * Отвечает за все DOM манипуляции и рендеринг
 */
export class MangaPageUI {
  private tippyInstance: Instance | null = null;

  /**
   * Рендерит информацию о главах в табе
   */
  renderChaptersInTab(
    tab: JQuery<HTMLElement>,
    chapters: ChaptersResponse | null,
  ) {
    if (!chapters?.data) return;

    const totalChapters = chapters.data.length;
    const lastChapter = chapters.data.at(-1)?.number;
    const totalChaptersDOM = `<small class="chapters-all">[${chapters.data.length + 1}]</small>`;

    tab.html(
      tab.text() +
        ` <span>(${chapters.data.at(-1)?.number || 0}${lastChapter === totalChapters ? totalChaptersDOM : ''})</span>`,
    );
  }

  /**
   * Показывает/скрывает лоадер
   */
  toggleLoader(element: JQuery<HTMLElement>) {
    element.has('.loader-wrapper').length
      ? element.find('.loader-wrapper').remove()
      : element.prepend(loaderTemplate);
  }

  /**
   * Создает кнопку для дропдауна со спиннером
   */
  renderPlatformButton() {
    const buttonGroup = $('.fade.container .btns._group');
    const openOnPlatforms = createDropdownButton();
    buttonGroup.after(openOnPlatforms);

    this.toggleLoader(openOnPlatforms.find('button').eq(0));

    if (!$('#edit-link-modal').length) {
      const $pageModals = $('.page-modals');
      if ($pageModals.length) {
        $pageModals.append(editLinkModalTemplate);
      } else {
        $('body').append(editLinkModalTemplate);
      }
    }
  }

  /**
   * Заполняет dropdown платформами и убирает спиннер
   */
  updatePlatformList(
    platforms: SearchResult[],
    hasMoreChapters: boolean,
    sourceSlug: string,
  ) {
    const openOnPlatforms = $('.platforms');

    const content = $(dropdownListTemplate);
    const listItem = content.find('.menu-item').clone();
    content.find('.menu-item').remove();

    for (const {
      chapter,
      lastChapterRead,
      platform,
      url,
      platformKey,
      slug,
    } of platforms) {
      const item = listItem.clone();
      const $link = item.find('a');

      $link.text(`${platform} | ${chapter || '0'} (${lastChapterRead || '0'})`);
      $link.attr('href', url);

      // If title not found (no slug) - visually dim with opacity
      if (!slug) {
        $link.css({
          opacity: '0.6',
        });
      }

      item
        .find('.edit-link')
        .attr('data-platform', platformKey)
        .attr('data-source-slug', sourceSlug);

      content.find('.menu-list').append(item);
    }

    // If other platforms have more chapters - highlight
    if (hasMoreChapters) {
      openOnPlatforms.addClass('new');
    }

    this.tippyInstance = tippy('.platforms', {
      content: content[0],
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
      onShown: (instance) => {
        $(instance.popper).trigger('tippy-shown');
      },
    })[0];

    this.tippyInstance.show();

    this.toggleLoader(openOnPlatforms.find('button').eq(0));
  }

  /**
   * Очистка UI
   */
  destroy() {
    const tabsWrapper = $('.tabs-menu');
    const chaptersTab = tabsWrapper.find('.tabs-item .tabs-item__inner').eq(1);
    chaptersTab.find('span').remove();
    this.tippyInstance?.destroy();
  }
}
