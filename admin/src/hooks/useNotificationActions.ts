import { useCallback, useRef, useState } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  setNotifications,
  markAsRead as storeMarkAsRead,
  markAllAsRead as storeMarkAllAsRead,
  clearNotification as storeClear,
  clearAll as storeClearAll,
  getNotifications,
} from '../store/notifications';
import { getConfig } from '../store/config';
import type { Notification, Pagination } from '../types';

type DBNotification = {
  id: number;
  title: string;
  message: string;
  type?: Notification['type'];
  read: boolean;
  createdAt: string;
  url?: string;
};

const toStoreItem = (n: DBNotification): Notification => ({
  id: String(n.id),
  title: n.title,
  message: n.message ?? '',
  type: n.type ?? 'info',
  read: n.read,
  createdAt: n.createdAt,
  url: n.url,
});

export const useNotificationActions = () => {
  const { get, put, del } = useFetchClient();
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const currentPage = useRef(1);

  const fetchPage = useCallback(
    async (page: number, append = false) => {
      const { pageSize } = getConfig();
      setIsLoading(true);
      try {
        const { data } = await get(
          `/notifier/notifications?page=${page}&pageSize=${pageSize}`
        );
        if (Array.isArray(data?.data)) {
          const incoming = data.data.map(toStoreItem);
          if (append) {
            setNotifications([...getNotifications(), ...incoming]);
          } else {
            setNotifications(incoming);
          }
          setPagination(data.pagination ?? null);
          currentPage.current = page;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [get]
  );

  const fetchAll = useCallback(() => fetchPage(1, false), [fetchPage]);

  const loadMore = useCallback(() => {
    if (!pagination || currentPage.current >= pagination.pageCount) return;
    fetchPage(currentPage.current + 1, true);
  }, [fetchPage, pagination]);

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      storeMarkAsRead(id);
      try {
        await put(`/notifier/notifications/${id}/read`);
      } catch {
        // optimistic — server will reconcile on next poll
      }
    },
    [put]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    storeMarkAllAsRead();
    try {
      await put('/notifier/notifications/read-all');
    } catch {}
  }, [put]);

  const handleClear = useCallback(
    async (id: string) => {
      storeClear(id);
      try {
        await del(`/notifier/notifications/${id}`);
      } catch {}
    },
    [del]
  );

  const handleClearAll = useCallback(async () => {
    storeClearAll();
    try {
      await del('/notifier/notifications');
    } catch {}
  }, [del]);

  const hasMore = pagination
    ? currentPage.current < pagination.pageCount
    : false;

  return {
    fetchAll,
    loadMore,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleClear,
    handleClearAll,
    isLoading,
    hasMore,
  };
};
