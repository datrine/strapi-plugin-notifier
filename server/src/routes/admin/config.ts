export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/config',
      handler: 'config.find',
      config: { policies: ['admin::isAuthenticatedAdmin'] },
    },
  ],
};
