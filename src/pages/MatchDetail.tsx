import React from 'react';
import { useParams, Link } from 'react-router-dom';
import matches from '../data/matches.json';
import { CountryCard } from '../components/CountryCard';
import { CountryCompare } from '../components/CountryCompare';
import { toGuatemalaTime } from '../utils/time';

export default function MatchDetail() {
  const { id } = useParams();
  const match = matches.find((m: any) => m.matchId === Number(id));
  if (!match)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Partido no encontrado.</p>
      </div>
    );

  const gtmTime = toGuatemalaTime(match.date, match.timeLocal, match.timezone);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="text-blue-600 text-sm mb-4 inline-block">¬ Volver al dashboard</Link>
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Grupo {match.group}</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">{match.teamAName} vs {match.teamBName}</h1>
          <p className="text-gray-500 text-sm mt-1">{match.venueName}</p>
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            <p>Hora sede: {match.date} · {match.timeLocal}</p>
            <p>Hora Guatemala (UTC-6): {gtmTime}</p>
          </div>
        </div>

        <div className="mb-6">
          {/* WeatherPanel espera que Persona A lo implemente */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <CountryCard iso3={match.teamA} />
          <CountryCard iso3={match.teamB} />
        </div>

        <CountryCompare isoA={match.teamA} isoB={match.teamB} />
      </div>
    </div>
  );
}
