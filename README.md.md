# TripPlan — Organiza tu viaje de principio a fin

TripPlan es una aplicación web frontend desarrollada con **React + Vite** para planificar viajes desde una sola interfaz. Permite organizar actividades, visualizar destinos, administrar favoritos, controlar un presupuesto, revisar un resumen general del viaje y consultar el pronóstico del clima.

## Descripción del proyecto

La planificación de un viaje suele requerir distintas herramientas para organizar fechas, actividades, presupuesto, destinos e información meteorológica.

TripPlan busca centralizar esas tareas en una aplicación simple y responsive, permitiendo que el usuario pueda revisar y modificar su planificación sin depender de un backend.

Actualmente el proyecto utiliza como viaje de ejemplo **Santiago de Chile**, con actividades, fechas y presupuesto simulados.

## Problemática

Al organizar un viaje es común utilizar diferentes aplicaciones, documentos o notas para registrar actividades, ordenar un itinerario, controlar gastos, guardar lugares de interés y revisar el clima.

TripPlan reúne estas funciones en una misma interfaz para simplificar la organización del viaje.

## Usuarios objetivo

TripPlan está orientado a personas que desean organizar:

* Viajes personales.
* Vacaciones.
* Escapadas de fin de semana.
* Actividades turísticas.
* Itinerarios con control de presupuesto.

## Funcionalidades implementadas

### Dashboard dinámico

El Dashboard entrega una vista general del viaje y se actualiza automáticamente según los cambios realizados en las actividades.

Muestra:

* Destino actual.
* Fechas del viaje.
* Cantidad de actividades.
* Presupuesto total.
* Total gastado.
* Presupuesto disponible.
* Próximas actividades.
* Actividades favoritas.
* Resumen general del viaje.
* Pronóstico meteorológico.

### Resumen del viaje

El Dashboard incluye un resumen dinámico con:

* Destino.
* Fechas.
* Cantidad de actividades.
* Cantidad de favoritos.
* Total gastado.
* Presupuesto disponible.

Los valores cambian automáticamente cuando se agregan, editan o eliminan actividades.

### Gestión del itinerario

El usuario puede administrar las actividades del viaje mediante un itinerario ordenado por fecha y hora.

Funciones disponibles:

* Agregar actividades.
* Editar actividades directamente desde su tarjeta.
* Eliminar actividades con confirmación.
* Ordenar automáticamente las actividades por fecha y hora.
* Agrupar actividades por día.
* Registrar nombre, categoría, fecha, hora y costo estimado.

### Filtros del itinerario

El itinerario incluye herramientas para encontrar actividades más fácilmente:

* Búsqueda por nombre.
* Filtro por categoría.
* Filtro de solo actividades favoritas.
* Contador de resultados.
* Opción para limpiar filtros.
* Estado vacío cuando no existen coincidencias.

Categorías utilizadas:

* Turismo.
* Cultura.
* Gastronomía.
* Paseo.
* Entretenimiento.

### Favoritos

Cada actividad puede ser marcada o desmarcada como favorita.

La aplicación incluye una página dedicada donde se muestran únicamente las actividades favoritas.

Los favoritos utilizan el mismo estado compartido que el itinerario, por lo que los cambios se reflejan inmediatamente entre las distintas vistas.

### Destinos

TripPlan incluye una sección de destinos con información básica de diferentes lugares de Chile.

Actualmente se incluyen solos algunos ejemplos, que son: 

* Santiago.
* Valparaíso.
* Pucón.
* San Pedro de Atacama.

La página permite:

* Buscar por nombre.
* Buscar por región.
* Buscar por tipo de destino.
* Visualizar el destino actual.
* Mostrar un estado vacío cuando no existen coincidencias.

### Presupuesto

La aplicación incorpora una vista de presupuesto que utiliza los costos registrados en las actividades.

Permite visualizar:

* Presupuesto total del viaje.
* Total gastado.
* Presupuesto disponible.
* Desglose de costos asociados a las actividades.

Los valores se calculan dinámicamente a partir de la planificación actual.

### Persistencia con LocalStorage

Las actividades se almacenan en **LocalStorage**, permitiendo mantener los cambios incluso después de recargar la aplicación.

Se conservan:

* Actividades agregadas.
* Actividades editadas.
* Actividades eliminadas.
* Estado de favoritos.

Si no existen datos almacenados, la aplicación utiliza los datos iniciales definidos en el proyecto.

### Pronóstico del clima

TripPlan consume la API pública de **Open-Meteo** para mostrar información meteorológica del destino.

El Dashboard muestra:

* Temperatura máxima.
* Temperatura mínima.
* Probabilidad máxima de precipitación.
* Estado general del tiempo.

La integración incluye:

* Estado de carga.
* Manejo de errores.
* Renderizado condicional.
* Consumo mediante `fetch`.
* Uso de `useEffect`.

### Diseño responsive

La interfaz se adapta a diferentes tamaños de pantalla.

Se han considerado especialmente:

* Navbar.
* Dashboard.
* Tarjetas de estadísticas.
* Itinerario.
* Formularios.
* Filtros.
* Favoritos.
* Destinos.
* Clima.
* Presupuesto.

## Tecnologías utilizadas

* React.
* Vite.
* JavaScript.
* JSX.
* HTML5.
* CSS3.
* React Router DOM.
* Fetch API.
* JSON.
* LocalStorage.
* Git.
* GitHub.
* Git Flow.

## Conceptos de React aplicados

Durante el desarrollo se utilizaron:

* Componentes reutilizables.
* Props.
* `useState`.
* `useEffect`.
* Eventos.
* Formularios controlados.
* Renderizado condicional.
* Renderizado de listas con `map`.
* Uso de `filter`, `reduce` y `sort`.
* Estado compartido entre páginas.
* React Router.
* Consumo de APIs externas.

## API pública

### Open-Meteo

TripPlan utiliza **Open-Meteo** para obtener el pronóstico meteorológico correspondiente al destino del viaje.

Documentación oficial:

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

* `latitude`
* `longitude`
* `start\_date`
* `end\_date`
* `timezone`
* `daily`

Dentro de `daily` se solicitan variables como:

* `weather\_code`
* `temperature\_2m\_max`
* `temperature\_2m\_min`
* `precipitation\_probability\_max`

### Datos utilizados en la interfaz

* Código meteorológico.
* Temperatura máxima.
* Temperatura mínima.
* Probabilidad máxima de precipitación.

Los datos son transformados antes de mostrarse mediante componentes de React.

### Ubicación de los datos

El pronóstico se visualiza en el **Dashboard** del viaje.

### Manejo de errores

Si la consulta a Open-Meteo falla, TripPlan muestra un mensaje indicando que no fue posible obtener el pronóstico.

También se muestra un estado de carga mientras la petición se encuentra en proceso.

### Justificación de la API

La información meteorológica aporta valor directo a una aplicación de planificación de viajes, ya que permite considerar las condiciones esperadas del destino al momento de organizar actividades.

## Estructura del proyecto

```text
src/
├── assets/
│   ├── images/
│   └── icons/
├── components/
│   ├── ActivityCard.jsx
│   ├── ActivityForm.jsx
│   ├── Navbar.jsx
│   ├── StatCard.jsx
│   ├── TripSummary.jsx
│   └── WeatherCard.jsx
├── data/
│   ├── actividades.js
│   ├── destinos.js
│   └── viajes.js
├── pages/
│   ├── Dashboard.jsx
│   ├── Destinos.jsx
│   ├── Favoritos.jsx
│   ├── Itinerario.jsx
│   └── Presupuesto.jsx
├── services/
│   └── weatherApi.js
├── styles/
│   └── styles.css
├── App.jsx
└── main.jsx
```

La estructura puede continuar evolucionando a medida que se realicen ajustes finales de integración.

## Estado compartido

El estado principal de las actividades se administra desde `App.jsx`.

Esto permite que diferentes secciones trabajen con los mismos datos:

```text
App.jsx
   │
   └── actividades
        ├── Dashboard
        ├── Itinerario
        ├── Favoritos
        └── Presupuesto
```

Las modificaciones realizadas desde el itinerario se reflejan en el resto de la aplicación.

## Ejecución del proyecto

### Requisitos

Tener instalado:

* Node.js.
* npm.
* Git.

### Clonar el repositorio

```bash
git clone https://github.com/marycodder/viajes.git
```

### Entrar al proyecto

```bash
cd viajes
```

### Instalar dependencias

```bash
npm install
```

### Ejecutar en modo desarrollo

```bash
npm run dev
```

Vite mostrará una dirección local similar a:

```text
http://localhost:5173
```

## Flujo de trabajo con Git

El proyecto utiliza una organización basada en Git Flow.

Ramas principales:

* `main`: versión estable.
* `develop`: integración del desarrollo.

Las funcionalidades se trabajan en ramas independientes, por ejemplo:

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
feature/presupuesto
```

Cada funcionalidad se integra mediante Pull Requests hacia `develop`.

## Uso de Inteligencia Artificial

Durante el desarrollo se utilizó **ChatGPT** como herramienta de apoyo.

### Propósitos

La IA fue utilizada principalmente para:

* Apoyar la componentización en React.
* Explicar conceptos como `useState`, `useEffect`, props y estado compartido.
* Proponer implementaciones para formularios, filtros y LocalStorage.
* Apoyar la integración de Open-Meteo.
* Detectar y corregir errores de JavaScript y React.



### Ejemplo de consulta utilizada

```text
Necesitamos agregar favoritos al itinerario. Queremos marcar y desmarcar
actividades y mostrar las favoritas en una página aparte utilizando el mismo
estado de React.
```

### Resultado obtenido

La IA propuso una estructura utilizando:

* Estado compartido.
* Props.
* Renderizado condicional.
* Componentes reutilizables.
* React Router.

### Modificaciones realizadas por el equipo

Las propuestas de IA no fueron incorporadas automáticamente.

El equipo:

* Revisó cada fragmento de código.
* Adaptó nombres y estructura al proyecto.
* Probó cada funcionalidad.
* Corrigió errores detectados durante la integración.
* Ajustó estilos y comportamiento responsive.
* Tomó decisiones sobre qué funcionalidades mantener o descartar.

### Aprendizajes obtenidos

El uso de IA permitió reforzar conocimientos relacionados con:

* Organización de componentes en React.
* Manejo de estado.
* Comunicación mediante props.
* Persistencia con LocalStorage.
* Consumo de APIs.
* Manejo de errores.
* Uso de Git Flow.
* Depuración de errores de importación, sintaxis y estado.

## Limitaciones conocidas

* La aplicación no utiliza backend.
* Actualmente se trabaja principalmente con un viaje de ejemplo.
* Los datos iniciales se encuentran definidos localmente.
* LocalStorage depende del navegador y dispositivo utilizado.
* Los datos no se sincronizan entre diferentes dispositivos.
* No existe autenticación de usuarios.
* El pronóstico depende de la disponibilidad de Open-Meteo.
* Los destinos utilizados como ejemplo están almacenados localmente.
* La aplicación todavía puede recibir ajustes visuales y pruebas finales antes de la presentación.

## Integrantes

* Mary González.
* Gonzalo Yussef.
* Sebastián Torrealba.

