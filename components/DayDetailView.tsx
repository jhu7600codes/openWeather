'use client';

import { useState } from 'react';
import { DayForecast } from '@/types/weather';
import { getWeatherEmoji, convertTemp, windDirLabel, windStrength } from '@/lib/weather';

interface Props {
  day: DayForecast;
  unit: 'C' | 'F';
  onBack: () => void;
}

type Tab = 'precipitation' | 'wind' | 'humidity';

export default function DayDetailView({ day, unit, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('precipitation');
  const t = (c: number) => convertTemp(c, unit);
  const deg = `°${unit}`;

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    return h < 12 ? `${h === 0 ? 12 : h}:${m} AM` : `${h === 12 ? 12 : h - 12}:${m} PM`;
  };

  const formatHour = (timeStr: string) => {
    const d = new Date(timeStr);
    const h = d.getHours();
    return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
  };

  // Wind compass blob
  const WindCompass = () => {
    const angle = day.windDirection;
    const rad = (angle - 90) * Math.PI / 180;
    const cx = 50, cy = 50, r = 30;
    const blobX = cx + r * Math.cos(rad);
    const blobY = cy + r * Math.sin(rad);
    return (
      <svg viewBox="0 0 100 100" width="80" height="80">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#2a3555" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="50" y="10" textAnchor="middle" fill="#8a9ab5" fontSize="9" fontFamily="sans-serif">N</text>
        <ellipse cx={blobX} cy={blobY} rx="16" ry="11"
          transform={`rotate(${angle}, ${blobX}, ${blobY})`}
          fill="#4a9abf" opacity="0.85" />
        <circle cx="50" cy="50" r="3" fill="#6ab0d8" />
      </svg>
    );
  };

  // Humidity bar gauge
  const HumidityGauge = ({ value }: { value: number }) => {
    const pct = Math.max(0, Math.min(100, value));
    const barH = 80;
    const fillH = (pct / 100) * barH;
    return (
      <svg viewBox="0 0 40 100" width="36" height="90">
        <text x="20" y="10" textAnchor="middle" fill="#8a9ab5" fontSize="9" fontFamily="sans-serif">100</text>
        <rect x="12" y="14" width="16" height={barH} rx="8" fill="#2a3555" />
        <rect x="12" y={14 + barH - fillH} width="16" height={fillH} rx="8" fill="#e8a020" />
        {/* arrow marker */}
        <polygon points={`8,${14 + barH - fillH} 12,${14 + barH - fillH - 5} 12,${14 + barH - fillH + 5}`}
          fill="white" />
        <text x="20" y="102" textAnchor="middle" fill="#8a9ab5" fontSize="9" fontFamily="sans-serif">0</text>
      </svg>
    );
  };

  const uvLabel = (uv: number) => {
    if (uv < 3) return { label: 'Low', color: '#4caf50' };
    if (uv < 6) return { label: 'Moderate', color: '#ff9800' };
    if (uv < 8) return { label: 'High', color: '#f44336' };
    return { label: 'Very High', color: '#9c27b0' };
  };

  const uvInfo = uvLabel(day.uvIndexMax);

  const tabData = day.hourly.map(h => ({
    label: formatHour(h.time),
    precipitation: h.precipProb,
    wind: h.windSpeed,
    humidity: h.humidity,
    emoji: getWeatherEmoji(h.weatherCode, h.isDay),
  }));

  const getTabMax = () => {
    if (tab === 'precipitation') return 100;
    if (tab === 'wind') return Math.max(...tabData.map(d => d.wind), 10);
    return 100;
  };

  const getTabValue = (d: typeof tabData[0]) => {
    if (tab === 'precipitation') return d.precipitation;
    if (tab === 'wind') return d.wind;
    return d.humidity;
  };

  const getTabUnit = () => {
    if (tab === 'precipitation') return '%';
    if (tab === 'wind') return ' km/h';
    return '%';
  };

  return (
    <div className="fade-in min-h-screen" style={{ background: '#1a1f2e', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button onClick={onBack} className="text-xl text-white opacity-80">←</button>
        <h1 className="text-lg font-medium">10-day forecast</h1>
      </div>

      {/* Day header */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-60">{day.dayLabel}</p>
          <p className="text-3xl font-light mt-1">
            {t(day.tempMax)}{deg} / {t(day.tempMin)}{deg}
          </p>
        </div>
        <span className="text-5xl">{getWeatherEmoji(day.weatherCode, 1)}</span>
      </div>

      {/* Daily conditions */}
      <div className="px-4">
        <p className="text-sm font-medium opacity-70 mb-3">Daily conditions</p>
        <div className="grid grid-cols-2 gap-3">

          {/* Max wind */}
          <div className="rounded-2xl p-4" style={{ background: '#222840' }}>
            <p className="text-xs opacity-60 mb-2">Max wind</p>
            <WindCompass />
            <p className="text-xl font-medium mt-2">{day.windSpeedMax} <span className="text-sm font-normal opacity-70">km/h</span></p>
            <p className="text-xs opacity-50 mt-0.5">
              {windStrength(day.windSpeedMax)} · From {windDirLabel(day.windDirection)}
            </p>
          </div>

          {/* Humidity */}
          <div className="rounded-2xl p-4" style={{ background: '#222840' }}>
            <p className="text-xs opacity-60 mb-2">Average humidity</p>
            <div className="flex items-center gap-3">
              <HumidityGauge value={day.humidity} />
              <p className="text-3xl font-medium">{day.humidity}<span className="text-base opacity-70">%</span></p>
            </div>
          </div>

          {/* UV Index */}
          <div className="rounded-2xl p-4" style={{ background: '#222840' }}>
            <p className="text-xs opacity-60 mb-2">Max UV Index</p>
            {day.uvIndexMax > 0 ? (
              <>
                <p className="text-3xl font-medium mt-3">{day.uvIndexMax.toFixed(1)}</p>
                <p className="text-sm mt-1" style={{ color: uvInfo.color }}>{uvInfo.label}</p>
              </>
            ) : (
              <p className="text-sm opacity-40 mt-3">No data available</p>
            )}
          </div>

          {/* Sunrise & Sunset */}
          <div className="rounded-2xl p-4" style={{ background: '#222840' }}>
            <p className="text-xs opacity-60 mb-3">Sunrise & sunset</p>
            <div className="space-y-2">
              <div>
                <p className="text-xl font-medium">{formatTime(day.sunrise)}</p>
                <p className="text-xs opacity-50">Sunrise</p>
              </div>
              <div className="mt-2">
                <p className="text-xl font-medium">{formatTime(day.sunset)}</p>
                <p className="text-xs opacity-50">Sunset</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly details */}
      <div className="px-4 mt-5 pb-8">
        <p className="text-sm font-medium opacity-70 mb-3">Hourly details</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['precipitation', 'wind', 'humidity'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
              style={{
                background: tab === t ? '#3a5080' : '#222840',
                color: tab === t ? 'white' : '#8a9ab5',
              }}>
              {t === 'precipitation' ? '🌧 Precipitation' : t === 'wind' ? '💨 Wind' : '💧 Humidity'}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-2xl p-4" style={{ background: '#222840' }}>
          {tabData.length === 0 ? (
            <p className="text-sm opacity-40 text-center py-4">No hourly data</p>
          ) : (
            <div className="hourly-scroll">
              <div className="flex gap-3 items-end" style={{ minWidth: 'max-content', height: 100 }}>
                {tabData.map((d, i) => {
                  const max = getTabMax();
                  const val = getTabValue(d);
                  const barH = Math.max(4, (val / max) * 70);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: 40 }}>
                      <span className="text-xs opacity-60">{val}{getTabUnit()}</span>
                      <div className="w-6 rounded-t-sm" style={{
                        height: barH,
                        background: tab === 'precipitation' ? '#4a7abf'
                          : tab === 'wind' ? '#4a9abf' : '#e8a020',
                        opacity: 0.8,
                      }} />
                      <span className="text-xs opacity-50" style={{ fontSize: 10 }}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
