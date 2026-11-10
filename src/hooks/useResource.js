import { useCallback, useEffect, useState } from 'react';
import { listAll, request } from '../services/api';

export default function useResource(path, { list = false, revision = 0 } = {}) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    path: null,
    version: '',
    data: null,
    error: '',
  });
  const version = `${revision}:${attempt}`;
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    const load = list ? listAll : request;
    load(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ path, version, data, error: '' });
      },
      (error) => {
        if (!controller.signal.aborted)
          setState((previous) => ({
            path,
            version,
            data: previous.path === path ? previous.data : null,
            error: error.message,
          }));
      },
    );
    return () => controller.abort();
  }, [path, version, list]);
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const samePath = path && state.path === path;
  return {
    data: samePath ? state.data : null,
    error: samePath ? state.error : '',
    loading: Boolean(path && (!samePath || state.version !== version)),
    reload,
  };
}
