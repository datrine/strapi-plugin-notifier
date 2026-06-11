export type FilterType = 'all' | 'unread' | 'info' | 'success' | 'warning' | 'error';
export type RecipientStrategy = 'broadcast' | 'role' | 'user';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface RetentionConfig {
  /** Auto-delete notifications older than this many days. 0 = disabled. */
  maxDays: number;
  /** Cap total stored notifications per user. 0 = disabled. */
  maxPerUser: number;
}

export interface DeliveryConfig {
  /** Default targeting strategy when none is specified in notifier.send(). */
  defaultRecipient: RecipientStrategy;
  /** Role codes that may receive notifications. Empty = all roles. */
  allowedRoles: string[];
}

export interface BadgeConfig {
  enabled: boolean;
  color: string;
}

export interface ThemeAccentConfig {
  info: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeConfig {
  bellSize: string;
  accent: ThemeAccentConfig;
}

export interface UIConfig {
  /** How often (ms) the Bell icon polls the server. */
  pollInterval: number;
  /** Notifications per page in the inbox. */
  pageSize: number;
  /** Filter active by default when the inbox opens. */
  defaultFilter: FilterType;
  badge: BadgeConfig;
  theme: ThemeConfig;
}

export interface PluginSettings {
  retention: RetentionConfig;
  delivery: DeliveryConfig;
  ui: UIConfig;
}

/** Deep partial — every field optional for consumer-facing config. */
export type PluginConfig = {
  retention?: Partial<RetentionConfig>;
  delivery?: Partial<DeliveryConfig>;
  ui?: Partial<UIConfig> & {
    badge?: Partial<BadgeConfig>;
    theme?: Partial<ThemeConfig> & { accent?: Partial<ThemeAccentConfig> };
  };
};

export const DEFAULT_SETTINGS: PluginSettings = {
  retention: {
    maxDays: 90,
    maxPerUser: 500,
  },
  delivery: {
    defaultRecipient: 'broadcast',
    allowedRoles: [],
  },
  ui: {
    pollInterval: 30_000,
    pageSize: 20,
    defaultFilter: 'all',
    badge: {
      enabled: true,
      color: '#ee5e52',
    },
    theme: {
      bellSize: '1.5em',
      accent: {
        info: '#4945ff',
        success: '#328048',
        warning: '#d97706',
        error: '#d02b20',
      },
    },
  },
};

/** Deeply merges consumer config with defaults. */
export const mergeWithDefaults = (overrides: PluginConfig = {}): PluginSettings => ({
  retention: { ...DEFAULT_SETTINGS.retention, ...(overrides.retention ?? {}) },
  delivery: { ...DEFAULT_SETTINGS.delivery, ...(overrides.delivery ?? {}) },
  ui: {
    ...DEFAULT_SETTINGS.ui,
    ...(overrides.ui ?? {}),
    badge: { ...DEFAULT_SETTINGS.ui.badge, ...(overrides.ui?.badge ?? {}) },
    theme: {
      ...DEFAULT_SETTINGS.ui.theme,
      ...(overrides.ui?.theme ?? {}),
      accent: { ...DEFAULT_SETTINGS.ui.theme.accent, ...(overrides.ui?.theme?.accent ?? {}) },
    },
  },
});
