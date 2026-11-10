# Cómo iniciar el backend en Windows

Los archivos ya están en `Travels\viajes\backend`. No necesitas mover el proyecto, instalar PostgreSQL/MongoDB a mano ni crear cuentas en servicios de nube.

## 1. Instalar y abrir Docker Desktop

1. Descarga Docker Desktop desde su [página oficial para Windows](https://docs.docker.com/desktop/setup/install/windows-install/). Elige el instalador correspondiente al procesador de tu equipo.
2. Ejecuta el instalador y usa el motor **WSL 2**. Si Windows solicita autorización o reinicio, completa ese paso.
3. Si Docker indica que falta WSL, abre **PowerShell como administrador**, ejecuta `wsl --install`, reinicia si lo pide y vuelve a abrir Docker Desktop. Si pide actualizar WSL, usa `wsl --update`.
4. Abre **Docker Desktop** desde Inicio y espera que indique que el motor está en funcionamiento. Debe usar contenedores Linux.
5. Cierra y vuelve a abrir la terminal de VS Code o PowerShell para cargar el PATH nuevo.
6. Verifica:

```powershell
docker --version
docker compose version
docker info
```

`docker info` debe mostrar datos del servidor, sin error de conexión al motor. Si solicita habilitar virtualización, ese ajuste corresponde a Windows/BIOS y debe hacerlo el usuario siguiendo las indicaciones del fabricante.

Esta instalación abre ventanas del sistema y puede necesitar permisos o un reinicio. El código del backend se puede modificar sin completar esa instalación; Docker es necesario para ejecutarlo con los servicios preparados.

## 2. Abrir una terminal en el proyecto

En VS Code: **Terminal → Nueva terminal**. También sirve PowerShell. Ejecuta:

```powershell
Set-Location 'C:\Users\Christian Caleb\OneDrive\Escritorio\Travels\viajes'
```

Todos los comandos Docker siguientes se ejecutan desde esa carpeta, donde está `compose.yaml`.

## 3. Crear la configuración local

```powershell
node backend/scripts/setup-env.mjs
```

Se generan `viajes\.env` y `viajes\backend\.env` con claves locales aleatorias. El script no sobrescribe archivos existentes y no imprime las claves. Node.js ya estaba disponible en el equipo al preparar este proyecto.

No hace falta editar esos archivos para la configuración inicial. Para ver la contraseña del usuario de demostración, abre el `.env` de la raíz en el editor y busca `SEED_PASSWORD`. Mantén ese archivo local.

Si eliges cambiar manualmente las claves, usa valores hexadecimales como los que genera el script y actualiza ambos `.env` para que coincidan. Los puertos predeterminados son 3000, 8080, 5432 y 27017.

## 4. Construir y levantar los servicios

```powershell
docker compose up --build -d
docker compose ps
```

La primera ejecución descarga imágenes y dependencias. Compose espera que las bases estén listas antes de iniciar la API. La API aplica las migraciones SQL automáticamente.

Para revisar el arranque:

```powershell
docker compose logs --tail 80 backend
```

Abre en el navegador:

- **Swagger:** http://localhost:3000/docs
- **Estado de las bases:** http://localhost:3000/api/v1/health
- **Aplicación web integrada:** http://localhost:8080

El estado debe devolver `status: "ok"`, PostgreSQL `up` y MongoDB `up`. La aplicación web está conectada a la API. Si tenías un contenedor anterior, reconstruye el frontend para cargar las pantallas integradas: `docker compose up --build --no-deps -d frontend`.

## 5. Cargar un viaje de ejemplo (opcional)

```powershell
docker compose exec backend node dist/database/seed.js
```

Crea una cuenta `demo@tripplan.local`, un viaje, destino, itinerario, actividades, un gasto y documentos MongoDB. Usa fechas próximas al día de ejecución. Repetir el comando conserva la cuenta y el viaje existentes; no cambia su contraseña.

La contraseña inicial es `SEED_PASSWORD` en el `.env` local de la raíz. También puedes registrar una cuenta nueva desde Swagger sin utilizar el seed.

### Usar la aplicación web

1. Abre http://localhost:8080. Inicia sesión con la cuenta demo y su contraseña local, o pulsa **No tengo cuenta: registrarme**.
2. En **Viajes** puedes crear, editar o eliminar viajes y agregar viajeros por su correo registrado.
3. Selecciona el viaje desde **Viaje actual**. En **Destinos**, crea o busca un destino y pulsa **Agregar al viaje**.
4. En **Itinerario**, agrega un día dentro del período y luego sus actividades. Puedes editar su estado y guardar favoritos personales.
5. En **Presupuesto**, registra gastos reales y revisa saldo, estimaciones y desglose por categoría. El presupuesto total se modifica en **Viajes → Editar viaje**.
6. En **Reservas**, registra y sigue reservas simuladas. En **Notas**, alterna notas y recomendaciones.
7. En **Historial**, consulta los cambios de planificación; pueden tardar unos segundos en aparecer.
8. Recarga o cierra sesión y vuelve a entrar para comprobar que los datos persisten. Los viajeros asociados tienen lectura y favoritos personales; el propietario administra el viaje.

## 6. Probar desde Swagger

1. Abre http://localhost:3000/docs.
2. En **Autenticación y usuarios**, abre `POST /api/v1/auth/register`, pulsa **Try it out**, ingresa nombre, correo y contraseña y luego **Execute**. La contraseña debe tener al menos diez caracteres, una minúscula y un número, y no superar 72 bytes UTF-8.
3. Si ya tienes cuenta, usa `POST /api/v1/auth/login`.
4. Copia el valor de `accessToken` de la respuesta.
5. Pulsa **Authorize**, pega solamente el token y confirma. Swagger añade `Bearer` automáticamente.
6. Crea un viaje con `POST /api/v1/trips` y conserva su `id` como `tripId`.
7. Crea un destino en `POST /api/v1/destinations` y asócialo con `POST /api/v1/trips/{tripId}/destinations`.
8. Crea un día con `POST /api/v1/trips/{tripId}/days`, usando una fecha dentro del viaje y el destino asociado.
9. Crea una actividad en `/trips/{tripId}/activities` utilizando el `id` de ese día como `dayId`.
10. Consulta de nuevo las actividades para demostrar persistencia en PostgreSQL.
11. Registra un gasto en `/trips/{tripId}/expenses` y consulta `/trips/{tripId}/summary`.
12. Guarda una nota en `/trips/{tripId}/notes` y consúltala para demostrar MongoDB. Los documentos MongoDB usan `_id` para sus operaciones de edición/borrado.
13. Espera unos segundos y consulta `/trips/{tripId}/events` para mostrar el historial de las operaciones SQL.
14. Intenta crear un día fuera del período del viaje: debe responder **400** con un mensaje de validación.

## 7. Ejecutar la comprobación con bases reales

```powershell
docker compose exec backend npm run smoke
```

Comprueba registro/login, permisos, viajes, persistencia SQL, itinerarios, favoritos, gastos, indicadores, reservas, MongoDB e historial. Crea tres cuentas ficticias y elimina el viaje y destino utilizados al finalizar; esas cuentas de prueba permanecen. Ejecuta el comando una sola vez por minuto para respetar el límite de registro.

Para comprobar el servicio meteorológico usa Swagger, con un destino asociado y un viaje que coincida con los próximos dieciséis días. La prueba smoke no depende de la disponibilidad de Open-Meteo.

Con el seed cargado, también puedes ejecutar desde la raíz una comprobación de solo lectura:

```powershell
node backend/scripts/check-runtime.mjs
```

Verifica las bases, las direcciones web, Swagger, la cuenta demo, su presupuesto, documentos MongoDB y el clima real. Lee la contraseña desde el `.env` local y no imprime credenciales. Esta comprobación requiere que Open-Meteo esté disponible y que las credenciales iniciales de la cuenta demo coincidan con `SEED_PASSWORD`.

El 10 de noviembre de 2026 se completaron tanto `smoke` como esta comprobación con los servicios reales. El viaje de ejemplo quedó cargado: presupuesto de 350.000 CLP, gasto real de 8.000 CLP y saldo de 342.000 CLP.

## 8. Detener y volver a iniciar

```powershell
docker compose stop
docker compose start
```

Los datos quedan en los volúmenes de Docker. `docker compose down` quita los contenedores pero también conserva esos volúmenes. No añadas `-v` si quieres conservar los datos.

## Desarrollo del backend fuera del contenedor

Desde la raíz inicia solo las bases:

```powershell
docker compose up -d postgres mongo
Set-Location backend
npm.cmd ci
npm.cmd run start:dev
```

No mantengas a la vez el contenedor backend ocupando el puerto 3000. Si estaba iniciado, primero usa `docker compose stop backend frontend` desde la raíz. `start:dev` recompila TypeScript y reinicia la API al cambiar el código.

Las pruebas que no necesitan servidores externos se ejecutan desde `backend/`:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

La prueba de navegador se ejecuta desde la **raíz `viajes/`**, con Docker iniciado y Chrome instalado:

```powershell
npm.cmd ci
npm.cmd run test:e2e
```

Usa cuentas ficticias y servicios reales. Limpia el viaje y destino de prueba al finalizar; las cuentas ficticias permanecen. Verifica el flujo desde las pantallas, persistencia al recargar/reingresar, permisos, manejo de errores y pantalla móvil. Si usas Edge en lugar de Chrome, configura `$env:E2E_BROWSER_CHANNEL = 'msedge'` antes de ejecutar la prueba.

## Si aparece un error

| Mensaje o síntoma | Acción |
| --- | --- |
| `docker` no se reconoce | Instala Docker Desktop y vuelve a abrir la terminal. |
| No se puede conectar al motor | Abre Docker Desktop y espera que termine de iniciar. |
| Puerto ocupado | Cierra la aplicación que lo usa. Para API/web también puedes cambiar `API_PORT`/`WEB_PORT` en `.env`; adapta los enlaces y `CORS_ORIGINS` si cambia el puerto web. |
| Contraseña SQL/Mongo incorrecta tras cambiar `.env` | Las claves de un volumen ya creado no cambian al editar variables. Restaura la configuración con la que lo inicializaste o cambia la contraseña dentro de la base. |
| Respuesta 401 | Inicia sesión de nuevo y actualiza **Authorize**; el token dura una hora. |
| Respuesta 403 | Usa la cuenta del propietario para modificar el viaje. |
| Respuesta 429 | Espera un minuto; hay límites de solicitudes y de registro/login. |
| No aparece historial inmediatamente | Espera unos segundos: el worker entrega los eventos SQL a MongoDB en segundo plano. |

Para volver a usar el proyecto, abre Docker Desktop y ejecuta `docker compose start` desde la raíz. No necesitas recrear los contenedores ni cargar el seed cada vez. Los cambios del backend requieren reconstruir su imagen con `docker compose up --build -d backend`.
