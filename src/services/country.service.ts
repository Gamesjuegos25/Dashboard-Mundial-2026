import type { CountryData } from '../types';
import countriesData from '../data/countries.json';

const COUNTRIES: Record<string, CountryData> = countriesData as Record<string, CountryData>;

export async function fetchCountry(iso3: string): Promise<CountryData> {
  const found = COUNTRIES[iso3];
  if (found) return found;

  return {
    name: iso3,
    officialName: iso3,
    flag: '',
    capital: 'N/A',
    region: 'N/A',
    languages: [],
    currencies: [],
    population: 0,
    timezones: [],
  };
}

export default fetchCountry;