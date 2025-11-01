import './style/main.less';
import GM_fetch from '@trim21/gm-fetch';
import DB from './common/DB';
import { PluginRegistry } from './common/PluginRegistry';
import { Logger } from './common/Logger';

// Import all platforms to trigger auto-registration
import './platforms/mangalib.me';
import './platforms/senkuro.com';
import './platforms/mangabuff.ru';
import './platforms/readmanga.io';
import './platforms/manga.ovh';

async function init() {
  // Initialize logger (exposed in unsafeWindow for debugging)
  Logger.init();

  global.tokens = {};
  if (!unsafeWindow.$) unsafeWindow.$ = $;
  unsafeWindow.GM_fetch = GM_fetch;
  DB.flushExpired();

  const oldPushState = history.pushState;
  history.pushState = function pushState(...args: [any, string, string?]) {
    const ret = oldPushState.apply(this, args);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });

  $.fn.extend({
    rawClick: function (this: JQuery) {
      return this.each(function (this: HTMLElement) {
        const element = this;
        if (element) {
          const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: unsafeWindow,
          });
          element.dispatchEvent(mouseUpEvent);
        }
      });
    },
  });
}

async function main() {
  await init();

  const currentDomain = window.location.hostname;
  const RouterClass = PluginRegistry.findRouterByDomain(currentDomain);

  if (!RouterClass) {
    throw new Error(`No router found for domain: ${currentDomain}`);
  }

  const router = new RouterClass();
  await router.init();

  window.addEventListener('locationchange', () => {
    router.init();
  });
}

main().catch((e) => {
  Logger.error('Main', 'Initialization failed', e);
});
