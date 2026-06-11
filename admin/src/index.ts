import { lazy } from 'react';
import type { StrapiApp } from '@strapi/admin/strapi-admin';
import Bell from './components/Bell';

const pluginId = 'notifier';

export default {
  register(app: StrapiApp) {
    // Notification inbox in the sidebar
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: Bell,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Notifications',
      },
      permissions: [],
      Component: () => import('./components/Index'),
    });

    // Settings panel under Settings → Notifier
    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: `${pluginId}.settings.section`,
          defaultMessage: 'Notifier',
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.settings.page`,
            defaultMessage: 'Configuration',
          },
          id: `${pluginId}.settings`,
          to: `/settings/${pluginId}`,
          Component: lazy(() => import('./components/SettingsPage')),
          permissions: [
            { action: `plugin::${pluginId}.settings.read`, subject: null },
          ],
        },
      ]
    );

    app.registerPlugin({
      id: pluginId,
      name: 'Notifier',
    });
  },
};
