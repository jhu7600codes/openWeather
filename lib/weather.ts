import { WeatherData, DayForecast, HourlyPoint } from '@/types/weather';

export function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Thunderstorm w/ hail',
  };
  return map[code] ?? 'Unknown';
}

export function getWeatherEmoji(code: number, isDay = 1): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '🌙';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

export function windDirLabel(deg: number): string {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function windStrength(kmh: number): string {
  if (kmh < 12) return 'Light';
  if (kmh < 29) return 'Moderate';
  if (kmh < 50) return 'Fresh';
  return 'Strong';
}

export async function fetchWeather(lat: number, lon: number, name: string): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', [
    'temperature_2m','apparent_temperature','weather_code',
    'wind_speed_10m','relative_humidity_2m','is_day'
  ].join(','));
  url.searchParams.set('hourly', [
    'temperature_2m','weather_code','precipitation_probability',
    'wind_speed_10m','relative_humidity_2m','is_day'
  ].join(','));
  url.searchParams.set('daily', [
    'weather_code','temperature_2m_max','temperature_2m_min',
    'precipitation_probability_max','wind_speed_10m_max','wind_direction_10m_dominant',
    'uv_index_max','sunrise','sunset','relative_humidity_2m_mean'
  ].join(','));
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '10');

  const res = await fetch(url.toString());
  const d = await res.json();

  const c = d.current;
  const h = d.hourly;
  const daily = d.daily;

  // build hourly points for next 48h
  const now = new Date();
  const hourlyPoints: HourlyPoint[] = h.time
    .map((t: string, i: number) => ({
      time: t,
      temp: Math.round(h.temperature_2m[i]),
      weatherCode: h.weather_code[i],
      precipProb: h.precipitation_probability[i] ?? 0,
      windSpeed: Math.round(h.wind_speed_10m[i]),
      humidity: h.relative_humidity_2m[i],
      isDay: h.is_day[i],
    }))
    .filter((p: HourlyPoint) => new Date(p.time) >= now)
    .slice(0, 48);

  // build daily forecasts with their hourly slices
  const dailyForecasts: DayForecast[] = daily.time.map((date: string, i: number) => {
    const dayHourly = h.time
      .map((t: string, j: number) => ({
        time: t,
        temp: Math.round(h.temperature_2m[j]),
        weatherCode: h.weather_code[j],
        precipProb: h.precipitation_probability[j] ?? 0,
        windSpeed: Math.round(h.wind_speed_10m[j]),
        humidity: h.relative_humidity_2m[j],
        isDay: h.is_day[j],
      }))
      .filter((p: HourlyPoint) => p.time.startsWith(date));

    const dateObj = new Date(date + 'T12:00:00');
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();
    const dayLabel = isToday
      ? 'Today'
      : dateObj.toLocaleDateString('en', { weekday: 'long' });

    return {
      date,
      dayLabel,
      weatherCode: daily.weather_code[i],
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      precipProb: daily.precipitation_probability_max[i] ?? 0,
      windSpeedMax: Math.round(daily.wind_speed_10m_max[i]),
      windDirection: daily.wind_direction_10m_dominant[i],
      uvIndexMax: daily.uv_index_max[i] ?? 0,
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      humidity: Math.round(daily.relative_humidity_2m_mean?.[i] ?? 0),
      hourly: dayHourly,
    };
  });

  return {
    locationName: name,
    current: {
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      weatherCode: c.weather_code,
      windSpeed: Math.round(c.wind_speed_10m),
      humidity: c.relative_humidity_2m,
      isDay: c.is_day,
    },
    todayHigh: Math.round(daily.temperature_2m_max[0]),
    todayLow: Math.round(daily.temperature_2m_min[0]),
    hourly: hourlyPoints,
    daily: dailyForecasts,
  };
}

export function convertTemp(c: number, unit: 'C' | 'F'): number {
  return unit === 'C' ? c : Math.round(c * 9/5 + 32);
}
