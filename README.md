# TripPlan — Planifica tu viaje de principio a fin

TripPlan es una aplicación web frontend desarrollada con **React + Vite** para organizar un viaje desde una sola interfaz. Permite administrar un itinerario, registrar actividades, controlar gastos, guardar favoritos, explorar destinos sugeridos y consultar información meteorológica relevante para el viaje actual.

---

## Descripción del proyecto

Planificar un viaje normalmente implica utilizar distintas herramientas para organizar fechas, actividades, gastos, destinos e información externa como el clima.

TripPlan busca centralizar esas tareas en una aplicación simple, visual y responsive, permitiendo que el usuario pueda revisar y modificar su planificación sin depender de un backend.

Actualmente la aplicación trabaja con un viaje de ejemplo a **Santiago de Chile**, entre el **12 y el 18 de octubre de 2026**, con un presupuesto inicial de **$350.000 CLP**.

---

## Problemática

Durante la planificación de un viaje es común utilizar notas, planillas, aplicaciones de mapas, páginas meteorológicas y herramientas separadas para organizar la información.

Esto puede provocar:

- Información dispersa.
- Dificultad para controlar el presupuesto.
- Problemas para ordenar las actividades.
- Falta de una visión general del viaje.
- Dificultad para relacionar gastos, actividades y fechas.

TripPlan reúne estas funciones en una sola interfaz para facilitar la planificación y entregar una visión clara del estado actual del viaje.

---

## Usuarios objetivo

TripPlan está orientado a personas que desean organizar:

- Viajes personales.
- Vacaciones.
- Escapadas de fin de semana.
- Actividades turísticas.
- Itinerarios con control de presupuesto.

---

# Funcionalidades implementadas

## 1. Dashboard dinámico

El Dashboard funciona como la vista principal del viaje.

Muestra:

- Destino actual.
- Fechas del viaje.
- Cantidad de actividades.
- Presupuesto total.
- Total gastado.
- Presupuesto disponible.
- Resumen general del viaje.
- Próximas actividades.
- Actividades favoritas.
- Pronóstico meteorológico.

El total gastado se calcula utilizando dos fuentes:

```text
Costos de las actividades del itinerario
+
Gastos adicionales registrados en Presupuesto
=
Gasto total del viaje
```

Esto permite mantener sincronizados el Dashboard y el módulo de Presupuesto.

---

## 2. Resumen del viaje

El Dashboard incluye un resumen dinámico con:

- Destino.
- Fechas.
- Cantidad de actividades.
- Cantidad de favoritos.
- Total gastado.
- Presupuesto disponible.

Los valores se actualizan cuando el usuario modifica la planificación.

---

## 3. Gestión del itinerario

El usuario puede administrar las actividades del viaje desde la vista de Itinerario.

Funciones disponibles:

- Agregar actividades.
- Editar actividades.
- Eliminar actividades.
- Marcar actividades como favoritas.
- Registrar nombre.
- Registrar fecha.
- Registrar hora.
- Registrar categoría.
- Registrar costo estimado.
- Ordenar automáticamente por fecha y hora.
- Agrupar actividades por día.

Las actividades se mantienen en un estado compartido para que los cambios se reflejen en otras secciones de la aplicación.

---

## 4. Formulario con validación

TripPlan incorpora un formulario controlado en React para crear nuevas actividades.

Se validan campos necesarios como:

- Nombre.
- Fecha.
- Hora.
- Categoría.

El costo se transforma a un valor numérico antes de incorporarlo al estado de la aplicación.

---

## 5. Filtros del itinerario

El itinerario incorpora filtros para facilitar la búsqueda de actividades.

Incluye:

- Búsqueda por nombre.
- Filtro por categoría.
- Filtro de solo favoritos.
- Contador de resultados.
- Botón para limpiar filtros.
- Estado vacío cuando no existen coincidencias.

Entre las categorías utilizadas se encuentran:

- Turismo.
- Cultura.
- Gastronomía.
- Paseo.
- Entretenimiento.

---

## 6. Favoritos

Cada actividad puede marcarse o desmarcarse como favorita.

La aplicación posee una vista independiente de **Favoritos**, donde se muestran solamente las actividades seleccionadas.

El estado de favoritos se comparte con el itinerario, por lo que cualquier cambio se refleja inmediatamente entre ambas vistas.

---

## 7. Destinos

TripPlan incorpora una sección para explorar destinos de Chile.

Actualmente se incluyen:

- Santiago.
- Valparaíso.
- Pucón.
- San Pedro de Atacama.

**Santiago corresponde al destino del viaje actual.**

Los demás destinos funcionan como sugerencias para futuras planificaciones y se presentan como información de exploración.

La vista permite:

- Buscar por nombre.
- Buscar por región.
- Buscar por tipo de destino.
- Identificar el destino actual.
- Mostrar un estado vacío cuando no existen resultados.

La información meteorológica se consulta para el viaje activo, por lo que no es necesario cargar pronóstico para todos los destinos sugeridos.

---

## 8. Presupuesto

TripPlan incorpora un módulo específico de presupuesto.

Permite visualizar y administrar:

- Presupuesto total.
- Total gastado.
- Presupuesto disponible.
- Cantidad de viajeros.
- Cantidad de días.
- Moneda seleccionada.
- Distribución del gasto por categoría.
- Gastos adicionales.
- Actividades del itinerario asociadas al presupuesto.
- Gasto por persona.
- Gasto promedio por día.

Las actividades del itinerario se muestran dentro del presupuesto como información de solo lectura.

Los gastos adicionales pueden agregarse, editarse o eliminarse desde la sección de Presupuesto.

---

## 9. Integración entre Itinerario, Presupuesto y Dashboard

Una de las principales integraciones del proyecto conecta tres vistas:

```text
Itinerario
   │
   └── Costos de actividades
             │
             ▼
        Presupuesto
             │
   Gastos adicionales
             │
             ▼
          Dashboard
```

El gasto total corresponde a:

```text
Gastos de actividades + gastos adicionales
```

De esta forma, el valor mostrado en Presupuesto coincide con el valor mostrado en Dashboard.

---

## 10. Presupuesto simulado

El módulo de presupuesto permite generar una estimación utilizando parámetros como:

- Estilo de viaje.
- Costo del destino.
- Distancia del viaje.
- Cantidad de viajeros.
- Duración del viaje.

La estimación sirve como referencia y posteriormente puede ajustarse mediante gastos reales o simulados.

---

## 11. Conversión de moneda

El módulo de Presupuesto incluye soporte para distintas monedas.

La lógica de conversión está separada en utilidades y en un hook específico:

```text
useTasasCambio.js
presupuestoUtils.js
```

La aplicación contempla la consulta de tasas externas y dispone de valores de respaldo cuando no es posible obtener información actualizada.

---

## 12. Persistencia con LocalStorage

TripPlan utiliza **LocalStorage** para conservar información entre recargas del navegador.

Se mantienen datos como:

- Actividades agregadas.
- Actividades editadas.
- Actividades eliminadas.
- Favoritos.
- Estado del presupuesto.
- Gastos adicionales.

Si no existen datos guardados, la aplicación utiliza los datos iniciales definidos localmente.

---

## 13. Pronóstico del clima

TripPlan consume la API pública de **Open-Meteo** para consultar el pronóstico meteorológico del destino activo.

En el Dashboard se muestran datos como:

- Temperatura máxima.
- Temperatura mínima.
- Probabilidad de precipitación.
- Estado general del tiempo.

La respuesta de la API se transforma antes de mostrarse en la interfaz.

---

## 14. Estados de carga y error

La integración meteorológica contempla:

- Estado de carga.
- Manejo de errores.
- Renderizado condicional.
- Mensajes cuando no es posible obtener información.
- Consumo HTTP mediante `fetch`.

Esto evita que la interfaz dependa de que la API responda correctamente en todo momento.

---

## 15. Diseño responsive

La aplicación fue adaptada para funcionar en diferentes tamaños de pantalla.

Se trabajó especialmente en:

- Navbar.
- Dashboard.
- Tarjetas de estadísticas.
- Resumen del viaje.
- Itinerario.
- Formularios.
- Filtros.
- Favoritos.
- Destinos.
- Clima.
- Presupuesto.

La interfaz utiliza la siguiente paleta principal:

```text
#418EF2
#50B4F2
#59C1D9
#5ABFB5
#D9C8A9
```

---

# Tecnologías utilizadas

- React.
- Vite.
- JavaScript.
- JSX.
- HTML5.
- CSS3.
- React Router DOM.
- Fetch API.
- JSON.
- LocalStorage.
- Git.
- GitHub.
- Git Flow.

---

# Conceptos de React aplicados

Durante el desarrollo se utilizaron de manera práctica:

- Componentes reutilizables.
- Props.
- `useState`.
- `useEffect`.
- Eventos.
- Formularios controlados.
- Renderizado condicional.
- Listas y `key`.
- `map`.
- `filter`.
- `reduce`.
- `sort`.
- Estado compartido.
- Persistencia.
- React Router.
- Consumo de APIs externas.
- Separación de responsabilidades.

---

# API pública principal

## Open-Meteo

TripPlan utiliza **Open-Meteo** para obtener el pronóstico meteorológico correspondiente al destino del viaje actual.

### Documentación oficial

https://open-meteo.com/en/docs

### Endpoint utilizado

```text
https://api.open-meteo.com/v1/forecast
```

### Método HTTP

```text
GET
```

### Parámetros utilizados

Entre los parámetros enviados se encuentran:

- `latitude`
- `longitude`
- `start_date`
- `end_date`
- `timezone`
- `daily`

Dentro de `daily` se solicitan variables como:

- `weather_code`
- `temperature_2m_max`
- `temperature_2m_min`
- `precipitation_probability_max`

### Datos utilizados

La aplicación utiliza:

- Código meteorológico.
- Temperatura máxima.
- Temperatura mínima.
- Probabilidad máxima de precipitación.

### Ubicación en la interfaz

El pronóstico se visualiza en el **Dashboard** del viaje actual.

### Manejo de errores

Si la consulta falla:

- Se captura el error.
- La interfaz muestra un mensaje correspondiente.
- No se bloquea el resto de la aplicación.

También se muestra un estado de carga mientras la consulta se encuentra en proceso.

### Justificación funcional

La información meteorológica aporta valor directo al problema de planificación de viajes.

Conocer las condiciones esperadas del destino permite al usuario considerar factores como lluvia y temperatura al momento de organizar actividades.

---

# Gestión de datos sin backend

TripPlan no utiliza backend.

Los datos son administrados mediante:

- Objetos JavaScript.
- Arrays.
- Archivos locales.
- Estado de React.
- LocalStorage.
- Información obtenida desde APIs públicas.

Esta arquitectura permite simular el comportamiento de un sistema funcional completamente desde el frontend.

---

# Estructura del proyecto

```text
src/
├── assets/
│
├── components/
│   ├── ActivityCard.jsx
│   ├── ActivityForm.jsx
│   ├── Navbar.jsx
│   ├── StatCard.jsx
│   ├── TripSummary.jsx
│   └── WeatherCard.jsx
│
├── data/
│   ├── actividades.js
│   ├── destinos.js
│   └── viajes.js
│
├── features/
│   └── presupuesto/
│       ├── GastosLista.jsx
│       ├── Presupuesto.css
│       ├── Presupuesto.jsx
│       ├── ResumenPresupuesto.jsx
│       ├── Simulador.jsx
│       ├── presupuestoUtils.js
│       ├── usePresupuesto.js
│       └── useTasasCambio.js
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Destinos.jsx
│   ├── Favoritos.jsx
│   └── Itinerario.jsx
│
├── services/
│   └── weatherApi.js
│
├── styles/
│   └── styles.css
│
├── App.jsx
└── main.jsx
```

La carpeta `features/presupuesto/` concentra la lógica y los componentes relacionados con el presupuesto para evitar sobrecargar las páginas generales de la aplicación.

---

# Estado compartido

El estado principal de actividades se administra desde `App.jsx`.

Esto permite compartir los mismos datos entre distintas vistas:

```text
App.jsx
   │
   ├── Dashboard
   ├── Itinerario
   ├── Favoritos
   └── Presupuesto
```

Además, `App.jsx` mantiene la comunicación necesaria para que los gastos adicionales del presupuesto puedan reflejarse en el Dashboard.

---

# Rutas principales

La aplicación utiliza React Router DOM.

```text
/               Dashboard
/itinerario     Itinerario
/destinos       Destinos
/presupuesto    Presupuesto
/favoritos      Favoritos
```

---

# Ejecución del proyecto

## Requisitos

Tener instalado:

- Node.js.
- npm.
- Git.

## Clonar el repositorio

```bash
git clone https://github.com/marycodder/viajes.git
```

## Entrar al proyecto

```bash
cd viajes
```

## Instalar dependencias

```bash
npm install
```

## Ejecutar en modo desarrollo

```bash
npm run dev
```

Vite mostrará una dirección local similar a:

```text
http://localhost:5173
```

---

# Flujo de trabajo con Git

El proyecto utiliza una organización basada en Git Flow.

## Ramas principales

- `main`: versión estable del proyecto.
- `develop`: rama de integración.

## Ramas de funcionalidades

Durante el desarrollo se utilizaron ramas independientes, por ejemplo:

```text
feature/dashboard
feature/itinerario
feature/gestion-actividades
feature/favoritos
feature/local-storage
feature/dashboard-dinamico
feature/weather-api
feature/destinos
feature/resumen-viaje
feature/filtros-itinerario
feature/presupuestos
feature/integracion-presupuesto
```

El flujo utilizado fue principalmente:

```text
feature/* → develop → main
```

Las funcionalidades principales fueron integradas mediante Pull Requests.

---

# Diseño de la interfaz

La aplicación utiliza una identidad visual basada principalmente en tonos azules y turquesa.

La estructura visual considera:

- Navbar principal.
- Encabezados destacados.
- Tarjetas reutilizables.
- Jerarquía clara de títulos.
- Estados visuales.
- Formularios agrupados.
- Diseño responsive.
- Consistencia entre Dashboard, Itinerario, Destinos, Presupuesto y Favoritos.

---

# Flujo principal del usuario

Un flujo representativo es:

```text
Inicio
→ revisar resumen
→ entrar al itinerario
→ agregar o modificar una actividad
→ registrar su costo
→ revisar presupuesto
→ agregar gastos adicionales
→ volver al Dashboard
→ comprobar gasto total y presupuesto disponible
```

Otro flujo disponible es:

```text
Itinerario
→ marcar actividad como favorita
→ Favoritos
→ visualizar actividad seleccionada
```

---

# Uso de Inteligencia Artificial

Durante el desarrollo se utilizó **ChatGPT** como herramienta de apoyo.

## Propósitos

La IA fue utilizada para:

- Analizar los requerimientos del taller.
- Apoyar la componentización.
- Explicar conceptos de React.
- Revisar uso de `useState`.
- Revisar uso de `useEffect`.
- Trabajar con props y estado compartido.
- Apoyar formularios y validaciones.
- Implementar filtros.
- Apoyar persistencia con LocalStorage.
- Orientar la integración de Open-Meteo.
- Apoyar la integración entre Presupuesto, Itinerario y Dashboard.
- Orientar el uso de Git, ramas y Pull Requests.

## Ejemplo representativo de consulta

```text
Necesitamos integrar el presupuesto con el itinerario y el Dashboard.
Las actividades tienen costos, pero también existen gastos adicionales
registrados en Presupuesto. Queremos que el gasto total mostrado en
Dashboard corresponda a la suma de ambas fuentes sin duplicar actividades.
```

## Resultado obtenido

La herramienta propuso separar:

- Actividades del itinerario.
- Gastos adicionales.
- Total utilizado para los cálculos.
- Estado compartido entre vistas.

También se propuso mantener las actividades del itinerario como elementos de solo lectura dentro de Presupuesto y dejar únicamente los gastos adicionales como elementos editables en la sección de gastos.

## Modificación humana

Las propuestas de IA fueron revisadas antes de incorporarse.

El equipo:

- Revisó los fragmentos de código.
- Adaptó los nombres a la estructura existente.
- Conservó la organización creada por los integrantes.
- Probó los cálculos.
- Detectó duplicaciones de gastos.
- Ajustó la integración.
- Probó la persistencia.
- Corrigió errores visuales.
- Validó el comportamiento responsive.
- Decidió qué propuestas implementar y cuáles descartar.

## Aprendizajes obtenidos

El uso de IA permitió reforzar conocimientos sobre:

- Organización de componentes.
- Estado compartido.
- Comunicación mediante props.
- Hooks.
- Formularios controlados.
- Renderizado condicional.
- Transformación de arrays.
- Persistencia con LocalStorage.
- Consumo de APIs.
- Manejo de errores.
- Separación de responsabilidades.
- Integración de módulos desarrollados por distintos integrantes.
- Git Flow.
- Resolución de conflictos de ramas.
- Pull Requests.
- Depuración de problemas de estado y sincronización.

---

# Limitaciones conocidas

- La aplicación no utiliza backend.
- No existe autenticación de usuarios.
- Actualmente se administra un viaje activo a la vez.
- El viaje activo de demostración corresponde a Santiago.
- Los otros destinos se utilizan como sugerencias de exploración.
- Los datos locales no se sincronizan entre dispositivos.
- LocalStorage depende del navegador utilizado.
- El pronóstico depende de la disponibilidad de Open-Meteo.
- Las actividades y destinos iniciales son datos locales.
- Los datos de presupuesto tienen carácter simulado.
- La conversión de moneda depende de la disponibilidad de la fuente externa utilizada por el módulo de tasas.

---

# Integrantes

- Mary González.
- Gonzalo Yussef.
- Sebastián Torrealba.

---


