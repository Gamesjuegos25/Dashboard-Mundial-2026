import { useEffect, useState } from "react";
import matches from "../data/matches.json";
import fetchRestCountry from "../services/country.service";

type Match = {
  matchId: number;
  phase: string;
  group: string;
  date: string;
  timeLocal: string;
  timezone: string;
  venueName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  teamA: string;
  teamB: string;
};

function MatchesDashboard() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const enriched = await Promise.all(
        (matches as Match[]).map(async (match) => {
          const home = await fetchRestCountry(match.teamA);
          const away = await fetchRestCountry(match.teamB);
          return { ...match, home, away };
        })
      );
      setData(enriched);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Encuentros del Mundial 2026</h2>
      <ul>
        {data.map((m) => (
          <li key={m.matchId}>
            <img src={m.home?.flag} alt={m.home?.name} width="30" /> {m.home?.name}
            vs
            <img src={m.away?.flag} alt={m.away?.name} width="30" /> {m.away?.name}
            <br />
            Ciudad: {m.city}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MatchesDashboard;
