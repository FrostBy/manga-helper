export default class MetaData {
  static getSlug(): string {
    const url = unsafeWindow.location.pathname;
    const match = url.match(/^\/manga\/([^\/]+)\/chapters(\/.*)?$/);
    return match ? match[1] : null;
  }
}
