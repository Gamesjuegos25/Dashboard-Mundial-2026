Panel de control Mundial 2026


Panel interactivo de la fase de grupos de la Copa del Mundo FIFA 2026, desarrollado con React, TypeScript y Vite.




 Descripción

Dashboard Mundial 2026 es una aplicación de página única (SPA) que permite visualizar todos los partidos de la fase de grupos del Mundial FIFA 2026. Incluye información en tiempo real sobre el estado de cada partido, el clima en la sede del encuentro, datos estadísticos de los países participantes y detalles de los planteles por selección.

Los horarios se muestran en la hora local de cada sede (no en la zona horaria del navegador del usuario), gracias a una conversión precisa mediante la API Intl.DateTimeFormat.


 Características principales


 Calendario completo de la fase de grupos con estado en tiempo real: Próximo , En curso y Finalizado
 Horarios en hora local de la sede — conversión correcta entre zonas horarias (DST incluido)
 Clima del día del partido — temperatura máxima/mín, probabilidad de lluvia, humedad y viento mediante Open-Meteo API
 Datos del país — bandera, capital, región, idiomas, monedas y población mediante REST Países v5 API
 Planteles por selección — jugadores y posiciones de todos los equipos participantes
 Información de estadios — sede, ciudad, país y coordenadas geográficas
 Filtros interactivos — por grupo, por equipo y por estado del partido
 Tema oscuro de manera predeterminada, adaptado para pantallas de todo tamaño



 Tecnologías utilizadas

TecnologíaVersiónUsoReaccionar^19.2.6Interfaz de usuario del marcoMecanografiado~6.0.2Tipado estáticoVite^8.0.12Bundler y servidor de desarrolloTailwind CSS^3.4.19Estilos utilitariosReact Router DOM^7.17.0EnrutamientoConsulta de React de TanStack^5.101.0Caché y obtención de datos asíncronosAxios^1.18.0Cliente HTTPAPI Open-Meteo—Datos meteorológicos (sin clave de API)Países REST v5—Datos geopolíticos de los países


 Estructura del proyecto

dashboard-mundial-2026/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── CountryCard.tsx       # Tarjeta de datos del país
│   │   ├── CountryCompare.tsx    # Comparativa entre países
│   │   ├── MatchesDashboard.tsx  # Lista/grilla de partidos
│   │   └── WeatherPanel.tsx      # Panel del clima por sede
│   ├── data/
│   │   ├── matches.json          # Datos de todos los partidos
│   │   ├── squads.ts             # Planteles de selecciones
│   │   └── stadiumInfo.ts        # Info de estadios y coordenadas
│   ├── hooks/
│   │   ├── useCountry.ts         # Hook para datos de país (React Query)
│   │   └── useWeather.ts         # Hook para datos del clima (React Query)
│   ├── pages/
│   │   └── Dashboard.tsx         # Página principal del dashboard
│   ├── services/
│   │   ├── country.service.ts    # Servicio REST Countries v5 API
│   │   └── weather.service.ts    # Servicio Open-Meteo API
│   ├── utils/
│   │   └── time.ts               # Utilidades de zona horaria y formato
│   ├── types.ts                  # Interfaces TypeScript compartidas
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── .env.ejemplo
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.cjs
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts


 Instalación y uso

Prerrequisitos


Node.js v18 o superior
npm v9 o superior


1. Clonar el repositorio

intentogit clone https://github.com/Gamesjuegos25/Dashboard-Mundial-2026.git
cd Dashboard-mundial-2026

2. Instalar dependencias

intentonpm install

3. Configurar variables de entorno

Crea un archivo .enven la raíz del proyecto basándote en .env.ejemplo:

intentocp .env.ejemplo .env

Edita el archivo .envy agrega tu clave de API:

entornoVITE_REST_COUNTRIES_KEY=tu_api_key_aqui


Nota: La API de Open-Meteo (clima) es completamente gratuita y no requiere clave. Solo los países REST v5 requieren autenticación.



4. Iniciar el servidor de desarrollo

intentonpm run dev

Abre http://localhost :5173 en tu navegador.


 Scripts disponibles

ComandoDescripciónnpm run devInicia el servidor de desarrollo con HMRnpm run buildCompila TypeScript y genera la compilación de producción.npm run previewPrevisualiza la construcción de producción localmentenpm run lintEjecuta ESLint sobre todo el código fuente


 API externas

Open-Meteo


URL: https://api.open-meteo.com/v1/forecast
Autenticación: Ninguna (pública y gratuita)
Uso: Temperatura máxima/mín, probabilidad de lluvia, velocidad del viento, código meteorológico y humedad relativa para el día del partido en cada sede.


Países REST v5


URL: https://api.restcountries.com/countries/v5
Autenticación: Token al portador (variable VITE_REST_COUNTRIES_KEY)
Uso: Nombre oficial, bandera SVG, capital, región, idiomas, monedas, población y zonas horarias de cada selección.
Mapping FIFA → ISO: El servicio incluye una tabla de conversión de códigos FIFA de tres letras a códigos ISO 3166-1 alpha-3 para consultar correctamente cada país.



 Lógica de zonas horarias

Cada partido almacena su hora local en la zona horaria de la sede (ej. America/Mexico_City, America/Los_Angeles, America/Toronto). La conversión se realiza con Intl.DateTimeFormatpara respetar el horario de verano (DST) de forma precisa, sin depender de las compensaciones fijas.

ts// src/utils/time.ts
export function formatTime12h(date: string, timeLocal: string, timezone: string): string { ... }
export function getMatchStatus(date: string, timeLocal: string, timezone: string): string { ... }

El estado del partido se calcula dinámicamente comparando la hora actual (UTC) con el inicio del partido convertido a UTC usando el offset real de la sede.


Estructura de datos —matches.json

Cada objeto en matches.jsontiene la siguiente forma:

json{
  "matchId": 1,
  "phase": "group",
  "group": "A",
  "date": "2026-06-11",
  "timeLocal": "13:00",
  "timezone": "America/Mexico_City",
  "venueName": "Estadio Ciudad de México",
  "city": "Ciudad de México",
  "country": "MX",
  "latitude": 19.3032,
  "longitude": -99.1506,
  "teamA": "MEX",
  "teamB": "ZAF",
  "teamAName": "México",
  "teamBName": "Sudáfrica"
}


 Caché y rendimiento

Los datos de API externas se almacenan en TanStack React Query :


Datos de país ( useCountry): caché de 1 hora
Datos del clima ( useWeather): caché de 30 minutos


Esto evita llamadas redundantes al navegar entre partidos del mismo equipo o sede.


 Colaboradores

Este proyecto fue desarrollado como parte del curso de Análisis de Sistemas I en la Universidad Mariano Gálvez de Guatemala — Centro Universitario de Chiquimulilla, Grupo No. 2 .


 Licencia

Proyecto academico de uso educativo. Los datos de partidos, equipos y sedes corresponden al torneo oficial FIFA World Cup 2026.