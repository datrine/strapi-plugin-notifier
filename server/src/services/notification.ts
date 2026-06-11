import type { Core } from '@strapi/strapi';
import type { NotificationType } from '../config';

const UID = 'plugin::notifier.notification' as const;

const accessFilter = (userId: number, roleCodes: string[] = []) => ({
  $or: [
    { recipientId: userId },
    ...(roleCodes.length ? [{ recipientRole: { $in: roleCodes } }] : []),
    { recipientId: null, recipientRole: null },
  ],
});

export interface CreateNotificationInput {
  title: string;
  message?: string;
  type?: NotificationType;
  url?: string;
  recipientId?: number;
  recipientRole?: string;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  findByRecipient(
    userId: number,
    roleCodes: string[],
    { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}
  ) {
    return strapi.db.query(UID).findMany({
      where: accessFilter(userId, roleCodes),
      orderBy: { createdAt: 'desc' },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  },

  countByRecipient(userId: number, roleCodes: string[]) {
    return strapi.db.query(UID).count({ where: accessFilter(userId, roleCodes) });
  },

  countUnread(userId: number, roleCodes: string[]) {
    return strapi.db.query(UID).count({
      where: { ...accessFilter(userId, roleCodes), read: false },
    });
  },

  async markAsRead(id: number, userId: number, roleCodes: string[]) {
    const existing = await strapi.db
      .query(UID)
      .findOne({ where: { id, ...accessFilter(userId, roleCodes) } });
    if (!existing) return null;
    return strapi.db.query(UID).update({ where: { id }, data: { read: true } });
  },

  markAllAsRead(userId: number, roleCodes: string[]) {
    return strapi.db.query(UID).updateMany({
      where: { ...accessFilter(userId, roleCodes), read: false },
      data: { read: true },
    });
  },

  async delete(id: number, userId: number, roleCodes: string[]) {
    const existing = await strapi.db
      .query(UID)
      .findOne({ where: { id, ...accessFilter(userId, roleCodes) } });
    if (!existing) return null;
    return strapi.db.query(UID).delete({ where: { id } });
  },

  clearAll(userId: number, roleCodes: string[]) {
    return strapi.db.query(UID).deleteMany({ where: accessFilter(userId, roleCodes) });
  },

  create({ title, message, type = 'info', url, recipientId, recipientRole }: CreateNotificationInput) {
    return strapi.db.query(UID).create({
      data: { title, message, type, url, read: false, recipientId, recipientRole },
    });
  },

  /** Retention cleanup: remove notifications older than maxDays and enforce per-user cap. */
  async cleanupOld(maxDays: number, maxPerUser: number) {
    if (maxDays > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - maxDays);
      await strapi.db.query(UID).deleteMany({
        where: { createdAt: { $lt: cutoff.toISOString() } },
      });
    }

    if (maxPerUser > 0) {
      // Get all distinct recipientIds
      const rows = await strapi.db.query(UID).findMany({
        select: ['recipientId'],
        where: { recipientId: { $notNull: true } },
      });
      const ids = [...new Set(rows.map((r: any) => r.recipientId as number))];

      for (const recipientId of ids) {
        const total = await strapi.db.query(UID).count({ where: { recipientId } });
        if (total > maxPerUser) {
          const excess = await strapi.db.query(UID).findMany({
            where: { recipientId },
            orderBy: { createdAt: 'asc' },
            limit: total - maxPerUser,
            select: ['id'],
          });
          const excessIds = excess.map((e: any) => e.id as number);
          await strapi.db.query(UID).deleteMany({ where: { id: { $in: excessIds } } });
        }
      }
    }
  },
});
