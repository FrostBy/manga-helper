/**
 * Централизованная система логирования
 * Логи идут в unsafeWindow.console для видимости в браузере
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 999,
}

export class Logger {
  private static currentLevel: LogLevel = LogLevel.INFO;
  private static readonly STORAGE_KEY = 'manga-helper:log-level';

  /**
   * Инициализация логгера
   * Читает уровень из localStorage
   */
  static init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.currentLevel = parseInt(saved, 10);
    }

    // Экспортируем в unsafeWindow для дебага
    if (typeof unsafeWindow !== 'undefined') {
      unsafeWindow.MangaHelperLogger = {
        setLevel: (level: LogLevel) => this.setLevel(level),
        getLevel: () => this.currentLevel,
        levels: LogLevel,
      };
    }

    this.info('Logger', 'Initialized', `Level: ${LogLevel[this.currentLevel]}`);
  }

  /**
   * Установить уровень логирования
   */
  static setLevel(level: LogLevel) {
    this.currentLevel = level;
    localStorage.setItem(this.STORAGE_KEY, level.toString());
    this.info('Logger', 'Level changed', LogLevel[level]);
  }

  /**
   * Debug - детальная информация для разработки
   */
  static debug(context: string, message: string, ...args: any[]) {
    if (this.currentLevel <= LogLevel.DEBUG) {
      this.log('DEBUG', context, message, args, 'color: #6c757d');
    }
  }

  /**
   * Info - общая информация
   */
  static info(context: string, message: string, ...args: any[]) {
    if (this.currentLevel <= LogLevel.INFO) {
      this.log('INFO', context, message, args, 'color: #0d6efd');
    }
  }

  /**
   * Warn - предупреждения
   */
  static warn(context: string, message: string, ...args: any[]) {
    if (this.currentLevel <= LogLevel.WARN) {
      this.log('WARN', context, message, args, 'color: #ffc107');
    }
  }

  /**
   * Error - ошибки
   */
  static error(context: string, message: string, error?: any) {
    if (this.currentLevel <= LogLevel.ERROR) {
      this.log(
        'ERROR',
        context,
        message,
        [error],
        'color: #dc3545; font-weight: bold',
      );
    }
  }

  /**
   * Внутренний метод логирования
   */
  private static log(
    level: string,
    context: string,
    message: string,
    args: any[],
    style: string,
  ) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    const prefix = `%c[${timestamp}] [${level}] [${context}]`;

    const console =
      typeof unsafeWindow !== 'undefined'
        ? unsafeWindow.console
        : window.console;

    if (args.length > 0 && args[0] !== undefined) {
      console.log(prefix, style, message, ...args);
    } else {
      console.log(prefix, style, message);
    }
  }
}
