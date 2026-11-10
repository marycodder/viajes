import { createContext, useContext } from 'react';
import useResource from '../hooks/useResource';
export const TripContext = createContext(null);
export const useTrip = () => useContext(TripContext);
export function useTripResource(path, options = {}) {
  const { revision } = useTrip();
  return useResource(path, { ...options, revision });
}
