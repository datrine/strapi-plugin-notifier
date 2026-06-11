import { useEffect, useRef } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { useNotificationCount } from '../hooks/useNotificationCount';
import { usePluginConfig } from '../hooks/usePluginConfig';
import { setNotifications } from '../store/notifications';
import { setConfig } from '../store/config';
import type { Notification, UIConfig } from '../types';

type DBNotification = {
  id: number;
  title: string;
  message: string;
  type?: Notification['type'];
  read: boolean;
  createdAt: string;
  url?: string;
};

const toStoreNotification = (n: DBNotification): Notification => ({
  id: String(n.id),
  title: n.title,
  message: n.message ?? '',
  type: n.type ?? 'info',
  read: n.read,
  createdAt: n.createdAt,
  url: n.url,
});

export default function Bell() {
  const count = useNotificationCount();
  const config = usePluginConfig();
  const { get } = useFetchClient();
  const configLoaded = useRef(false);

  // Fetch server-side UI config once on mount
  useEffect(() => {
    if (configLoaded.current) return;
    configLoaded.current = true;
    get('/notifier/config')
      .then(({ data }) => { if (data) setConfig(data as UIConfig); })
      .catch(() => {});
  }, [get]);

  // Poll for new notifications
  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await get(`/notifier/notifications?page=1&pageSize=${config.pageSize}`);
        if (Array.isArray(data?.data)) {
          setNotifications(data.data.map(toStoreNotification));
        }
      } catch {}
    };
    poll();
    const id = setInterval(poll, config.pollIntervalMs);
    return () => clearInterval(id);
  }, [get, config.pollIntervalMs, config.pageSize]);

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="1.5em"
        height="1.5em"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span
          aria-label={`${count} unread notification${count === 1 ? '' : 's'}`}
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-6px',
            backgroundColor: '#ee5e52',
            color: '#fff',
            borderRadius: '9px',
            fontSize: '9px',
            fontWeight: 700,
            height: '13px',
            minWidth: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 2px',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  );
}
