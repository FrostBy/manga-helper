import './style/main.less';
import GM_fetch from '@trim21/gm-fetch';
import DB from './common/DB';

import MangalibRouter from './platforms/mangalib.me/router';
import SenkuroRouter from './platforms/senkuro.com/router';
import MangabuffRouter from './platforms/mangabuff.ru/router';
import ReadMangaRouter from './platforms/readmanga.io/router';
import MangaOVHRouter from './platforms/manga.ovh/router';

async function init() {
  global.tokens = {};
  if (!unsafeWindow.$) unsafeWindow.$ = $;
  unsafeWindow.GM_fetch = GM_fetch;
  DB.flushExpired();

  const oldPushState = history.pushState;
  history.pushState = function pushState() {
    const ret = oldPushState.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  /*const oldReplaceState = history.replaceState;
  history.replaceState = function replaceState() {
    console.log('replaceState')
    const ret = oldReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };*/

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });

  $.fn.extend({
    rawClick: function () {
      return this.each(function () {
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

  const currentDomain = window.location.hostname; // Получите текущий домен
  const routers = [
    MangalibRouter,
    SenkuroRouter,
    MangabuffRouter,
    ReadMangaRouter,
    MangaOVHRouter,
  ]; // Массив всех роутеров
  let router;
  const routerClass = routers.find((router) => {
    const domain = router.config.domain;
    return currentDomain === domain || currentDomain.endsWith('.' + domain);
  });

  if (routerClass) {
    router = new routerClass(); // Создаем экземпляр найденного роутера
  } else {
    throw new Error('No router found for this domain');
  }

  await router.init();

  window.addEventListener('locationchange', (e) => {
    router.init();
  });
}

main().catch((e) => {
  console.log(e);
});
