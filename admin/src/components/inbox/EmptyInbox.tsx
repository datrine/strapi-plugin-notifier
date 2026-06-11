import { Box, Typography } from '@strapi/design-system';
import type { FilterType } from '../../types';

const MESSAGES: Record<FilterType, string> = {
  all: 'No notifications yet.',
  unread: 'No unread notifications.',
  info: 'No info notifications.',
  success: 'No success notifications.',
  warning: 'No warning notifications.',
  error: 'No error notifications.',
};

interface EmptyInboxProps {
  filter?: FilterType;
}

export default function EmptyInbox({ filter = 'all' }: EmptyInboxProps) {
  return (
    <Box padding={8} style={{ textAlign: 'center' }}>
      <Typography variant="omega" textColor="neutral500">
        {MESSAGES[filter]}
      </Typography>
    </Box>
  );
}
