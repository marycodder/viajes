import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import EntityForm from '../components/EntityForm';

export default function Auth() {
  const { user, signIn } = useAuth();
  const [register, setRegister] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const fields = [
    ...(register
      ? [
          {
            name: 'name',
            label: 'Nombre',
            required: true,
            maxLength: 100,
            autoComplete: 'name',
          },
        ]
      : []),
    {
      name: 'email',
      label: 'Correo electrónico',
      type: 'email',
      required: true,
      maxLength: 254,
      autoComplete: 'username',
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      required: true,
      minLength: register ? 10 : 1,
      maxLength: 72,
      autoComplete: register ? 'new-password' : 'current-password',
      hint: register
        ? 'Al menos 10 caracteres, una minúscula y un número. Máximo 72 bytes UTF-8.'
        : undefined,
    },
  ];
  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="section-label">TripPlan</p>
        <h1>Organiza tu viaje de principio a fin</h1>
        <p>Destinos, actividades y gastos en un solo lugar.</p>
      </section>
      <EntityForm
        key={String(register)}
        title={register ? 'Crear cuenta' : 'Iniciar sesión'}
        fields={fields}
        submitLabel={register ? 'Registrarme' : 'Entrar'}
        reset={false}
        onSave={async (values) => {
          if (
            register &&
            (!/[a-z]/.test(values.password) ||
              !/\d/.test(values.password) ||
              new TextEncoder().encode(values.password).length > 72)
          )
            throw new Error(
              'La contraseña debe incluir una minúscula y un número, y no superar 72 bytes.',
            );
          await signIn(register ? 'register' : 'login', values);
        }}
      />
      <button className="text-button" onClick={() => setRegister(!register)}>
        {register
          ? 'Ya tengo cuenta: iniciar sesión'
          : 'No tengo cuenta: registrarme'}
      </button>
    </main>
  );
}
