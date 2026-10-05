import { useEffect, useState, type ReactNode } from 'react';
import { StoreCurrencyContext } from './StoreSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('INR');
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/store-settings`)
      .then((response) => response.json())
      .then((result) => { if (result.success) setCurrency(result.data.settings.currency || 'INR'); })
      .catch(() => undefined);
  }, []);
  return <StoreCurrencyContext.Provider value={currency}>{children}</StoreCurrencyContext.Provider>;
}
