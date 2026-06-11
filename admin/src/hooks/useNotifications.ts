import { useState, useEffect } from 'react';
import { getNotifications, subscribeToNotifications } from '../store/notifications';
import type { Notification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications);
  useEffect(() => subscribeToNotifications(setNotifications), []);
  return notifications;
};
