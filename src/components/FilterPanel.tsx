import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  setSearch: (v: string) => void;
  filterGroup: string;
  setFilterGroup: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterTeam: string;
  setFilterTeam: (v: string) => void;
  filterDate: string;
  setFilterDate: (v: string) => void;
  filterCountry: string;
  setFilterCountry: (v: string) => void;
  filterVenue: string;
  setFilterVenue: (v: string) => void;
  clearFilters: () => void;
  teams: { code: string; name: string }[];
  venues: string[];
  ALL_GROUPS: string[];
  ALL_COUNTRIES: string[];
  getCountryName: (c: string) => string;
}

export default function FilterPanel({
  isOpen,
  onClose,
  search,
  setSearch,
  filterGroup,
  setFilterGroup,
  filterStatus,
  setFilterStatus,
  filterTeam,
  setFilterTeam,
  filterDate,
  setFilterDate,
  filterCountry,
  setFilterCountry,
  filterVenue,
  setFilterVenue,
  clearFilters,
  teams,
  venues,
  ALL_GROUPS,
  ALL_COUNTRIES,
  getCountryName,
}: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <div
        className={`fixed left-1/2 transform -translate-x-1/2 top-6 w-[92%] max-w-7xl bg-white rounded-xl shadow p-6 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800">Filtros avanzados</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar filtros
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar filtros"
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Buscar equipo, sede o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-200"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="Todos">Grupo: Todos</option>
            {ALL_GROUPS.map((g) => (
              <option key={g} value={g}>Grupo {g}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="Todos">Estado: Todos</option>
            <option value="Próximo">Próximo</option>
            <option value="En curso">En curso</option>
            <option value="Finalizado">Finalizado</option>
          </select>

          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            {teams.map((t) => (
              <option key={t.code} value={t.code}>{t.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          />

          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="Todos">País: Todos</option>
            {ALL_COUNTRIES.map((c) => (
              <option key={c} value={c}>{getCountryName(c)}</option>
            ))}
          </select>

          <select
            value={filterVenue}
            onChange={(e) => setFilterVenue(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            {venues.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
