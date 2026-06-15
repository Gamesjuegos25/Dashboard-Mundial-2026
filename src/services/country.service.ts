import type { CountryData } from '../types';
import countriesData from '../data/countries.json';

/**
 * ESTRATEGIA DE DATOS DE PAÍSES:
 *
 * 1. World Bank API (api.worldbank.org) — llamada en vivo, sin API key, CORS habilitado.
 *    Provee: nombre oficial, capital, región, población (dato más reciente).
 *    Endpoint: https://api.worldbank.org/v2/country/{ISO3}?format=json
 *    Endpoint: https://api.worldbank.org/v2/country/{ISO3}/indicator/SP.POP.TOTL?format=json&per_page=1&mrv=1
 *
 * 2. Dataset local (src/data/countries.json) — fallback y complemento.
 *    Provee: bandera (flagcdn.com), idiomas, monedas, zonas horarias.
 *    Justificación: REST Countries v3.1 fue deprecada en 2025 y v5 requiere API key,
 *    violando el requisito de acceso libre. World Bank no provee estos campos.
 *    El dataset local cubre las 37 selecciones del torneo.
 */

const LOCAL: Record<string, CountryData> = countriesData as Record<string, CountryData>;

// Mapa ISO-3 FIFA → ISO-3 World Bank (son iguales en casi todos, excepto algunos)
const ISO3_WB: Record<string, string> = {
  ENG: 'GBR', // Inglaterra → Reino Unido en World Bank
  SCO: 'GBR', // Escocia → Reino Unido en World Bank
  KSA: 'SAU', // Arabia Saudita
  KOR: 'KOR',
  CZE: 'CZE',
  HAI: 'HTI',
  COD: 'COD',
  ZAF: 'ZAF',
  BIH: 'BIH',
};

function wbIso(iso3: string): string {
  return ISO3_WB[iso3] ?? iso3;
}

async function fetchWBCountry(iso3: string): Promise<{ name: string; capital: string; region: string } | null> {
  try {
    const wb = wbIso(iso3);
    const res = await fetch(`https://api.worldbank.org/v2/country/${wb}?format=json`);
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.[1]?.[0];
    if (!d) return null;
    return {
      name: d.name ?? '',
      capital: d.capitalCity ?? 'N/A',
      region: d.region?.value?.replace(' (excluding high income)', '') ?? 'N/A',
    };
  } catch {
    return null;
  }
}

async function fetchWBPopulation(iso3: string): Promise<number | null> {
  try {
    const wb = wbIso(iso3);
    const res = await fetch(
      `https://api.worldbank.org/v2/country/${wb}/indicator/SP.POP.TOTL?format=json&per_page=1&mrv=1`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const value = json?.[1]?.[0]?.value;
    return typeof value === 'number' ? value : null;
  } catch {
    return null;
  }
}

export async function fetchCountry(iso3: string): Promise<CountryData> {
  const local = LOCAL[iso3];

  // Llamadas paralelas a World Bank API
  const [wbInfo, wbPop] = await Promise.allSettled([
    fetchWBCountry(iso3),
    fetchWBPopulation(iso3),
  ]);

  const info = wbInfo.status === 'fulfilled' ? wbInfo.value : null;
  const pop  = wbPop.status  === 'fulfilled' ? wbPop.value  : null;

  // Combinar: World Bank (en vivo) + local (complemento)
  return {
    name:         info?.name         ?? local?.name         ?? iso3,
    officialName: local?.officialName ?? info?.name         ?? iso3,
    flag:         local?.flag         ?? '',
    capital:      info?.capital       ?? local?.capital      ?? 'N/A',
    region:       info?.region        ?? local?.region       ?? 'N/A',
    languages:    local?.languages    ?? [],
    currencies:   local?.currencies   ?? [],
    population:   pop                 ?? local?.population   ?? 0,
    timezones:    local?.timezones    ?? [],
  };
}

export default fetchCountry;