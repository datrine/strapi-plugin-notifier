import { Box, Flex, Button, Loader } from '@strapi/design-system';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import EmptyInbox from './EmptyInbox';
import type { FilterType, Notification } from '../../types';

const applyFilter = (items: Notification[], filter: FilterType): Notification[] => {
  if (filter === 'all') return items;
  if (filter === 'unread') return items.filter((n) => !n.read);
  return items.filter((n) => n.type === filter);
};

interface NotificationListProps {
  filter: FilterType;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function NotificationList({
  filter,
  onMarkAsRead,
  onClear,
  isLoading,
  hasMore,
  onLoadMore,
}: NotificationListProps) {
  const notifications = useNotifications();
  const filtered = applyFilter(notifications, filter);

  if (isLoading && notifications.length === 0) {
    return (
      <Flex justifyContent="center" padding={8}>
        <Loader small>Loading notifications…</Loader>
      </Flex>
    );
  }

  if (filtered.length === 0) {
    return <EmptyInbox filter={filter} />;
  }

  return (
    <Box>
      {filtered.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkAsRead={onMarkAsRead}
          onClear={onClear}
        />
      ))}
      {hasMore && (
        <Flex justifyContent="center" padding={4}>
          <Button variant="tertiary" onClick={onLoadMore} loading={isLoading}>
            {isLoading ? 'Loading…' : 'Load more'}
          </Button>
        </Flex>
      )}
    </Box>
  );
}
