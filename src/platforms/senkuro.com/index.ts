/**
 * Senkuro.com platform plugin
 * Auto-registers itself with the PluginRegistry
 */
import { PluginRegistry } from '../../common/PluginRegistry';
import API from './API';
import Router from './router';

PluginRegistry.register(API, Router);
