import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import TripProvider from './context/TripProvider';
import { useAuth } from './context/auth-context';
import { useTrip } from './context/trip-context';
import { ResourceFeedback } from './components/Feedback';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Viajes from './pages/Viajes';
import Itinerario from './pages/Itinerario';
import Destinos from './pages/Destinos';
import Favoritos from './pages/Favoritos';
import Presupuesto from './pages/Presupuesto';
import Reservas from './pages/Reservas';
import Documentos from './pages/Documentos';
import Historial from './pages/Historial';

function Workspace() {
  const { trips, trip, selectTrip, owner, notice } = useTrip();
  return (
    <>
      <Navbar />
      <section className="trip-toolbar" aria-label="Selección de viaje">
        <div>
          <label htmlFor="active-trip">Viaje actual</label>
          <select
            id="active-trip"
            value={trip?.id || ''}
            onChange={(e) => selectTrip(e.target.value)}
            disabled={!trips.data?.length}
          >
            {!trips.data?.length && <option value="">Sin viajes</option>}
            {trips.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        {trip && (
          <span className="role-badge">
            {owner ? 'Propietario' : 'Viajero'}
          </span>
        )}
        <ResourceFeedback resource={trips} />
        {notice && (
          <p className="success-message" role="status">
            {notice}
          </p>
        )}
      </section>
      <Routes>
        <Route path="/" element={<Dashboard key={trip?.id} />} />
        <Route path="/viajes" element={<Viajes />} />
        <Route path="/itinerario" element={<Itinerario key={trip?.id} />} />
        <Route path="/destinos" element={<Destinos key={trip?.id} />} />
        <Route path="/favoritos" element={<Favoritos key={trip?.id} />} />
        <Route path="/presupuesto" element={<Presupuesto key={trip?.id} />} />
        <Route path="/reservas" element={<Reservas key={trip?.id} />} />
        <Route path="/notas" element={<Documentos key={trip?.id} />} />
        <Route path="/historial" element={<Historial key={trip?.id} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
function AuthenticatedApp() {
  const { user, checking } = useAuth();
  if (checking)
    return (
      <main className="auth-page">
        <p role="status">Comprobando sesión…</p>
      </main>
    );
  if (!user)
    return (
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  return (
    <TripProvider key={user.id}>
      <Workspace />
    </TripProvider>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
