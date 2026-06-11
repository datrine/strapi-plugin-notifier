import type { UIConfig } from '../types';

const DEFAULT_CONFIG: UIConfig = {
  pollIntervalMs: 30_000,
  pageSize: 20,
  theme: {
    accent: {
      info: '#4945ff',
      success: '#5cb85c',
      warning: '#f0ad4e',
      error: '#ee5e52',
    },
  },
};

let config: UIConfig = DEFAULT_CONFIG;
let subscribers: Array<(c: UIConfig) => void> = [];

export const getConfig = () => config;

export const setConfig = (next: UIConfig) => {
  config = { ...DEFAULT_CONFIG, ...next, theme: { accent: { ...DEFAULT_CONFIG.theme.accent, ...next?.theme?.accent } } };
  subscribers.forEach((fn) => fn(config));
};

export const subscribeToConfig = (fn: (c: UIConfig) => void) => {
  subscribers.push(fn);
  return () => { subscribers = subscribers.filter((s) => s !== fn); };
};
