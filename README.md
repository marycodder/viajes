# Trip Plan: Organiza tu viaje de orincipio a fin

Nuestro proeycto corresponde a una aplicación frontend desarrollada con React para la planificación de viajes.

## Descripción del proyecto

Trip Plan es una aplicación web que permite a los usuarios organizar un viaje mediante la gestión de destinos, actividades, itinerarios, presupuesto estimado y favoritos. Desarrollado completamente como frontend, sin backend.

## Problemática

La planificación de un viaje suele requerir utilizar diferentes herramientas para organizar destinos, actividades, presupuesto e información externa.

La aplicación busca centralizar esa información en una sola interfaz, facilitando la organización del viaje y permitiendo visualizar información relevante de manera simple.

## Usuarios objetivo

Personas que necesitan organizar y planificar viajes personales, vacaciones o actividades turísticas.

## Funcionalidades principales

- Visualización general del viaje.
- Gestión de destinos.
- Creación y visualización de itinerarios.
- Registro de actividades.
- Edición y eliminación de actividades.
- Gestión de favoritos.
- Presupuesto estimado.
- Cálculo del presupuesto utilizado y disponible.
- Filtros de actividades.
- Persistencia mediante LocalStorage.
- Consulta de información meteorológica mediante una API pública.
- Manejo de estados de carga y error.
- Diseño responsive.

## Tecnologías utilizadas

- React
- Vite
- JavaScript
- HTML5 / JSX
- CSS3
- Bootstrap
- Fetch API
- JSON
- LocalStorage
- Git
- GitHub
- Git Flow

## API pública

Se utilizará Open-Meteo para obtener información meteorológica relacionada con los destinos del viaje.

### Documentación oficial

https://open-meteo.com/en/docs

### Endpoint principal

`https://api.open-meteo.com/v1/forecast`

### Método HTTP

`GET`

### Datos utilizados

La aplicación utilizará información como:

- Temperatura máxima.
- Temperatura mínima.
- Probabilidad de precipitación.
- Código meteorológico.

### Justificación

La información meteorológica aporta valor a la planificación del viaje porque permite al usuario conocer las condiciones esperadas del destino y tomar mejores decisiones respecto de sus actividades.

## Estructura inicial del proyecto

```text
src/
├── assets/
├── components/
├── data/
├── pages/
├── services/
├── styles/
├── App.jsx
└── main.jsx


Uso de Inteligencia Artificial

Durante el desarrollo se utilizarán herramientas de Inteligencia Artificial como apoyo.

Se documentará:
- Herramienta utilizada.
- Propósito.
- Prompt o consulta.
- Resultado obtenido.
- Modificaciones realizadas por el equipo.
- Aprendizajes obtenidos.
El código generado o sugerido mediante IA será revisado y comprendido por los integrantes del equipo antes de ser incorporado.
Limitaciones conocidas
- No existe backend.
- Los datos principales son simulados mediante JSON, estado de React y LocalStorage.
- La persistencia depende del navegador utilizado.
- La información meteorológica depende de la disponibilidad de la API pública.

Integrantes:
- Mary González
- Gonzalo Yussef
- Sebastián Torrealba