import { useQuery } from '@tanstack/react-query';
import { fetchCountry } from '../services/country.service';

export function useCountry(iso3: string, enabled = true) {
  return useQuery({
    queryKey: ['country', iso3],
    queryFn: () => fetchCountry(iso3),
    enabled: enabled && !!iso3,
    staleTime: 1000 * 60 * 60, // 1 hour cache
    retry: 2,
  });
}

export default useCountry;
