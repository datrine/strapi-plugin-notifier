import { Box, Flex, Typography, Button } from '@strapi/design-system';
import type { FilterType } from '../../types';

const FILTERS: FilterType[] = ['all', 'unread', 'info', 'success', 'warning', 'error'];

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'All',
  unread: 'Unread',
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

interface InboxHeaderProps {
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export default function InboxHeader({
  filter,
  onFilterChange,
  onMarkAllAsRead,
  onClearAll,
}: InboxHeaderProps) {
  return (
    <Box paddingBottom={4}>
      <Flex justifyContent="space-between" alignItems="center" paddingBottom={4}>
        <Typography variant="alpha">Notifications</Typography>
        <Flex gap={2}>
          <Button variant="tertiary" size="S" onClick={onMarkAllAsRead}>
            Mark all as read
          </Button>
          <Button
            variant="danger-light"
            size="S"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        </Flex>
      </Flex>
      <Flex gap={2} wrap="wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              border: '1px solid',
              borderColor: filter === f ? '#4945ff' : '#dcdce4',
              backgroundColor: filter === f ? '#f0f0ff' : 'transparent',
              color: filter === f ? '#4945ff' : '#32324d',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: filter === f ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </Flex>
    </Box>
  );
}
