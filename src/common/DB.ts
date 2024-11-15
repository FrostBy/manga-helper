import Set from 'lodash/set';
import Get from 'lodash/get';
import Unset from 'lodash/unset';
import GMStorage, { Value } from 'gm-storage';
const store = new GMStorage();

export interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

interface DBRecord extends Iterable<[string, any]> {
  expiresAfter?: number;
  value: any;
}

interface PlatformData extends Iterable<[string, any]> {
  _GLOBAL: {
    [key: string]: any;
  };

  [slug: string]: {
    [prop: string]: DBRecord;
  };
}

interface Database extends Iterable<PlatformData> {
  [platform: string]: PlatformData;
}

class DB {
  static milliseconds = 3600000;

  static _isExpired(data: DBRecord) {
    return data?.expiresAfter && Date.now() >= data.expiresAfter;
  }

  static _generateExpireDate(value: number | boolean) {
    if (!value) return false;
    if (value === true) return this.milliseconds + Date.now();
    if (!isNaN(value)) return +value + Date.now();
  }

  static get(
    platform: string,
    slug: string,
    prop: string,
    defaultValue: any = null,
    getExpired = false,
  ): DBRecord['value'] {
    const platformData: PlatformData = store.get(platform, {}) as PlatformData;
    const data: DBRecord | typeof defaultValue = Get(
      platformData,
      [slug, prop],
      defaultValue,
    );
    if (!getExpired && this._isExpired(data)) return defaultValue;

    return data?.value || defaultValue;
  }

  static set(
    platform: string,
    slug: string,
    prop: string,
    data: any,
    expiryMilliseconds = false,
  ): DBRecord['value'] {
    const oldData: PlatformData = store.get(platform, {}) as PlatformData;
    data = {
      value: data,
      expiresAfter: this._generateExpireDate(expiryMilliseconds),
    } as DBRecord;
    const newData: PlatformData = Set(oldData, [slug, prop], data);
    store.set(platform, newData as unknown as Value);
    return data.value;
  }

  static getAndDelete(
    platform: string,
    slug: string,
    prop: string,
    defaultValue: any = null,
    getExpired = false,
  ) {
    const data = this.get(platform, slug, prop, defaultValue, getExpired);
    this.delete(platform, slug, prop);
    return data;
  }

  static delete(platform: string, slug: string, prop: string) {
    const oldData: PlatformData = store.get(platform, {}) as PlatformData;
    if (Unset(oldData, [slug, prop])) {
      store.set(platform, oldData as unknown as Value);
    }
    return true;
  }

  static async flushExpired() {
    for (const [platform, data] of store as unknown as Map<
      string,
      PlatformData
    >) {
      for (const slug in data) {
        for (const prop in data[slug]) {
          if (this._isExpired(data[slug][prop])) Unset(data, [slug, prop]);
        }
      }
      store.set(platform, data as unknown as Value);
    }
  }

  static flushDB() {
    store.clear();
  }

  static async _getCache(platform: string, slug: string) {
    return DB.getAndDelete(platform, slug, `invalidate`)
      ? false
      : this.get(platform, slug, 'cache');
  }
}

export default DB;
