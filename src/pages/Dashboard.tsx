import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import matches from "../data/matches.json";
import { Flag } from "../components/Flag";
import FilterPanel from "../components/FilterPanel";

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
  const [isFilterOpen, setIsFilterOpen] = useState(true);
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
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 relative pt-28">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-green-600 font-semibold text-sm uppercase tracking-widest">
            Fase de Grupos
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-gray-900">
            72 partidos, 16 sedes y el clima en contexto.
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            Consulta horarios locales, condiciones meteorológicas y datos
            comparativos de cada selección.
          </p>
        </div>
      </div>

      {/* FILTROS (overlay) - uso de componente separada con backdrop y animación */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        search={search}
        setSearch={setSearch}
        filterGroup={filterGroup}
        setFilterGroup={setFilterGroup}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterTeam={filterTeam}
        setFilterTeam={setFilterTeam}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        filterCountry={filterCountry}
        setFilterCountry={setFilterCountry}
        filterVenue={filterVenue}
        setFilterVenue={setFilterVenue}
        clearFilters={clearFilters}
        teams={teams}
        venues={venues}
        ALL_GROUPS={ALL_GROUPS}
        ALL_COUNTRIES={ALL_COUNTRIES}
        getCountryName={getCountryName}
      />

      {/* floating open/close button */}
      <div className="fixed right-6 top-6 z-50">
        <button
          onClick={() => setIsFilterOpen((s) => !s)}
          className="bg-white border border-gray-200 rounded-full p-3 shadow hover:shadow-md"
          aria-expanded={isFilterOpen}
        >
          {isFilterOpen ? 'Filtros' : 'Mostrar filtros'}
        </button>
      </div>

      <div className="h-24" />

      {/* CONTADOR */}
      <div className="max-w-7xl mx-auto mb-4 text-gray-600 text-sm">
        <strong className="text-gray-800">{filtered.length}</strong> partidos encontrados
      </div>

      {/* TARJETAS - cuadrícula de 3 columnas con tarjetas uniformes */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map((m) => {
          const status = getMatchStatus(m.date, m.timeLocal, m.timezone);
          return (
            <div
              key={m.matchId}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all h-52 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm text-green-600 font-semibold uppercase">Grupo {m.group}</span>
                <span className={`text-xs text-white px-2 py-0.5 rounded-full ${getStatusColor(status).replace('bg-','bg-')}`}>{status}</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center text-center">
                  {/* @ts-ignore */}
                  <Flag iso3={m.teamA} size={48} />
                  <div className="mt-2 text-sm font-medium text-gray-800">{m.teamAName}</div>
                </div>

                <div className="text-sm text-gray-400">vs</div>

                <div className="flex flex-col items-center text-center">
                  {/* @ts-ignore */}
                  <Flag iso3={m.teamB} size={48} />
                  <div className="mt-2 text-sm font-medium text-gray-800">{m.teamBName}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <div>📅 {m.date} · {m.timeLocal}</div>
                  <div className="truncate">📍 {m.city}, {getCountryName(m.country)}</div>
                </div>
                <button
                  onClick={() => navigate(`/match/${m.matchId}`)}
                  className="ml-4 bg-green-600 text-white text-sm px-3 py-2 rounded-md shadow hover:bg-green-500"
                >
                  Ver
                </button>
              </div>
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

