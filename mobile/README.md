# TripPlan — Hito 4: Aplicación móvil

**Asignatura:** Desarrollo Web y Móvil  
**Tecnología móvil:** React Native con Expo  
**Caso:** Sistema de planificación de viajes

## Descripción

TripPlan Móvil permite consultar los viajes de un usuario, visualizar sus destinos e itinerarios, marcar actividades planificadas como realizadas y registrar gastos consultando el presupuesto del viaje.

La aplicación móvil es un cliente del sistema desarrollado en el Hito 3. Reutiliza la misma API REST de NestJS que consume la aplicación web React; no dispone de un backend ni de bases de datos independientes.

## Arquitectura

```text
React (web) ────────┐
                   ├── API REST NestJS ── PostgreSQL
React Native (app) ┘                 └── MongoDB
```

## Funcionalidades

- Inicio de sesión mediante la API existente.
- Consulta de viajes y sus destinos.
- Consulta de días y actividades del itinerario.
- Actualización del estado de una actividad a `completada`.
- Consulta del resumen financiero y los gastos de un viaje.
- Registro de gastos con validación de descripción, categoría, fecha y monto.
- Indicadores de carga, errores, listas vacías y confirmaciones.

## Organización del código

```text
mobile/
├── App.js
├── README.md
├── src/
│   ├── screens/
│   │   ├── Ingreso.js
│   │   ├── Viajes.js
│   │   ├── DetalleViaje.js
│   │   ├── Itinerario.js
│   │   └── Presupuesto.js
│   ├── components/
│   │   └── TarjetaViaje.js
│   ├── services/
│   │   └── api.js
│   └── styles/
│       └── estilos.js
├── app.json
└── package.json
```

`App.js` administra la sesión, la navegación y las operaciones con la API. Las vistas se encuentran en `screens/`, los elementos reutilizables en `components/`, la comunicación HTTP en `services/api.js` y los estilos compartidos en `styles/estilos.js`.

## Requisitos previos

- Node.js y npm.
- Docker Desktop con los servicios del Hito 3 funcionando.
- Android Studio con un emulador Android configurado.
- Android Debug Bridge (`adb`) accesible desde la terminal.
- Una cuenta válida de TripPlan, registrada en el backend existente.

## Instalación y ejecución

1. Desde la raíz del repositorio, iniciar los servicios del Hito 3:

   ```bash
   docker compose up -d
   ```

2. Verificar el estado de los contenedores:

   ```bash
   docker compose ps
   ```

3. Abrir el emulador Android.

4. Redirigir el puerto de la API del computador al emulador:

   ```bash
   adb reverse tcp:3000 tcp:3000
   ```

5. En otra terminal, entrar a la aplicación móvil e instalar sus dependencias:

   ```bash
   cd mobile
   npm install
   ```

6. Iniciar Expo:

   ```bash
   npx expo start
   ```

7. Presionar `a` en la terminal de Expo para abrir la aplicación en Android.

8. Iniciar sesión con las credenciales existentes y abrir un viaje.

> El comando `adb reverse` puede necesitar repetirse si se reinicia el emulador o se pierde la redirección. Si el comando `adb` no se reconoce, utilizar el ejecutable de `platform-tools` del Android SDK.

## Configuración de la API

La URL base utilizada en el desarrollo con emulador Android es:

```javascript
const API_URL = 'http://localhost:3000/api/v1';
```

Se configura al inicio de `mobile/src/services/api.js`.

**Importante:** `localhost` funciona en esta configuración porque se ejecuta `adb reverse tcp:3000 tcp:3000`. Sin la redirección, el `localhost` del emulador no apunta automáticamente al servidor del computador. Para ejecutar en un teléfono físico sin esta redirección habría que configurar una URL de API accesible desde ese dispositivo.

## Endpoints consumidos

Todos los endpoints utilizan el prefijo `/api/v1`.

| Método | Ruta | Función |
|---|---|---|
| POST | `/auth/login` | Inicio de sesión |
| GET | `/trips?limit=100` | Consultar viajes |
| GET | `/trips/:viajeId/destinations` | Consultar destinos |
| GET | `/trips/:viajeId/days?limit=100` | Consultar días |
| GET | `/trips/:viajeId/activities?limit=100` | Consultar actividades |
| PATCH | `/trips/:viajeId/activities/:actividadId` | Marcar actividad como realizada |
| GET | `/trips/:viajeId/summary` | Consultar resumen del presupuesto |
| GET | `/trips/:viajeId/expenses?limit=100` | Consultar gastos |
| POST | `/trips/:viajeId/expenses` | Registrar gasto |

Las operaciones protegidas envían el token obtenido al iniciar sesión mediante el encabezado `Authorization: Bearer <token>`.


## Uso de herramientas de inteligencia artificial

Se utilizó **ChatGPT (OpenAI)** como herramienta de apoyo para elaborar código de interfaz React Native, integrar las llamadas a la API existente, depurar errores y redactar documentación. El equipo fue responsable de comprender, ajustar y validar la solución entregada.


## Evidencias de funcionamiento – Hito 4 TripPlan
## Descripcion de las fotos de carpeta evidencias

**Evidencia 1. Pantalla de inicio de sesión**

Se presenta la pantalla inicial de TripPlan, que permite acceder a la aplicación mediante correo electrónico y contraseña.

**Evidencia 2. Formulario de autenticación**

Se muestra el ingreso de las credenciales del usuario. La contraseña permanece oculta para proteger su visualización.

**Evidencia 3. Consulta de viajes**

Se visualiza el listado de viajes obtenidos desde la API REST, incluyendo nombre, fechas, presupuesto y acceso al detalle.

**Evidencia 4. Detalle del viaje**

Se presenta la información del viaje seleccionado, sus destinos asociados y las opciones para consultar el itinerario y el presupuesto.

**Evidencia 5. Itinerario y actividades**

Se muestran las actividades organizadas por fecha, incluyendo horario, categoría, costo estimado y estado, con la opción de marcarlas como realizadas.

**Evidencia 6. Consulta del presupuesto**

Se presenta el resumen financiero del viaje, incluyendo presupuesto total, gastos acumulados, saldo disponible y costos estimados de actividades.

**Evidencia 7. Registro de un gasto**

Se muestra el formulario con la descripción, categoría, fecha y monto de un nuevo gasto de $8.000, ingresado desde la aplicación móvil.

**Evidencia 8. Confirmación y actualización del presupuesto**

Se confirma el registro exitoso del gasto, aumentando el total utilizado a $28.000 y disminuyendo el presupuesto disponible a $772.000.

**Evidencia 9. Estado inicial de los gastos en la aplicación web**

Se visualizan los gastos existentes en TripPlan Web antes del nuevo registro, permitiendo establecer una referencia para verificar la actualización de los datos.

**Evidencia 10. Sincronización entre la aplicación móvil y web**

Se comprueba que el gasto de $8.000 registrado desde Android aparece en TripPlan Web, demostrando la persistencia y consistencia de los datos compartidos.

**Evidencia 11. Validación de errores en el registro de gastos**

Se evidencia el manejo de un formulario con datos inválidos o incompletos, mostrando un mensaje de error que impide registrar el gasto hasta corregir la información.