export interface HourlyPoint {
  time: string;
  temp: number;
  weatherCode: number;
  precipProb: number;
  windSpeed: number;
  humidity: number;
  isDay: number;
}

export interface DayForecast {
  date: string;
  dayLabel: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  windSpeedMax: number;
  windDirection: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  humidity: number;
  hourly: HourlyPoint[];
}

export interface WeatherData {
  locationName: string;
  current: {
    temp: number;
    feelsLike: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
    isDay: number;
  };
  todayHigh: number;
  todayLow: number;
  hourly: HourlyPoint[];
  daily: DayForecast[];
}
