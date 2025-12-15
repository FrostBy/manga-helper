/**
 * HTML templates for Mangalib MangaPage
 */

// language=HTML
export const loaderTemplate = `
  <div class="loader-wrapper _size-sm btn__loader">
    <svg class="loader size-sm" viewBox="25 25 50 50" xmlns="http://www.w3.org/2000/svg">
      <circle class="path" fill="none" stroke-width="4" stroke-miterlimit="10" stroke-linecap="round" cx="50" cy="50"
              r="20"></circle>
    </svg>
  </div>`;

// language=HTML
export const dropdownListTemplate = `
  <div class="dropdown-menu">
    <div class="platforms-dropdown">
      <div class="menu">
        <div class="menu-list scrollable">
          <div class="menu-item">
            <div class="menu-item__text"><a href="#"></a></div>
            <span class="edit-link" style="cursor: pointer; display: inline-flex;">
              <svg class="svg-inline--fa fa-pencil menu-item__icon menu-item__icon_right" aria-hidden="true"
                   focusable="false" data-prefix="fas"
                   data-icon="pencil" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <title>Edit link</title>
                <path class="" fill="currentColor"
                      d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// language=HTML
export const editLinkModalTemplate = `
  <div class="modal" id="edit-link-modal">
    <div class="modal__inner">
      <div class="modal__content" data-size="small">
        <div class="modal__header">
          <div class="modal__title">Редактировать ссылку</div>
          <div class="modal__close" data-close-modal>
            <svg class="modal__close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
            </svg>
          </div>
        </div>
        <div class="modal__body">
          <form id="edit-link-form">
            <div class="form__field">
              <div class="form__label">
                <span>Полная ссылка на тайтл</span>
              </div>
              <input type="url" name="link" class="form__input" placeholder="https://example.com/manga/slug"/>
            </div>
            <div class="form__footer">
              <button class="btn button_save" type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"/>
                </svg>
                Сохранить
              </button>
              <button class="btn button_clean" type="button" data-close-modal>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/>
                </svg>
                Удалить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
`;

// language=HTML
export const inlineLoaderTemplate = `<span class="inline-loader">...</span>`;

// language=HTML
export const platformItemTemplate = `
  <div class="menu-item" data-platform-key="">
    <div class="menu-item__text">
      <a href="#">
        <span class="platform-name"></span> | <span class="platform-stats"><span class="inline-loader">...</span></span>
      </a>
    </div>
    <span class="refresh-link" style="cursor: pointer; display: inline-flex; margin-right: 4px;">
      <svg class="svg-inline--fa fa-refresh menu-item__icon menu-item__icon_right" aria-hidden="true"
           focusable="false" data-prefix="fas"
           data-icon="refresh" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <title>Refresh</title>
        <path class="" fill="currentColor"
              d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1l17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"></path>
      </svg>
    </span>
    <span class="edit-link" style="cursor: pointer; display: inline-flex;">
      <svg class="svg-inline--fa fa-pencil menu-item__icon menu-item__icon_right" aria-hidden="true"
           focusable="false" data-prefix="fas"
           data-icon="pencil" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <title>Edit link</title>
        <path class="" fill="currentColor"
              d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"></path>
      </svg>
    </span>
  </div>
`;

// language=HTML
export const platformListTemplate = `
  <div class="dropdown-menu">
    <div class="platforms-dropdown">
      <div class="menu">
        <div class="menu-list scrollable"></div>
      </div>
    </div>
  </div>
`;

/**
 * Creates dropdown button DOM from existing button group
 */
export function createDropdownButton(): JQuery<HTMLElement> {
  const group = $('.fade.container .btns._group').clone();
  group.find('span').text('Открыть на сайте');
  group.find('.fa-bookmark').remove();
  group.find('.fa-plus').remove();
  group.addClass('platforms');
  return group;
}
