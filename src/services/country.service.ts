import type { CountryData } from '../types';
import countriesData from '../data/countries.json';

const LOCAL: Record<string, CountryData> = countriesData as Record<string, CountryData>;

const ISO3_WB: Record<string, string> = {
  ENG: 'GBR',
  SCO: 'GBR',
  KSA: 'SAU',
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

// --- World Bank ---
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

// --- REST Countries ---
async function fetchRestCountry(iso3: string): Promise<any | null> {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${iso3}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.[0] ?? null;
  } catch {
    return null;
  }
}

// --- Función principal ---
export async function fetchCountry(iso3: string): Promise<CountryData> {
  const [restResult, wbInfoResult, wbPopResult] = await Promise.allSettled([
    fetchRestCountry(iso3),
    fetchWBCountry(iso3),
    fetchWBPopulation(iso3),
  ]);

  const rest = restResult.status === 'fulfilled' ? restResult.value : null;
  const info = wbInfoResult.status === 'fulfilled' ? wbInfoResult.value : null;
  const pop  = wbPopResult.status  === 'fulfilled' ? wbPopResult.value  : null;
  const local = LOCAL[iso3];

  return {
    name:         rest?.name?.common ?? info?.name ?? local?.name ?? iso3,
    officialName: rest?.name?.official ?? local?.officialName ?? info?.name ?? iso3,
    flag:         rest?.flags?.svg ?? local?.flag ?? '',
    capital:      rest?.capital?.[0] ?? info?.capital ?? local?.capital ?? 'N/A',
    region:       rest?.region ?? info?.region ?? local?.region ?? 'N/A',
    languages:    rest?.languages ? Object.values(rest.languages) : local?.languages ?? [],
    currencies:   rest?.currencies ? Object.keys(rest.currencies) : local?.currencies ?? [],
    population:   rest?.population ?? pop ?? local?.population ?? 0,
    timezones:    rest?.timezones ?? local?.timezones ?? [],
  };
}

export default fetchCountry;