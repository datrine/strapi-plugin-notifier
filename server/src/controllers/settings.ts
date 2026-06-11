import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    const settings = await strapi.plugin('notifier').service('settings').getEffective();
    ctx.body = { data: settings };
  },

  async update(ctx: any) {
    const patch = ctx.request.body as Record<string, unknown>;
    const updated = await strapi.plugin('notifier').service('settings').update(patch as any);
    ctx.body = { data: updated };
  },

  async reset(ctx: any) {
    await strapi.plugin('notifier').service('settings').reset();
    const defaults = await strapi.plugin('notifier').service('settings').getEffective();
    ctx.body = { data: defaults };
  },
});
