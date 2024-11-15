declare module '*.less';
declare var tokens: Record<string, any>;
declare var unsafeWindow: Window & {
  $: typeof jQuery;
  GM_fetch: typeof import('@trim21/gm-fetch').default;
};

declare interface JQuery<TElement = HTMLElement> {
  rawClick(): this;
}

declare var GM: {
  cookie: {
    list(
      details?: Tampermonkey.ListCookiesDetails,
    ): Promise<Tampermonkey.Cookie[]>; // Возвращаем промис с массивом cookies

    set(details: Tampermonkey.SetCookiesDetails): Promise<void>; // Возвращаем промис, который разрешается при успешной установке

    delete(
      details: AtLeastOneOf<Tampermonkey.DeleteCookiesDetails>,
    ): Promise<void>; // Возвращаем промис, который разрешается при успешном удалении
  };
};
