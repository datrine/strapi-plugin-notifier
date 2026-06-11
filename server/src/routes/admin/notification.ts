export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/notifications',
      handler: 'notification.find',
      config: { policies: ['admin::isAuthenticatedAdmin'] },
    },
    {
      method: 'PUT',
      path: '/notifications/read-all',
      handler: 'notification.markAllAsRead',
      config: { policies: ['admin::isAuthenticatedAdmin'] },
    },
    {
      method: 'DELETE',
      path: '/notifications',
      handler: 'notification.clearAll',
      config: { policies: ['admin::isAuthenticatedAdmin'] },
    },
    {
      method: 'PUT',
      path: '/notifications/:id/read',
      handler: 'notification.markAsRead',
      config: { policies: ['admin::isAuthenticatedAdmin'] },
    },
    {
      method: 'DELETE',
      path: '/notifications/:id',
      handler: 'notification.clear',
      config: { policies: ['admin::isAuthenticatedAdmin'] },
    },
  ],
};
