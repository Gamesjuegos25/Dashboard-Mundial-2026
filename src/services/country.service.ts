import axios from 'axios';
import { CountryData } from '../types';

const SPECIAL_COUNTRIES: Record<string, CountryData> = {
  SCO: {
    name: 'Escocia',
    officialName: 'Scotland',
    flag: 'https://flagcdn.com/gb-sct.svg',
    capital: 'Edimburgo',
    region: 'Europe',
    languages: ['Inglés', 'Escocés gaélico'],
    currencies: ['Libra esterlina (£)'],
    population: 5500000,
    timezones: ['UTC+0'],
  },
  ENG: {
    name: 'Inglaterra',
    officialName: 'England',
    flag: 'https://flagcdn.com/gb-eng.svg',
    capital: 'Londres',
    region: 'Europe',
    languages: ['Inglés'],
    currencies: ['Libra esterlina (£)'],
    population: 56000000,
    timezones: ['UTC+0'],
  },
  CUW: {
    name: 'Curazao',
    officialName: 'Curaçao',
    flag: 'https://flagcdn.com/cw.svg',
    capital: 'Willemstad',
    region: 'Americas',
    languages: ['Papiamento', 'Holandés', 'Inglés'],
    currencies: ['Florín antillano (ƒ)'],
    population: 153000,
    timezones: ['UTC-4'],
  },
};

const ISO3_TO_NAME: Record<string, string> = {
  ARG: 'Argentina',
  AUS: 'Australia',
  BEL: 'Belgium',
  BIH: 'Bosnia and Herzegovina',
  BRA: 'Brazil',
  CMR: 'Cameroon',
  CAN: 'Canada',
  CHL: 'Chile',
  CHN: 'China',
  COL: 'Colombia',
  CRI: 'Costa Rica',
  HRV: 'Croatia',
  ECU: 'Ecuador',
  EGY: 'Egypt',
  FRA: 'France',
  DEU: 'Germany',
  GHA: 'Ghana',
  HTI: 'Haiti',
  HUN: 'Hungary',
  IRN: 'Iran',
  IRQ: 'Iraq',
  ITA: 'Italy',
  JAM: 'Jamaica',
  JPN: 'Japan',
  KAZ: 'Kazakhstan',
  KOR: 'South Korea',
  MAR: 'Morocco',
  MEX: 'Mexico',
  NZL: 'New Zealand',
  NGA: 'Nigeria',
  NOR: 'Norway',
  PAN: 'Panama',
  PRY: 'Paraguay',
  PER: 'Peru',
  POR: 'Portugal',
  ROU: 'Romania',
  SAU: 'Saudi Arabia',
  SEN: 'Senegal',
  SRB: 'Serbia',
  SVK: 'Slovakia',
  RSA: 'South Africa',
  ESP: 'Spain',
  TUR: 'Turkey',
  UKR: 'Ukraine',
  URU: 'Uruguay',
  USA: 'United States',
  VEN: 'Venezuela',
  CZE: 'Czech Republic',
  THA: 'Thailand',
  ALB: 'Albania',
  SLV: 'El Salvador',
};

export async function fetchCountry(iso3: string): Promise<CountryData> {
  if (SPECIAL_COUNTRIES[iso3]) return SPECIAL_COUNTRIES[iso3];
  const name = ISO3_TO_NAME[iso3] ?? iso3;
  try {
    const { data } = await axios.get(`https://restcountries.com/v3.1/name/${name}`, {
      params: {
        fields: 'name,flags,capital,region,languages,currencies,population,timezones',
      },
    });
    const c = data[0];
    return {
      name: c.name.common,
      officialName: c.name.official,
      flag: c.flags?.svg ?? c.flags?.png ?? '',
      capital: c.capital?.[0] ?? 'N/A',
      region: c.region,
      languages: Object.values(c.languages ?? {}),
      currencies: Object.values(c.currencies ?? {}).map((cu: any) => `${cu.name} (${cu.symbol})`),
      population: c.population,
      timezones: c.timezones,
    } as CountryData;
  } catch (e) {
    try {
      const { data: cn } = await axios.get('https://countriesnow.space/api/v0.1/countries/flag/images');
      const found = cn.data?.find((x: any) => x.name.toLowerCase().includes(name.toLowerCase()));
      return {
        name,
        officialName: name,
        flag: found?.flag ?? '',
        capital: 'N/A',
        region: 'N/A',
        languages: [],
        currencies: [],
        population: 0,
        timezones: [],
      } as CountryData;
    } catch (err) {
      return {
        name,
        officialName: name,
        flag: '',
        capital: 'N/A',
        region: 'N/A',
        languages: [],
        currencies: [],
        population: 0,
        timezones: [],
      } as CountryData;
    }
  }
}

export default fetchCountry;
