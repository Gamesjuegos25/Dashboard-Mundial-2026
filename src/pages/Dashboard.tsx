import { useState, useMemo, useEffect } from "react";
import matches from "../data/matches.json";
import { squads, getFlagUrl, hostCountryName } from "../data/squads";
import { useCountry } from "../hooks/useCountry";

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

function getMatchStatus(date: string, timeLocal: string): string {
  const now = new Date();
  const matchDate = new Date(`${date}T${timeLocal}:00`);
  const diffMin = (now.getTime() - matchDate.getTime()) / 60000;
  if (diffMin < 0) return "Próximo";
  if (diffMin <= 105) return "En curso";
  return "Finalizado";
}

function getCountryName(code: string): string {
  const map: Record<string, string> = { US: "Estados Unidos", MX: "México", CA: "Canadá" };
  return map[code] ?? code;
}

function buildJornadaMap(allMatches: Match[]): Record<number, number> {
  const byGroup: Record<string, Match[]> = {};
  for (const m of allMatches) {
    (byGroup[m.group] ??= []).push(m);
  }
  const map: Record<number, number> = {};
  for (const group of Object.values(byGroup)) {
    const sorted = [...group].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.timeLocal < b.timeLocal ? -1 : a.timeLocal > b.timeLocal ? 1 : 0;
    });
    sorted.forEach((m, i) => {
      map[m.matchId] = Math.min(Math.floor(i / 2) + 1, 3);
    });
  }
  return map;
}

const VENUE_IMAGES: Record<string, string> = {
  "Estadio de Ciudad de México": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
  "Estadio Guadalajara": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80",
  "Estadio de Toronto": "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=800&q=80",
  "Estadio de Los Ángeles": "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&q=80",
  "Estadio de Boston": "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80",
  "BC Place Vancouver": "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800&q=80",
  "Estadio de Nueva York Nueva Jersey": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
  "Estadio de Dallas": "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
  "Estadio del Área de la Bahía de San Francisco": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
  "Estadio de Kansas City": "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&q=80",
  "Estadio de Houston": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80",
  "Estadio de Filadelfia": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
  "Estadio de Miami": "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=800&q=80",
  "Estadio de Atlanta": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80",
  "Estadio de Monterrey": "https://images.unsplash.com/photo-1551958219-acbc595b5b22?w=800&q=80",
  "Camping World Stadium": "https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=800&q=80",
};
const DEFAULT_STADIUM = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80";


// Paleta FIFA 2026
const C = {
  bg: "#050d1a",
  card: "#0a1628",
  surface: "#0f1f35",
  surfaceAlt: "#152843",
  border: "#1a3050",
  borderHover: "#e63946",
  red: "#e63946",
  redBright: "#ff4d5a",
  redGlow: "rgba(230,57,70,0.3)",
  blue: "#1d3557",
  blueBright: "#457b9d",
  green: "#2d6a4f",
  greenBright: "#52b788",
  white: "#f1faee",
  gray: "#7a8fa6",
  grayLight: "#a8b8c8",
  grayDark: "#2d4060",
};

const POS_LABEL: Record<string, string> = {
  POR: "Portero", DEF: "Defensa", MED: "Mediocampista", DEL: "Delantero",
};
const POS_COLOR: Record<string, string> = {
  POR: "#b45309", DEF: "#1d4ed8", MED: "#2d6a4f", DEL: "#e63946",
};

function getPlayerPhoto(name: string): string {
  const encoded = encodeURIComponent(name.replace(/ /g, "_"));
  return `https://en.wikipedia.org/wiki/Special:Redirect/file/${encoded}.jpg`;
}

function AnimCounter({ target, label, icon }: { target: number; label: string; icon: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <div style={{ textAlign: "center", padding: "14px 20px", background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, minWidth: 100 }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ color: C.redBright, fontWeight: 900, fontSize: 26, lineHeight: 1.1 }}>{count}</div>
      <div style={{ color: C.gray, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function useWiki(title: string) {
  const [data, setData] = useState<{ extract: string; thumbnail?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!title) return;
    setLoading(true); setData(null);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`)
      .then(r => r.json())
      .then(d => { setData({ extract: d.extract ?? "Sin información.", thumbnail: d.thumbnail?.source }); setLoading(false); })
      .catch(() => { setData({ extract: "No se encontró información." }); setLoading(false); });
  }, [title]);
  return { data, loading };
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[100, 85, 92, 70, 88].map((w, i) => (
        <div key={i} style={{ height: 10, background: C.surface, borderRadius: 5, width: `${w}%`, opacity: 0.5 }} />
      ))}
      <p style={{ color: C.grayDark, fontSize: 11, margin: "6px 0 0" }}>Cargando desde Wikipedia...</p>
    </div>
  );
}

// ── CLIMA TAB ─────────────────────────────────────────────────────
function WeatherTab({ match }: { match: Match }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`)
      .then(r => r.json())
      .then(d => { setWeather(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [match.latitude, match.longitude]);

  function weatherIcon(code: number): string {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";
    return "⛈️";
  }

  function weatherDesc(code: number): string {
    if (code === 0) return "Despejado";
    if (code <= 3) return "Parcialmente nublado";
    if (code <= 48) return "Niebla";
    if (code <= 67) return "Lluvia";
    if (code <= 77) return "Nieve";
    if (code <= 82) return "Chubascos";
    return "Tormenta";
  }

  const days = ["Hoy", "Mañana", "Pasado"];

  return (
    <div style={{ padding: "20px 20px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, background: C.blueBright, borderRadius: 2 }} />
        <span style={{ color: C.white, fontWeight: 800, fontSize: 15 }}>Clima en {match.city}</span>
      </div>

      {loading ? <Skeleton /> : !weather ? (
        <p style={{ color: C.gray, textAlign: "center", padding: "24px 0" }}>No se pudo cargar el clima.</p>
      ) : (
        <>
          {/* CLIMA ACTUAL */}
          <div style={{ background: `linear-gradient(135deg, ${C.blue}, #1a4a7a)`, borderRadius: 16, padding: "24px", marginBottom: 16, border: `1px solid ${C.blueBright}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.15 }}>
              {weatherIcon(weather.current.weather_code)}
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 56, lineHeight: 1 }}>{weatherIcon(weather.current.weather_code)}</div>
                <p style={{ color: C.grayLight, fontSize: 13, margin: "8px 0 4px" }}>{weatherDesc(weather.current.weather_code)}</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: 0 }}>📍 {match.city}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: C.white, fontWeight: 900, fontSize: 52, lineHeight: 1 }}>{Math.round(weather.current.temperature_2m)}°</div>
                <p style={{ color: C.grayLight, fontSize: 12, margin: "4px 0 0" }}>Sensación {Math.round(weather.current.apparent_temperature)}°C</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ color: C.grayLight, fontSize: 12 }}>💧 {weather.current.relative_humidity_2m}% humedad</span>
              <span style={{ color: C.grayLight, fontSize: 12 }}>💨 {Math.round(weather.current.wind_speed_10m)} km/h viento</span>
            </div>
          </div>

          {/* PRONÓSTICO 3 DÍAS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {weather.daily.temperature_2m_max.slice(0, 3).map((_: number, i: number) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "14px 12px", textAlign: "center", border: `1px solid ${C.border}` }}>
                <p style={{ color: C.gray, fontSize: 11, margin: "0 0 6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{days[i]}</p>
                <div style={{ fontSize: 28, margin: "4px 0" }}>{weatherIcon(weather.daily?.weathercode?.[i] ?? 0)}</div>
                <p style={{ color: C.white, fontWeight: 800, fontSize: 14, margin: "4px 0 2px" }}>{Math.round(weather.daily.temperature_2m_max[i])}°</p>
                <p style={{ color: C.gray, fontSize: 11, margin: "0 0 6px" }}>{Math.round(weather.daily.temperature_2m_min[i])}° mín</p>
                <div style={{ background: `rgba(69,123,157,0.3)`, borderRadius: 6, padding: "2px 6px", display: "inline-block" }}>
                  <span style={{ color: C.blueBright, fontSize: 10, fontWeight: 700 }}>🌧 {weather.daily.precipitation_probability_max[i]}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── TAB SELECCIONES ───────────────────────────────────────────────
function TeamsTab({ match }: { match: Match }) {
  const [teamTab, setTeamTab] = useState<"A" | "B">("A");
  const teamCode = teamTab === "A" ? match.teamA : match.teamB;
  const teamName = teamTab === "A" ? match.teamAName : match.teamBName;

  const TEAM_WIKI: Record<string, string> = {
    MEX: "Mexico_national_football_team", USA: "United_States_men%27s_national_soccer_team",
    CAN: "Canada_men%27s_national_soccer_team", ARG: "Argentina_national_football_team",
    BRA: "Brazil_national_football_team", FRA: "France_national_football_team",
    ESP: "Spain_national_football_team", GER: "Germany_national_football_team",
    ENG: "England_national_football_team", POR: "Portugal_national_football_team",
    ITA: "Italy_national_football_team", NED: "Netherlands_national_football_team",
    BEL: "Belgium_national_football_team", JPN: "Japan_national_football_team",
    MAR: "Morocco_national_football_team", SEN: "Senegal_national_football_team",
    URU: "Uruguay_national_football_team", COL: "Colombia_national_football_team",
    ECU: "Ecuador_national_football_team", PAR: "Paraguay_national_football_team",
    KOR: "South_Korea_national_football_team", CRO: "Croatia_national_football_team",
    SRB: "Serbia_national_football_team", TUR: "Turkey_national_football_team",
    IRN: "Iran_national_football_team", KSA: "Saudi_Arabia_national_football_team",
    AUS: "Australia_national_soccer_team", NZL: "New_Zealand_national_football_team",
    CMR: "Cameroon_national_football_team", NGA: "Nigeria_national_football_team",
    COD: "DR_Congo_national_football_team", RSA: "South_Africa_national_football_team",
    ALB: "Albania_national_football_team", CZE: "Czech_Republic_national_football_team",
    SCO: "Scotland_national_football_team", BIH: "Bosnia_and_Herzegovina_national_football_team",
    HAI: "Haiti_national_football_team",
  };

  const { data, loading } = useWiki(TEAM_WIKI[teamCode] ?? teamName);

  return (
    <div style={{ padding: "16px 20px 28px" }}>
      {/* SUB TABS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["A", "B"] as const).map((side) => {
          const code = side === "A" ? match.teamA : match.teamB;
          const name = side === "A" ? match.teamAName : match.teamBName;
          const active = teamTab === side;
          return (
            <button key={side} onClick={() => setTeamTab(side)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 13, background: active ? C.red : C.surface, color: active ? C.white : C.gray, border: active ? `1px solid ${C.red}` : `1px solid ${C.border}`, boxShadow: active ? `0 0 20px ${C.redGlow}` : "none", transition: "all 0.2s" }}>
              <img src={getFlagUrl(code)} alt={code} style={{ width: 22, height: 15, objectFit: "cover", borderRadius: 3 }} />
              {name}
            </button>
          );
        })}
      </div>

      {/* INFO SELECCIÓN */}
      {data?.thumbnail && (
        <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16, height: 150, position: "relative" }}>
          <img src={data.thumbnail} alt={teamName} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,0.9), transparent)" }} />
          <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <img src={getFlagUrl(teamCode)} alt={teamCode} style={{ width: 40, height: 27, objectFit: "cover", borderRadius: 4, border: `2px solid ${C.white}` }} />
            <h3 style={{ color: C.white, fontWeight: 900, fontSize: 18, margin: 0 }}>{teamName}</h3>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 12px", color: C.grayLight, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <img src={getFlagUrl(teamCode)} alt={teamCode} style={{ width: 18, height: 12, objectFit: "cover", borderRadius: 2 }} />
          {teamName}
        </span>
        <span style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 12px", color: C.grayLight, fontSize: 12 }}>
          👥 {(squads[teamCode] ?? []).length} convocados
        </span>
      </div>

      <p style={{ color: C.green, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 16, height: 2, background: C.greenBright }} /> Historia de la selección
      </p>
      {loading ? <Skeleton /> : <p style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{data?.extract?.slice(0, 600)}{(data?.extract?.length ?? 0) > 600 ? "..." : ""}</p>}
    </div>
  );
}

// ── TAB ESTADIO ───────────────────────────────────────────────────
function StadiumTab({ match }: { match: Match }) {
  const { data, loading } = useWiki(match.venueName);
  const venueImg = VENUE_IMAGES[match.venueName] ?? DEFAULT_STADIUM;
  return (
    <div style={{ padding: "20px 20px 28px" }}>
      <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 18, height: 180, position: "relative" }}>
        <img src={data?.thumbnail ?? venueImg} alt={match.venueName}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }}
          onError={e => { (e.target as HTMLImageElement).src = venueImg; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,0.9), transparent)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 14 }}>
          <h3 style={{ color: C.white, fontWeight: 900, fontSize: 18, margin: 0 }}>{match.venueName}</h3>
          <p style={{ color: C.gray, fontSize: 12, margin: "3px 0 0" }}>📍 {match.city}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ icon: "📍", text: match.city }, { icon: "🌎", text: hostCountryName[match.country] ?? getCountryName(match.country) }, { icon: "📅", text: `${match.date} · ${match.timeLocal}` }]
          .map((item, i) => <span key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 12px", color: C.grayLight, fontSize: 12 }}>{item.icon} {item.text}</span>)}
      </div>
      <p style={{ color: C.blueBright, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 16, height: 2, background: C.blueBright }} /> Sobre el estadio
      </p>
      {loading ? <Skeleton /> : <p style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{data?.extract?.slice(0, 600)}{(data?.extract?.length ?? 0) > 600 ? "..." : ""}</p>}
    </div>
  );
}

// ── TAB PAÍS (REST Countries) ────────────────────────────────────
function CountrySkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[100, 85, 92, 70, 88, 60].map((w, i) => (
        <div key={i} style={{ height: 12, background: C.surface, borderRadius: 5, width: `${w}%`, opacity: 0.5 }} />
      ))}
      <p style={{ color: C.grayDark, fontSize: 11, margin: "6px 0 0" }}>Cargando desde REST Countries...</p>
    </div>
  );
}

function CountryInfoBlock({ code, name }: { code: string; name: string }) {
  const { data, isLoading, isError } = useCountry(code);

  if (isLoading) return <CountrySkeleton />;

  if (isError || !data) {
    return (
      <p style={{ color: C.gray, fontSize: 12, textAlign: "center", padding: "12px 0" }}>
        No se pudo cargar la información de {name}.
      </p>
    );
  }

  const rows: Array<[string, string]> = [
    ["Capital", data.capital],
    ["Región", data.region],
    ["Idiomas", data.languages.join(", ") || "N/A"],
    ["Moneda", data.currencies[0] ?? "N/A"],
    ["Población", data.population.toLocaleString()],
    ["Zona horaria", data.timezones[0] ?? "N/A"],
  ];

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {data.flag && (
          <img src={data.flag} alt={data.name} style={{ width: 36, height: 24, objectFit: "cover", borderRadius: 4, border: `1px solid ${C.border}` }} />
        )}
        <div>
          <p style={{ color: C.white, fontWeight: 800, fontSize: 14, margin: 0 }}>{data.name}</p>
          <p style={{ color: C.gray, fontSize: 11, margin: 0 }}>{data.officialName}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: C.gray }}>{label}</span>
            <span style={{ color: C.grayLight, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountryCompareBlock({ codeA, nameA, codeB, nameB }: { codeA: string; nameA: string; codeB: string; nameB: string }) {
  const a = useCountry(codeA);
  const b = useCountry(codeB);

  if (a.isLoading || b.isLoading) return <CountrySkeleton />;
  if (!a.data || !b.data) return null;

  const popA = a.data.population;
  const popB = b.data.population;
  const popDiff = Math.abs(popA - popB);
  const base = Math.max(popA, popB) || 1;
  const popPct = ((popDiff / base) * 100).toFixed(1);

  const rows: Array<[string, string, string]> = [
    ["Población", popA.toLocaleString(), popB.toLocaleString()],
    ["Región", a.data.region, b.data.region],
    ["Idiomas", a.data.languages.slice(0, 2).join(", ") || "N/A", b.data.languages.slice(0, 2).join(", ") || "N/A"],
    ["Moneda", a.data.currencies[0] ?? "N/A", b.data.currencies[0] ?? "N/A"],
    ["Zona horaria", a.data.timezones[0] ?? "N/A", b.data.timezones[0] ?? "N/A"],
  ];

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: C.gray, borderBottom: `1px solid ${C.border}` }}>
            <th style={{ textAlign: "left", padding: "4px 0", fontWeight: 800 }}>{nameA}</th>
            <th style={{ textAlign: "center", padding: "4px 0", fontWeight: 700, color: C.grayDark }}>Indicador</th>
            <th style={{ textAlign: "right", padding: "4px 0", fontWeight: 800 }}>{nameB}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, valA, valB]) => (
            <tr key={label} style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: "6px 0", color: C.grayLight, textAlign: "left" }}>{valA}</td>
              <td style={{ padding: "6px 0", color: C.gray, textAlign: "center", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{label}</td>
              <td style={{ padding: "6px 0", color: C.grayLight, textAlign: "right" }}>{valB}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: C.gray, fontSize: 11, marginTop: 10, marginBottom: 0 }}>
        Diferencia de población: <span style={{ color: C.grayLight, fontWeight: 700 }}>{popDiff.toLocaleString()}</span> ({popPct}%)
      </p>
    </div>
  );
}

function CountryTab({ match }: { match: Match }) {
  return (
    <div style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ color: C.greenBright, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 16, height: 2, background: C.greenBright }} /> Fichas de país (REST Countries)
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CountryInfoBlock code={match.teamA} name={match.teamAName} />
        <CountryInfoBlock code={match.teamB} name={match.teamBName} />
      </div>

      <p style={{ color: C.blueBright, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 16, height: 2, background: C.blueBright }} /> Comparación de selecciones
      </p>

      <CountryCompareBlock codeA={match.teamA} nameA={match.teamAName} codeB={match.teamB} nameB={match.teamBName} />
    </div>
  );
}

  // ── TAB RESUMEN (Clima + Países + Comparador, todo junto) ─────────
  function SummaryTab({ match }: { match: Match }) {
    return (
      <div>
        <WeatherTab match={match} />
        <div style={{ height: 1, background: C.border, margin: "0 20px" }} />
        <CountryTab match={match} />
      </div>
    );
  }


// ── TAB CONVOCADOS ────────────────────────────────────────────────
function SquadTab({ match }: { match: Match }) {
  const [teamTab, setTeamTab] = useState<"A" | "B">("A");
  const teamCode = teamTab === "A" ? match.teamA : match.teamB;
  const teamName = teamTab === "A" ? match.teamAName : match.teamBName;
  const players = squads[teamCode] ?? [];
  const byPos: Record<string, typeof players> = { POR: [], DEF: [], MED: [], DEL: [] };
  players.forEach(p => { (byPos[p.pos] ?? byPos["DEL"]).push(p); });

  return (
    <div style={{ padding: "16px 20px 28px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["A", "B"] as const).map(side => {
          const code = side === "A" ? match.teamA : match.teamB;
          const name = side === "A" ? match.teamAName : match.teamBName;
          const active = teamTab === side;
          return (
            <button key={side} onClick={() => setTeamTab(side)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 13, background: active ? C.red : C.surface, color: active ? C.white : C.gray, border: active ? `1px solid ${C.red}` : `1px solid ${C.border}`, boxShadow: active ? `0 0 20px ${C.redGlow}` : "none", transition: "all 0.2s" }}>
              <img src={getFlagUrl(code)} alt={code} style={{ width: 22, height: 15, objectFit: "cover", borderRadius: 3 }} />
              {name}
              <span style={{ background: active ? "rgba(255,255,255,0.2)" : C.grayDark, borderRadius: 6, padding: "1px 7px", fontSize: 11 }}>{(squads[code] ?? []).length}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
        <img src={getFlagUrl(teamCode)} alt={teamCode} style={{ width: 32, height: 21, objectFit: "cover", borderRadius: 4 }} />
        <span style={{ color: C.white, fontWeight: 800, fontSize: 15 }}>Convocados — {teamName}</span>
        <span style={{ marginLeft: "auto", color: C.gray, fontSize: 12, background: C.surface, padding: "2px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>{players.length} jugadores</span>
      </div>
      <p style={{ color: C.grayDark, fontSize: 11, margin: "0 0 16px", fontStyle: "italic" }}>Haz clic en un jugador para ver su perfil</p>

      {players.length === 0 ? <p style={{ color: C.gray, textAlign: "center", padding: "32px 0" }}>Sin datos.</p>
        : Object.entries(byPos).map(([pos, list]) =>
          list.length === 0 ? null : (
            <div key={pos} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 3, height: 16, background: POS_COLOR[pos] ?? C.red, borderRadius: 2 }} />
                <span style={{ color: C.white, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{POS_LABEL[pos] ?? pos}s</span>
                <span style={{ color: C.grayDark, fontSize: 12 }}>· {list.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {list.map(p => <PlayerCard key={p.name} p={p} />)}
              </div>
            </div>
          )
        )}
    </div>
  );
}

// ── MODAL JUGADOR ─────────────────────────────────────────────────
function PlayerModal({ p, onClose }: { p: { name: string; club: string; age: number; pos: string }; onClose: () => void }) {
  const { data, loading } = useWiki(p.name);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 460, background: C.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: `0 0 60px ${C.redGlow}` }}
        onClick={e => e.stopPropagation()}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.red}, ${C.blueBright}, ${C.greenBright})` }} />
        <div style={{ background: `linear-gradient(135deg, ${C.blue}, #0a1f3a)`, borderBottom: `1px solid ${C.border}`, padding: "22px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, color: C.white, borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: `3px solid ${C.red}`, flexShrink: 0, background: C.surface, boxShadow: `0 0 20px ${C.redGlow}` }}>
              {data?.thumbnail
                ? <img src={data.thumbnail} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: C.red }}>{p.name.charAt(0)}</div>}
            </div>
            <div>
              <h3 style={{ color: C.white, fontWeight: 900, fontSize: 20, margin: 0 }}>{p.name}</h3>
              <p style={{ color: C.gray, fontSize: 13, margin: "6px 0 0" }}>⚽ {p.club}</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "14px 22px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <span style={{ background: POS_COLOR[p.pos] ?? C.red, color: "white", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 6, textTransform: "uppercase" }}>{POS_LABEL[p.pos] ?? p.pos}</span>
          <span style={{ background: C.surface, color: C.grayLight, fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 6, border: `1px solid ${C.border}` }}>🎂 {p.age} años</span>
          <span style={{ background: C.surface, color: C.grayLight, fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 6, border: `1px solid ${C.border}` }}>🏟️ {p.club}</span>
        </div>
        <div style={{ padding: "18px 22px 24px" }}>
          <p style={{ color: C.red, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 12px" }}>── Biografía</p>
          {loading ? <Skeleton /> : <p style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{data?.extract?.slice(0, 520)}{(data?.extract?.length ?? 0) > 520 ? "..." : ""}</p>}
        </div>
      </div>
    </div>
  );
}

// ── TARJETA JUGADOR ───────────────────────────────────────────────
function PlayerCard({ p }: { p: { name: string; club: string; age: number; pos: string } }) {
  const [imgOk, setImgOk] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <>
      {showModal && <PlayerModal p={p} onClose={() => setShowModal(false)} />}
      <div onClick={() => setShowModal(true)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ background: hovered ? C.surfaceAlt : C.surface, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, border: `1px solid ${hovered ? C.red : C.border}`, transition: "all 0.2s", cursor: "pointer", boxShadow: hovered ? `0 0 12px ${C.redGlow}` : "none", transform: hovered ? "translateY(-1px)" : "none" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: C.card, border: `2px solid ${hovered ? C.red : C.border}` }}>
          {imgOk
            ? <img src={getPlayerPhoto(p.name)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgOk(false)} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: C.white, background: POS_COLOR[p.pos] ?? C.red }}>{p.name.charAt(0)}</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: C.white, fontWeight: 700, fontSize: 12, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
          <p style={{ color: C.gray, fontSize: 11, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.club}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
          <span style={{ background: C.card, color: C.gray, fontSize: 10, borderRadius: 5, padding: "2px 6px", fontWeight: 700, border: `1px solid ${C.border}` }}>{p.age}a</span>
          {hovered && <span style={{ color: C.red, fontSize: 9, fontWeight: 700 }}>VER →</span>}
        </div>
      </div>
    </>
  );
}

// ── MODAL PARTIDO ─────────────────────────────────────────────────
function MatchInfoModal({ match, onClose }: { match: Match; onClose: () => void }) {
  const [tab, setTab] = useState<"summary" | "squad" | "teams" | "stadium" | "country" | "weather">("summary");
  const venueImg = VENUE_IMAGES[match.venueName] ?? DEFAULT_STADIUM;
  const status = getMatchStatus(match.date, match.timeLocal);

  const TABS = [
    { key: "summary", label: "📊", title: "Resumen" },
    { key: "squad", label: "👥", title: "Convocados" },
    { key: "teams", label: "🏴", title: "Selecciones" },
    { key: "stadium", label: "🏟️", title: "Estadio" },
  ] as const;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,5,0.94)", backdropFilter: "blur(10px)" }}
      onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 720, borderRadius: 22, overflow: "hidden", boxShadow: `0 0 100px rgba(230,57,70,0.2), 0 0 60px rgba(29,53,87,0.4), 0 30px 80px rgba(0,0,0,0.9)`, maxHeight: "92vh", overflowY: "auto", background: C.card, border: `1px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}>

        {/* TOP LINE */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.red} 0%, ${C.blueBright} 50%, ${C.greenBright} 100%)` }} />

        {/* HERO */}
        <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
          <img src={venueImg} alt={match.venueName} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35) saturate(0.6)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(5,13,26,0.1), rgba(5,13,26,0.98))` }} />
          <div style={{ position: "absolute", top: 14, left: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 14px", borderRadius: 6, color: "white", letterSpacing: 2, textTransform: "uppercase", background: status === "Próximo" ? C.blue : status === "En curso" ? C.green : C.red }}>{status}</span>
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "rgba(0,0,0,0.6)", border: `1px solid ${C.border}`, color: C.white, borderRadius: 8, width: 34, height: 34, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 32 }}>
            <div style={{ textAlign: "center" }}>
              <img src={getFlagUrl(match.teamA)} alt={match.teamA} style={{ width: 58, height: 39, objectFit: "cover", borderRadius: 6, boxShadow: `0 4px 20px rgba(0,0,0,0.8)`, border: `2px solid ${C.red}` }} />
              <p style={{ color: C.white, fontWeight: 800, fontSize: 13, margin: "7px 0 0" }}>{match.teamAName}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: C.redBright, fontWeight: 900, fontSize: 28, letterSpacing: 3, textShadow: `0 0 30px ${C.red}` }}>VS</div>
              <p style={{ color: C.gray, fontSize: 10, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: 2 }}>Grupo {match.group}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <img src={getFlagUrl(match.teamB)} alt={match.teamB} style={{ width: 58, height: 39, objectFit: "cover", borderRadius: 6, boxShadow: `0 4px 20px rgba(0,0,0,0.8)`, border: `2px solid ${C.red}` }} />
              <p style={{ color: C.white, fontWeight: 800, fontSize: 13, margin: "7px 0 0" }}>{match.teamBName}</p>
            </div>
          </div>
        </div>

        {/* TABS NAV */}
        <div style={{ display: "flex", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "12px 6px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: tab === t.key ? C.card : "transparent", color: tab === t.key ? C.white : C.gray, borderBottom: tab === t.key ? `3px solid ${C.red}` : "3px solid transparent", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 16 }}>{t.label}</span>
              <span style={{ fontSize: 10, letterSpacing: 0.5 }}>{t.title}</span>
            </button>
          ))}
        </div>

        {tab === "summary" && <SummaryTab match={match} />}
        {tab === "squad" && <SquadTab match={match} />}
        {tab === "teams" && <TeamsTab match={match} />}
        {tab === "stadium" && <StadiumTab match={match} />}
      </div>
    </div>
  );
}

const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const ALL_COUNTRIES = ["US","MX","CA"];

export default function Dashboard() {
const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterCountry, setFilterCountry] = useState("Todos");
  const [filterDate, setFilterDate] = useState("");
  const [filterVenue, setFilterVenue] = useState("Todas");
  const [filterTeam, setFilterTeam] = useState("Todas");
  const [filterJornada, setFilterJornada] = useState("Todas");

  const jornadaMap = useMemo(() => buildJornadaMap(matches as Match[]), []);
  const venues = useMemo(() => {
    const v = (matches as Match[]).map(m => m.venueName);
    return ["Todas", ...Array.from(new Set(v))];
  }, []);

  const teams = useMemo(() => {
    const t = (matches as Match[]).flatMap(m => [{ code: m.teamA, name: m.teamAName }, { code: m.teamB, name: m.teamBName }]);
    const unique = new Map(t.map(x => [x.code, x.name]));
    return [{ code: "Todas", name: "Todas las selecciones" }, ...Array.from(unique.entries()).map(([code, name]) => ({ code, name }))];
  }, []);

  const filtered = useMemo(() => {
    return (matches as Match[]).filter(m => {
      const status = getMatchStatus(m.date, m.timeLocal);
      const jornada = jornadaMap[m.matchId];
      return (
        (search === "" || m.teamAName.toLowerCase().includes(search.toLowerCase()) || m.teamBName.toLowerCase().includes(search.toLowerCase()) || m.venueName.toLowerCase().includes(search.toLowerCase())) &&
        (filterGroup === "Todos" || m.group === filterGroup) &&
        (filterStatus === "Todos" || status === filterStatus) &&
        (filterCountry === "Todos" || m.country === filterCountry) &&
        (filterDate === "" || m.date === filterDate) &&
        (filterVenue === "Todas" || m.venueName === filterVenue) &&
        (filterTeam === "Todas" || m.teamA === filterTeam || m.teamB === filterTeam) &&
        (filterJornada === "Todas" || String(jornada) === filterJornada)
      );
    });
  }, [search, filterGroup, filterStatus, filterCountry, filterDate, filterVenue, filterTeam, filterJornada, jornadaMap]);
 
  const totalMatches = (matches as Match[]).length;
  const finalizados = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "Finalizado").length;
  const proximos = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "Próximo").length;
  const enCurso = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "En curso").length;

  const sel: React.CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`, color: C.grayLight,
    borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {selectedMatch && <MatchInfoModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 15% 50%, rgba(230,57,70,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 50%, rgba(29,53,87,0.25) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(45,106,79,0.1) 0%, transparent 50%)` }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 36px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 36, background: `linear-gradient(to bottom, ${C.red}, ${C.blueBright})`, borderRadius: 2 }} />
                <div>
                  <p style={{ color: C.red, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 4, margin: 0 }}>FIFA World Cup</p>
                  <h1 style={{ fontSize: "clamp(28px,4vw,54px)", fontWeight: 900, margin: "2px 0 0", lineHeight: 1, color: C.white, letterSpacing: -1 }}>
                    2026 <span style={{ color: C.blueBright }}>Fase de</span> <span style={{ color: C.greenBright }}>Grupos</span>
                  </h1>
                </div>
              </div>
              <p style={{ color: C.gray, fontSize: 14, margin: "0 0 0 12px" }}>USA 🇺🇸 · México 🇲🇽 · Canadá 🇨🇦 · 16 sedes · 48 selecciones</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <AnimCounter target={totalMatches} label="Partidos" icon="⚽" />
              <AnimCounter target={finalizados} label="Finalizados" icon="✅" />
              <AnimCounter target={proximos} label="Próximos" icon="🔜" />
              <AnimCounter target={enCurso} label="En curso" icon="🔴" />
            </div>
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.red}, ${C.blueBright}, ${C.greenBright})` }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px" }}>
        {/* FILTROS */}
        <div style={{ background: C.card, borderRadius: 14, padding: "20px 22px", marginBottom: 28, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 800, color: C.white, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.blueBright }}>▍</span> Filtrar partidos
            </span>
            <button onClick={() => { setSearch(""); setFilterGroup("Todos"); setFilterStatus("Todos"); setFilterCountry("Todos"); setFilterDate(""); setFilterVenue("Todas"); setFilterTeam("Todas"); setFilterJornada("Todas"); }}
              style={{ background: "none", border: `1px solid ${C.border}`, color: C.gray, cursor: "pointer", fontSize: 12, padding: "4px 12px", borderRadius: 6, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.white; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.gray; }}>
              Limpiar ✕
            </button>
          </div>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.gray }}>🔍</span>
            <input type="text" placeholder="Buscar equipo o sede..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...sel, width: "100%", boxSizing: "border-box", paddingLeft: 38, paddingTop: 11, paddingBottom: 11 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 8 }}>
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} style={sel}>
              <option value="Todos">Grupo: Todos</option>
              {ALL_GROUPS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={sel}>
              <option value="Todos">Estado: Todos</option>
              <option value="Próximo">Próximo</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} style={sel}>
              {teams.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={sel} />
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={sel}>
              <option value="Todos">País: Todos</option>
              {ALL_COUNTRIES.map(c => <option key={c} value={c}>{getCountryName(c)}</option>)}
            </select>
            <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)} style={sel}>
              {venues.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filterJornada} onChange={e => setFilterJornada(e.target.value)} style={sel}>
              <option value="Todas">Jornada: Todas</option>
              <option value="1">Jornada 1</option>
              <option value="2">Jornada 2</option>
              <option value="3">Jornada 3</option>
            </select>
          </div>
        </div>

        {/* CONTADOR */}
        <div style={{ color: C.gray, fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: C.red, borderRadius: 6, padding: "2px 10px", color: C.white, fontWeight: 900 }}>{filtered.length}</span>
          <span>partidos encontrados</span>
          {filtered.length !== totalMatches && <span style={{ color: C.grayDark, fontSize: 12 }}>· de {totalMatches} totales</span>}
        </div>

        {/* GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {filtered.map(m => {
            const status = getMatchStatus(m.date, m.timeLocal);
            const venueImg = VENUE_IMAGES[m.venueName] ?? DEFAULT_STADIUM;
            return (
              <div key={m.matchId}
                style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 48px ${C.redGlow}, 0 0 0 1px ${C.red}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* IMAGEN */}
                <div style={{ position: "relative", height: 115, overflow: "hidden" }}>
                  <img src={venueImg} alt={m.venueName} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.7)" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.style.background = C.blue; }} />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(5,13,26,0.1), rgba(5,13,26,0.92))` }} />
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: status === "En curso" ? C.greenBright : status === "Próximo" ? C.blueBright : C.red }} />
                  <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: C.white, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>Grupo {m.group} · J{jornadaMap[m.matchId]}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, padding: "3px 9px", borderRadius: 5, color: "white", textTransform: "uppercase", background: status === "Próximo" ? C.blue : status === "En curso" ? C.green : C.red }}>{status}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 7, left: 10 }}>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, margin: 0 }}>🏟️ {m.venueName}</p>
                  </div>
                </div>

                {/* CUERPO */}
                <div style={{ padding: "16px 14px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <img src={getFlagUrl(m.teamA)} alt={m.teamA} style={{ width: 46, height: 31, objectFit: "cover", borderRadius: 5, boxShadow: "0 2px 10px rgba(0,0,0,0.6)", border: `1px solid ${C.border}` }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span style={{ color: C.white, fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{m.teamAName}</span>
                    </div>
                    <span style={{ color: C.red, fontWeight: 900, fontSize: 15, letterSpacing: 1, padding: "0 8px" }}>VS</span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <img src={getFlagUrl(m.teamB)} alt={m.teamB} style={{ width: 46, height: 31, objectFit: "cover", borderRadius: 5, boxShadow: "0 2px 10px rgba(0,0,0,0.6)", border: `1px solid ${C.border}` }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span style={{ color: C.white, fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{m.teamBName}</span>
                    </div>
                  </div>

                  <div style={{ background: C.bg, borderRadius: 8, padding: "8px 12px", marginBottom: 14, border: `1px solid ${C.border}` }}>
                    <p style={{ color: C.gray, fontSize: 11, margin: "0 0 3px" }}>📅 {m.date} · {m.timeLocal}</p>
                    <p style={{ color: C.gray, fontSize: 11, margin: 0 }}>📍 {m.city}, {getCountryName(m.country)}</p>
                  </div>

                  <button onClick={() => setSelectedMatch(m)} style={{ width: "100%", padding: "10px 0", background: `linear-gradient(135deg, ${C.red}, #a01020)`, border: "none", borderRadius: 10, color: C.white, fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textTransform: "uppercase", letterSpacing: 0.5, boxShadow: `0 4px 20px ${C.redGlow}`, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.redBright}, ${C.red})`; e.currentTarget.style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.red}, #a01020)`; e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    ⚽ Ver info del partido
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: C.grayDark, padding: "80px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 15, margin: 0 }}>No se encontraron partidos.</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, padding: "22px 24px", marginTop: 48, textAlign: "center", color: C.grayDark, fontSize: 12 }}>
        <span style={{ color: C.red, fontWeight: 800 }}>FIFA</span> World Cup 2026 · <span style={{ color: C.blueBright }}>USA</span> 🇺🇸 · <span style={{ color: C.greenBright }}>México</span> 🇲🇽 · <span style={{ color: C.white }}>Canadá</span> 🇨🇦
      </div>
    </div>
  );
}