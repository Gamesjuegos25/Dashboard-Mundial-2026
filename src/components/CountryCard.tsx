import React from 'react';
import { useCountry } from '../hooks/useCountry';

interface Props {
  iso3: string;
}

export function CountryCard({ iso3 }: Props) {
  const { data, isLoading, isError } = useCountry(iso3);

  if (isLoading)
    return (
      <div className="bg-white rounded-xl p-4 shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );

  if (isError || !data)
    return (
      <div className="bg-red-50 rounded-xl p-4 text-red-600 text-sm">
        No se pudo cargar la información del país.
      </div>
    );

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className="flex items-center gap-3 mb-3">
        <img src={data.flag} alt={data.name} className="w-10 h-7 object-cover rounded shadow" />
        <div>
          <p className="font-bold text-gray-800">{data.name}</p>
          <p className="text-xs text-gray-500">{data.officialName}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium">Capital:</span> {data.capital}
        </p>
        <p>
          <span className="font-medium">Región:</span> {data.region}
        </p>
        <p>
          <span className="font-medium">Idiomas:</span> {data.languages.join(', ')}
        </p>
        <p>
          <span className="font-medium">Moneda:</span> {data.currencies[0] ?? 'N/A'}
        </p>
        <p>
          <span className="font-medium">Población:</span> {data.population.toLocaleString()}
        </p>
        <p>
          <span className="font-medium">Zona horaria:</span> {data.timezones[0] ?? 'N/A'}
        </p>
      </div>
    </div>
  );
}

export default CountryCard;
