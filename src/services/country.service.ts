import type { CountryData } from '../types';


const FIFA_TO_ISO: Record<string, string> = {
  MEX: 'MEX', USA: 'USA', CAN: 'CAN', HAI: 'HTI', PAN: 'PAN', CUW: 'CUW',
  ARG: 'ARG', BRA: 'BRA', URU: 'URY', COL: 'COL', ECU: 'ECU', PAR: 'PRY',
  FRA: 'FRA', ESP: 'ESP', GER: 'DEU', ENG: 'GBR', POR: 'PRT', NED: 'NLD',
  BEL: 'BEL', CRO: 'HRV', TUR: 'TUR', CZE: 'CZE', SCO: 'GBR', BIH: 'BIH',
  SUI: 'CHE', SWE: 'SWE', NOR: 'NOR', AUT: 'AUT',
  JPN: 'JPN', KOR: 'KOR', IRN: 'IRN', KSA: 'SAU', AUS: 'AUS', QAT: 'QAT',
  UZB: 'UZB', IRQ: 'IRQ', JOR: 'JOR',
  MAR: 'MAR', SEN: 'SEN', NGA: 'NGA', COD: 'COD', ZAF: 'ZAF',
  ALG: 'DZA', EGY: 'EGY', GHA: 'GHA', CIV: 'CIV', TUN: 'TUN', CPV: 'CPV',
  NZL: 'NZL',

};

const API_KEY = import.meta.env.VITE_REST_COUNTRIES_KEY;
const BASE_URL = 'https://api.restcountries.com/countries/v5';

interface RestCountryLanguage {
  name?: string;
  english_name?: string;
  iso639_1?: string;
}

interface RestCountryCurrency {
  code?: string;
  name?: string;
}

interface RestCountryResponse {
  names?: { common?: string; official?: string };
  flag?: { url_svg?: string };
  capitals?: { name?: string }[];
  region?: string;
  languages?: RestCountryLanguage[] | Record<string, RestCountryLanguage>;
  currencies?: RestCountryCurrency[] | Record<string, RestCountryCurrency>;
  population?: number;
  timezones?: string[];
}

function parseLanguages(languages: RestCountryResponse['languages']): string[] {
  if (!languages) return ['N/A'];
  if (Array.isArray(languages)) {
    return languages.map((lang) => lang.name ?? lang.english_name ?? lang.iso639_1 ?? 'N/A');
  }
  return Object.keys(languages);
}

function parseCurrencies(currencies: RestCountryResponse['currencies']): string[] {
  if (!currencies) return ['N/A'];
  if (Array.isArray(currencies)) {
    return currencies.map((currency) => currency.code ?? currency.name ?? 'N/A');
  }
  return Object.entries(currencies).map(([code, currency]) =>
    currency?.name ? `${code} (${currency.name})` : code
  );
}

async function fetchRestCountry(fifaCode: string): Promise<CountryData | null> {
  if (!API_KEY) {
    console.error('REST Countries: falta configurar VITE_REST_COUNTRIES_KEY en .env');
    return null;
  }

  const isoCode = FIFA_TO_ISO[fifaCode] ?? fifaCode;
  const url = `${BASE_URL}/codes.alpha_3/${isoCode}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!res.ok) {
      console.error(`REST Countries: error ${res.status} al buscar ${fifaCode}`, await res.text());
      return null;
    }

    const body = await res.json();
    const country: RestCountryResponse | undefined = body.data?.objects?.[0];

    if (!country) return null;

    return {
      name: country.names?.common ?? fifaCode,
      officialName: country.names?.official ?? fifaCode,
      flag: country.flag?.url_svg ?? '',
      capital: country.capitals?.[0]?.name ?? 'N/A',
      region: country.region ?? 'N/A',
      languages: parseLanguages(country.languages),
      currencies: parseCurrencies(country.currencies),
      population: country.population ?? 0,
      timezones: country.timezones ?? ['N/A'],
    };
  } catch (error) {
    console.error(`REST Countries: fallo de red al buscar ${fifaCode}`, error);
    return null;
  }
}

export default fetchRestCountry;
