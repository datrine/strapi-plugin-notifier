import { useState, useEffect } from 'react';
import { getConfig, subscribeToConfig } from '../store/config';
import type { UIConfig } from '../types';

export const usePluginConfig = (): UIConfig => {
  const [config, setConfig] = useState<UIConfig>(getConfig);
  useEffect(() => subscribeToConfig(setConfig), []);
  return config;
};
