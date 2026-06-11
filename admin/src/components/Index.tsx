import { useState, useEffect } from 'react';
import { Box } from '@strapi/design-system';
import { useNotificationActions } from '../hooks/useNotificationActions';
import InboxHeader from './inbox/InboxHeader';
import NotificationList from './inbox/NotificationList';
import type { FilterType } from '../types';

export default function Index() {
  const [filter, setFilter] = useState<FilterType>('all');
  const {
    fetchAll,
    loadMore,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleClear,
    handleClearAll,
    isLoading,
    hasMore,
  } = useNotificationActions();

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <Box padding={8} style={{ height: '100%' }}>
      <InboxHeader
        filter={filter}
        onFilterChange={setFilter}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
      />
      <NotificationList
        filter={filter}
        onMarkAsRead={handleMarkAsRead}
        onClear={handleClear}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </Box>
  );
}
