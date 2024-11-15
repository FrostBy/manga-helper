import MangalibAPI from '../platforms/mangalib.me/API';
import SenkuroAPI from '../platforms/senkuro.com/API';
import MangabuffAPI from '../platforms/mangabuff.ru/API';
import ReadmangaAPI from '../platforms/readmanga.io/API';
import MangaOVHAPI from '../platforms/manga.ovh/API';

export default class PlatformManager {
  private platforms: { [key: string]: any } = {};

  constructor() {
    this.platforms[MangalibAPI.config.key] = MangalibAPI;
    this.platforms[SenkuroAPI.config.key] = SenkuroAPI;
    this.platforms[MangabuffAPI.config.key] = MangabuffAPI;
    this.platforms[ReadmangaAPI.config.key] = ReadmangaAPI;
    this.platforms[MangaOVHAPI.config.key] = MangaOVHAPI;
  }

  public getPlatform(platformName: string) {
    return this.platforms[platformName] || null;
  }

  public getPlatformKeys() {
    return Object.keys(this.platforms);
  }

  public getPlatforms() {
    return this.platforms;
  }
}
