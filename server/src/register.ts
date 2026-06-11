import type { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  // Register admin permissions for the settings panel
  strapi.admin?.services?.permission?.actionProvider?.registerMany([
    {
      section: 'plugins',
      displayName: 'Read settings',
      uid: 'settings.read',
      pluginName: 'notifier',
    },
    {
      section: 'plugins',
      displayName: 'Update settings',
      uid: 'settings.update',
      pluginName: 'notifier',
    },
  ]);

  // Schedule daily retention cleanup via Strapi cron
  strapi.cron.add({
    notifierCleanup: {
      task: async ({ strapi: s }: { strapi: Core.Strapi }) => {
        const settings = await s.plugin('notifier').service('settings').getEffective();
        const { maxDays, maxPerUser } = settings.retention;
        await s.plugin('notifier').service('notification').cleanupOld(maxDays, maxPerUser);
      },
      options: {
        rule: '0 3 * * *', // 3 AM daily — configurable in cron settings if needed
      },
    },
  });
};
