/**
 * Доменные типы для manga-helper
 * Базовые структуры данных используемые на всех платформах
 */

/**
 * Одна глава манги
 */
export interface Chapter {
  id?: string | number;
  number: number;
  title?: string;
  volume?: number;
  createdAt?: string;
  [key: string]: unknown; // Платформо-специфичные поля
}

/**
 * Ответ с несколькими главами
 */
export interface ChaptersResponse {
  data: Chapter[];
  [key: string]: unknown; // Платформо-специфичные метаданные
}

/**
 * Метаданные манги
 */
export interface Manga {
  slug?: string;
  name: string;
  rus_name?: string;
  eng_name?: string;
  otherNames?: string[];
  cover?: string;
  description?: string;
  status?: string;
  [key: string]: unknown; // Платформо-специфичные поля
}

/**
 * Закладка/прогресс чтения пользователя
 */
export interface Bookmark {
  chapter: number;
  lastChapterRead?: number;
  data?: {
    item?: {
      number: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown; // Платформо-специфичные поля
}

/**
 * Результат поиска манги на другой платформе
 */
export interface SearchResult {
  platform: string;
  platformKey: string; // Ключ типа "senkuro.com", "readmanga.io"
  url: string;
  slug: string;
  chapter: number;
  lastChapterRead: number;
}

/**
 * Обёртка ответа API для getManga
 */
export interface MangaData {
  chapter: number;
  lastChapterRead: number;
}
