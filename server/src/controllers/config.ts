import type { Core } from '@strapi/strapi';

/** Returns only the UI config — safe to expose to the admin panel. */
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    const settings = await strapi.plugin('notifier').service('settings').getEffective();
    ctx.body = { data: settings.ui };
  },
});
