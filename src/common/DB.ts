import Set from 'lodash/set';
import Get from 'lodash/get';
import Unset from 'lodash/unset';
import GMStorage, { Value } from 'gm-storage';

const store = new GMStorage();

interface DBRecord<T = any> {
  expiresAfter?: number;
  value: T;
}

interface PlatformData {
  _GLOBAL: {
    [key: string]: DBRecord<any>;
  };

  [slug: string]: {
    [prop: string]: DBRecord<any>;
  };
}

class DB {
  static milliseconds = 3600000;

  static _isExpired(data: DBRecord) {
    return data?.expiresAfter && Date.now() >= data.expiresAfter;
  }

  static _generateExpireDate(value: number | boolean): number | false {
    if (value === true) return this.milliseconds + Date.now();
    const num = Number(value);
    if (num > 0) return num + Date.now();
    return false;
  }

  static get<T>(
    platform: string,
    slug: string,
    prop: string,
    defaultValue?: T,
    getExpired = false,
  ): T | any {
    const platformData: PlatformData = store.get(platform, {}) as PlatformData;
    const data = Get(platformData, [slug, prop], defaultValue);

    // Type guard: check if data is DBRecord
    if (data && typeof data === 'object' && 'value' in data) {
      if (!getExpired && this._isExpired(data as DBRecord<T>)) {
        return defaultValue;
      }
      return (data as DBRecord<T>).value;
    }

    return defaultValue;
  }

  static set<T = any>(
    platform: string,
    slug: string,
    prop: string,
    data: T,
    expiryMilliseconds: number | boolean = false,
  ): T {
    const oldData: PlatformData = store.get(platform, {}) as PlatformData;
    const record: DBRecord<T> = {
      value: data,
      expiresAfter: this._generateExpireDate(expiryMilliseconds),
    } as DBRecord<T>;
    const newData: PlatformData = Set(oldData, [slug, prop], record);
    store.set(platform, newData as unknown as Value);
    return record.value;
  }

  static getAndDelete<T = any>(
    platform: string,
    slug: string,
    prop: string,
    defaultValue?: T,
    getExpired = false,
  ) {
    const data = this.get<T>(platform, slug, prop, defaultValue, getExpired);
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

  static _getCache(platform: string, slug: string) {
    return DB.getAndDelete(platform, slug, `invalidate`)
      ? false
      : this.get(platform, slug, 'cache');
  }
}

export default DB;
