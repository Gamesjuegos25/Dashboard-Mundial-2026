# Manual Técnico — Dashboard Mundial 2026

## Portada

- Proyecto: Dashboard Mundial 2026
- Integrantes: (Lista de integrantes)
- Fecha

## Arquitectura

Descripción de la arquitectura: frontend React + APIs externas (REST Countries, OpenWeather), despliegue estático en Render.

## APIs usadas

- REST Countries: https://restcountries.com — búsqueda por nombre con campos `name,flags,capital,region,languages,currencies,population,timezones`.
- countriesnow.space: fallback para banderas.

## Estructura de `matches.json`

Explicar campos: matchId, teamA, teamB, teamAName, teamBName, date, timeLocal, timezone, venueName, latitude, longitude, group.

## Componentes React

- `CountryCard` (src/components/CountryCard.tsx): recibe `iso3` y muestra datos.
- `CountryCompare` (src/components/CountryCompare.tsx): recibe `isoA`, `isoB` y genera tabla.
- `MatchDetail` (src/pages/MatchDetail.tsx): página de detalle del partido.

## Hooks personalizados

- `useCountry` (src/hooks/useCountry.ts): usa TanStack Query para cachear por 1 hora.

## Casos especiales

- Escocia (`SCO`), Inglaterra (`ENG`) y Curazao (`CUW`) no están en REST Countries y se manejan con datos estáticos en `country.service.ts`.

## Despliegue en Render.com

Pasos para configurar Static Site en Render: conectar repo, build `npm run build`, publish `dist`, y agregar `public/_redirects`.

## Solución a CORS

Se usa fallback a `countriesnow.space` si REST Countries falla por CORS.

## Troubleshooting y errores comunes

- Bandera no cargada: revisar `flag` en la respuesta o fallback.
- Página 404 en producción: verificar `public/_redirects`.

## Instalación local

1. `npm install`
2. `npm run dev`

## Anexos

- Diagrama de componentes: (agregar)
