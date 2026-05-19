'use client';

import { useState, useRef } from 'react';
import { WeatherData, DayForecast } from '@/types/weather';
import { getWeatherDescription, getWeatherEmoji, convertTemp } from '@/lib/weather';
import SceneBanner from './SceneBanner';

interface Props {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  unit: 'C' | 'F';
  locationName: string;
  manualMode: boolean;
  onUnitToggle: () => void;
  onSearch: (q: string) => void;
  onDaySelect: (day: DayForecast) => void;
  onRetry: () => void;
}

export default function MainView({
  weather, loading, error, unit, locationName,
  manualMode, onUnitToggle, onSearch, onDaySelect, onRetry
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = (c: number) => convertTemp(c, unit);
  const deg = `°${unit}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
      setSearchFocused(false);
      inputRef.current?.blur();
    }
  };

  const formatHourLabel = (timeStr: string) => {
    const d = new Date(timeStr);
    const h = d.getHours();
    const now = new Date();
    if (Math.abs(d.getTime() - now.getTime()) < 3600000) return 'Now';
    return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
  };

  const formatSunTime = (timeStr: string) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    return h < 12 ? `${h}:${m} AM` : `${h === 12 ? 12 : h - 12}:${m} PM`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#1a1f2e' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🌤️</div>
          <div className="text-white opacity-60 text-sm">Loading weather...</div>
        </div>
      </div>
    );
  }

  if (manualMode && !weather) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6" style={{ background: '#1a1f2e' }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">📍</div>
          <p className="text-white opacity-70 mb-6 text-sm">Enter a city to get the weather</p>
          <form onSubmit={handleSearch}>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search city..."
              className="w-full px-4 py-3 rounded-full text-white text-sm outline-none"
              style={{ background: '#2a3050', border: '1px solid #3a4060' }}
              autoFocus
            />
            <button type="submit" className="mt-3 w-full py-3 rounded-full text-white text-sm font-medium"
              style={{ background: '#4a7abf' }}>
              Search
            </button>
          </form>
          <button onClick={onRetry} className="mt-3 text-xs opacity-50 underline text-white">
            Try location again
          </button>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#1a1f2e' }}>
        <div className="text-center px-6">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-white opacity-60 text-sm mb-4">{error ?? 'Something went wrong'}</p>
          <button onClick={onRetry} className="px-6 py-2 rounded-full text-white text-sm"
            style={{ background: '#4a7abf' }}>Retry</button>
        </div>
      </div>
    );
  }

  const { current, daily, hourly, todayHigh, todayLow } = weather;
  const today = daily[0];

  return (
    <div className="fade-in min-h-screen" style={{ background: '#1a1f2e', maxWidth: 480, margin: '0 auto' }}>
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-full"
            style={{ background: searchFocused ? '#2a3050' : '#222840', border: '1px solid #3a4060' }}>
            <span className="text-lg">📍</span>
            <input
              ref={inputRef}
              type="text"
              value={searchFocused ? searchQuery : ''}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => { if (!searchQuery) setSearchFocused(false); }}
              placeholder={locationName}
              className="flex-1 bg-transparent text-white text-sm outline-none"
              style={{ color: 'white' }}
            />
            {!searchFocused && (
              <button type="button" onClick={onUnitToggle}
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ background: '#3a4060', color: '#aac4e8' }}>
                °{unit === 'C' ? 'F' : 'C'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Current weather */}
      <div className="px-5 pt-2">
        <p className="text-sm opacity-60 mb-1">Now</p>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-light" style={{ fontSize: 72, lineHeight: 1 }}>
                {t(current.temp)}
              </span>
              <span className="text-4xl">{getWeatherEmoji(current.weatherCode, current.isDay)}</span>
            </div>
            <p className="text-sm opacity-50 mt-1">
              High: {t(todayHigh)}{deg} · Low: {t(todayLow)}{deg}
            </p>
          </div>
          <div className="text-right mt-2">
            <p className="font-medium text-base">{getWeatherDescription(current.weatherCode)}</p>
            <p className="text-sm opacity-60">Feels like {t(current.feelsLike)}{deg}</p>
            <p className="text-xs opacity-50 mt-1">💨 {current.windSpeed} km/h</p>
          </div>
        </div>
      </div>

      {/* Scene banner */}
      <div className="mt-3">
        <SceneBanner weatherCode={current.weatherCode} isDay={current.isDay} />
      </div>

      {/* Hourly forecast */}
      <div className="px-4 mt-4">
        <p className="text-sm font-medium opacity-70 mb-2">Hourly forecast</p>
        <div className="hourly-scroll">
          <div className="flex gap-0 rounded-2xl overflow-hidden" style={{ background: '#222840', minWidth: 'max-content' }}>
            {hourly.slice(0, 24).map((h, i) => (
              <div key={i} className="flex flex-col items-center py-3 px-3 min-w-[56px]"
                style={{ borderRight: i < 23 ? '1px solid #2a3050' : 'none' }}>
                <span className="text-sm font-medium">{t(h.temp)}{deg}</span>
                {h.precipProb >= 20 && (
                  <span className="text-xs mt-0.5" style={{ color: '#6ab0e8' }}>{h.precipProb}%</span>
                )}
                <span className="text-xl my-1">{getWeatherEmoji(h.weatherCode, h.isDay)}</span>
                <span className="text-xs opacity-50">{formatHourLabel(h.time)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 10-day forecast */}
      <div className="px-4 mt-5 pb-8">
        <p className="text-sm font-medium opacity-70 mb-2">10-day forecast</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: '#222840' }}>
          {daily.map((day, i) => (
            <button key={i} onClick={() => onDaySelect(day)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ borderBottom: i < daily.length - 1 ? '1px solid #2a3050' : 'none' }}>
              <span className="text-sm w-20">{day.dayLabel}</span>
              <div className="flex items-center gap-1">
                {day.precipProb >= 20 && (
                  <span className="text-xs mr-1" style={{ color: '#6ab0e8' }}>{day.precipProb}%</span>
                )}
                <span className="text-xl">{getWeatherEmoji(day.weatherCode, 1)}</span>
              </div>
              <span className="text-sm" style={{ color: '#aac4e8' }}>
                {t(day.tempMax)}{deg}/{t(day.tempMin)}{deg}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
