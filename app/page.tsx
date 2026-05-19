'use client';

import { useState, useEffect, useCallback } from 'react';
import MainView from '@/components/MainView';
import DayDetailView from '@/components/DayDetailView';
import { WeatherData, DayForecast } from '@/types/weather';
import { fetchWeather } from '@/lib/weather';

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [selectedDay, setSelectedDay] = useState<DayForecast | null>(null);
  const [locationName, setLocationName] = useState('');
  const [manualMode, setManualMode] = useState(false);

  const loadWeather = useCallback(async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon, name);
      setWeather(data);
      setLocationName(name);
    } catch {
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = useCallback(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      setManualMode(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&count=1`
          );
          const data = await res.json();
          const name = data.results?.[0]
            ? `${data.results[0].name}, ${data.results[0].country_code?.toUpperCase()}`
            : 'Your Location';
          loadWeather(latitude, longitude, name);
        } catch {
          loadWeather(latitude, longitude, 'Your Location');
        }
      },
      () => {
        setManualMode(true);
        setLoading(false);
      }
    );
  }, [loadWeather]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const searchCity = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en`
      );
      const data = await res.json();
      if (data.results?.length) {
        const r = data.results[0];
        const name = `${r.name}, ${r.country_code?.toUpperCase()}`;
        setManualMode(false);
        loadWeather(r.latitude, r.longitude, name);
      } else {
        setError('City not found');
        setLoading(false);
      }
    } catch {
      setError('Search failed');
      setLoading(false);
    }
  };

  if (selectedDay && weather) {
    return (
      <DayDetailView
        day={selectedDay}
        unit={unit}
        onBack={() => setSelectedDay(null)}
      />
    );
  }

  return (
    <MainView
      weather={weather}
      loading={loading}
      error={error}
      unit={unit}
      locationName={locationName}
      manualMode={manualMode}
      onUnitToggle={() => setUnit(u => u === 'C' ? 'F' : 'C')}
      onSearch={searchCity}
      onDaySelect={setSelectedDay}
      onRetry={detectLocation}
    />
  );
}
