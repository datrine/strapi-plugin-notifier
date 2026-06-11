# strapi-plugin-notifier

A first-class notification system for Strapi v5 admin panels. Adds a live bell icon to the sidebar, a full notification inbox, a runtime Settings panel, and a simple API to send notifications from anywhere in your Strapi application.

## Features

- **Live bell icon** — badge count updated by polling the server (interval configurable)
- **Notification inbox** — filter by type, mark as read, dismiss, load more, clear all
- **Targeting** — broadcast to all admins, or target by user ID or role code
- **Configurable** — poll interval, page size, retention policy, and UI accent colours
- **Settings panel** — runtime configuration via Settings → Notifier (persisted in Strapi plugin store)
- **Retention cron** — daily cleanup at 3 AM, respects maxDays and maxPerUser limits
- **Strapi v5 only**

## Installation

```bash
npm install strapi-plugin-notifier
# or
yarn add strapi-plugin-notifier
```

Enable the plugin in `config/plugins.ts`:

```typescript
export default {
  notifier: {
    enabled: true,
    config: {
      // all fields are optional — see Configuration below
    },
  },
};
```

## Configuration

All configuration is optional. Built-in defaults apply unless overridden.

```typescript
// config/plugins.ts
export default {
  notifier: {
    enabled: true,
    config: {
      retention: {
        maxDays: 90,       // delete notifications older than N days
        maxPerUser: 500,   // cap notifications stored per user
      },
      delivery: {
        pollIntervalMs: 30_000, // how often the Bell polls (ms)
        pageSize: 20,           // notifications per page in inbox
      },
      ui: {
        theme: {
          accent: {
            info:    '#4945ff',
            success: '#5cb85c',
            warning: '#f0ad4e',
            error:   '#ee5e52',
          },
        },
      },
    },
  },
};
```

Settings can also be updated at runtime from the Strapi admin panel under **Settings → Notifier**. Runtime settings take precedence over `config/plugins.ts`.

## Sending notifications

Use the `notifier` service from anywhere in your Strapi code (services, controllers, lifecycles, webhooks):

```typescript
const notifier = strapi.plugin('notifier').service('notifier');

// Broadcast to all admin users
notifier.broadcast({ title: 'Maintenance scheduled', type: 'warning' });

// Send to a specific role
notifier.toRole('strapi-editor', {
  title: 'New content submitted',
  message: 'An article is waiting for review.',
  url: '/content-manager/collection-types/api::article.article',
});

// Send to a specific admin user (by user ID)
notifier.toUser(42, {
  title: 'Your export is ready',
  type: 'success',
  url: '/uploads/export-2024.csv',
});

// Generic send with full control
notifier.send({
  title: 'Hello',
  message: 'World',
  type: 'info',
  url: 'https://example.com',
  to: { role: 'strapi-super-admin' },
});
```

### Notification options

| Field     | Type                                      | Required | Default     |
|-----------|-------------------------------------------|----------|-------------|
| `title`   | `string`                                  | Yes      | —           |
| `message` | `string`                                  | No       | —           |
| `type`    | `'info' \| 'success' \| 'warning' \| 'error'` | No  | `'info'`    |
| `url`     | `string`                                  | No       | —           |

## API routes

All routes require `admin::isAuthenticatedAdmin`. The plugin mounts under `/notifier/`.

| Method | Path                            | Description                          |
|--------|---------------------------------|--------------------------------------|
| GET    | `/notifier/notifications`       | List notifications (paginated)       |
| PUT    | `/notifier/notifications/read-all` | Mark all as read                  |
| DELETE | `/notifier/notifications`       | Clear all notifications              |
| PUT    | `/notifier/notifications/:id/read` | Mark one as read                 |
| DELETE | `/notifier/notifications/:id`   | Clear one notification               |
| GET    | `/notifier/config`              | Fetch UI config (safe for frontend)  |
| GET    | `/notifier/settings`            | Get full settings (requires permission) |
| PUT    | `/notifier/settings`            | Update settings (requires permission) |
| DELETE | `/notifier/settings`            | Reset settings to defaults           |

Query parameters for `GET /notifier/notifications`:

| Param      | Default | Description         |
|------------|---------|---------------------|
| `page`     | `1`     | Page number         |
| `pageSize` | `20`    | Results per page    |

## Permissions

Two permissions are registered under the **Notifier** plugin section in **Settings → Roles**:

- `plugin::notifier.settings.read` — view the settings panel
- `plugin::notifier.settings.update` — save or reset settings

## Content type

Notifications are stored in `plugin::notifier.notification` (collection: `notifier_notifications`). The content type is hidden from Content Manager and Content-Type Builder by default.

## License

MIT
