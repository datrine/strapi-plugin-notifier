import type { Notification } from '../types';

let items: Notification[] = [];
let countSubscribers: Array<(n: number) => void> = [];
let itemSubscribers: Array<(items: Notification[]) => void> = [];

const getUnreadCount = () => items.filter((n) => !n.read).length;

const broadcastCount = () => {
  const n = getUnreadCount();
  countSubscribers.forEach((fn) => fn(n));
};

const broadcastItems = () => {
  const snapshot = [...items];
  itemSubscribers.forEach((fn) => fn(snapshot));
  broadcastCount();
};

export const getNotificationCount = () => getUnreadCount();
export const getNotifications = () => [...items];

export const subscribeToCount = (fn: (n: number) => void) => {
  countSubscribers.push(fn);
  return () => { countSubscribers = countSubscribers.filter((s) => s !== fn); };
};

export const subscribeToNotifications = (fn: (items: Notification[]) => void) => {
  itemSubscribers.push(fn);
  return () => { itemSubscribers = itemSubscribers.filter((s) => s !== fn); };
};

export const setNotifications = (next: Notification[]) => {
  items = next;
  broadcastItems();
};

export const addNotification = (n: Notification) => {
  items = [n, ...items];
  broadcastItems();
};

export const markAsRead = (id: string) => {
  items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  broadcastItems();
};

export const markAllAsRead = () => {
  items = items.map((n) => ({ ...n, read: true }));
  broadcastItems();
};

export const clearNotification = (id: string) => {
  items = items.filter((n) => n.id !== id);
  broadcastItems();
};

export const clearAll = () => {
  items = [];
  broadcastItems();
};
