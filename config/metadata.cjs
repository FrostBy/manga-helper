const {
  author,
  dependencies,
  description,
  repository,
  version
} = require('../package.json');

module.exports = {
  name: {
    $: 'Manga Helper',
    en: 'Manga Helper',
    ru: 'Manga Helper'
  },
  description: {
    $: description,
    en: description,
    ru: description
  },
  icon: 'https://mangalib.me/static/images/logo/ml/favicon.ico',
  namespace: 'https://greasyfork.org/users/728771',
  downloadURL: '',
  updateURL: '',
  version: version,
  author: author,
  source: repository.url,
  // 'license': 'MIT',
  match: [
    'https://mangalib.me/*',
    'https://*.senkuro.com/*',
    'https://*.senkuro.me/*',
    'https://*.readmanga.io/*',
    'https://mangabuff.ru/*',
    'https://manga.ovh/*'
  ],
  require: [
    `https://cdn.jsdelivr.net/npm/jquery@${dependencies.jquery}/dist/jquery.min.js`,
    `https://cdn.jsdelivr.net/npm/lodash@${dependencies.lodash}/lodash.min.js`,
    `https://cdn.jsdelivr.net/npm/gm-storage@${dependencies['gm-storage']}/dist/index.umd.min.js`,
    `https://cdn.jsdelivr.net/npm/@trim21/gm-fetch@${dependencies['@trim21/gm-fetch']}/dist/gm_fetch.min.js`
  ],
  grant: [
    'unsafeWindow',
    'GM.xmlHttpRequest',

    'GM.cookie',
    'GM_cookie',

    'GM.getValue',
    'GM.setValue',
    'GM.deleteValue',
    'GM.listValues',

    'GM_getValue',
    'GM_setValue',
    'GM_deleteValue',
    'GM_listValues',

    'GM.getResourceText',
    'GM.addStyle'
  ],
  connect: ['mangalib.me', 'senkuro.com', 'readmanga.io', 'api.rmr.rocks', 'mangabuff.ru', 'manga.ovh', 'api.cdnlibs.org', 'senkuro.me', 'api.senkuro.me', 'api.senkuro.com'],
  'run-at': 'document-end'
};
