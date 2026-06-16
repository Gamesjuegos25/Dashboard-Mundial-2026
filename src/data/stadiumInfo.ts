export interface StadiumInfo {
  name: string;
  city: string;
  country: string;
  capacity: number;
  opened: number;
  surface: string;
  description: string;
  image: string;
}

export const stadiumInfo: Record<string, StadiumInfo> = {
  "Estadio Azteca": {
    name: "Estadio Azteca", city: "Ciudad de México", country: "México",
    capacity: 87523, opened: 1966, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    description: "El Estadio Azteca es el recinto deportivo más icónico de México y uno de los más famosos del mundo. Es el único estadio que ha albergado dos finales de Copa del Mundo (1970 y 1986). Aquí Diego Maradona marcó el 'Gol del Siglo' contra Inglaterra en 1986. Con capacidad para más de 87,000 espectadores, es el estadio más grande de América Latina. Ha sido sede de innumerables partidos históricos y conciertos de talla mundial.",
  },
  "Estadio Akron": {
    name: "Estadio Akron", city: "Guadalajara", country: "México",
    capacity: 49850, opened: 2010, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80",
    description: "El Estadio Akron, también conocido como Estadio Omnilife, es el hogar del Club Deportivo Guadalajara (Chivas). Inaugurado en 2010, cuenta con un diseño arquitectónico moderno y una capacidad de casi 50,000 espectadores. Es considerado uno de los estadios más modernos y cómodos de México. Su diseño permite una excelente visibilidad desde todos los ángulos y una acústica impresionante.",
  },
  "Estadio BBVA": {
    name: "Estadio BBVA", city: "Monterrey", country: "México",
    capacity: 53500, opened: 2015, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1551958219-acbc595b5b22?w=800&q=80",
    description: "El Estadio BBVA es el hogar del Club de Fútbol Monterrey y uno de los estadios más modernos de América Latina. Inaugurado en 2015, tiene una capacidad de 53,500 espectadores y cuenta con tecnología de punta. Su diseño fue inspirado en las montañas que rodean Monterrey. Es considerado uno de los mejores estadios del mundo por su arquitectura, comodidades e instalaciones.",
  },
  "BMO Field": {
    name: "BMO Field", city: "Toronto", country: "Canadá",
    capacity: 30000, opened: 2007, surface: "Césped artificial",
    image: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=800&q=80",
    description: "BMO Field es el estadio principal del Toronto FC en la MLS y de la selección canadiense de fútbol. Inaugurado en 2007 y ampliado en 2016, tiene capacidad para 30,000 espectadores. Está ubicado en Exhibition Place, a orillas del lago Ontario. Para el Mundial 2026 fue renovado para cumplir con los estándares de la FIFA.",
  },
  "BC Place": {
    name: "BC Place", city: "Vancouver", country: "Canadá",
    capacity: 54500, opened: 1983, surface: "Césped artificial",
    image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800&q=80",
    description: "BC Place es el estadio cubierto más grande de Canadá, con capacidad para 54,500 espectadores. Inaugurado en 1983 y completamente renovado en 2011 con un techo retráctil de última generación. Fue sede de los Juegos Olímpicos de Vancouver 2010. Su característica cúpula inflable es reconocible en el horizonte de Vancouver. Es hogar de los Vancouver Whitecaps de la MLS.",
  },
  "SoFi Stadium": {
    name: "SoFi Stadium", city: "Los Ángeles", country: "Estados Unidos",
    capacity: 70240, opened: 2020, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&q=80",
    description: "SoFi Stadium es uno de los estadios más modernos y costosos jamás construidos, con una inversión de 5,500 millones de dólares. Inaugurado en 2020, es el hogar de los Rams y los Chargers de la NFL. Su techo translúcido es una maravilla arquitectónica. Con capacidad para más de 70,000 espectadores, cuenta con la pantalla de video más grande de cualquier estadio deportivo del mundo.",
  },
  "MetLife Stadium": {
    name: "MetLife Stadium", city: "Nueva York/NJ", country: "Estados Unidos",
    capacity: 82500, opened: 2010, surface: "Césped artificial",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    description: "MetLife Stadium es el estadio más grande de la NFL, con capacidad para 82,500 espectadores. Hogar de los Giants y los Jets de Nueva York, fue inaugurado en 2010. Será sede de la Gran Final del Mundial 2026, el partido más importante del torneo. Está ubicado en East Rutherford, Nueva Jersey, a pocos kilómetros de Manhattan. Su ubicación en el área metropolitana más grande de EE.UU. garantiza una atmósfera incomparable.",
  },
  "Gillette Stadium": {
    name: "Gillette Stadium", city: "Boston", country: "Estados Unidos",
    capacity: 65878, opened: 2002, surface: "Césped artificial",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80",
    description: "Gillette Stadium es el hogar de los New England Patriots de la NFL y el New England Revolution de la MLS. Inaugurado en 2002, tiene capacidad para 65,878 espectadores. Está ubicado en Foxborough, Massachusetts, a 45 minutos de Boston. El estadio es conocido por su fiel base de aficionados y su ambiente intimidante para los equipos visitantes.",
  },
  "AT&T Stadium": {
    name: "AT&T Stadium", city: "Dallas", country: "Estados Unidos",
    capacity: 80000, opened: 2009, surface: "Césped artificial",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
    description: "AT&T Stadium, conocido como 'America's Stadium', es el hogar de los Dallas Cowboys de la NFL. Inaugurado en 2009 con una inversión de 1,200 millones de dólares, tiene capacidad para 80,000 espectadores y puede ampliarse hasta 100,000. Cuenta con la mayor pantalla de video colgante del mundo. Su diseño arquitectónico, con un techo retráctil y paredes de vidrio, lo convierte en una obra maestra moderna.",
  },
  "Hard Rock Stadium": {
    name: "Hard Rock Stadium", city: "Miami", country: "Estados Unidos",
    capacity: 64767, opened: 1987, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=800&q=80",
    description: "Hard Rock Stadium es el hogar de los Miami Dolphins de la NFL. Renovado completamente entre 2015 y 2016 con una inversión de 555 millones de dólares, tiene capacidad para 64,767 espectadores. Su estructura de cubierta única protege a los aficionados del sol y la lluvia tropicales de Miami. Ha sido sede del Super Bowl múltiples veces y de la Copa América 2016.",
  },
  "Mercedes-Benz Stadium": {
    name: "Mercedes-Benz Stadium", city: "Atlanta", country: "Estados Unidos",
    capacity: 71000, opened: 2017, surface: "Césped artificial",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80",
    description: "Mercedes-Benz Stadium es considerado uno de los mejores estadios del mundo. Inaugurado en 2017, tiene capacidad para 71,000 espectadores. Su característica cúpula retráctil con forma de iris es una hazaña de ingeniería. Hogar de los Atlanta Falcons de la NFL y Atlanta United de la MLS. Ganó el premio LEED Platino por sus estándares medioambientales. Fue sede del Super Bowl LIII en 2019.",
  },
  "NRG Stadium": {
    name: "NRG Stadium", city: "Houston", country: "Estados Unidos",
    capacity: 72220, opened: 2002, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80",
    description: "NRG Stadium es el hogar de los Houston Texans de la NFL. Inaugurado en 2002, fue el primer estadio de la NFL con techo retráctil. Con capacidad para 72,220 espectadores, ha sido sede de múltiples Super Bowls. Houston es una de las ciudades más diveZAFs de Estados Unidos, con una gran comunidad latina que promete una atmósfera electrizante durante el Mundial.",
  },
  "Lincoln Financial Field": {
    name: "Lincoln Financial Field", city: "Filadelfia", country: "Estados Unidos",
    capacity: 69796, opened: 2003, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    description: "Lincoln Financial Field es el hogar de los Philadelphia Eagles de la NFL. Inaugurado en 2003, tiene capacidad para 69,796 espectadores. Conocido por tener una de las aficiones más apasionadas e intimidantes de la NFL. Filadelfia es una ciudad con rica historia futbolística y una comunidad muy diveZAF. El estadio cuenta con instalaciones de primera clase y excelente visibilidad desde todos los asientos.",
  },
  "Arrowhead Stadium": {
    name: "Arrowhead Stadium", city: "Kansas City", country: "Estados Unidos",
    capacity: 76416, opened: 1972, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&q=80",
    description: "Arrowhead Stadium es el hogar de los Kansas City Chiefs de la NFL y uno de los estadios con mayor nivel de ruido registrado en la historia. Inaugurado en 1972 y renovado en 2010, tiene capacidad para 76,416 espectadores. Ostenta el récord Guinness de estadio más ruidoso del mundo con 142.2 decibeles. Sus aficionados, conocidos como 'Chiefs Kingdom', crean una atmósfera legendaria.",
  },
  "Levi's Stadium": {
    name: "Levi's Stadium", city: "San Francisco", country: "Estados Unidos",
    capacity: 68500, opened: 2014, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
    description: "Levi's Stadium es el hogar de los San Francisco 49ers de la NFL. Inaugurado en 2014 en Santa Clara, Silicon Valley, tiene capacidad para 68,500 espectadores. Es uno de los estadios más sostenibles del mundo, con paneles solares en su techo verde. Está ubicado en el corazón tecnológico del mundo, lo que se refleja en sus instalaciones de última generación.",
  },
  "Camping World Stadium": {
    name: "Camping World Stadium", city: "Orlando", country: "Estados Unidos",
    capacity: 65000, opened: 1936, surface: "Césped natural",
    image: "https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=800&q=80",
    description: "Camping World Stadium es uno de los estadios más históricos de Florida, inaugurado en 1936 y completamente renovado. Con capacidad para 65,000 espectadores, es sede de importantes partidos de fútbol americano universitario y eventos de fútbol. Orlando es una de las ciudades más visitadas del mundo gracias a sus parques temáticos, lo que garantiza una gran afluencia de turistas durante el Mundial.",
  },
  "Lumen Field": {
    name: "Lumen Field", city: "Seattle", country: "Estados Unidos",
    capacity: 69000, opened: 2002, surface: "Césped artificial",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    description: "Lumen Field es el hogar de los Seattle Seahawks de la NFL y el Seattle Sounders de la MLS. Inaugurado en 2002, tiene capacidad para 69,000 espectadores. Es conocido por su increíble acústica que amplifica el ruido de la afición, siendo uno de los más ruidosos de la NFL. Seattle es una ciudad vibrante con una gran comunidad futbolística y los Sounders tienen una de las mejores asistencias de la MLS.",
  },
};