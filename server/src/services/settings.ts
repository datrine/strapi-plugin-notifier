import type { Core } from '@strapi/strapi';
import { DEFAULT_SETTINGS, mergeWithDefaults, type PluginSettings, type PluginConfig } from '../config';

const STORE_KEY = 'settings';

const getStore = (strapi: Core.Strapi) =>
  strapi.store({ environment: '', type: 'plugin', name: 'notifier' });

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /** Returns settings from the plugin store, falling back to defaults. */
  async get(): Promise<PluginSettings> {
    const stored = (await getStore(strapi).get({ key: STORE_KEY })) as PluginSettings | null;
    return stored ?? { ...DEFAULT_SETTINGS };
  },

  /**
   * Returns the effective settings: defaults → config/plugins.ts → plugin store (highest priority).
   * This is the source of truth used by all server-side logic.
   */
  async getEffective(): Promise<PluginSettings> {
    const fromPluginsConfig = (strapi.config.get('plugin::notifier', {}) as PluginConfig);
    const fromStore = (await getStore(strapi).get({ key: STORE_KEY })) as Partial<PluginSettings> | null;

    const withPluginsConfig = mergeWithDefaults(fromPluginsConfig);

    if (!fromStore) return withPluginsConfig;

    // Store values win over config/plugins.ts values
    return {
      retention: { ...withPluginsConfig.retention, ...(fromStore.retention ?? {}) },
      delivery: { ...withPluginsConfig.delivery, ...(fromStore.delivery ?? {}) },
      ui: {
        ...withPluginsConfig.ui,
        ...(fromStore.ui ?? {}),
        badge: { ...withPluginsConfig.ui.badge, ...(fromStore.ui?.badge ?? {}) },
        theme: {
          ...withPluginsConfig.ui.theme,
          ...(fromStore.ui?.theme ?? {}),
          accent: {
            ...withPluginsConfig.ui.theme.accent,
            ...(fromStore.ui?.theme?.accent ?? {}),
          },
        },
      },
    };
  },

  /** Persists a full or partial settings update to the plugin store. */
  async update(patch: Partial<PluginSettings>): Promise<PluginSettings> {
    const current = await this.get();
    const next: PluginSettings = {
      retention: { ...current.retention, ...(patch.retention ?? {}) },
      delivery: { ...current.delivery, ...(patch.delivery ?? {}) },
      ui: {
        ...current.ui,
        ...(patch.ui ?? {}),
        badge: { ...current.ui.badge, ...(patch.ui?.badge ?? {}) },
        theme: {
          ...current.ui.theme,
          ...(patch.ui?.theme ?? {}),
          accent: { ...current.ui.theme.accent, ...(patch.ui?.theme?.accent ?? {}) },
        },
      },
    };
    await getStore(strapi).set({ key: STORE_KEY, value: next });
    return next;
  },

  /** Resets plugin store settings, reverting to config/plugins.ts + built-in defaults. */
  async reset(): Promise<void> {
    await getStore(strapi).delete({ key: STORE_KEY });
  },
});
