export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type FilterType = 'all' | 'unread' | 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  url?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: Pagination;
}

export interface UIConfig {
  pollIntervalMs: number;
  pageSize: number;
  theme: {
    accent: {
      info: string;
      success: string;
      warning: string;
      error: string;
    };
  };
}
