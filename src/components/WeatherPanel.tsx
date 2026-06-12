import { useWeather } from "../hooks/useWeather";
import {
  getWeatherRecommendation,
  getWeatherIcon,
} from "../services/weather.service";

interface WeatherPanelProps {
  latitude: number;
  longitude: number;
  date: string;
  timezone: string;
}

export default function WeatherPanel({
  latitude,
  longitude,
  date,
  timezone,
}: WeatherPanelProps) {
  const { data, isLoading, isError } = useWeather({
    latitude,
    longitude,
    date,
    timezone,
  });

  if (isLoading)
    return (
      <div className="bg-gray-800 rounded-xl p-4 text-white text-center">
        Cargando clima...
      </div>
    );

  if (isError || !data)
    return (
      <div className="bg-red-900 rounded-xl p-4 text-white text-center">
        No se pudo obtener el clima para esta sede.
      </div>
    );

  const recommendation = getWeatherRecommendation(data);
  const icon = getWeatherIcon(data.weatherCode);

  const recommendationColor =
    recommendation === "Clima favorable para el partido"
      ? "text-green-400"
      : recommendation === "Temperatura alta — condiciones exigentes"
      ? "text-yellow-400"
      : recommendation === "Posible lluvia durante el partido"
      ? "text-blue-400"
      : "text-red-400";

  return (
    <div className="bg-gray-800 rounded-xl p-5 text-white">
      <h3 className="text-lg font-bold mb-3">Clima de la sede</h3>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-5xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold">{data.tempMax}°C</p>
          <p className="text-gray-400 text-sm">Mín: {data.tempMin}°C</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-gray-700 rounded-lg p-2 text-center">
          <p className="text-gray-400">Lluvia</p>
          <p className="font-semibold">{data.rainProbability}%</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-2 text-center">
          <p className="text-gray-400">Humedad</p>
          <p className="font-semibold">{data.humidity}%</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-2 text-center">
          <p className="text-gray-400">Viento</p>
          <p className="font-semibold">{data.windSpeed} km/h</p>
        </div>
      </div>

      <div className={`font-semibold text-sm ${recommendationColor}`}>
        ⚡ {recommendation}
      </div>
    </div>
  );
}

