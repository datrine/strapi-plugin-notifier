import { Box, Flex, Typography, IconButton } from '@strapi/design-system';
import { Cross } from '@strapi/icons';
import { usePluginConfig } from '../../hooks/usePluginConfig';
import type { Notification } from '../../types';

const UNREAD_BG: Record<Notification['type'], string> = {
  info: '#f0f0ff',
  success: '#f0fff4',
  warning: '#fffbf0',
  error: '#fff5f5',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onClear,
}: NotificationItemProps) {
  const config = usePluginConfig();
  const accent = config.theme.accent[notification.type];

  const handleClick = () => {
    if (!notification.read) onMarkAsRead(notification.id);
    if (notification.url) {
      if (notification.url.startsWith('http')) {
        window.open(notification.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = notification.url;
      }
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear(notification.id);
  };

  const bg = !notification.read ? UNREAD_BG[notification.type] : 'transparent';

  return (
    <Box
      onClick={handleClick}
      style={{
        borderLeft: `4px solid ${accent}`,
        backgroundColor: bg,
        cursor: notification.url ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
      padding={4}
    >
      <Flex justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex gap={1} alignItems="center">
            <Typography
              variant="omega"
              fontWeight={notification.read ? 'normal' : 'bold'}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {notification.title}
            </Typography>
            {notification.url && (
              <Typography variant="pi" textColor="neutral500">
                ↗
              </Typography>
            )}
          </Flex>
          {notification.message && (
            <Typography variant="pi" textColor="neutral600" style={{ marginTop: 2 }}>
              {notification.message}
            </Typography>
          )}
          <Typography variant="pi" textColor="neutral400" style={{ marginTop: 4 }}>
            {new Date(notification.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <IconButton
          label="Dismiss"
          onClick={handleDismiss}
          variant="ghost"
          size="S"
        >
          <Cross />
        </IconButton>
      </Flex>
    </Box>
  );
}
