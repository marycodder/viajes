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
- Actualización del estado de una actividad a `completed`.
- Consulta del resumen financiero y los gastos de un viaje.
- Registro de gastos con validación de descripción, categoría, fecha y monto.
- Indicadores de carga, errores, listas vacías y confirmaciones.
- **Funcionalidad adicional móvil:** botón «Cómo llegar al destino» que abre indicaciones en Google Maps desde el detalle de un viaje, mediante `Linking` de React Native.

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
- Una cuenta válida de **TripPlan**, registrada en el backend existente.
- Para probar «Cómo llegar», conexión a internet y Google Maps disponible (aplicación o navegador). **No es obligatorio iniciar sesión en Gmail o con una cuenta de Google** para utilizar el enlace de indicaciones. Si se requiere instalar Google Maps desde Play Store, el propio servicio de instalación puede solicitar una cuenta.
- Google Maps deberá tener permiso para utilizar la ubicación si se desea calcular una ruta desde el punto actual del emulador.

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

> El comando `adb reverse` puede necesitar repetirse si se reinicia el emulador o se pierde la redirección. Si el comando `adb` no se reconoce, revisar **Solución de problemas** más abajo.
> Ejecute Docker desde la raíz `viajes/` y Expo desde `mobile/`. `adb reverse` puede ejecutarse desde cualquier carpeta.

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


## Funcionalidad adicional: navegación desde el destino (Google Maps)

En **Detalle del viaje**, el botón **«Cómo llegar al destino»** utiliza el nombre, región y país registrados en la API para construir una URL de indicaciones de Google Maps y abrirla con `Linking.openURL()` de React Native.

- No se creó una API nueva ni se modificaron las bases de datos.
- TripPlan **no obtiene por sí mismo las coordenadas GPS**: delega el cálculo de la ruta y el uso de ubicación a Google Maps.
- **No se necesita una cuenta de Gmail** para abrir una URL de indicaciones. La cuenta de TripPlan, necesaria para ver los viajes, es independiente.
- Para probar rutas reales, habilite la ubicación en Google Maps y configure una posición simulada coherente en el emulador.
- Si Google Maps no está instalado, la URL puede abrirse en el navegador compatible.


## Solución de problemas frecuentes

### 1. `bash: adb: command not found`

Esto significa que Git Bash no encuentra Android Debug Bridge (`adb`) en el `PATH`. En Windows, normalmente está en `Android/Sdk/platform-tools/` del usuario que instaló Android Studio.

**Solución recomendada en Windows PowerShell (sin depender del nombre del usuario):**

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse --list
```

**Alternativa en Git Bash (ajustar `TU_USUARIO` al usuario de Windows de cada computador):**

```bash
"/c/Users/TU_USUARIO/AppData/Local/Android/Sdk/platform-tools/adb.exe" reverse tcp:3000 tcp:3000
"/c/Users/TU_USUARIO/AppData/Local/Android/Sdk/platform-tools/adb.exe" reverse --list
```

**Ejemplo del computador utilizado en el desarrollo:**

```bash
"/c/Users/mary_/AppData/Local/Android/Sdk/platform-tools/adb.exe" reverse tcp:3000 tcp:3000
```

Esa ruta es **solo un ejemplo**, no una ruta universal. Si Android SDK se instaló en otra ubicación, buscar `adb.exe` en Android Studio → **SDK Manager** → **Android SDK Location** y añadir `platform-tools/adb.exe`. Opcionalmente agregar `platform-tools` a la variable de entorno `PATH` para poder escribir simplemente `adb`.

### 2. «Network request failed» o no se puede iniciar sesión

1. Comprobar que Docker Desktop esté iniciado y ejecutar `docker compose up -d` y `docker compose ps` desde la raíz `viajes/`.
2. Verificar que el backend responda en el computador mediante `http://localhost:3000/api/v1` (una ruta válida de la API o Swagger).
3. Confirmar que el emulador esté encendido y reconocido con `adb devices`.
4. Ejecutar o repetir `adb reverse tcp:3000 tcp:3000`.
5. Revisar que `mobile/src/services/api.js` use `http://localhost:3000/api/v1` en este entorno de emulador con redirección.
6. Volver a Expo y presionar `r` para recargar.

### 3. Google Maps muestra el origen en Estados Unidos y no encuentra una ruta

El emulador puede iniciar con una ubicación GPS simulada en California. En el desarrollo se observó que Google Maps encontraba Puerto Natales, pero no podía generar una ruta en automóvil desde Estados Unidos.

**Opción gráfica:** en Android Emulator, abrir **Extended Controls** (`...`) → **Location** → seleccionar **Punta Arenas, Chile** → **Set location**.

**Opción por terminal:** con un emulador encendido, ejecutar:

```bash
adb emu geo fix -70.9171 -53.1638
```

El orden de `geo fix` es **longitud, latitud** (aquí: Punta Arenas). Si `adb` no se reconoce, reemplazarlo por la ruta completa a `adb.exe` indicada en el punto 1. Abrir de nuevo la ruta desde TripPlan; Google Maps puede requerir un momento para actualizar la ubicación.

### 4. Google Maps no se abre o solicita una cuenta de Google

- **No se requiere Gmail para ejecutar TripPlan ni para abrir el enlace de Google Maps.** La cuenta de usuario requerida es la de TripPlan.
- Confirmar que el emulador tenga conexión a internet.
- Comprobar que exista una app o navegador compatible para abrir enlaces HTTP/HTTPS.
- Si es necesario instalar Google Maps desde Play Store, utilizar una imagen de emulador con Google Play y, si Play Store lo solicita, una cuenta de Google **de prueba**, no necesariamente una cuenta personal.
- La función del proyecto utiliza `Linking.openURL()` y la URL oficial de Google Maps; no depende de una clave de Google Maps API.

### 5. ADB no muestra ningún dispositivo o pierde la redirección

- Encender el emulador antes de ejecutar `adb devices`. La salida debe incluir un dispositivo con estado `device`.
- Si aparece `offline`, esperar a que Android inicie y volver a comprobar.
- Tras reiniciar el emulador, volver a ejecutar `adb reverse tcp:3000 tcp:3000` (o el comando con ruta completa) y comprobar con `adb reverse --list`.
- Los comandos `adb` pueden ejecutarse desde la carpeta raíz `viajes/` o desde `mobile/`; no dependen del directorio actual.

### 6. La aplicación muestra una pantalla vacía o un error después de cambios

- Ejecutar `npx expo start` desde `mobile/` y abrir Android con `a`.
- Presionar `r` para recargar después de guardar los cambios.
- Revisar los errores mostrados por Metro/Expo y verificar importaciones de `screens/`, `components/`, `styles/` y `services/`.
- Mantener activos los servicios Docker antes de hacer consultas o modificaciones desde TripPlan.

## Capturas de pantalla

Las evidencias reales de la aplicación se encuentran en `mobile/evidencias/` y están descritas en la documentación de entrega. Se incluyen once capturas de la aplicación móvil y web:

1. Pantalla de inicio de sesión.
2. Ingreso de credenciales (ocultar datos personales en la versión pública).
3. Consulta de viajes.
4. Detalle del viaje y destinos.
5. Itinerario y actualización de actividades.
6. Consulta de presupuesto.
7. Formulario de registro de gasto.
8. Confirmación del gasto y saldo actualizado.
9. Gastos en la web antes del nuevo registro.
10. Gasto registrado desde Android visible en la web.
11. Validación de error en el formulario de gastos.
12. Funcionalidad adicional: Navegaión con Google Maps,permite abrir Google Maps desde TripPlan y visualizar la ruta desde la ubicación del dispositivo hasta el destino seleccionado

## Uso de herramientas de inteligencia artificial


Se utilizó **ChatGPT (OpenAI)** como herramienta de apoyo para elaborar código de interfaz React Native, integrar las llamadas a la API existente, depurar errores y redactar documentación. El equipo fue responsable de comprender, ajustar y validar la solución entregada.


## Código fuente del proyecto completo

Esta carpeta `mobile/` contiene solamente el cliente React Native; el backend y los demás componentes del Hito 3 no se duplican. El código completo está en: https://github.com/marycodder/viajes/tree/hito4
