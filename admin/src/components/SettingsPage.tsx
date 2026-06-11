import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Typography,
  Button,
  TextInput,
  NumberInput,
  Divider,
} from '@strapi/design-system';
import { useFetchClient } from '@strapi/admin/strapi-admin';

interface AccentConfig {
  info: string;
  success: string;
  warning: string;
  error: string;
}

interface SettingsState {
  retention: { maxDays: number; maxPerUser: number };
  delivery: { pollIntervalMs: number; pageSize: number };
  ui: { theme: { accent: AccentConfig } };
}

const DEFAULT: SettingsState = {
  retention: { maxDays: 90, maxPerUser: 500 },
  delivery: { pollIntervalMs: 30000, pageSize: 20 },
  ui: { theme: { accent: { info: '#4945ff', success: '#5cb85c', warning: '#f0ad4e', error: '#ee5e52' } } },
};

export default function SettingsPage() {
  const { get, put, del } = useFetchClient();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    get('/notifier/settings')
      .then(({ data }) => { if (data) setSettings(data as SettingsState); })
      .catch(() => {});
  }, [get]);

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const { data } = await put('/notifier/settings', { data: settings });
      if (data) setSettings(data as SettingsState);
    } catch (e: any) {
      setSaveError(e?.message ?? 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await del('/notifier/settings');
      const { data } = await get('/notifier/settings');
      if (data) setSettings(data as SettingsState);
    } finally {
      setIsResetting(false);
    }
  };

  const set = (path: string, value: unknown) => {
    setSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SettingsState;
      const keys = path.split('.');
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  return (
    <Box padding={8}>
      <Flex justifyContent="space-between" alignItems="center" paddingBottom={6}>
        <Typography variant="alpha">Notifier Settings</Typography>
        <Flex gap={2}>
          <Button variant="tertiary" onClick={handleReset} loading={isResetting}>
            Reset to defaults
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            Save
          </Button>
        </Flex>
      </Flex>

      {saveError && (
        <Box paddingBottom={4}>
          <Typography textColor="danger600">{saveError}</Typography>
        </Box>
      )}

      <Box background="neutral0" padding={6} hasRadius>
        <Typography variant="delta" paddingBottom={4} as="h2">
          Retention
        </Typography>
        <Flex gap={4} wrap="wrap">
          <NumberInput
            label="Max age (days)"
            hint="Notifications older than this will be deleted by the nightly cron."
            value={settings.retention.maxDays}
            onValueChange={(v: number) => set('retention.maxDays', v)}
            style={{ flex: 1 }}
          />
          <NumberInput
            label="Max per user"
            hint="Cap on notifications stored per user. Oldest are removed first."
            value={settings.retention.maxPerUser}
            onValueChange={(v: number) => set('retention.maxPerUser', v)}
            style={{ flex: 1 }}
          />
        </Flex>
      </Box>

      <Box background="neutral0" padding={6} hasRadius marginTop={4}>
        <Typography variant="delta" paddingBottom={4} as="h2">
          Delivery
        </Typography>
        <Flex gap={4} wrap="wrap">
          <NumberInput
            label="Poll interval (ms)"
            hint="How often the Bell polls the server for new notifications."
            value={settings.delivery.pollIntervalMs}
            onValueChange={(v: number) => set('delivery.pollIntervalMs', v)}
            style={{ flex: 1 }}
          />
          <NumberInput
            label="Page size"
            hint="Number of notifications loaded per page in the inbox."
            value={settings.delivery.pageSize}
            onValueChange={(v: number) => set('delivery.pageSize', v)}
            style={{ flex: 1 }}
          />
        </Flex>
      </Box>

      <Box background="neutral0" padding={6} hasRadius marginTop={4}>
        <Typography variant="delta" paddingBottom={4} as="h2">
          Theme
        </Typography>
        <Divider />
        <Box paddingTop={4}>
          <Typography variant="sigma" paddingBottom={3}>
            Accent colours (hex)
          </Typography>
          <Flex gap={4} wrap="wrap">
            {(['info', 'success', 'warning', 'error'] as const).map((type) => (
              <TextInput
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                value={settings.ui.theme.accent[type]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  set(`ui.theme.accent.${type}`, e.target.value)
                }
                style={{ flex: 1 }}
              />
            ))}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
