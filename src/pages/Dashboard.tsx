import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import matches from "../data/matches.json";

interface Match {
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
  teamAName: string;
  teamBName: string;
}

function getMatchStatus(date: string, timeLocal: string, _timezone: string): string {
  const now = new Date();
  const matchDate = new Date(`${date}T${timeLocal}:00`);
  const diffMs = now.getTime() - matchDate.getTime();
  const diffMin = diffMs / 60000;
  if (diffMin < 0) return "Próximo";
  if (diffMin >= 0 && diffMin <= 105) return "En curso";
  return "Finalizado";
}

function getStatusColor(status: string): string {
  if (status === "Próximo") return "bg-blue-500";
  if (status === "En curso") return "bg-green-500 animate-pulse";
  return "bg-gray-500";
}

function getCountryName(code: string): string {
  const map: Record<string, string> = {
    US: "Estados Unidos", MX: "México", CA: "Canadá"
  };
  return map[code] ?? code;
}

const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const ALL_COUNTRIES = ["US","MX","CA"];

export default function Dashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterCountry, setFilterCountry] = useState("Todos");
  const [filterDate, setFilterDate] = useState("");
  const [filterVenue, setFilterVenue] = useState("Todas");

  const venues = useMemo(() => {
    const v = (matches as Match[]).map((m) => m.venueName);
    return ["Todas", ...Array.from(new Set(v))];
  }, []);

  const teams = useMemo(() => {
    const t = (matches as Match[]).flatMap((m) => [
      { code: m.teamA, name: m.teamAName },
      { code: m.teamB, name: m.teamBName },
    ]);
    const unique = new Map(t.map((x) => [x.code, x.name]));
    return [{ code: "Todas", name: "Todas las selecciones" }, ...Array.from(unique.entries()).map(([code, name]) => ({ code, name }))];
  }, []);

  const [filterTeam, setFilterTeam] = useState("Todas");

  const filtered = useMemo(() => {
    return (matches as Match[]).filter((m) => {
      const status = getMatchStatus(m.date, m.timeLocal, m.timezone);
      const matchesSearch =
        search === "" ||
        m.teamAName.toLowerCase().includes(search.toLowerCase()) ||
        m.teamBName.toLowerCase().includes(search.toLowerCase()) ||
        m.venueName.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = filterGroup === "Todos" || m.group === filterGroup;
      const matchesStatus = filterStatus === "Todos" || status === filterStatus;
      const matchesCountry = filterCountry === "Todos" || m.country === filterCountry;
      const matchesDate = filterDate === "" || m.date === filterDate;
      const matchesVenue = filterVenue === "Todas" || m.venueName === filterVenue;
      const matchesTeam =
        filterTeam === "Todas" || m.teamA === filterTeam || m.teamB === filterTeam;
      return (
        matchesSearch &&
        matchesGroup &&
        matchesStatus &&
        matchesCountry &&
        matchesDate &&
        matchesVenue &&
        matchesTeam
      );
    });
  }, [search, filterGroup, filterStatus, filterCountry, filterDate, filterVenue, filterTeam]);

  function clearFilters() {
    setSearch("");
    setFilterGroup("Todos");
    setFilterStatus("Todos");
    setFilterCountry("Todos");
    setFilterDate("");
    setFilterVenue("Todas");
    setFilterTeam("Todas");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <p className="text-green-400 font-semibold text-sm uppercase tracking-widest">
          Fase de Grupos
        </p>
        <h1 className="text-3xl font-bold mt-1">
          72 partidos, 16 sedes y el clima en contexto.
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Consulta horarios locales, condiciones meteorológicas y datos
          comparativos de cada selección.
        </p>
      </div>

      {/* FILTROS */}
      <div className="max-w-7xl mx-auto bg-gray-900 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-300">Filtrar partidos</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-white underline"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Busqueda */}
        <input
          type="text"
          placeholder="Buscar equipo o sede..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:border-green-500"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Grupo */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          >
            <option value="Todos">Grupo: Todos</option>
            {ALL_GROUPS.map((g) => (
              <option key={g} value={g}>Grupo {g}</option>
            ))}
          </select>

          {/* Estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          >
            <option value="Todos">Estado: Todos</option>
            <option value="Próximo">Próximo</option>
            <option value="En curso">En curso</option>
            <option value="Finalizado">Finalizado</option>
          </select>

          {/* Seleccion */}
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          >
            {teams.map((t) => (
              <option key={t.code} value={t.code}>{t.name}</option>
            ))}
          </select>

          {/* Fecha */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          />

          {/* Pais anfitrion */}
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          >
            <option value="Todos">País: Todos</option>
            {ALL_COUNTRIES.map((c) => (
              <option key={c} value={c}>{getCountryName(c)}</option>
            ))}
          </select>

          {/* Sede */}
          <select
            value={filterVenue}
            onChange={(e) => setFilterVenue(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
          >
            {venues.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTADOR */}
      <div className="max-w-7xl mx-auto mb-4 text-gray-400 text-sm">
        {filtered.length} partidos encontrados
      </div>

      {/* TARJETAS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => {
          const status = getMatchStatus(m.date, m.timeLocal, m.timezone);
          return (
            <div
              key={m.matchId}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-500 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-400 text-xs font-semibold uppercase">
                  Grupo {m.group}
                </span>
                <span
                  className={`text-xs text-white px-2 py-0.5 rounded-full ${getStatusColor(status)}`}
                >
                  {status}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-3">
                {m.teamAName} vs {m.teamBName}
              </h3>

              <div className="text-sm text-gray-400 space-y-1 mb-4">
                <p>📅 {m.date} · {m.timeLocal}</p>
                <p>🏟️ {m.venueName}</p>
                <p>📍 {m.city}, {getCountryName(m.country)}</p>
              </div>

              <button
                onClick={() => navigate(`/match/${m.matchId}`)}
                className="text-green-400 text-sm font-semibold hover:text-green-300 transition-colors"
              >
                Ver detalle →
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center text-gray-500 py-16">
            No se encontraron partidos con esos filtros.
          </div>
        )}
      </div>
    </div>
  );
}

