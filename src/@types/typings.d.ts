declare module '*.less';
declare var tokens: Record<string, any>;
declare var unsafeWindow: Window & {
  $: typeof jQuery;
  GM_fetch: typeof import('@trim21/gm-fetch').default;
  console: Console;
  MangaHelperLogger: {
    setLevel: (level: number) => void;
    getLevel: () => number;
    levels: typeof import('../common/Logger').LogLevel;
  };
};

declare interface JQuery<TElement = HTMLElement> {
  rawClick(): this;
}

declare var GM: {
  cookie: {
    list(
      details?: Tampermonkey.ListCookiesDetails,
    ): Promise<Tampermonkey.Cookie[]>;

    set(details: Tampermonkey.SetCookiesDetails): Promise<void>;

    delete(
      details: AtLeastOneOf<Tampermonkey.DeleteCookiesDetails>,
    ): Promise<void>;
  };
};
