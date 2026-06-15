import React from 'react';
import { useCountry } from '../hooks/useCountry';

interface Props {
  iso3: string;
  size?: number;
}

export function Flag({ iso3, size = 36 }: Props) {
  const { data, isLoading } = useCountry(iso3);

  if (isLoading) return <div className="w-9 h-6 bg-gray-100 rounded" />;
  if (!data || !data.flag) return <div className="w-9 h-6 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">🏳️</div>;

  return (
    <img
      src={data.flag}
      alt={data.name}
      width={size}
      height={Math.round(size * 0.6)}
      className="object-cover rounded"
    />
  );
}

export default Flag;
