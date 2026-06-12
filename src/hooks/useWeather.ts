import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "../services/weather.service";
import type { WeatherData } from "../services/weather.service";

interface UseWeatherParams {
  latitude: number;
  longitude: number;
  date: string;
  timezone: string;
}

export function useWeather({
  latitude,
  longitude,
  date,
  timezone,
}: UseWeatherParams) {
  return useQuery<WeatherData, Error>({
    queryKey: ["weather", latitude, longitude, date],
    queryFn: () => fetchWeather(latitude, longitude, date, timezone),
    staleTime: 1000 * 60 * 30, // cache 30 minutos
    retry: 2,
  });
}

