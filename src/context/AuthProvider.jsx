import { useEffect, useState } from 'react';
import { request, sessionToken } from '../services/api';
import { AuthContext } from './auth-context';

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionToken.get);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(token));
  useEffect(() => {
    if (!token) return;
    let active = true;
    request('/users/me').then(
      (profile) => {
        if (active) {
          setUser(profile);
          setChecking(false);
        }
      },
      () => {
        if (active) {
          sessionToken.set(null);
          setToken(null);
          setUser(null);
          setChecking(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [token]);
  useEffect(() => {
    const expired = () => {
      setToken(null);
      setUser(null);
      setChecking(false);
      sessionStorage.removeItem('tripplan_trip');
    };
    window.addEventListener('tripplan:unauthorized', expired);
    return () => window.removeEventListener('tripplan:unauthorized', expired);
  }, []);
  async function signIn(mode, values) {
    const session = await request(`/auth/${mode}`, {
      method: 'POST',
      body: values,
    });
    sessionToken.set(session.accessToken);
    setToken(session.accessToken);
    setUser(session.user);
    setChecking(false);
  }
  function signOut() {
    sessionToken.set(null);
    sessionStorage.removeItem('tripplan_trip');
    setToken(null);
    setUser(null);
    setChecking(false);
  }
  return (
    <AuthContext.Provider value={{ user, checking, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
