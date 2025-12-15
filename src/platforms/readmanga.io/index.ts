/**
 * Плагин платформы ReadManga.io
 * Автоматически регистрируется в PluginRegistry
 */
import { PluginRegistry } from '../../common/PluginRegistry';
import API from './API';
import Router from './router';

PluginRegistry.register(API, Router);
