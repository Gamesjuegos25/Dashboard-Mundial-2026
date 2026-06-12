import { useState, useMemo, useEffect } from "react";
import matches from "../data/matches.json";
<<<<<<< Updated upstream
import { Flag } from "../components/Flag";
import FilterPanel from "../components/FilterPanel";
=======
import { squads, getFlagUrl, hostCountryName } from "../data/squads";
>>>>>>> Stashed changes

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

const VENUE_IMAGES: Record<string, string> = {
  "Estadio Azteca": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
  "Estadio Akron": "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80",
  "BMO Field": "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=800&q=80",
  "SoFi Stadium": "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&q=80",
  "Gillette Stadium": "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80",
  "BC Place": "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800&q=80",
  "MetLife Stadium": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
  "AT&T Stadium": "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
  "Levi's Stadium": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
  "Arrowhead Stadium": "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&q=80",
  "NRG Stadium": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80",
  "Lincoln Financial Field": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
  "Hard Rock Stadium": "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=800&q=80",
  "Mercedes-Benz Stadium": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80",
  "Estadio BBVA": "https://images.unsplash.com/photo-1551958219-acbc595b5b22?w=800&q=80",
  "Camping World Stadium": "https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=800&q=80",
};
const DEFAULT_STADIUM = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80";

const C = {
  bg: "#0a0a0a",
  card: "#111111",
  cardHover: "#1a1a1a",
  border: "#222222",
  borderHover: "#cc0000",
  red: "#cc0000",
  redBright: "#ff1a1a",
  redGlow: "rgba(204,0,0,0.3)",
  white: "#ffffff",
  gray: "#888888",
  grayLight: "#bbbbbb",
  grayDark: "#444444",
  surface: "#161616",
  surfaceAlt: "#1c1c1c",
};

const POS_LABEL: Record<string, string> = {
  POR: "Portero", DEF: "Defensa", MED: "Mediocampista", DEL: "Delantero",
};
const POS_COLOR: Record<string, string> = {
  POR: "#b45309", DEF: "#1d4ed8", MED: "#15803d", DEL: "#cc0000",
};

function getPlayerPhoto(name: string): string {
  const encoded = encodeURIComponent(name.replace(/ /g, "_"));
  return `https://en.wikipedia.org/wiki/Special:Redirect/file/${encoded}.jpg`;
}

// ── COUNTER ANIMADO ───────────────────────────────────────────────
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
    <div style={{ textAlign: "center", padding: "16px 24px", background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, minWidth: 110 }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ color: C.redBright, fontWeight: 900, fontSize: 28, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{count}</div>
      <div style={{ color: C.gray, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── MODAL JUGADOR ─────────────────────────────────────────────────
function PlayerModal({ p, onClose }: { p: { name: string; club: string; age: number; pos: string }; onClose: () => void }) {
  const [info, setInfo] = useState<{ extract: string; thumbnail?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.name.replace(/ /g, "_"))}`)
      .then((r) => r.json())
      .then((d) => { setInfo({ extract: d.extract ?? "Sin información disponible.", thumbnail: d.thumbnail?.source }); setLoading(false); })
      .catch(() => { setInfo({ extract: "No se encontró información en Wikipedia." }); setLoading(false); });
  }, [p.name]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 460, background: C.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: `0 0 60px ${C.redGlow}, 0 25px 60px rgba(0,0,0,0.8)` }}
        onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={{ background: `linear-gradient(135deg, #1a0000, #2d0000)`, borderBottom: `2px solid ${C.red}`, padding: "22px 22px 18px", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.red}, ${C.redBright}, ${C.red})` }} />
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, color: C.white, borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: `3px solid ${C.red}`, flexShrink: 0, background: "#1a0000", boxShadow: `0 0 20px ${C.redGlow}` }}>
              {loading ? (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: C.red }}>{p.name.charAt(0)}</div>
              ) : info?.thumbnail ? (
                <img src={info.thumbnail} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: C.red }}>{p.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <h3 style={{ color: C.white, fontWeight: 900, fontSize: 20, margin: 0, lineHeight: 1.1 }}>{p.name}</h3>
              <p style={{ color: C.gray, fontSize: 13, margin: "6px 0 0" }}>⚽ {p.club}</p>
            </div>
          </div>
        </div>

        {/* BADGES */}
        <div style={{ display: "flex", gap: 8, padding: "14px 22px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <span style={{ background: POS_COLOR[p.pos] ?? C.red, color: "white", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            {POS_LABEL[p.pos] ?? p.pos}
          </span>
          <span style={{ background: C.surface, color: C.grayLight, fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 6, border: `1px solid ${C.border}` }}>
            🎂 {p.age} años
          </span>
          <span style={{ background: C.surface, color: C.grayLight, fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 6, border: `1px solid ${C.border}` }}>
            🏟️ {p.club}
          </span>
        </div>

        {/* BIO */}
        <div style={{ padding: "18px 22px 24px" }}>
          <p style={{ color: C.red, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 16, height: 2, background: C.red }} /> Biografía
          </p>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[100, 85, 92, 70, 88].map((w, i) => (
                <div key={i} style={{ height: 10, background: C.surface, borderRadius: 5, width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <p style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.8, margin: 0 }}>
              {info?.extract?.slice(0, 520)}{(info?.extract?.length ?? 0) > 520 ? "..." : ""}
            </p>
          )}
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
      <div onClick={() => setShowModal(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? C.surfaceAlt : C.surface,
          borderRadius: 10, padding: "10px 12px",
          display: "flex", alignItems: "center", gap: 10,
          border: `1px solid ${hovered ? C.red : C.border}`,
          transition: "all 0.2s", cursor: "pointer",
          boxShadow: hovered ? `0 0 12px ${C.redGlow}` : "none",
          transform: hovered ? "translateY(-1px)" : "none",
        }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: C.surface, border: `2px solid ${hovered ? C.red : C.border}`, transition: "border-color 0.2s" }}>
          {imgOk ? (
            <img src={getPlayerPhoto(p.name)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setImgOk(false)} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, color: C.white, background: POS_COLOR[p.pos] ?? C.red }}>
              {p.name.charAt(0)}
            </div>
          )}
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
  const [tab, setTab] = useState<"A" | "B">("A");
  const teamCode = tab === "A" ? match.teamA : match.teamB;
  const teamName = tab === "A" ? match.teamAName : match.teamBName;
  const players = squads[teamCode] ?? [];
  const venueImg = VENUE_IMAGES[match.venueName] ?? DEFAULT_STADIUM;
  const status = getMatchStatus(match.date, match.timeLocal);

  const byPos: Record<string, typeof players> = { POR: [], DEF: [], MED: [], DEL: [] };
  players.forEach((p) => { (byPos[p.pos] ?? byPos["DEL"]).push(p); });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 700, borderRadius: 20, overflow: "hidden", boxShadow: `0 0 80px ${C.redGlow}, 0 30px 80px rgba(0,0,0,0.8)`, maxHeight: "92vh", overflowY: "auto", background: C.card, border: `1px solid ${C.border}` }}
        onClick={(e) => e.stopPropagation()}>

        {/* LÍNEA ROJA TOP */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.red}, ${C.redBright}, ${C.red})` }} />

        {/* HERO ESTADIO */}
        <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
          <img src={venueImg} alt={match.venueName} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) saturate(0.7)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(10,10,10,0.97) 100%)" }} />

          <div style={{ position: "absolute", top: 14, left: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 14px", borderRadius: 6, color: "white", letterSpacing: 2, textTransform: "uppercase", background: status === "Próximo" ? "#1d4ed8" : status === "En curso" ? "#16a34a" : C.red, boxShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>{status}</span>
          </div>

          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "rgba(0,0,0,0.7)", border: `1px solid ${C.border}`, color: C.white, borderRadius: 8, width: 34, height: 34, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

          <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 }}>
            <div style={{ textAlign: "center" }}>
              <img src={getFlagUrl(match.teamA)} alt={match.teamA} style={{ width: 56, height: 38, objectFit: "cover", borderRadius: 6, boxShadow: `0 4px 16px rgba(0,0,0,0.8)`, border: `2px solid ${C.red}` }} />
              <p style={{ color: C.white, fontWeight: 800, fontSize: 13, margin: "7px 0 0" }}>{match.teamAName}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: C.redBright, fontWeight: 900, fontSize: 26, textShadow: `0 0 30px ${C.red}`, letterSpacing: 2 }}>VS</div>
              <p style={{ color: C.gray, fontSize: 10, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: 2 }}>Grupo {match.group}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <img src={getFlagUrl(match.teamB)} alt={match.teamB} style={{ width: 56, height: 38, objectFit: "cover", borderRadius: 6, boxShadow: `0 4px 16px rgba(0,0,0,0.8)`, border: `2px solid ${C.red}` }} />
              <p style={{ color: C.white, fontWeight: 800, fontSize: 13, margin: "7px 0 0" }}>{match.teamBName}</p>
            </div>
          </div>
        </div>

        {/* INFO SEDE */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "14px 20px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          {[
            { icon: "🏟️", text: match.venueName, bold: true },
            { icon: "📍", text: match.city },
            { icon: "🌎", text: hostCountryName[match.country] ?? getCountryName(match.country) },
            { icon: "📅", text: `${match.date} · ${match.timeLocal}` },
          ].map((item, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: C.card, borderRadius: 8, padding: "5px 12px", color: item.bold ? C.white : C.gray, fontSize: 12, fontWeight: item.bold ? 700 : 400, border: `1px solid ${C.border}` }}>
              {item.icon} {item.text}
            </span>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, padding: "16px 20px 0", background: C.card }}>
          {(["A", "B"] as const).map((side) => {
            const code = side === "A" ? match.teamA : match.teamB;
            const name = side === "A" ? match.teamAName : match.teamBName;
            const active = tab === side;
            return (
              <button key={side} onClick={() => setTab(side)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 13,
                background: active ? C.red : C.surface,
                color: active ? C.white : C.gray,
                border: active ? `1px solid ${C.red}` : `1px solid ${C.border}`,
                boxShadow: active ? `0 0 20px ${C.redGlow}` : "none",
                transition: "all 0.2s",
              }}>
                <img src={getFlagUrl(code)} alt={code} style={{ width: 22, height: 15, objectFit: "cover", borderRadius: 3 }} />
                {name}
                <span style={{ background: active ? "rgba(255,255,255,0.2)" : C.border, borderRadius: 6, padding: "1px 7px", fontSize: 11, color: active ? C.white : C.gray }}>
                  {(squads[code] ?? []).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* CONVOCADOS */}
        <div style={{ padding: "16px 20px 28px", background: C.card }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            <img src={getFlagUrl(teamCode)} alt={teamCode} style={{ width: 32, height: 21, objectFit: "cover", borderRadius: 4 }} />
            <span style={{ color: C.white, fontWeight: 800, fontSize: 15 }}>Convocados — {teamName}</span>
            <span style={{ marginLeft: "auto", color: C.gray, fontSize: 12, background: C.surface, padding: "2px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>{players.length} jugadores</span>
          </div>
          <p style={{ color: C.grayDark, fontSize: 11, margin: "0 0 16px", fontStyle: "italic" }}>Haz clic en un jugador para ver su perfil completo</p>

          {players.length === 0 ? (
            <p style={{ color: C.gray, textAlign: "center", padding: "32px 0" }}>Sin datos disponibles.</p>
          ) : (
            Object.entries(byPos).map(([pos, list]) =>
              list.length === 0 ? null : (
                <div key={pos} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 3, height: 16, background: POS_COLOR[pos] ?? C.red, borderRadius: 2 }} />
                    <span style={{ color: C.white, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{POS_LABEL[pos] ?? pos}s</span>
                    <span style={{ color: C.grayDark, fontSize: 12 }}>· {list.length}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {list.map((p) => <PlayerCard key={p.name} p={p} />)}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const ALL_COUNTRIES = ["US","MX","CA"];

export default function Dashboard() {
<<<<<<< Updated upstream
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(true);
=======
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
>>>>>>> Stashed changes
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterCountry, setFilterCountry] = useState("Todos");
  const [filterDate, setFilterDate] = useState("");
  const [filterVenue, setFilterVenue] = useState("Todas");
  const [filterTeam, setFilterTeam] = useState("Todas");

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

  const filtered = useMemo(() => {
    return (matches as Match[]).filter((m) => {
      const status = getMatchStatus(m.date, m.timeLocal);
      return (
        (search === "" || m.teamAName.toLowerCase().includes(search.toLowerCase()) || m.teamBName.toLowerCase().includes(search.toLowerCase()) || m.venueName.toLowerCase().includes(search.toLowerCase())) &&
        (filterGroup === "Todos" || m.group === filterGroup) &&
        (filterStatus === "Todos" || status === filterStatus) &&
        (filterCountry === "Todos" || m.country === filterCountry) &&
        (filterDate === "" || m.date === filterDate) &&
        (filterVenue === "Todas" || m.venueName === filterVenue) &&
        (filterTeam === "Todas" || m.teamA === filterTeam || m.teamB === filterTeam)
      );
    });
  }, [search, filterGroup, filterStatus, filterCountry, filterDate, filterVenue, filterTeam]);

  const totalMatches = (matches as Match[]).length;
  const finalizados = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "Finalizado").length;
  const proximos = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "Próximo").length;
  const enCurso = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "En curso").length;

  const sel: React.CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`, color: C.grayLight,
    borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", cursor: "pointer",
  };

  return (
<<<<<<< Updated upstream
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
=======
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {selectedMatch && <MatchInfoModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 50%, rgba(204,0,0,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(204,0,0,0.08) 0%, transparent 60%)` }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 36px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <div style={{ width: 28, height: 3, background: C.red, borderRadius: 2 }} />
                <span style={{ color: C.red, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 4 }}>FIFA World Cup 2026</span>
              </div>
              <h1 style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1, color: C.white, letterSpacing: -1 }}>
                Fase de <span style={{ color: C.red }}>Grupos</span>
              </h1>
              <p style={{ color: C.gray, fontSize: 14, margin: 0 }}>
                USA 🇺🇸 · México 🇲🇽 · Canadá 🇨🇦 · 16 sedes · 48 selecciones
              </p>
            </div>
            {/* COUNTERS */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <AnimCounter target={totalMatches} label="Partidos" icon="⚽" />
              <AnimCounter target={finalizados} label="Finalizados" icon="✅" />
              <AnimCounter target={proximos} label="Próximos" icon="🔜" />
              <AnimCounter target={enCurso} label="En curso" icon="🔴" />
>>>>>>> Stashed changes
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px" }}>

        {/* FILTROS */}
        <div style={{ background: C.card, borderRadius: 14, padding: "20px 22px", marginBottom: 28, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 800, color: C.white, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.red }}>▍</span> Filtrar partidos
            </span>
            <button onClick={() => { setSearch(""); setFilterGroup("Todos"); setFilterStatus("Todos"); setFilterCountry("Todos"); setFilterDate(""); setFilterVenue("Todas"); setFilterTeam("Todas"); }}
              style={{ background: "none", border: `1px solid ${C.border}`, color: C.gray, cursor: "pointer", fontSize: 12, padding: "4px 12px", borderRadius: 6, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.white; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.gray; }}>
              Limpiar ✕
            </button>
          </div>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.gray, fontSize: 14 }}>🔍</span>
            <input type="text" placeholder="Buscar equipo o sede..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...sel, width: "100%", boxSizing: "border-box", paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 8 }}>
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} style={sel}>
              <option value="Todos">Grupo: Todos</option>
              {ALL_GROUPS.map((g) => <option key={g} value={g}>Grupo {g}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={sel}>
              <option value="Todos">Estado: Todos</option>
              <option value="Próximo">Próximo</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} style={sel}>
              {teams.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
            </select>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={sel} />
            <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} style={sel}>
              <option value="Todos">País: Todos</option>
              {ALL_COUNTRIES.map((c) => <option key={c} value={c}>{getCountryName(c)}</option>)}
            </select>
            <select value={filterVenue} onChange={(e) => setFilterVenue(e.target.value)} style={sel}>
              {venues.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* CONTADOR */}
        <div style={{ color: C.gray, fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: C.red, borderRadius: 6, padding: "2px 10px", color: C.white, fontWeight: 900, fontSize: 13 }}>{filtered.length}</span>
          <span>partidos encontrados</span>
          {filtered.length !== totalMatches && (
            <span style={{ color: C.grayDark, fontSize: 12 }}>· filtrando de {totalMatches}</span>
          )}
        </div>

        {/* GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {filtered.map((m) => {
            const status = getMatchStatus(m.date, m.timeLocal);
            const venueImg = VENUE_IMAGES[m.venueName] ?? DEFAULT_STADIUM;
            return (
              <div key={m.matchId}
                style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, transition: "all 0.25s", cursor: "default" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${C.redGlow}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* IMAGEN ESTADIO */}
                <div style={{ position: "relative", height: 115, overflow: "hidden" }}>
                  <img src={venueImg} alt={m.venueName} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55) saturate(0.8)", transition: "transform 0.3s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.style.background = "#1a0000"; }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.2),rgba(10,10,10,0.9))" }} />
                  {/* TOP BAR */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: status === "En curso" ? "#16a34a" : status === "Próximo" ? "#1d4ed8" : C.red }} />
                  <div style={{ position: "absolute", top: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: C.white, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>Grupo {m.group}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, padding: "3px 9px", borderRadius: 5, color: "white", letterSpacing: 0.5, textTransform: "uppercase", background: status === "Próximo" ? "#1d4ed8" : status === "En curso" ? "#16a34a" : C.red }}>{status}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 7, left: 10 }}>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, margin: 0, fontWeight: 500 }}>🏟️ {m.venueName}</p>
                  </div>
                </div>

                {/* CUERPO */}
                <div style={{ padding: "16px 14px 14px" }}>
                  {/* EQUIPOS */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <img src={getFlagUrl(m.teamA)} alt={m.teamA} style={{ width: 46, height: 31, objectFit: "cover", borderRadius: 5, boxShadow: "0 2px 10px rgba(0,0,0,0.6)", border: `1px solid ${C.border}` }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span style={{ color: C.white, fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{m.teamAName}</span>
                    </div>
                    <div style={{ textAlign: "center", padding: "0 8px" }}>
                      <span style={{ color: C.red, fontWeight: 900, fontSize: 15, letterSpacing: 1 }}>VS</span>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <img src={getFlagUrl(m.teamB)} alt={m.teamB} style={{ width: 46, height: 31, objectFit: "cover", borderRadius: 5, boxShadow: "0 2px 10px rgba(0,0,0,0.6)", border: `1px solid ${C.border}` }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span style={{ color: C.white, fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{m.teamBName}</span>
                    </div>
                  </div>

                  {/* DATOS */}
                  <div style={{ background: C.bg, borderRadius: 8, padding: "8px 12px", marginBottom: 14, border: `1px solid ${C.border}` }}>
                    <p style={{ color: C.gray, fontSize: 11, margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>📅 <span>{m.date} · {m.timeLocal}</span></p>
                    <p style={{ color: C.gray, fontSize: 11, margin: 0, display: "flex", alignItems: "center", gap: 5 }}>📍 <span>{m.city}, {getCountryName(m.country)}</span></p>
                  </div>

                  {/* BOTÓN */}
                  <button onClick={() => setSelectedMatch(m)} style={{
                    width: "100%", padding: "10px 0",
                    background: `linear-gradient(135deg, ${C.red}, #990000)`,
                    border: "none", borderRadius: 10, color: C.white,
                    fontWeight: 800, fontSize: 12, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    letterSpacing: 0.5, textTransform: "uppercase",
                    boxShadow: `0 4px 20px ${C.redGlow}`,
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.redBright}, ${C.red})`; e.currentTarget.style.boxShadow = `0 6px 28px ${C.redGlow}`; e.currentTarget.style.transform = "scale(1.02)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.red}, #990000)`; e.currentTarget.style.boxShadow = `0 4px 20px ${C.redGlow}`; e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    👥 Ver convocados
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: C.grayDark, padding: "80px 0", fontSize: 15 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              No se encontraron partidos con esos filtros.
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "22px 24px", marginTop: 48, textAlign: "center", color: C.grayDark, fontSize: 12 }}>
        <span style={{ color: C.red, fontWeight: 800 }}>FIFA</span> World Cup 2026 · USA 🇺🇸 · México 🇲🇽 · Canadá 🇨🇦
      </div>
    </div>
  );
}