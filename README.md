# TripPlan — frontend React y API de viajes

Continuación del Taller 2 para el Hito 3 de Desarrollo Web y Móvil. Se conserva la aplicación React + Vite y se incorpora un backend propio en `backend/`.

La API usa NestJS + TypeScript, PostgreSQL + TypeORM, MongoDB + Mongoose, autenticación JWT y Swagger/OpenAPI. El mismo contrato REST puede utilizarse desde React Native en el Hito 4.

**Estado del alcance:** React está conectado a la API para usuarios, viajeros, viajes, destinos, itinerarios diarios, actividades, reservas simuladas, favoritos personales, gastos, indicadores, notas, recomendaciones e historial. Los datos operacionales provienen de PostgreSQL y MongoDB. El navegador conserva únicamente el token de sesión y el identificador del viaje seleccionado en `sessionStorage`.

**Integrantes registrados en el Taller 2:** Mary González, Gonzalo Yussef y Sebastián Torrealba.

El [documento del Hito 3](docs/HITO_3.md) incluye diagnóstico del prototipo, actores, historias de usuario, criterios de aceptación, navegación, arquitectura, evidencia técnica, guion de demostración y revisión humana pendiente.

## Empezar en Windows

Sigue [INICIAR_BACKEND.md](INICIAR_BACKEND.md), que explica la instalación de Docker Desktop, los comandos exactos, Swagger y la prueba con bases de datos reales.

Desde esta carpeta, con Docker Desktop abierto:

```powershell
node backend/scripts/setup-env.mjs
docker compose up --build -d
docker compose exec backend node dist/database/seed.js
docker compose exec backend npm run smoke
```

El primer comando genera configuración local con claves aleatorias y conserva archivos `.env` existentes. Las migraciones se ejecutan al iniciar la API; el seed es opcional y repetible.

| Servicio | Dirección local |
| --- | --- |
| Swagger interactivo | http://localhost:3000/docs |
| API REST | http://localhost:3000/api/v1 |
| Estado SQL y MongoDB | http://localhost:3000/api/v1/health |
| Aplicación web integrada | http://localhost:8080 |
| PostgreSQL | localhost:5432 |
| MongoDB | localhost:27017 |

## Arquitectura

```mermaid
flowchart LR
  Web[React web: sesión y flujos del viaje] -->|HTTP / JSON| API[NestJS API REST]
  Mobile[React Native: futuro Hito 4] -->|misma API| API
  Swagger[Swagger /docs] --> API
  API --> SQL[(PostgreSQL)]
  API --> Mongo[(MongoDB)]
  API --> Weather[Open-Meteo]
  SQL --> Outbox[Eventos pendientes / worker]
  Outbox --> Mongo
```

Reglas, modelo de datos, módulos, permisos y endpoints se describen en [backend/README.md](backend/README.md). El [contrato OpenAPI exportado](backend/docs/openapi.json) se genera a partir de los mismos controladores que usa la API.

## Desarrollo y pruebas

Frontend, desde la raíz:

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run test:e2e
```

Backend, desde `backend/`:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run openapi
```

Las pruebas automáticas HTTP usan la migración SQL real sobre `pg-mem`. También se prueban validación de documentos, permisos de notas, reintentos de eventos y clima con dependencias simuladas. Esto no reemplaza ejecutar `npm run smoke` con PostgreSQL y MongoDB reales. La guía explica ambas modalidades.

El **10 de noviembre de 2026** se completó la prueba `smoke` con PostgreSQL y MongoDB reales en Docker Desktop para Windows. Los cuatro servicios quedaron ejecutándose; las dos bases y el backend reportaron estado saludable. También se verificaron Swagger (52 operaciones), acceso HTTP a la web, el viaje de demostración persistido y siete días de pronóstico real desde Open-Meteo.

Con los servicios iniciados y el seed cargado, puedes repetir la comprobación de solo lectura desde la raíz:

```powershell
node backend/scripts/check-runtime.mjs
```

Este comando usa la cuenta demo configurada localmente y no imprime contraseñas ni tokens. La prueba de navegador `npm.cmd run test:e2e` comprueba por separado los flujos desde React con las bases reales: registro, viaje, destinos, itinerario, favoritos, gastos, reservas, documentos, historial, persistencia, permisos, errores y vista móvil. Requiere los servicios iniciados y Chrome instalado; ver [requisitos y alcance de las pruebas](docs/HITO_3.md#pruebas-y-evidencia).

La integración final pasó ese recorrido de navegador en Chrome con PostgreSQL y MongoDB reales, incluyendo edición y eliminación desde la interfaz. También pasaron la revisión estática y la compilación de producción del frontend en Docker. Las capturas se revisaron en escritorio y móvil; el procedimiento y la evidencia reproducible están en `tests/e2e/tripplan.spec.js`.

## Continuidad y decisiones

- Se conservan la identidad visual y los componentes reutilizables del Taller 2. La navegación se amplía con los flujos exigidos y la consulta meteorológica se canaliza por el backend. La documentación histórica del frontend está en [README.md.md](README.md.md).
- Se incorpora una API organizada en controladores, servicios, DTO, entidades/esquemas y configuración.
- PostgreSQL concentra la información relacional; MongoDB guarda contenido documental e historial. No se copian viajes ni gastos completos a MongoDB.
- El presupuesto usa CLP y distingue estimaciones de actividades de gastos reales.
- Los propietarios administran sus viajes. Los viajeros asociados tienen lectura y favoritos personales.
- No hay pagos comerciales: las reservas son registros administrativos simulados.
- Docker Compose incluye volúmenes para conservar datos al detener servicios. `.env` queda fuera de Git; se entregan `.env.example` y un generador local.

## API pública

Se conserva [Open-Meteo](https://open-meteo.com/en/docs). El backend consulta `GET https://api.open-meteo.com/v1/forecast` y ofrece el resultado en `GET /api/v1/trips/{tripId}/weather?destinationId={id}`. El dashboard consume ese endpoint y permite elegir un destino asociado. Se usan coordenadas, fechas, temperatura, precipitaciones y código meteorológico. El backend agrega autorización, caché de diez minutos, timeout de ocho segundos y un mensaje para fechas fuera del horizonte; React muestra carga, errores, atribución y fechas sin pronóstico.

## Uso de Inteligencia Artificial

Se utilizó Codex como apoyo para diseñar e implementar el backend, elaborar migraciones, pruebas y documentación.

- **Instrucción representativa:** crear el backend de TripPlan con NestJS, PostgreSQL, MongoDB, Swagger y Docker Compose, respetando el enunciado del Hito 3.
- **Resultado:** API, modelo SQL y documental, integración de las pantallas React, validaciones, pruebas y documentación del Hito 3.
- **Validación automatizada:** compilación TypeScript, veinte pruebas HTTP/reglas de negocio, documentos, eventos y clima, y compilación del frontend. Se ejecutaron además el flujo `smoke` sobre PostgreSQL y MongoDB reales y la comprobación local de servicios, Swagger, datos demo y Open-Meteo.
- **Validación humana:** pendiente de que el equipo revise el código, ejecute la demostración y registre lo que adaptó o descartó. No se atribuye una revisión humana que todavía no se ha realizado.
- **Aprendizaje a documentar por el equipo:** relaciones entre entidades, permisos, separación SQL/NoSQL, diferencia entre presupuesto y gasto real, y reutilización de la API desde móvil.

## Limitaciones conocidas

La ejecución con contenedores y los flujos React–API–bases de datos se verifican con las pruebas documentadas. Los JWT expiran en una hora; se renuevan iniciando sesión. Las reservas son simuladas y la moneda utilizada es CLP. La aplicación móvil pertenece al Hito 4. Antes de entregar, el equipo debe completar su revisión, registrar sus aprendizajes reales y practicar la defensa; se incluye una lista de revisión en [docs/HITO_3.md](docs/HITO_3.md#uso-de-ia-y-revisión-humana).
