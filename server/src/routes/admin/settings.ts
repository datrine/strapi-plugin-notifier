export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/settings',
      handler: 'settings.find',
      config: { policies: ['admin::hasPermissions'], config: { actions: ['plugin::notifier.settings.read'] } },
    },
    {
      method: 'PUT',
      path: '/settings',
      handler: 'settings.update',
      config: { policies: ['admin::hasPermissions'], config: { actions: ['plugin::notifier.settings.update'] } },
    },
    {
      method: 'DELETE',
      path: '/settings',
      handler: 'settings.reset',
      config: { policies: ['admin::hasPermissions'], config: { actions: ['plugin::notifier.settings.update'] } },
    },
  ],
};
