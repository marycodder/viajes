import { useState } from 'react';

export default function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function run(work, success = 'Cambios guardados.') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const value = await work();
      setMessage(success);
      return { ok: true, value };
    } catch (failure) {
      setError(failure.message || 'No se pudo completar la operación.');
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, message, run };
}
