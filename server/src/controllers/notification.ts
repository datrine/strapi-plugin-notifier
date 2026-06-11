import type { Core } from '@strapi/strapi';

const getUserRoleCodes = async (strapi: Core.Strapi, userId: number): Promise<string[]> => {
  const user = await strapi.db.query('admin::user').findOne({
    where: { id: userId },
    populate: ['roles'],
  });
  return (user as any)?.roles?.map((r: any) => r.code as string) ?? [];
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    const adminUser = ctx.state.user;
    if (!adminUser) return ctx.unauthorized();

    const settings = await strapi.plugin('notifier').service('settings').getEffective();
    const page = Math.max(1, Number(ctx.query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(ctx.query.pageSize ?? settings.ui.pageSize)));

    const roleCodes = await getUserRoleCodes(strapi, adminUser.id);
    const svc = strapi.plugin('notifier').service('notification');

    const [data, total] = await Promise.all([
      svc.findByRecipient(adminUser.id, roleCodes, { page, pageSize }),
      svc.countByRecipient(adminUser.id, roleCodes),
    ]);

    ctx.body = {
      data,
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    };
  },

  async markAsRead(ctx: any) {
    const adminUser = ctx.state.user;
    if (!adminUser) return ctx.unauthorized();

    const id = Number(ctx.params.id);
    const roleCodes = await getUserRoleCodes(strapi, adminUser.id);
    const notification = await strapi
      .plugin('notifier')
      .service('notification')
      .markAsRead(id, adminUser.id, roleCodes);

    if (!notification) return ctx.notFound();
    ctx.body = { data: notification };
  },

  async markAllAsRead(ctx: any) {
    const adminUser = ctx.state.user;
    if (!adminUser) return ctx.unauthorized();

    const roleCodes = await getUserRoleCodes(strapi, adminUser.id);
    await strapi.plugin('notifier').service('notification').markAllAsRead(adminUser.id, roleCodes);
    ctx.body = { ok: true };
  },

  async clear(ctx: any) {
    const adminUser = ctx.state.user;
    if (!adminUser) return ctx.unauthorized();

    const id = Number(ctx.params.id);
    const roleCodes = await getUserRoleCodes(strapi, adminUser.id);
    const deleted = await strapi
      .plugin('notifier')
      .service('notification')
      .delete(id, adminUser.id, roleCodes);

    if (!deleted) return ctx.notFound();
    ctx.body = { ok: true };
  },

  async clearAll(ctx: any) {
    const adminUser = ctx.state.user;
    if (!adminUser) return ctx.unauthorized();

    const roleCodes = await getUserRoleCodes(strapi, adminUser.id);
    await strapi.plugin('notifier').service('notification').clearAll(adminUser.id, roleCodes);
    ctx.body = { ok: true };
  },
});
