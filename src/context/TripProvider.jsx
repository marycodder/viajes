import { useCallback, useState } from 'react';
import { useAuth } from './auth-context';
import { TripContext } from './trip-context';
import useResource from '../hooks/useResource';
import { request } from '../services/api';

export default function TripProvider({ children }) {
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState('');
  const [selectedId, setSelectedId] = useState(() =>
    sessionStorage.getItem('tripplan_trip'),
  );
  const trips = useResource('/trips', { list: true });
  const trip =
    trips.data?.find((item) => item.id === selectedId) ||
    trips.data?.[0] ||
    null;
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  function selectTrip(id) {
    sessionStorage.setItem('tripplan_trip', id);
    setSelectedId(id);
  }
  async function mutate(path, method, body) {
    setNotice('');
    const result = await request(path, { method, body });
    setNotice('Cambios guardados.');
    if (/^\/trips(?:\/[a-f\d-]+)?$/.test(path)) trips.reload();
    refresh();
    return result;
  }
  return (
    <TripContext.Provider
      value={{
        trips,
        trip,
        selectTrip,
        revision,
        refresh,
        mutate,
        notice,
        owner: trip?.ownerId === user.id,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}
