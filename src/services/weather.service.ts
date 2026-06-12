const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export interface WeatherData {
  tempMax: number;
  tempMin: number;
  rainProbability: number;
  windSpeed: number;
  weatherCode: number;
  humidity: number;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  date: string,
  timezone: string
): Promise<WeatherData> {
  const url =
    `${BASE_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,` +
    `windspeed_10m_max,weathercode` +
    `&hourly=relativehumidity_2m` +
    `&timezone=${encodeURIComponent(timezone)}` +
    `&start_date=${date}&end_date=${date}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener datos del clima");

  const data = await res.json();

  const humidityArr: number[] = data.hourly?.relativehumidity_2m ?? [];
  const avgHumidity =
    humidityArr.length > 0
      ? Math.round(
          humidityArr.reduce((a: number, b: number) => a + b, 0) /
            humidityArr.length
        )
      : 0;

  return {
    tempMax: data.daily.temperature_2m_max[0],
    tempMin: data.daily.temperature_2m_min[0],
    rainProbability: data.daily.precipitation_probability_max[0],
    windSpeed: data.daily.windspeed_10m_max[0],
    weatherCode: data.daily.weathercode[0],
    humidity: avgHumidity,
  };
}

export function getWeatherRecommendation(weather: WeatherData): string {
  if (weather.rainProbability >= 70 && weather.windSpeed > 40) {
    return "Condiciones adversas";
  }
  if (weather.rainProbability >= 40) {
    return "Posible lluvia durante el partido";
  }
  if (weather.tempMax >= 30) {
    return "Temperatura alta — condiciones exigentes";
  }
  return "Clima favorable para el partido";
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return "Soleado";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Niebla";
  if (code <= 67) return "Lluvia";
  if (code <= 77) return "Nieve";
  if (code <= 82) return "Chubascos";
  if (code <= 99) return "Tormenta";
  return "Clima variable";
}
