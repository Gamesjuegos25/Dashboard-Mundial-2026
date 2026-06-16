import { useState, useMemo, useEffect } from "react";
import matches from "../data/matches.json";
import { squads, getFlagUrl, hostCountryName } from "../data/squads";

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
  for (const m of allMatches) { (byGroup[m.group] ??= []).push(m); }
  const map: Record<number, number> = {};
  for (const group of Object.values(byGroup)) {
    const sorted = [...group].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.timeLocal < b.timeLocal ? -1 : a.timeLocal > b.timeLocal ? 1 : 0;
    });
    sorted.forEach((m, i) => { map[m.matchId] = Math.min(Math.floor(i / 2) + 1, 3); });
  }
  return map;
}

// ── DATOS ESTÁTICOS ───────────────────────────────────────────────

const STADIUM_INFO: Record<string, { descripcion: string; capacidad: number; inaugurado: number; superficie: string }> = {
  "Estadio de Ciudad de México": { capacidad: 87523, inaugurado: 1966, superficie: "Césped natural", descripcion: "El estadio más icónico de México y uno de los más famosos del mundo. Es el único recinto que ha albergado dos finales de la Copa del Mundo (1970 y 1986). Aquí Diego Maradona marcó el 'Gol del Siglo' contra Inglaterra en 1986. Con capacidad para más de 87,000 espectadores, es el estadio más grande de América Latina." },
  "Estadio Guadalajara": { capacidad: 49850, inaugurado: 2010, superficie: "Césped natural", descripcion: "También conocido como Estadio Akron u Omnilife, es el hogar del Club Deportivo Guadalajara (Chivas). Inaugurado en 2010, cuenta con un diseño arquitectónico moderno y una capacidad de casi 50,000 espectadores. Es considerado uno de los estadios más modernos y cómodos de México." },
  "Estadio de Monterrey": { capacidad: 53500, inaugurado: 2015, superficie: "Césped natural", descripcion: "Conocido como Estadio BBVA, es el hogar del Club de Fútbol Monterrey y uno de los estadios más modernos de América Latina. Su diseño fue inspirado en las montañas que rodean la ciudad. Es considerado uno de los mejores estadios del mundo por su arquitectura y comodidades." },
  "Estadio de Toronto": { capacidad: 30000, inaugurado: 2007, superficie: "Césped artificial", descripcion: "Conocido como BMO Field, es el estadio principal del Toronto FC en la MLS y de la selección canadiense. Inaugurado en 2007 y ampliado en 2016, está ubicado en Exhibition Place, a orillas del lago Ontario. Para el Mundial 2026 fue renovado para cumplir con los estándares de la FIFA." },
  "BC Place Vancouver": { capacidad: 54500, inaugurado: 1983, superficie: "Césped artificial", descripcion: "BC Place es el estadio cubierto más grande de Canadá. Inaugurado en 1983 y completamente renovado en 2011 con un techo retráctil de última generación. Fue sede de los Juegos Olímpicos de Vancouver 2010. Su característica cúpula es reconocible en el horizonte de la ciudad." },
  "Estadio de Los Ángeles": { capacidad: 70240, inaugurado: 2020, superficie: "Césped natural", descripcion: "Conocido como SoFi Stadium, es uno de los estadios más modernos y costosos jamás construidos, con una inversión de 5,500 millones de dólares. Su techo translúcido es una maravilla arquitectónica y cuenta con la pantalla de video más grande de cualquier estadio deportivo del mundo." },
  "Estadio de Nueva York Nueva Jersey": { capacidad: 82500, inaugurado: 2010, superficie: "Césped artificial", descripcion: "Conocido como MetLife Stadium, es el estadio más grande de la NFL y será sede de la Gran Final del Mundial 2026. Está ubicado en East Rutherford, Nueva Jersey, a pocos kilómetros de Manhattan." },
  "Estadio de Boston": { capacidad: 65878, inaugurado: 2002, superficie: "Césped artificial", descripcion: "Conocido como Gillette Stadium, es el hogar de los New England Patriots de la NFL. Inaugurado en 2002, está ubicado en Foxborough, Massachusetts, a 45 minutos de Boston." },
  "Estadio de Dallas": { capacidad: 80000, inaugurado: 2009, superficie: "Césped artificial", descripcion: "Conocido como AT&T Stadium o 'el estadio de América', es el hogar de los Dallas Cowboys de la NFL. Tiene capacidad para 80,000 espectadores y cuenta con la mayor pantalla de video colgante del mundo." },
  "Estadio del Área de la Bahía de San Francisco": { capacidad: 68500, inaugurado: 2014, superficie: "Césped natural", descripcion: "Conocido como Levi's Stadium, es el hogar de los San Francisco 49ers de la NFL. Es uno de los estadios más sostenibles del mundo, con paneles solares en su techo verde, ubicado en el corazón de Silicon Valley." },
  "Estadio de Kansas City": { capacidad: 76416, inaugurado: 1972, superficie: "Césped natural", descripcion: "Conocido como Arrowhead Stadium, ostenta el récord Guinness de estadio más ruidoso del mundo con 142.2 decibeles. Es el hogar de los Kansas City Chiefs de la NFL y sus aficionados crean una atmósfera absolutamente legendaria." },
  "Estadio de Houston": { capacidad: 72220, inaugurado: 2002, superficie: "Césped natural", descripcion: "Conocido como NRG Stadium, es el hogar de los Houston Texans de la NFL. Fue el primer estadio de la NFL con techo retráctil. Houston es una de las ciudades más diveZAFs de EE.UU., con una gran comunidad latina." },
  "Estadio de Filadelfia": { capacidad: 69796, inaugurado: 2003, superficie: "Césped natural", descripcion: "Conocido como Lincoln Financial Field, es el hogar de los Philadelphia Eagles de la NFL. Conocido por tener una de las aficiones más apasionadas e intimidantes de toda la liga." },
  "Estadio de Miami": { capacidad: 64767, inaugurado: 1987, superficie: "Césped natural", descripcion: "Conocido como Hard Rock Stadium, es el hogar de los Miami Dolphins de la NFL. Renovado completamente entre 2015 y 2016, su estructura de cubierta única protege a los aficionados del calor y la lluvia tropical de Miami." },
  "Estadio de Atlanta": { capacidad: 71000, inaugurado: 2017, superficie: "Césped artificial", descripcion: "Conocido como Mercedes-Benz Stadium, es considerado uno de los mejores estadios del mundo. Su característica cúpula retráctil con forma de iris es una hazaña de ingeniería. Ganó el premio LEED Platino por sus estándares medioambientales." },
  "Camping World Stadium": { capacidad: 65000, inaugurado: 1936, superficie: "Césped natural", descripcion: "Uno de los estadios más históricos de Florida, inaugurado en 1936 y completamente renovado. Orlando es una de las ciudades más visitadas del mundo gracias a sus parques temáticos." },
};

const COUNTRY_INFO: Record<string, { nombre: string; capital: string; poblacion: string; area: string; idioma: string; moneda: string; region: string; zonaHoraria: string; descripcion: string; flag: string }> = {
  MX: { nombre: "México", capital: "Ciudad de México", poblacion: "130 millones", area: "1,964,375 km²", idioma: "Español", moneda: "Peso mexicano (MXN)", region: "América Latina", zonaHoraria: "UTC-6 a UTC-8", flag: "mx", descripcion: "México es un país megadiverso con una de las culturas más ricas del mundo. Cuna de civilizaciones ancestrales como los mayas y aztecas, combina historia milenaria con modernidad vibrante. Es el país hispanohablante más poblado del mundo y la segunda economía más grande de América Latina. Como co-anfitrión del Mundial 2026, se convierte en el primer país en organizar tres Mundiales (1970, 1986 y 2026)." },
  US: { nombre: "Estados Unidos", capital: "Washington D.C.", poblacion: "335 millones", area: "9,833,517 km²", idioma: "Inglés", moneda: "Dólar estadounidense (USD)", region: "América del Norte", zonaHoraria: "UTC-5 a UTC-10", flag: "us", descripcion: "Estados Unidos es la tercera nación más grande del mundo y la mayor economía del planeta. Organizaron el Mundial de 1994, que estableció el récord de asistencia que se mantiene hasta hoy. El fútbol ha crecido exponencialmente gracias a la MLS. Como anfitrión principal del Mundial 2026, albergará la gran final en el MetLife Stadium." },
  CA: { nombre: "Canadá", capital: "Ottawa", poblacion: "40 millones", area: "9,984,670 km²", idioma: "Inglés y Francés", moneda: "Dólar canadiense (CAD)", region: "América del Norte", zonaHoraria: "UTC-3.5 a UTC-8", flag: "ca", descripcion: "Canadá es el segundo país más grande del mundo, conocido por sus impresionantes paisajes naturales y su diversidad cultural. El fútbol ha crecido enormemente, culminando con su clasificación al Mundial de Qatar 2022 tras 36 años de ausencia. Como co-anfitrión del Mundial 2026, tiene la oportunidad histórica de mostrar su pasión por el fútbol." },
  AR: { nombre: "Argentina", capital: "Buenos Aires", poblacion: "46 millones", area: "2,780,400 km²", idioma: "Español", moneda: "Peso argentino (ARS)", region: "América del Sur", zonaHoraria: "UTC-3", flag: "ar", descripcion: "Argentina es la campeona vigente del mundo tras su victoria en Qatar 2022. Con Lionel Messi al frente, es uno de los países más apasionados por el fútbol. Buenos Aires es conocida como la capital del fútbol sudamericano." },
  BR: { nombre: "Brasil", capital: "Brasilia", poblacion: "215 millones", area: "8,515,767 km²", idioma: "Portugués", moneda: "Real brasileño (BRL)", region: "América del Sur", zonaHoraria: "UTC-3 a UTC-5", flag: "br", descripcion: "Brasil es la nación más exitosa en la historia del Mundial con 5 títulos. El fútbol es una religión en el país que dio al mundo a Pelé, Ronaldo y Ronaldinho. Con 215 millones de habitantes es el gigante de América del Sur." },
  FR: { nombre: "Francia", capital: "París", poblacion: "68 millones", area: "551,695 km²", idioma: "Francés", moneda: "Euro (EUR)", region: "Europa Occidental", zonaHoraria: "UTC+1", flag: "fr", descripcion: "Francia es bicampeona del mundo (1998 y 2018) y una de las potencias culturales y económicas de Europa. París, su capital, es conocida como la Ciudad de la Luz y es uno de los destinos más visitados del planeta." },
  ES: { nombre: "España", capital: "Madrid", poblacion: "47 millones", area: "505,990 km²", idioma: "Español", moneda: "Euro (EUR)", region: "Europa", zonaHoraria: "UTC+1", flag: "es", descripcion: "España es campeona del mundo 2010 y dominó el fútbol mundial entre 2008 y 2012. Es conocida por su rica cultura, gastronomía, arquitectura y su clima mediterráneo. Madrid y Barcelona son dos de las ciudades más influyentes de Europa." },
  DE: { nombre: "Alemania", capital: "Berlín", poblacion: "84 millones", area: "357,114 km²", idioma: "Alemán", moneda: "Euro (EUR)", region: "Europa Central", zonaHoraria: "UTC+1", flag: "de", descripcion: "Alemania es tetracampeona del mundo (1954, 1974, 1990, 2014) y una de las mayores economías del planeta. Es conocida por su ingeniería, cultura y eficiencia. El fútbol alemán tiene una de las ligas más competitivas del mundo, la Bundesliga." },
  GB: { nombre: "Inglaterra", capital: "Londres", poblacion: "57 millones", area: "130,279 km²", idioma: "Inglés", moneda: "Libra esterlina (GBP)", region: "Europa", zonaHoraria: "UTC+0", flag: "gb-eng", descripcion: "Inglaterra es la cuna del fútbol moderno y campeona del mundo en 1966. La Premier League es considerada la liga más emocionante del mundo. Londres es una de las ciudades más cosmopolitas e influyentes del planeta." },
  PT: { nombre: "Portugal", capital: "Lisboa", poblacion: "10 millones", area: "92,212 km²", idioma: "Portugués", moneda: "Euro (EUR)", region: "Europa", zonaHoraria: "UTC+0", flag: "pt", descripcion: "Portugal tiene una rica historia como potencia marítima y exploradora. Campeón de Europa en 2016, es conocido por sus playas, gastronomía y el Fado. Lisboa y Oporto son dos de las ciudades más bellas de Europa." },
  IT: { nombre: "Italia", capital: "Roma", poblacion: "59 millones", area: "301,340 km²", idioma: "Italiano", moneda: "Euro (EUR)", region: "Europa", zonaHoraria: "UTC+1", flag: "it", descripcion: "Italia es tetracampeona del mundo (1934, 1938, 1982, 2006) y campeona de Europa en 2020. Es conocida mundialmente por su arte, arquitectura, gastronomía y moda. Roma, Milán y Venecia son íconos culturales univeZAFles." },
  NL: { nombre: "Países Bajos", capital: "Ámsterdam", poblacion: "17 millones", area: "41,543 km²", idioma: "Neerlandés", moneda: "Euro (EUR)", region: "Europa", zonaHoraria: "UTC+1", flag: "nl", descripcion: "Los Países Bajos son conocidos por sus molinos, tulipanes, canales y el fútbol total que revolucionó el deporte. Tres veces subcampeones del mundo, son una potencia económica y cultural de Europa Occidental." },
  BE: { nombre: "Bélgica", capital: "Bruselas", poblacion: "11 millones", area: "30,528 km²", idioma: "Francés / Neerlandés / Alemán", moneda: "Euro (EUR)", region: "Europa", zonaHoraria: "UTC+1", flag: "be", descripcion: "Bélgica es conocida por sus chocolates, cervezas, cómics y como sede de las instituciones de la Unión Europea. Su generación dorada de fútbol fue clasificada número uno del mundo durante varios años." },
  JP: { nombre: "Japón", capital: "Tokio", poblacion: "125 millones", area: "377,975 km²", idioma: "Japonés", moneda: "Yen japonés (JPY)", region: "Asia Oriental", zonaHoraria: "UTC+9", flag: "jp", descripcion: "Japón es una nación fascinante que combina tradición milenaria con tecnología de vanguardia. Es la tercera economía del mundo y ha sorprendido en los últimos Mundiales con sus victorias ante potencias europeas." },
  MA: { nombre: "Marruecos", capital: "Rabat", poblacion: "37 millones", area: "710,850 km²", idioma: "Árabe / Francés", moneda: "Dírham marroquí (MAD)", region: "África del Norte", zonaHoraria: "UTC+1", flag: "ma", descripcion: "Marruecos hizo historia en Qatar 2022 convirtiéndose en el primer equipo africano en llegar a las semifinales del Mundial. Es un país de contrastes entre el desierto del Sahara, las montañas del Atlas y sus coloridas medinas." },
  SN: { nombre: "Senegal", capital: "Dakar", poblacion: "17 millones", area: "196,722 km²", idioma: "Francés", moneda: "Franco CFA (XOF)", region: "África Occidental", zonaHoraria: "UTC+0", flag: "sn", descripcion: "Senegal es campeón africano y una democracia estable en África Occidental. Conocida como la puerta de África, Dakar es una ciudad vibrante con una rica cultura musical y artística." },
  UY: { nombre: "Uruguay", capital: "Montevideo", poblacion: "3.5 millones", area: "176,215 km²", idioma: "Español", moneda: "Peso uruguayo (UYU)", region: "América del Sur", zonaHoraria: "UTC-3", flag: "uy", descripcion: "Uruguay es un país pequeño pero con enorme historia futbolística: campeón en 1930 y 1950. Es considerado uno de los países más avanzados de América Latina en democracia, educación y calidad de vida." },
  CO: { nombre: "Colombia", capital: "Bogotá", poblacion: "52 millones", area: "1,141,748 km²", idioma: "Español", moneda: "Peso colombiano (COP)", region: "América del Sur", zonaHoraria: "UTC-5", flag: "co", descripcion: "Colombia es un país de extraordinaria biodiversidad y cultura. Ganadora de la Copa América 2024, es conocida por su café, flores, música vallenata y la alegría de su gente." },
  EC: { nombre: "Ecuador", capital: "Quito", poblacion: "18 millones", area: "283,561 km²", idioma: "Español", moneda: "Dólar estadounidense (USD)", region: "América del Sur", zonaHoraria: "UTC-5", flag: "ec", descripcion: "Ecuador es un país situado en la línea ecuatorial con una diversidad natural extraordinaria, desde las Islas Galápagos hasta la selva amazónica. Quito, su capital, es Patrimonio de la Humanidad de la UNESCO." },
  PY: { nombre: "Paraguay", capital: "Asunción", poblacion: "7 millones", area: "406,752 km²", idioma: "Español / Guaraní", moneda: "Guaraní paraguayo (PYG)", region: "América del Sur", zonaHoraria: "UTC-4", flag: "py", descripcion: "Paraguay es un país bilingüe donde el guaraní es lengua oficial junto al español. Conocido como el corazón de América del Sur, tiene una cultura única profundamente influenciada por la herencia indígena guaraní." },
  KR: { nombre: "Corea del Sur", capital: "Seúl", poblacion: "52 millones", area: "100,210 km²", idioma: "Coreano", moneda: "Won surcoreano (KRW)", region: "Asia Oriental", zonaHoraria: "UTC+9", flag: "kr", descripcion: "Corea del Sur es una de las economías más dinámicas de Asia, hogar de marcas globales como Samsung, Hyundai y LG. Ha protagonizado un fenómeno cultural mundial con el K-pop, los dramas y el cine coreano." },
  HR: { nombre: "Croacia", capital: "Zagreb", poblacion: "4 millones", area: "56,594 km²", idioma: "Croata", moneda: "Euro (EUR)", region: "Europa", zonaHoraria: "UTC+1", flag: "hr", descripcion: "Croacia es un pequeño país del Adriático conocido por su costa espectacular, sus islas y su rica historia. A pesar de su pequeño tamaño, ha logrado llegar a la final del Mundial 2018 y al tercer lugar en 2022." },
  RS: { nombre: "Serbia", capital: "Belgrado", poblacion: "7 millones", area: "77,474 km²", idioma: "Serbio", moneda: "Dinar serbio (RSD)", region: "Europa", zonaHoraria: "UTC+1", flag: "rs", descripcion: "Serbia es un país con rica historia en el corazón de los Balcanes. Belgrado, su capital, es conocida por su vibrante vida nocturna y su mezcla de culturas orientales y occidentales." },
  TR: { nombre: "Turquía", capital: "Ankara", poblacion: "85 millones", area: "783,356 km²", idioma: "Turco", moneda: "Lira turca (TRY)", region: "Europa / Asia", zonaHoraria: "UTC+3", flag: "tr", descripcion: "Turquía es un país transcontinental que une Europa y Asia. Estambul, la antigua Constantinopla, es una de las ciudades más fascinantes del mundo con más de 2,500 años de historia." },
  IR: { nombre: "Irán", capital: "Teherán", poblacion: "87 millones", area: "1,648,195 km²", idioma: "PeZAF", moneda: "Rial iraní (IRR)", region: "Asia Occidental", zonaHoraria: "UTC+3:30", flag: "ir", descripcion: "Irán es una de las civilizaciones más antiguas del mundo. Conocida antiguamente como Persia, tiene una herencia cultural extraordinaria. Es el cuarto clasificador más consistente de Asia al Mundial." },
  SA: { nombre: "Arabia Saudita", capital: "Riad", poblacion: "36 millones", area: "2,149,690 km²", idioma: "Árabe", moneda: "Riyal saudí (SAR)", region: "Asia Occidental", zonaHoraria: "UTC+3", flag: "sa", descripcion: "Arabia Saudita es la mayor economía árabe y hogar de los lugares más sagrados del Islam. En los últimos años ha experimentado enormes cambios sociales y deportivos, atrayendo a las mayores estrellas del fútbol mundial." },
  AU: { nombre: "Australia", capital: "Canberra", poblacion: "26 millones", area: "7,741,220 km²", idioma: "Inglés", moneda: "Dólar australiano (AUD)", region: "Oceanía", zonaHoraria: "UTC+8 a UTC+11", flag: "au", descripcion: "Australia es el sexto país más grande del mundo, conocido por su extraordinaria biodiversidad, sus playas paradisíacas y su cultura única. Sydney y Melbourne son dos de las ciudades más habitables del mundo." },
  NZ: { nombre: "Nueva Zelanda", capital: "Wellington", poblacion: "5 millones", area: "270,467 km²", idioma: "Inglés / Māori", moneda: "Dólar neozelandés (NZD)", region: "Oceanía", zonaHoraria: "UTC+12", flag: "nz", descripcion: "Nueva Zelanda es conocida por sus paisajes espectaculares que sirvieron de escenario para El Señor de los Anillos. Los All Blacks de rugby son el equipo más exitoso de la historia de ese deporte." },
  CM: { nombre: "Camerún", capital: "Yaundé", poblacion: "28 millones", area: "475,442 km²", idioma: "Francés / Inglés", moneda: "Franco CFA (XAF)", region: "África Central", zonaHoraria: "UTC+1", flag: "cm", descripcion: "Camerún es conocido como África en miniatura por su extraordinaria diversidad geográfica y cultural. Sus Leones Indomables fueron el primer equipo africano en llegar a cuartos de final de un Mundial en 1990." },
  NG: { nombre: "Nigeria", capital: "Abuja", poblacion: "220 millones", area: "923,768 km²", idioma: "Inglés", moneda: "Naira nigeriana (NGN)", region: "África Occidental", zonaHoraria: "UTC+1", flag: "ng", descripcion: "Nigeria es el país más poblado de África y la mayor economía del continente. Lagos es una de las ciudades más dinámicas del mundo. Las Súper Águilas son tricampeonas africanas con una rica tradición futbolística." },
  CD: { nombre: "R.D. del Congo", capital: "Kinshasa", poblacion: "100 millones", area: "2,344,858 km²", idioma: "Francés", moneda: "Franco congoleño (CDF)", region: "África Central", zonaHoraria: "UTC+1 a UTC+2", flag: "cd", descripcion: "La República Democrática del Congo es el segundo país más grande de África y alberga la segunda selva tropical más grande del mundo. Kinshasa es una de las ciudades más grandes y vibrantes de África." },
  ZA: { nombre: "Sudáfrica", capital: "Pretoria", poblacion: "60 millones", area: "1,219,090 km²", idioma: "11 idiomas oficiales", moneda: "Rand sudafricano (ZAR)", region: "África Austral", zonaHoraria: "UTC+2", flag: "za", descripcion: "Sudáfrica organizó el Mundial 2010, el primero en suelo africano. Es conocida como la Nación Arcoíris por su diversidad cultural. Johanesburgo y Ciudad del Cabo son dos de las ciudades más influyentes del continente." },
  AL: { nombre: "Albania", capital: "Tirana", poblacion: "3 millones", area: "28,748 km²", idioma: "Albanés", moneda: "Lek albanés (ALL)", region: "Europa", zonaHoraria: "UTC+1", flag: "al", descripcion: "Albania es un pequeño país de los Balcanes con una rica historia y una costa adriática y jónica espectacular. Tiene una de las poblaciones más jóvenes de Europa y una diáspora muy activa en todo el mundo." },
  CZ: { nombre: "República Checa", capital: "Praga", poblacion: "11 millones", area: "78,866 km²", idioma: "Checo", moneda: "Corona checa (CZK)", region: "Europa Central", zonaHoraria: "UTC+1", flag: "cz", descripcion: "La República Checa es conocida por Praga, una de las ciudades medievales mejor conservadas del mundo. Tiene una rica tradición en música clásica, literatura y deportes, con una de las ligas de hockey sobre hielo más competitivas del mundo." },
  GB_SCT: { nombre: "Escocia", capital: "Edimburgo", poblacion: "5.5 millones", area: "77,933 km²", idioma: "Inglés / Gaélico escocés", moneda: "Libra esterlina (GBP)", region: "Europa", zonaHoraria: "UTC+0", flag: "gb-sct", descripcion: "Escocia es co-inventora del fútbol junto a Inglaterra y tiene la hinchada visitante más celebrada del mundo: el Ejército Tartán. Edimburgo y Glasgow son ciudades llenas de historia, cultura y tradición." },
  BA: { nombre: "Bosnia y Herzegovina", capital: "Sarajevo", poblacion: "3.5 millones", area: "51,197 km²", idioma: "Bosnio / Serbio / Croata", moneda: "Marco convertible (BAM)", region: "Europa", zonaHoraria: "UTC+1", flag: "ba", descripcion: "Bosnia y Herzegovina es un país de los Balcanes con una historia compleja y una belleza natural impresionante. Sarajevo, su capital, es conocida como el Jerusalén de Europa por su convivencia histórica de culturas." },
  HT: { nombre: "Haití", capital: "Puerto Príncipe", poblacion: "11 millones", area: "27,750 km²", idioma: "Francés / Criollo haitiano", moneda: "Gourde haitiano (HTG)", region: "El Caribe", zonaHoraria: "UTC-5", flag: "ht", descripcion: "Haití fue la primera república negra del mundo y la primera nación latinoamericana en independizarse en 1804. A pesar de sus enormes desafíos, su cultura, arte, música y la resistencia de su pueblo son verdaderamente inspiradores." },
};

const TEAM_INFO: Record<string, { confederacion: string; entrenador: string; titulos: number; ranking: number; descripcion: string }> = {
  MEX: { confederacion: "CONCACAF", entrenador: "Javier Aguirre", titulos: 0, ranking: 15, descripcion: "El Tri es una de las selecciones más apasionantes de CONCACAF, clasificando a 17 Mundiales consecutivos. En 1970 y 1986 llegaron a cuartos de final como anfitriones. Su generación actual, liderada por Santiago Giménez y Chucky Lozano, busca superar la famosa maldición del quinto partido." },
  USA: { confederacion: "CONCACAF", entrenador: "Mauricio Pochettino", titulos: 0, ranking: 13, descripcion: "La selección de EE.UU. ha crecido enormemente en las últimas décadas. Con Christian Pulisic, Gio Reyna y Weston McKennie formados en los mejores clubes europeos, aspiran a hacer historia como anfitriones en 2026. El fútbol en EE.UU. ha explotado en popularidad gracias a la MLS." },
  CAN: { confederacion: "CONCACAF", entrenador: "Jesse Marsch", titulos: 0, ranking: 48, descripcion: "Canadá vivió su renacimiento futbolístico clasificando a Qatar 2022, su primera participación en 36 años. Alphonso Davies del Bayern Múnich es su estrella máxima. Como co-anfitriones de 2026, tienen la oportunidad perfecta de hacer historia ante su propia afición." },
  ARG: { confederacion: "CONMEBOL", entrenador: "Lionel Scaloni", titulos: 3, ranking: 1, descripcion: "Argentina llega como campeona vigente tras su emotiva victoria en Qatar 2022. Lionel Messi, considerado el mejor jugador de la historia, lidera un equipo que busca el tetracampeonato. Con Lautaro Martínez, Julián Álvarez y Enzo Fernández, son los máximos favoritos del torneo." },
  BRA: { confederacion: "CONMEBOL", entrenador: "Dorival Júnior", titulos: 5, ranking: 5, descripcion: "Brasil es la nación más exitosa del Mundial con 5 títulos. El fútbol es religión en el país de Pelé, Ronaldo y ahora Vinícius Jr. Con Vinícius Jr., Rodrygo y el joven Endrick del Real Madrid, tienen uno de los ataques más emocionantes del mundo." },
  FRA: { confederacion: "UEFA", entrenador: "Didier Deschamps", titulos: 2, ranking: 2, descripcion: "Francia es bicampeona del mundo con uno de los equipos más completos del planeta. Kylian Mbappé es el jugador más caro de la historia. Ganaron en 1998 en casa y en 2018 en Rusia, llegando a la final en Qatar 2022. Su profundidad de plantel es incomparable." },
  ESP: { confederacion: "UEFA", entrenador: "Luis de la Fuente", titulos: 1, ranking: 6, descripcion: "España dominó el fútbol mundial entre 2008 y 2012 ganando dos Eurocopas y el Mundial 2010. Con Lamine Yamal y Pedri tienen una nueva generación brillante. Ganaron la Eurocopa 2024 demostrando que su escuela sigue siendo élite. Rodri ancla su sistema de juego." },
  GER: { confederacion: "UEFA", entrenador: "Julian Nagelsmann", titulos: 4, ranking: 12, descripcion: "Alemania es tetracampeona del mundo. Tras decepciones en 2018 y 2022, buscan volver a su mejor nivel. Jamal Musiala y Florian Wirtz son posiblemente los dos jóvenes más emocionantes de Europa. Como anfitriones de la Euro 2024 mostraron energía renovada." },
  ENG: { confederacion: "UEFA", entrenador: "Gareth Southgate", titulos: 1, ranking: 4, descripcion: "Inglaterra lleva décadas buscando su gloria perdida. Su único título fue en 1966 en casa. Jude Bellingham del Real Madrid es el mediocampista más completo de su generación. Tras dos finales consecutivas de la Eurocopa, su ventana dorada no durará para siempre." },
  POR: { confederacion: "UEFA", entrenador: "Roberto Martínez", titulos: 0, ranking: 7, descripcion: "Portugal cuenta con uno de los planteles más talentosos del mundo. Cristiano Ronaldo lidera el ataque. Bruno Fernandes, Bernardo Silva y Rafael Leão aportan creatividad de clase mundial. Su triunfo en la Euro 2016 demostró que pueden ganar grandes torneos." },
  ITA: { confederacion: "UEFA", entrenador: "Luciano Spalletti", titulos: 4, ranking: 9, descripcion: "Italia es tetracampeona del mundo. Tras no clasificar al Mundial 2018, ganaron la Eurocopa 2020. Con Nicolo Barella, Sandro Tonali y Federico Chiesa, tienen calidad en todo el campo. La sofisticación táctica del fútbol italiano sigue siendo incomparable." },
  NED: { confederacion: "UEFA", entrenador: "Ronald Koeman", titulos: 0, ranking: 8, descripcion: "Los Países Bajos revolucionaron el fútbol con el Fútbol Total en los años 70. Virgil van Dijk es uno de los mejores defensas de la historia. Cody Gakpo, Xavi Simons y Tijjani Reijnders forman una emocionante nueva generación. Llegaron a semis en Qatar 2022." },
  BEL: { confederacion: "UEFA", entrenador: "Domenico Tedesco", titulos: 0, ranking: 3, descripcion: "La generación dorada de Bélgica alcanzó su pico con el tercer lugar en Rusia 2018. Kevin De Bruyne lidera un equipo que ha sido número uno del mundo. Romelu Lukaku es su máximo goleador histórico." },
  JPN: { confederacion: "AFC", entrenador: "Hajime Moriyasu", titulos: 0, ranking: 17, descripcion: "Japón hizo historia en Qatar 2022, derrotando a Alemania y España. Su estilo de presión alta ha ganado respeto global. Wataru Endo en Liverpool, Kaoru Mitoma en Brighton y Takefusa Kubo en la Real Sociedad representan su calidad europea." },
  MAR: { confederacion: "CAF", entrenador: "Walid Regragui", titulos: 0, ranking: 14, descripcion: "Marruecos hizo historia en Qatar 2022 convirtiéndose en el primer equipo africano en llegar a las semifinales. Achraf Hakimi del PSG es uno de los mejores laterales del mundo. Su estilo disciplinado y de contraataque los hace siempre peligrosos." },
  SEN: { confederacion: "CAF", entrenador: "Aliou Cissé", titulos: 0, ranking: 20, descripcion: "Senegal es campeón africano, ganando la AFCON en 2021 y 2023. Sadio Mané lidera un equipo con calidad en todas las líneas. En 2002 llegaron a cuartos de final en su primera participación mundialista." },
  URU: { confederacion: "CONMEBOL", entrenador: "Marcelo Bielsa", titulos: 2, ranking: 19, descripcion: "Uruguay ganó los dos primeros Mundiales en 1930 y 1950. Darwin Núñez del Liverpool es uno de los delanteros más poderosos del juego. Federico Valverde del Real Madrid es un fenómeno de mediocampo. Bajo Marcelo Bielsa juegan un fútbol intenso y atractivo." },
  COL: { confederacion: "CONMEBOL", entrenador: "Néstor Lorenzo", titulos: 0, ranking: 11, descripcion: "El mejor Mundial de Colombia fue Brasil 2014, donde James Rodríguez ganó la Bota de Oro. Luis Díaz del Liverpool es uno de los extremos más emocionantes del mundo. Colombia ganó la Copa América 2024, poniendo fin a 23 años sin títulos." },
  ECU: { confederacion: "CONMEBOL", entrenador: "Sebastián Beccacece", titulos: 0, ranking: 30, descripcion: "Ecuador abrió Qatar 2022 con una victoria impresionante. Moisés Caicedo del Chelsea es uno de los mediocampistas más cotizados del mundo. Piero Hincapié del Bayer Leverkusen es un defensa imponente." },
  PAR: { confederacion: "CONMEBOL", entrenador: "Gustavo Alfaro", titulos: 0, ranking: 55, descripcion: "Paraguay superó las expectativas en Sudáfrica 2010, llegando a cuartos de final. Miguel Almirón del Newcastle llevó el fútbol paraguayo a la atención mundial. Julio Enciso del Brighton es uno de los talentos jóvenes más emocionantes de Sudamérica." },
  KOR: { confederacion: "AFC", entrenador: "Hong Myung-bo", titulos: 0, ranking: 22, descripcion: "Corea del Sur co-organizó el Mundial 2002 y llegó a las semifinales. Son Heung-min del Tottenham es posiblemente el mejor jugador asiático de la historia. Kim Min-jae del Bayern Múnich es un defensa de clase mundial." },
  CRO: { confederacion: "UEFA", entrenador: "Zlatko Dalić", titulos: 0, ranking: 10, descripcion: "Croacia, una nación de solo 4 millones de habitantes, llegó a la final del Mundial 2018 y terminó tercera en 2022. Luka Modrić sigue siendo su corazón. Mateo Kovačić y Joško Gvardiol son jugadores de clase mundial." },
  SRB: { confederacion: "UEFA", entrenador: "Dragan Stojković", titulos: 0, ranking: 33, descripcion: "Serbia cuenta con uno de los ataques más potentes del fútbol mundial con Dušan Vlahović de la Juventus y Aleksandar Mitrović. Tienen calidad para llegar lejos en el torneo." },
  TUR: { confederacion: "UEFA", entrenador: "Vincenzo Montella", titulos: 0, ranking: 28, descripcion: "El mayor logro de Turquía fue el tercer lugar en el Mundial 2002. Hakan Çalhanoğlu del Inter de Milán es uno de los mejores mediocampistas de Europa. Arda Güler del Real Madrid es uno de los talentos jóvenes más emocionantes." },
  IRN: { confederacion: "AFC", entrenador: "Amir Ghalenoei", titulos: 0, ranking: 21, descripcion: "Irán es el clasificador más consistente de Asia al Mundial. Mehdi Taremi del Inter de Milán es su estrella, un delantero técnicamente dotado con excelente registro goleador en la Serie A." },
  KSA: { confederacion: "AFC", entrenador: "Roberto Mancini", titulos: 0, ranking: 58, descripcion: "Arabia Saudita impactó al mundo en Qatar 2022 derrotando a Argentina. Su liga doméstica se ha transformado con las llegadas de Ronaldo, Benzema y otras estrellas globales." },
  AUS: { confederacion: "AFC", entrenador: "Tony Popovic", titulos: 0, ranking: 23, descripcion: "Australia hizo una carrera extraordinaria en Qatar 2022, derrotando a Dinamarca para llegar a octavos. La habilidad individual de Mathew Leckie ante Dinamarca fue uno de los momentos más destacados del torneo." },
  NZL: { confederacion: "OFC", entrenador: "Darren Bazeley", titulos: 0, ranking: 95, descripcion: "Nueva Zelanda es el representante de la OFC. Chris Wood del Nottingham Forest es su delantero talismán con un impresionante registro en la Premier League." },
  CMR: { confederacion: "CAF", entrenador: "Marc Brys", titulos: 0, ranking: 43, descripcion: "Camerún es el equipo africano más exitoso históricamente con cinco títulos de la Copa Africana. André Onana del Manchester United y Bryan Mbeumo del Brentford son sus estrellas actuales." },
  NGA: { confederacion: "CAF", entrenador: "Eric Chelle", titulos: 0, ranking: 39, descripcion: "Nigeria es tricampeona africana. Victor Osimhen del Nápoles es uno de los delanteros más devastadores del mundo. Las Súper Águilas combinan atletismo explosivo con calidad técnica." },
  COD: { confederacion: "CAF", entrenador: "Sébastien Desabre", titulos: 0, ranking: 62, descripcion: "La República Democrática del Congo participó como Zaire en el Mundial de 1974. Silas Wissa del Brentford y Cédric Bakambu aportan calidad europea." },
  ZAF: { confederacion: "CAF", entrenador: "Hugo Broos", titulos: 0, ranking: 66, descripcion: "Sudáfrica organizó el Mundial 2010, el primero en suelo africano. La vuvuzela se convirtió en el sonido distintivo del torneo. Percy Tau es su atacante más talentoso. Bafana Bafana significa 'Los Chicos' en zulú." },
  ALB: { confederacion: "UEFA", entrenador: "Sylvinho", titulos: 0, ranking: 66, descripcion: "Albania realizó su primera aparición mundialista en 2026. Armando Broja del Chelsea y Kristjan Asllani del Inter de Milán representan la calidad de sus jugadores de la diáspora europea." },
  CZE: { confederacion: "UEFA", entrenador: "Ivan Hašek", titulos: 0, ranking: 36, descripcion: "La República Checa tiene una orgullosa tradición futbolística. Patrik Schick del Bayer Leverkusen marcó uno de los goles más espectaculares de la Eurocopa 2020. Tomáš Souček aporta energía incansable en el West Ham." },
  SCO: { confederacion: "UEFA", entrenador: "Steve Clarke", titulos: 0, ranking: 38, descripcion: "Escocia, co-inventora del fútbol, tiene la hinchada visitante más celebrada del mundo: el Ejército Tartán. Andy Robertson del Liverpool es uno de los mejores laterales izquierdos del mundo." },
  BIH: { confederacion: "UEFA", entrenador: "Sergej Barbarez", titulos: 0, ranking: 72, descripcion: "Bosnia y Herzegovina debutó en el Mundial en Brasil 2014. Edin Džeko del Inter de Milán se acerca a 130 goles internacionales. Su apasionada hinchada es una de las más emotivas del fútbol europeo." },
  HAI: { confederacion: "CONCACAF", entrenador: "Marc Collat", titulos: 0, ranking: 83, descripcion: "Haití participó en el Mundial de 1974 y su clasificación para 2026 es un logro extraordinario. Su equipo está formado por la diáspora haitiana en Francia, Canadá y EE.UU. Representan esperanza y resistencia." },
};

// Mapa de código FIFA → código COUNTRY_INFO
const TEAM_TO_COUNTRY: Record<string, string> = {
  MEX: "MX", USA: "US", CAN: "CA", ARG: "AR", BRA: "BR", FRA: "FR", ESP: "ES",
  GER: "DE", ENG: "GB", POR: "PT", ITA: "IT", NED: "NL", BEL: "BE", JPN: "JP",
  MAR: "MA", SEN: "SN", URU: "UY", COL: "CO", ECU: "EC", PAR: "PY", KOR: "KR",
  CRO: "HR", SRB: "RS", TUR: "TR", IRN: "IR", KSA: "SA", AUS: "AU", NZL: "NZ",
  CMR: "CM", NGA: "NG", COD: "CD", ZAF: "ZA", ALB: "AL", CZE: "CZ", SCO: "GB_SCT",
  BIH: "BA", HAI: "HT",
};

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

const C = {
  bg: "#050d1a", card: "#0a1628", surface: "#0f1f35", surfaceAlt: "#152843",
  border: "#1a3050", red: "#e63946", redBright: "#ff4d5a", redGlow: "rgba(230,57,70,0.3)",
  blue: "#1d3557", blueBright: "#457b9d", green: "#2d6a4f", greenBright: "#52b788",
  white: "#f1faee", gray: "#7a8fa6", grayLight: "#a8b8c8", grayDark: "#2d4060",
};

const POS_LABEL: Record<string, string> = { POR: "Portero", DEF: "Defensa", MED: "Mediocampista", DEL: "Delantero" };
const POS_COLOR: Record<string, string> = { POR: "#b45309", DEF: "#1d4ed8", MED: "#2d6a4f", DEL: "#e63946" };

function getPlayerPhoto(name: string): string {
  return `https://en.wikipedia.org/wiki/Special:Redirect/file/${encodeURIComponent(name.replace(/ /g, "_"))}.jpg`;
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
    </div>
  );
}

// ── TAB CLIMA ─────────────────────────────────────────────────────
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

  const dias = ["Hoy", "Mañana", "Pasado"];

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
          <div style={{ background: `linear-gradient(135deg, ${C.blue}, #1a4a7a)`, borderRadius: 16, padding: "24px", marginBottom: 16, border: `1px solid ${C.blueBright}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.15 }}>{weatherIcon(weather.current.weather_code)}</div>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {weather.daily.temperature_2m_max.slice(0, 3).map((_: number, i: number) => (
              <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "14px 12px", textAlign: "center", border: `1px solid ${C.border}` }}>
                <p style={{ color: C.gray, fontSize: 11, margin: "0 0 6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{dias[i]}</p>
                <div style={{ fontSize: 28, margin: "4px 0" }}>{weatherIcon(weather.daily?.weathercode?.[i] ?? 0)}</div>
                <p style={{ color: C.white, fontWeight: 800, fontSize: 14, margin: "4px 0 2px" }}>{Math.round(weather.daily.temperature_2m_max[i])}°</p>
                <p style={{ color: C.gray, fontSize: 11, margin: "0 0 6px" }}>{Math.round(weather.daily.temperature_2m_min[i])}° mín</p>
                <div style={{ background: "rgba(69,123,157,0.3)", borderRadius: 6, padding: "2px 6px", display: "inline-block" }}>
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

// ── TAB SELECCIONES (ESTÁTICO) ────────────────────────────────────
function TeamsTab({ match }: { match: Match }) {
  const [lado, setLado] = useState<"A" | "B">("A");
  const codigo = lado === "A" ? match.teamA : match.teamB;
  const nombre = lado === "A" ? match.teamAName : match.teamBName;
  const info = TEAM_INFO[codigo];

  return (
    <div style={{ padding: "16px 20px 28px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["A", "B"] as const).map(s => {
          const c = s === "A" ? match.teamA : match.teamB;
          const n = s === "A" ? match.teamAName : match.teamBName;
          const activo = lado === s;
          return (
            <button key={s} onClick={() => setLado(s)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 13, background: activo ? C.red : C.surface, color: activo ? C.white : C.gray, border: activo ? `1px solid ${C.red}` : `1px solid ${C.border}`, boxShadow: activo ? `0 0 20px ${C.redGlow}` : "none", transition: "all 0.2s" }}>
              <img src={getFlagUrl(c)} alt={c} style={{ width: 22, height: 15, objectFit: "cover", borderRadius: 3 }} />
              {n}
            </button>
          );
        })}
      </div>
      {!info ? <p style={{ color: C.gray, textAlign: "center", padding: "32px 0" }}>Sin información disponible.</p> : (
        <>
          <div style={{ background: `linear-gradient(135deg, ${C.blue}, #0a2040)`, borderRadius: 14, padding: "20px", marginBottom: 16, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 16 }}>
            <img src={getFlagUrl(codigo)} alt={codigo} style={{ width: 64, height: 43, objectFit: "cover", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.5)", border: `2px solid ${C.white}` }} />
            <div>
              <h3 style={{ color: C.white, fontWeight: 900, fontSize: 20, margin: 0 }}>{nombre}</h3>
              <p style={{ color: C.gray, fontSize: 13, margin: "4px 0 0" }}>{info.confederacion} · Entrenador: {info.entrenador}</p>
            </div>
            {info.titulos > 0 && (
              <div style={{ marginLeft: "auto", textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>🏆</div>
                <p style={{ color: C.redBright, fontWeight: 900, fontSize: 20, margin: 0 }}>{info.titulos}</p>
                <p style={{ color: C.gray, fontSize: 10, margin: 0, textTransform: "uppercase" }}>Títulos</p>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { icon: "🌍", label: "Ranking FIFA", value: `#${info.ranking}` },
              { icon: "🏅", label: "Confederación", value: info.confederacion },
              { icon: "👥", label: "Convocados", value: `${(squads[codigo] ?? []).length} jugadores` },
              { icon: "🏆", label: "Títulos mundiales", value: info.titulos === 0 ? "Ninguno" : `${info.titulos}` },
            ].map((stat, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 10, padding: "12px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{stat.icon}</span>
                <div>
                  <p style={{ color: C.gray, fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</p>
                  <p style={{ color: C.white, fontWeight: 700, fontSize: 13, margin: "2px 0 0" }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: C.surface, borderRadius: 12, padding: "16px", border: `1px solid ${C.border}` }}>
            <p style={{ color: C.greenBright, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 10px" }}>── Sobre el equipo</p>
            <p style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{info.descripcion}</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── TAB ESTADIO (ESTÁTICO) ────────────────────────────────────────
function StadiumTab({ match }: { match: Match }) {
  const estadio = STADIUM_INFO[match.venueName];
  const imgFallback = VENUE_IMAGES[match.venueName] ?? DEFAULT_STADIUM;
  return (
    <div style={{ padding: "20px 20px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, background: C.blueBright, borderRadius: 2 }} />
        <span style={{ color: C.white, fontWeight: 800, fontSize: 15 }}>{match.venueName}</span>
      </div>
      <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16, height: 180, position: "relative" }}>
        <img src={imgFallback} alt={match.venueName} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,0.9), transparent)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 14 }}>
          <h3 style={{ color: C.white, fontWeight: 900, fontSize: 18, margin: 0 }}>{match.venueName}</h3>
          <p style={{ color: C.gray, fontSize: 12, margin: "3px 0 0" }}>📍 {match.city}</p>
        </div>
      </div>
      {estadio && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { icon: "👥", label: "Capacidad", value: estadio.capacidad.toLocaleString() + " esp." },
            { icon: "📅", label: "Inaugurado", value: estadio.inaugurado.toString() },
            { icon: "🌱", label: "Superficie", value: estadio.superficie },
            { icon: "🌎", label: "País anfitrión", value: hostCountryName[match.country] ?? getCountryName(match.country) },
          ].map((stat, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, padding: "12px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{stat.icon}</span>
              <div>
                <p style={{ color: C.gray, fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</p>
                <p style={{ color: C.white, fontWeight: 700, fontSize: 13, margin: "2px 0 0" }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ icon: "📅", text: `${match.date} · ${match.timeLocal}` }, { icon: "📍", text: match.city }]
          .map((item, i) => <span key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 12px", color: C.grayLight, fontSize: 12 }}>{item.icon} {item.text}</span>)}
      </div>
      {estadio && (
        <div style={{ background: C.surface, borderRadius: 12, padding: "16px", border: `1px solid ${C.border}` }}>
          <p style={{ color: C.blueBright, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 10px" }}>── Sobre el estadio</p>
          <p style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{estadio.descripcion}</p>
        </div>
      )}
    </div>
  );
}

// ── TAB PAÍS (ESTÁTICO CON COMPARACIÓN) ──────────────────────────
function CountryTab({ match }: { match: Match }) {
  const codigoPaisA = TEAM_TO_COUNTRY[match.teamA];
  const codigoPaisB = TEAM_TO_COUNTRY[match.teamB];
  const datosA = codigoPaisA ? COUNTRY_INFO[codigoPaisA] : undefined;
  const datosB = codigoPaisB ? COUNTRY_INFO[codigoPaisB] : undefined;
  const paisSede = COUNTRY_INFO[match.country];
  const nombreSede = hostCountryName[match.country] ?? getCountryName(match.country);

  const filas: Array<[string, string, string]> = [
    ["Población", datosA?.poblacion ?? "N/A", datosB?.poblacion ?? "N/A"],
    ["Capital", datosA?.capital ?? "N/A", datosB?.capital ?? "N/A"],
    ["Región", datosA?.region ?? "N/A", datosB?.region ?? "N/A"],
    ["Idioma", datosA?.idioma ?? "N/A", datosB?.idioma ?? "N/A"],
    ["Moneda", datosA?.moneda ?? "N/A", datosB?.moneda ?? "N/A"],
    ["Zona horaria", datosA?.zonaHoraria ?? "N/A", datosB?.zonaHoraria ?? "N/A"],
  ];

  return (
    <div style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* FICHAS */}
      <p style={{ color: C.greenBright, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>── Fichas de país</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ code: match.teamA, name: match.teamAName, info: datosA }, { code: match.teamB, name: match.teamBName, info: datosB }].map(({ code, name, info }) => (
          <div key={code} style={{ background: C.surface, borderRadius: 12, padding: "14px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <img src={getFlagUrl(code)} alt={name} style={{ width: 32, height: 21, objectFit: "cover", borderRadius: 4, border: `1px solid ${C.border}` }} />
              <div>
                <p style={{ color: C.white, fontWeight: 800, fontSize: 13, margin: 0 }}>{name}</p>
                {info && <p style={{ color: C.gray, fontSize: 11, margin: 0 }}>{info.nombre}</p>}
              </div>
            </div>
            {info ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[["Capital", info.capital], ["Región", info.region], ["Idioma", info.idioma], ["Moneda", info.moneda], ["Población", info.poblacion], ["Zona horaria", info.zonaHoraria]].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: C.gray }}>{label}</span>
                    <span style={{ color: C.grayLight, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: C.gray, fontSize: 12, margin: 0, fontStyle: "italic" }}>Información no disponible</p>
            )}
          </div>
        ))}
      </div>

      {/* COMPARACIÓN */}
      <p style={{ color: C.blueBright, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>── Comparación de selecciones</p>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th style={{ textAlign: "left", padding: "4px 0", fontWeight: 800, color: C.white }}>{match.teamAName}</th>
              <th style={{ textAlign: "center", padding: "4px 0", fontWeight: 700, color: C.grayDark, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Indicador</th>
              <th style={{ textAlign: "right", padding: "4px 0", fontWeight: 800, color: C.white }}>{match.teamBName}</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(([label, valA, valB]) => (
              <tr key={label} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "6px 0", color: C.grayLight, textAlign: "left" }}>{valA}</td>
                <td style={{ padding: "6px 0", color: C.gray, textAlign: "center", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{label}</td>
                <td style={{ padding: "6px 0", color: C.grayLight, textAlign: "right" }}>{valB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAÍS SEDE */}
      {paisSede && (
        <>
          <p style={{ color: C.greenBright, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>── País anfitrión del partido</p>
          <div style={{ background: C.surface, borderRadius: 12, padding: "16px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <img src={`https://flagcdn.com/w40/${paisSede.flag}.png`} alt={paisSede.nombre} style={{ width: 36, height: 24, objectFit: "cover", borderRadius: 4, border: `1px solid ${C.border}` }} />
              <p style={{ color: C.white, fontWeight: 800, fontSize: 15, margin: 0 }}>{nombreSede}</p>
            </div>
            <p style={{ color: C.grayLight, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{paisSede.descripcion}</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── TAB RESUMEN ───────────────────────────────────────────────────
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
  const [equipoTab, setEquipoTab] = useState<"A" | "B">("A");
  const codigoEquipo = equipoTab === "A" ? match.teamA : match.teamB;
  const nombreEquipo = equipoTab === "A" ? match.teamAName : match.teamBName;
  const jugadores = squads[codigoEquipo] ?? [];
  const porPos: Record<string, typeof jugadores> = { POR: [], DEF: [], MED: [], DEL: [] };
  jugadores.forEach(p => { (porPos[p.pos] ?? porPos["DEL"]).push(p); });

  return (
    <div style={{ padding: "16px 20px 28px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["A", "B"] as const).map(s => {
          const code = s === "A" ? match.teamA : match.teamB;
          const name = s === "A" ? match.teamAName : match.teamBName;
          const activo = equipoTab === s;
          return (
            <button key={s} onClick={() => setEquipoTab(s)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 13, background: activo ? C.red : C.surface, color: activo ? C.white : C.gray, border: activo ? `1px solid ${C.red}` : `1px solid ${C.border}`, boxShadow: activo ? `0 0 20px ${C.redGlow}` : "none", transition: "all 0.2s" }}>
              <img src={getFlagUrl(code)} alt={code} style={{ width: 22, height: 15, objectFit: "cover", borderRadius: 3 }} />
              {name}
              <span style={{ background: activo ? "rgba(255,255,255,0.2)" : C.grayDark, borderRadius: 6, padding: "1px 7px", fontSize: 11 }}>{(squads[code] ?? []).length}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
        <img src={getFlagUrl(codigoEquipo)} alt={codigoEquipo} style={{ width: 32, height: 21, objectFit: "cover", borderRadius: 4 }} />
        <span style={{ color: C.white, fontWeight: 800, fontSize: 15 }}>Convocados — {nombreEquipo}</span>
        <span style={{ marginLeft: "auto", color: C.gray, fontSize: 12, background: C.surface, padding: "2px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>{jugadores.length} jugadores</span>
      </div>
      <p style={{ color: C.grayDark, fontSize: 11, margin: "0 0 16px", fontStyle: "italic" }}>Haz clic en un jugador para ver su perfil</p>
      {jugadores.length === 0
        ? <p style={{ color: C.gray, textAlign: "center", padding: "32px 0" }}>Sin datos disponibles.</p>
        : Object.entries(porPos).map(([pos, lista]) =>
          lista.length === 0 ? null : (
            <div key={pos} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 3, height: 16, background: POS_COLOR[pos] ?? C.red, borderRadius: 2 }} />
                <span style={{ color: C.white, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{POS_LABEL[pos] ?? pos}s</span>
                <span style={{ color: C.grayDark, fontSize: 12 }}>· {lista.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {lista.map(p => <TarjetaJugador key={p.name} p={p} />)}
              </div>
            </div>
          )
        )}
    </div>
  );
}

// ── MODAL JUGADOR ─────────────────────────────────────────────────
function ModalJugador({ p, onClose }: { p: { name: string; club: string; age: number; pos: string }; onClose: () => void }) {
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
function TarjetaJugador({ p }: { p: { name: string; club: string; age: number; pos: string } }) {
  const [imgOk, setImgOk] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <>
      {mostrarModal && <ModalJugador p={p} onClose={() => setMostrarModal(false)} />}
      <div onClick={() => setMostrarModal(true)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
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
function ModalPartido({ match, onClose }: { match: Match; onClose: () => void }) {
  const [tab, setTab] = useState<"resumen" | "convocados" | "selecciones" | "estadio">("resumen");
  const venueImg = VENUE_IMAGES[match.venueName] ?? DEFAULT_STADIUM;
  const estado = getMatchStatus(match.date, match.timeLocal);

  const TABS = [
    { key: "resumen", label: "📊", titulo: "Resumen" },
    { key: "convocados", label: "👥", titulo: "Convocados" },
    { key: "selecciones", label: "🏴", titulo: "Selecciones" },
    { key: "estadio", label: "🏟️", titulo: "Estadio" },
  ] as const;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,5,0.94)", backdropFilter: "blur(10px)" }}
      onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 720, borderRadius: 22, overflow: "hidden", boxShadow: `0 0 100px rgba(230,57,70,0.2), 0 30px 80px rgba(0,0,0,0.9)`, maxHeight: "92vh", overflowY: "auto", background: C.card, border: `1px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.red} 0%, ${C.blueBright} 50%, ${C.greenBright} 100%)` }} />
        <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
          <img src={venueImg} alt={match.venueName} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35) saturate(0.6)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,13,26,0.1), rgba(5,13,26,0.98))" }} />
          <div style={{ position: "absolute", top: 14, left: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 14px", borderRadius: 6, color: "white", letterSpacing: 2, textTransform: "uppercase", background: estado === "Próximo" ? C.blue : estado === "En curso" ? C.green : C.red }}>{estado}</span>
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "rgba(0,0,0,0.6)", border: `1px solid ${C.border}`, color: C.white, borderRadius: 8, width: 34, height: 34, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 32 }}>
            <div style={{ textAlign: "center" }}>
              <img src={getFlagUrl(match.teamA)} alt={match.teamA} style={{ width: 58, height: 39, objectFit: "cover", borderRadius: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.8)", border: `2px solid ${C.red}` }} />
              <p style={{ color: C.white, fontWeight: 800, fontSize: 13, margin: "7px 0 0" }}>{match.teamAName}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: C.redBright, fontWeight: 900, fontSize: 28, letterSpacing: 3, textShadow: `0 0 30px ${C.red}` }}>VS</div>
              <p style={{ color: C.gray, fontSize: 10, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: 2 }}>Grupo {match.group}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <img src={getFlagUrl(match.teamB)} alt={match.teamB} style={{ width: 58, height: 39, objectFit: "cover", borderRadius: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.8)", border: `2px solid ${C.red}` }} />
              <p style={{ color: C.white, fontWeight: 800, fontSize: 13, margin: "7px 0 0" }}>{match.teamBName}</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "12px 6px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: tab === t.key ? C.card : "transparent", color: tab === t.key ? C.white : C.gray, borderBottom: tab === t.key ? `3px solid ${C.red}` : "3px solid transparent", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 16 }}>{t.label}</span>
              <span style={{ fontSize: 10, letterSpacing: 0.5 }}>{t.titulo}</span>
            </button>
          ))}
        </div>
        {tab === "resumen" && <SummaryTab match={match} />}
        {tab === "convocados" && <SquadTab match={match} />}
        {tab === "selecciones" && <TeamsTab match={match} />}
        {tab === "estadio" && <StadiumTab match={match} />}
      </div>
    </div>
  );
}

// ── DASHBOARD PRINCIPAL ───────────────────────────────────────────
const ALL_GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const ALL_COUNTRIES = ["US","MX","CA"];

export default function Dashboard() {
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<Match | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroPais, setFiltroPais] = useState("Todos");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroSede, setFiltroSede] = useState("Todas");
  const [filtroEquipo, setFiltroEquipo] = useState("Todas");
  const [filtroJornada, setFiltroJornada] = useState("Todas");

  const jornadaMap = useMemo(() => buildJornadaMap(matches as Match[]), []);
  const sedes = useMemo(() => ["Todas", ...Array.from(new Set((matches as Match[]).map(m => m.venueName)))], []);
  const equipos = useMemo(() => {
    const t = (matches as Match[]).flatMap(m => [{ code: m.teamA, name: m.teamAName }, { code: m.teamB, name: m.teamBName }]);
    const unique = new Map(t.map(x => [x.code, x.name]));
    return [{ code: "Todas", name: "Todas las selecciones" }, ...Array.from(unique.entries()).map(([code, name]) => ({ code, name }))];
  }, []);

  const filtrados = useMemo(() => (matches as Match[]).filter(m => {
    const estado = getMatchStatus(m.date, m.timeLocal);
    const jornada = jornadaMap[m.matchId];
    return (
      (busqueda === "" || m.teamAName.toLowerCase().includes(busqueda.toLowerCase()) || m.teamBName.toLowerCase().includes(busqueda.toLowerCase()) || m.venueName.toLowerCase().includes(busqueda.toLowerCase())) &&
      (filtroGrupo === "Todos" || m.group === filtroGrupo) &&
      (filtroEstado === "Todos" || estado === filtroEstado) &&
      (filtroPais === "Todos" || m.country === filtroPais) &&
      (filtroFecha === "" || m.date === filtroFecha) &&
      (filtroSede === "Todas" || m.venueName === filtroSede) &&
      (filtroEquipo === "Todas" || m.teamA === filtroEquipo || m.teamB === filtroEquipo) &&
      (filtroJornada === "Todas" || String(jornada) === filtroJornada)
    );
  }), [busqueda, filtroGrupo, filtroEstado, filtroPais, filtroFecha, filtroSede, filtroEquipo, filtroJornada, jornadaMap]);

  const totalPartidos = (matches as Match[]).length;
  const finalizados = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "Finalizado").length;
  const proximos = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "Próximo").length;
  const enCurso = (matches as Match[]).filter(m => getMatchStatus(m.date, m.timeLocal) === "En curso").length;

  const sel: React.CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`, color: C.grayLight,
    borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {partidoSeleccionado && <ModalPartido match={partidoSeleccionado} onClose={() => setPartidoSeleccionado(null)} />}

      <div style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 50%, rgba(230,57,70,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 50%, rgba(29,53,87,0.25) 0%, transparent 55%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 36px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 36, background: `linear-gradient(to bottom, ${C.red}, ${C.blueBright})`, borderRadius: 2 }} />
                <div>
                  <p style={{ color: C.red, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 4, margin: 0 }}>Copa Mundial FIFA</p>
                  <h1 style={{ fontSize: "clamp(28px,4vw,54px)", fontWeight: 900, margin: "2px 0 0", lineHeight: 1, color: C.white, letterSpacing: -1 }}>
                    2026 <span style={{ color: C.blueBright }}>Fase de</span> <span style={{ color: C.greenBright }}>Grupos</span>
                  </h1>
                </div>
              </div>
              <p style={{ color: C.gray, fontSize: 14, margin: "0 0 0 12px" }}>EE.UU. 🇺🇸 · México 🇲🇽 · Canadá 🇨🇦 · 16 sedes · 48 selecciones</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <AnimCounter target={totalPartidos} label="Partidos" icon="⚽" />
              <AnimCounter target={finalizados} label="Finalizados" icon="✅" />
              <AnimCounter target={proximos} label="Próximos" icon="🔜" />
              <AnimCounter target={enCurso} label="En curso" icon="🔴" />
            </div>
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.red}, ${C.blueBright}, ${C.greenBright})` }} />
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ background: C.card, borderRadius: 14, padding: "20px 22px", marginBottom: 28, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 800, color: C.white, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.blueBright }}>▍</span> Filtrar partidos
            </span>
            <button onClick={() => { setBusqueda(""); setFiltroGrupo("Todos"); setFiltroEstado("Todos"); setFiltroPais("Todos"); setFiltroFecha(""); setFiltroSede("Todas"); setFiltroEquipo("Todas"); setFiltroJornada("Todas"); }}
              style={{ background: "none", border: `1px solid ${C.border}`, color: C.gray, cursor: "pointer", fontSize: 12, padding: "4px 12px", borderRadius: 6 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.white; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.gray; }}>
              Limpiar ✕
            </button>
          </div>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.gray }}>🔍</span>
            <input type="text" placeholder="Buscar equipo o sede..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{ ...sel, width: "100%", boxSizing: "border-box", paddingLeft: 38, paddingTop: 11, paddingBottom: 11 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 8 }}>
            <select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)} style={sel}>
              <option value="Todos">Grupo: Todos</option>
              {ALL_GROUPS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
            </select>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={sel}>
              <option value="Todos">Estado: Todos</option>
              <option value="Próximo">Próximo</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <select value={filtroEquipo} onChange={e => setFiltroEquipo(e.target.value)} style={sel}>
              {equipos.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
            </select>
            <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} style={sel} />
            <select value={filtroPais} onChange={e => setFiltroPais(e.target.value)} style={sel}>
              <option value="Todos">País: Todos</option>
              {ALL_COUNTRIES.map(c => <option key={c} value={c}>{getCountryName(c)}</option>)}
            </select>
            <select value={filtroSede} onChange={e => setFiltroSede(e.target.value)} style={sel}>
              {sedes.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select value={filtroJornada} onChange={e => setFiltroJornada(e.target.value)} style={sel}>
              <option value="Todas">Jornada: Todas</option>
              <option value="1">Jornada 1</option>
              <option value="2">Jornada 2</option>
              <option value="3">Jornada 3</option>
            </select>
          </div>
        </div>

        <div style={{ color: C.gray, fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: C.red, borderRadius: 6, padding: "2px 10px", color: C.white, fontWeight: 900 }}>{filtrados.length}</span>
          <span>partidos encontrados</span>
          {filtrados.length !== totalPartidos && <span style={{ color: C.grayDark, fontSize: 12 }}>· de {totalPartidos} totales</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {filtrados.map(m => {
            const estado = getMatchStatus(m.date, m.timeLocal);
            const imgSede = VENUE_IMAGES[m.venueName] ?? DEFAULT_STADIUM;
            return (
              <div key={m.matchId}
                style={{ background: C.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 48px ${C.redGlow}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ position: "relative", height: 115, overflow: "hidden" }}>
                  <img src={imgSede} alt={m.venueName} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.7)" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.style.background = C.blue; }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,13,26,0.1), rgba(5,13,26,0.92))" }} />
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: estado === "En curso" ? C.greenBright : estado === "Próximo" ? C.blueBright : C.red }} />
                  <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: C.white, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>Grupo {m.group} · J{jornadaMap[m.matchId]}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, padding: "3px 9px", borderRadius: 5, color: "white", textTransform: "uppercase", background: estado === "Próximo" ? C.blue : estado === "En curso" ? C.green : C.red }}>{estado}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 7, left: 10 }}>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, margin: 0 }}>🏟️ {m.venueName}</p>
                  </div>
                </div>
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
                  <button onClick={() => setPartidoSeleccionado(m)}
                    style={{ width: "100%", padding: "10px 0", background: `linear-gradient(135deg, ${C.red}, #a01020)`, border: "none", borderRadius: 10, color: C.white, fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textTransform: "uppercase", letterSpacing: 0.5, boxShadow: `0 4px 20px ${C.redGlow}`, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.redBright}, ${C.red})`; e.currentTarget.style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.red}, #a01020)`; e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    ⚽ Ver info del partido
                  </button>
                </div>
              </div>
            );
          })}
          {filtrados.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: C.grayDark, padding: "80px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 15, margin: 0 }}>No se encontraron partidos.</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, padding: "22px 24px", marginTop: 48, textAlign: "center", color: C.grayDark, fontSize: 12 }}>
        <span style={{ color: C.red, fontWeight: 800 }}>Copa Mundial FIFA</span> 2026 · <span style={{ color: C.blueBright }}>EE.UU.</span> 🇺🇸 · <span style={{ color: C.greenBright }}>México</span> 🇲🇽 · <span style={{ color: C.white }}>Canadá</span> 🇨🇦
      </div>
    </div>
  );
}