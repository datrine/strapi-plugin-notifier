import type { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Seed the plugin store with the effective settings on first boot
  // so the settings panel always has something to display.
  const stored = await strapi
    .store({ environment: '', type: 'plugin', name: 'notifier' })
    .get({ key: 'settings' });

  if (!stored) {
    const effective = await strapi.plugin('notifier').service('settings').getEffective();
    await strapi
      .store({ environment: '', type: 'plugin', name: 'notifier' })
      .set({ key: 'settings', value: effective });
  }
};
