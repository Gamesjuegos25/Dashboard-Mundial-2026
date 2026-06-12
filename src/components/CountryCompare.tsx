import React from 'react';
import { useCountry } from '../hooks/useCountry';

interface Props {
  isoA: string;
  isoB: string;
}

export function CountryCompare({ isoA, isoB }: Props) {
  const a = useCountry(isoA);
  const b = useCountry(isoB);

  if (a.isLoading || b.isLoading) return <p className="text-gray-400 text-sm">Cargando comparación...</p>;
  if (!a.data || !b.data) return null;

  const popDiff = Math.abs(a.data.population - b.data.population);
  const popPct = b.data.population ? ((popDiff / b.data.population) * 100).toFixed(1) : '0';

  const rows: Array<[string, string, string]> = [
    ['Población', a.data.population.toLocaleString(), b.data.population.toLocaleString()],
    ['Capital', a.data.capital, b.data.capital],
    ['Región', a.data.region, b.data.region],
    ['Idiomas', a.data.languages.slice(0, 2).join(', '), b.data.languages.slice(0, 2).join(', ')],
    ['Moneda', a.data.currencies[0] ?? 'N/A', b.data.currencies[0] ?? 'N/A'],
    ['Zona horaria', a.data.timezones[0] ?? 'N/A', b.data.timezones[0] ?? 'N/A'],
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-bold text-gray-700 mb-3">Comparación de selecciones</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left py-1">{a.data.name}</th>
            <th className="text-center py-1 text-gray-400">Indicador</th>
            <th className="text-right py-1">{b.data.name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, valA, valB]) => (
            <tr key={label} className="border-b last:border-0">
              <td className="py-1.5 text-gray-700">{valA}</td>
              <td className="py-1.5 text-center text-gray-400 text-xs">{label}</td>
              <td className="py-1.5 text-right text-gray-700">{valB}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-3">Diferencia de población: {popDiff.toLocaleString()} ({popPct}%)</p>
    </div>
  );
}

export default CountryCompare;
