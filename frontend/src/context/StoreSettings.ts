import { createContext, useContext } from 'react';

export const StoreCurrencyContext = createContext('INR');

export function useStoreCurrency() {
  return useContext(StoreCurrencyContext);
}