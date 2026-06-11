import type { Core } from '@strapi/strapi';
import type { NotificationType } from '../config';

export interface SendOptions {
  title: string;
  message?: string;
  type?: NotificationType;
  /** Optional link opened when the user clicks the notification in the inbox. */
  url?: string;
  /**
   * Targeting. Omit entirely to broadcast to all admin users.
   *   to: { userId: 42 }               — specific admin user
   *   to: { role: 'strapi-editor' }    — all users with this role code
   */
  to?: { userId?: number; role?: string };
}

/**
 * High-level notifier service.
 *
 * Usage from any lifecycle, service, or controller:
 *   strapi.plugin('notifier').service('notifier').send({ title: '...', message: '...' });
 *   strapi.plugin('notifier').service('notifier').toRole('strapi-editor', { title: '...' });
 *   strapi.plugin('notifier').service('notifier').toUser(42, { title: '...' });
 */
export default ({ strapi }: { strapi: Core.Strapi }) => {
  const svc = () => strapi.plugin('notifier').service('notification');

  return {
    send({ title, message, type, url, to }: SendOptions) {
      return svc().create({
        title,
        message,
        type,
        url,
        recipientId: to?.userId,
        recipientRole: to?.role,
      });
    },

    broadcast(opts: Omit<SendOptions, 'to'>) {
      return svc().create({ ...opts });
    },

    toRole(role: string, opts: Omit<SendOptions, 'to'>) {
      return svc().create({ ...opts, recipientRole: role });
    },

    toUser(userId: number, opts: Omit<SendOptions, 'to'>) {
      return svc().create({ ...opts, recipientId: userId });
    },
  };
};
