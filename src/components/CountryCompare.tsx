// src/components/CountryCompare.tsx
import { useCountry } from '../hooks/useCountry';

interface CountryCompareProps {
  teamA: string;  // "MEX"
  teamB: string;  // "ZAF"
}

export default function CountryCompare({ teamA, teamB }: CountryCompareProps) {
  const { data: dataA, isLoading: loadA } = useCountry(teamA);
  const { data: dataB, isLoading: loadB } = useCountry(teamB);

  if (loadA || loadB) return (
    <p style={{ color: '#7a8fa6', fontSize: 12 }}>Cargando comparación...</p>
  );

  const rows: Array<{ label: string; a: string; b: string }> = [
    { label: 'Población',     a: dataA?.population.toLocaleString() ?? 'N/A', b: dataB?.population.toLocaleString() ?? 'N/A' },
    { label: 'Capital',       a: dataA?.capital ?? 'N/A',    b: dataB?.capital ?? 'N/A' },
    { label: 'Región',        a: dataA?.region ?? 'N/A',     b: dataB?.region ?? 'N/A' },
    { label: 'Idiomas',       a: dataA?.languages.join(', ') ?? 'N/A', b: dataB?.languages.join(', ') ?? 'N/A' },
    { label: 'Moneda',        a: dataA?.currencies.join(', ') ?? 'N/A', b: dataB?.currencies.join(', ') ?? 'N/A' },
    { label: 'Zona horaria',  a: dataA?.timezones[0] ?? 'N/A', b: dataB?.timezones[0] ?? 'N/A' },
  ];

  return (
    <div style={{ background: '#0f1f35', border: '1px solid #1a3050', borderRadius: 12, padding: 14 }}>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1a3050' }}>
            <th style={{ textAlign: 'left', padding: '4px 0', fontWeight: 800, color: '#f1faee' }}>
              {dataA?.name ?? teamA}
            </th>
            <th style={{ textAlign: 'center', padding: '4px 0', fontWeight: 700, color: '#2d4060', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              Indicador
            </th>
            <th style={{ textAlign: 'right', padding: '4px 0', fontWeight: 800, color: '#f1faee' }}>
              {dataB?.name ?? teamB}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, a, b }) => (
            <tr key={label} style={{ borderBottom: '1px solid #1a3050' }}>
              <td style={{ padding: '6px 0', color: '#a8b8c8', textAlign: 'left' }}>{a}</td>
              <td style={{ padding: '6px 0', color: '#7a8fa6', textAlign: 'center', fontSize: 10, textTransform: 'uppercase' }}>{label}</td>
              <td style={{ padding: '6px 0', color: '#a8b8c8', textAlign: 'right' }}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}