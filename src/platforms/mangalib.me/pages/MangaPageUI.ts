import tippy, { Instance } from 'tippy.js';
import { ChaptersResponse, SearchResult } from '../../../common/types';
import {
  loaderTemplate,
  createDropdownButton,
  editLinkModalTemplate,
  platformItemTemplate,
  platformListTemplate,
} from './templates';
import BasePlatformAPI from '../../../common/basePlatformAPI';

/**
 * UI класс для MangaPage
 * Отвечает за все DOM манипуляции и рендеринг
 */
export class MangaPageUI {
  private tippyInstance: Instance | null = null;
  private dropdownContent: JQuery<HTMLElement> | null = null;

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
   * Создает кнопку для дропдауна (без спиннера)
   */
  renderPlatformButton() {
    const buttonGroup = $('.fade.container .btns._group');
    const openOnPlatforms = createDropdownButton();
    buttonGroup.after(openOnPlatforms);

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
   * Рендерит список платформ СРАЗУ с loaders вместо данных
   */
  renderPlatformList(
    platforms: Record<string, typeof BasePlatformAPI>,
    currentPlatformKey: string,
    sourceSlug: string,
  ) {
    const openOnPlatforms = $('.platforms');
    this.dropdownContent = $(platformListTemplate);

    // Добавляем все платформы кроме текущей
    for (const [platformKey, PlatformAPI] of Object.entries(platforms)) {
      if (platformKey === currentPlatformKey) continue;

      const item = $(platformItemTemplate);
      item.attr('data-platform-key', platformKey);
      item.find('.platform-name').text(PlatformAPI.config.title);
      item
        .find('.refresh-link')
        .attr('data-platform', platformKey)
        .attr('data-source-slug', sourceSlug);
      item
        .find('.edit-link')
        .attr('data-platform', platformKey)
        .attr('data-source-slug', sourceSlug);

      this.dropdownContent.find('.menu-list').append(item);
    }

    this.tippyInstance = tippy('.platforms', {
      content: this.dropdownContent[0],
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
  }

  /**
   * Показывает loader для платформы (при refresh)
   */
  setItemLoading(platformKey: string) {
    if (!this.dropdownContent) return;

    const item = this.dropdownContent.find(
      `[data-platform-key="${platformKey}"]`,
    );
    if (!item.length) return;

    item.find('.platform-stats').html('<span class="inline-loader">...</span>');
    item.find('a').css({ opacity: '1' }); // Reset opacity
  }

  /**
   * Обновляет данные одной платформы когда они загрузились
   */
  updatePlatformItem(data: SearchResult, currentChapter: number) {
    if (!this.dropdownContent) return;

    const item = this.dropdownContent.find(
      `[data-platform-key="${data.platformKey}"]`,
    );
    if (!item.length) return;

    const $link = item.find('a');
    const statsText = `${data.chapter || '0'} (${data.lastChapterRead || '0'})`;
    item.find('.platform-stats').text(statsText);
    $link.attr('href', data.url);

    // If title not found (no slug) - visually dim with opacity
    if (!data.slug) {
      $link.css({ opacity: '0.6' });
    }

    // If this platform has more chapters than current - highlight button
    if (data.chapter && data.chapter > currentChapter) {
      $('.platforms').addClass('new');
    }
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
