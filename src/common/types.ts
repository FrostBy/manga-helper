/**
 * Domain types for manga-helper
 * These types represent the core data structures used across all platforms
 */

/**
 * Represents a single chapter of a manga
 */
export interface Chapter {
  id?: string | number;
  number: number;
  title?: string;
  volume?: number;
  createdAt?: string;
  [key: string]: unknown; // Allow platform-specific fields
}

/**
 * Response containing multiple chapters
 */
export interface ChaptersResponse {
  data: Chapter[];
  [key: string]: unknown; // Allow platform-specific metadata
}

/**
 * Represents manga metadata
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
  [key: string]: unknown; // Allow platform-specific fields
}

/**
 * User's bookmark/reading progress for a manga
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
  [key: string]: unknown; // Allow platform-specific fields
}

/**
 * Result of searching for manga on another platform
 */
export interface SearchResult {
  platform: string;
  platformKey: string; // Key like "senkuro.com", "readmanga.io"
  url: string;
  slug: string;
  chapter: number;
  lastChapterRead: number;
}

/**
 * API response wrapper for getManga
 */
export interface MangaData {
  chapter: number;
  lastChapterRead: number;
}
