/**
 * Weather Correlation Analysis Component
 * Analyzes correlation between weather/snow and ski-related revenue
 */

'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface WeatherData {
  date: string;
  weather_condition: string;
  snow_depth_cm: number;
  avg_temperature_c: number;
  occupancy_pct: number;
  ski_revenue: string;
  bookings_with_ski_charges: number;
}

export default function WeatherCorrelation({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, [startDate, endDate]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/weather-correlation?start_date=${startDate}&end_date=${endDate}`
      );
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const result = await res.json();
      setData(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Error fetching weather correlation data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return <div className="text-center py-12">Loading weather correlation data...</div>;
  }

  // Handle empty or undefined data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No weather correlation data available.</p>
        <p className="text-sm text-gray-400">
          Please ensure the database is set up and data has been generated and loaded.
        </p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: item.date,
    snowDepth: item.snow_depth_cm,
    temperature: parseFloat(item.avg_temperature_c?.toString() || '0'),
    skiRevenue: parseFloat(item.ski_revenue || '0'),
    occupancy: parseFloat(item.occupancy_pct?.toString() || '0'),
    weather: item.weather_condition,
  }));

  // Calculate correlation insights
  const avgSkiRevenueOnSnow = data
    .filter((d) => d.snow_depth_cm > 30)
    .reduce((sum, d) => sum + parseFloat(d.ski_revenue || '0'), 0) /
    Math.max(
      data.filter((d) => d.snow_depth_cm > 30).length,
      1
    );
  const avgSkiRevenueNoSnow = data
    .filter((d) => d.snow_depth_cm <= 30)
    .reduce((sum, d) => sum + parseFloat(d.ski_revenue || '0'), 0) /
    Math.max(
      data.filter((d) => d.snow_depth_cm <= 30).length,
      1
    );

  return (
    <div className="space-y-6">
      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg Ski Revenue (Snow Depth &gt; 30cm)</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(avgSkiRevenueOnSnow)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg Ski Revenue (Snow Depth ≤ 30cm)</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(avgSkiRevenueNoSnow)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Impact of Snow</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {((avgSkiRevenueOnSnow / Math.max(avgSkiRevenueNoSnow, 1) - 1) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Snow Depth vs Ski Revenue */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Snow Depth vs Ski Revenue</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis yAxisId="left" label={{ value: 'Snow Depth (cm)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue (€)', angle: 90, position: 'insideRight' }} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Ski Revenue') return formatCurrency(value);
                return value;
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Bar
              yAxisId="right"
              dataKey="skiRevenue"
              fill="#00C49F"
              name="Ski Revenue"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="snowDepth"
              stroke="#0088FE"
              strokeWidth={2}
              name="Snow Depth (cm)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Temperature vs Occupancy */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Temperature vs Occupancy</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis yAxisId="left" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: 'Occupancy %', angle: 90, position: 'insideRight' }} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Occupancy') return `${value.toFixed(1)}%`;
                return `${value.toFixed(1)}°C`;
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke="#FF8042"
              strokeWidth={2}
              name="Temperature (°C)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="occupancy"
              stroke="#8884d8"
              strokeWidth={2}
              name="Occupancy %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

