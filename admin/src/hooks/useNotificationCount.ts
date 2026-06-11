import { useState, useEffect } from 'react';
import { getNotificationCount, subscribeToCount } from '../store/notifications';

export const useNotificationCount = () => {
  const [count, setCount] = useState(getNotificationCount);
  useEffect(() => subscribeToCount(setCount), []);
  return count;
};
