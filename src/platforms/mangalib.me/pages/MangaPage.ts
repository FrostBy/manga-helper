import BasePage from '../../../common/basePage';
import { waitForElm } from '../../../common/DOM';
import MetaData from '../MetaData';
import PlatformManager from '../../../common/PlatformManager';
import { ChaptersResponse } from '../../../common/types';
import { MangaDataService } from './MangaDataService';
import { MangaPageUI } from './MangaPageUI';
import config from '../config';

/**
 * MangaPage - координатор для страницы манги
 * Использует MangaDataService для данных и MangaPageUI для рендеринга
 */
export default class MangaPage extends BasePage {
  private dataService: MangaDataService;
  private ui: MangaPageUI;

  // Page data (state)
  private slug!: string;
  private state!: string;
  private titles!: string[];
  private chapters!: ChaptersResponse | null;

  constructor(platformManager?: PlatformManager) {
    super(platformManager);
    this.dataService = new MangaDataService(this.platformManager);
    this.ui = new MangaPageUI();
  }

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

  protected async initialize() {
    await waitForElm('.tabs-menu');

    // Get current manga slug
    this.slug = MetaData.getSlug();

    // Get UI state (reading status button, etc.)
    this.state = $('.fade.container .btns._group span').text().trim();

    // Load data via DataService
    const data = await this.dataService.fetchMangaData(this.slug);
    this.chapters = data.chapters;
    this.titles = data.titles;
  }

  async render() {
    const tabsWrapper = $('.tabs-menu');
    const chaptersTab = tabsWrapper.find('.tabs-item .tabs-item__inner').eq(1);

    // Select chapters tab
    this.selectTab(chaptersTab);

    // Render chapter info
    this.ui.renderChaptersInTab(chaptersTab, this.chapters);

    // Show button
    this.ui.renderPlatformButton();

    // Get all platforms and show list immediately with loaders
    const platforms = this.platformManager.getPlatforms();
    this.ui.renderPlatformList(platforms, config.key, this.slug);

    // Get current chapter count for comparison
    const lastChapterNumber = this.chapters?.data?.at(-1)?.number || 0;

    // Load data for each platform in background (not waiting for all)
    for (const platformKey of Object.keys(platforms)) {
      if (platformKey === config.key) continue;

      // Fire and forget - each platform updates independently
      this.dataService
        .searchOnSinglePlatform(platformKey, this.titles, this.slug)
        .then((data) => {
          this.ui.updatePlatformItem(data, lastChapterNumber);
        });
    }

    this.setupModalHandlers();
  }

  private setupModalHandlers() {
    const self = this;

    // Refresh button handler
    $('body').on('click', '.refresh-link', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const platformKey = $(this).data('platform');

      // Show loader
      self.ui.setItemLoading(platformKey);

      // Get current chapter for comparison
      const lastChapterNumber = self.chapters?.data?.at(-1)?.number || 0;

      // Refresh data (clears cache, preserves manual slug)
      const data = await self.dataService.refreshPlatformData(
        platformKey,
        self.titles,
        self.slug,
      );

      // Update UI
      self.ui.updatePlatformItem(data, lastChapterNumber);
    });

    $('body').on('click', '.edit-link', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $modal = $('#edit-link-modal');
      const platformKey = $(this).data('platform');
      const sourceSlug = $(this).data('source-slug');

      $modal.data('platform', platformKey);
      $modal.data('source-slug', sourceSlug);

      const savedSlug = await self.dataService.getSavedSlug(
        sourceSlug,
        platformKey,
      );
      const platform = self.platformManager.getPlatform(platformKey);
      const url = savedSlug && platform ? platform.link(savedSlug) : '';

      $modal.find('input[name="link"]').val(url);

      // Update second button based on whether slug exists
      const $cleanButton = $modal.find('.button_clean');
      if (savedSlug) {
        $cleanButton.html(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/>
          </svg>
          Удалить
        `);
        $cleanButton.attr('data-action', 'delete');
      } else {
        $cleanButton.html(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/>
          </svg>
          Отмена
        `);
        $cleanButton.attr('data-action', 'close');
      }

      $modal.addClass('is-open');
      $('body').addClass('modal-open');
    });

    $(document).on('submit', '#edit-link-form', async function (e) {
      e.preventDefault();
      const $modal = $('#edit-link-modal');
      const platformKey = $modal.data('platform');
      const sourceSlug = $modal.data('source-slug');
      const url = $modal.find('input[name="link"]').val() as string;

      const platform = self.platformManager.getPlatform(platformKey);
      if (!platform) return;

      const extractedSlug = platform.getSlugFromURL(url);
      await self.dataService.saveSlug(sourceSlug, platformKey, extractedSlug);

      unsafeWindow.location.reload();
    });

    $(document).on(
      'click',
      '#edit-link-modal .button_clean',
      async function () {
        const $modal = $('#edit-link-modal');
        const action = $(this).attr('data-action');

        if (action === 'delete') {
          const platformKey = $modal.data('platform');
          const sourceSlug = $modal.data('source-slug');

          await self.dataService.deleteSlug(sourceSlug, platformKey);
          unsafeWindow.location.reload();
        } else {
          // Just close modal
          $modal.removeClass('is-open');
          $('body').removeClass('modal-open');
        }
      },
    );

    $(document).on('click', '[data-close-modal]', function (e) {
      e.preventDefault();
      const $modal = $('#edit-link-modal');
      $modal.removeClass('is-open');
      $('body').removeClass('modal-open');
    });

    $(document).on('click', '#edit-link-modal', function (e) {
      if (e.target === this) {
        const $modal = $('#edit-link-modal');
        $modal.removeClass('is-open');
        $('body').removeClass('modal-open');
      }
    });
  }

  async destroy() {
    // Remove all event listeners
    $('body').off('click', '.refresh-link');
    $('body').off('click', '.edit-link');
    $(document).off('submit', '#edit-link-form');
    $(document).off('click', '#edit-link-modal .button_clean');
    $(document).off('click', '[data-close-modal]');
    $(document).off('click', '#edit-link-modal');

    // Remove modal from DOM
    $('#edit-link-modal').remove();

    // Remove platform button
    $('.platforms').remove();

    // Destroy UI
    this.ui.destroy();
  }
}
