/**
 * Occupancy Analytics Dashboard Component
 */

'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface OccupancyData {
  date: string;
  rooms_sold: number;
  occupancy_pct: number;
  room_revenue: string;
  adr: number;
  revpar: number;
  weather_condition?: string;
  avg_temperature_c?: number;
  snow_depth_cm?: number;
}

export default function OccupancyDashboard({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [dailyData, setDailyData] = useState<OccupancyData[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchOccupancyData();
  }, [startDate, endDate, groupBy]);

  const fetchOccupancyData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/occupancy?group_by=${groupBy}&start_date=${startDate}&end_date=${endDate}`
      );
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      
      if (groupBy === 'day') {
        setDailyData(Array.isArray(data.data) ? data.data : []);
      } else {
        setWeeklyData(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching occupancy data:', error);
      // Set empty arrays on error
      if (groupBy === 'day') {
        setDailyData([]);
      } else {
        setWeeklyData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return <div className="text-center py-12">Loading occupancy data...</div>;
  }

  const currentData = groupBy === 'day' ? dailyData : weeklyData;
  
  // Handle empty or undefined data
  if (!currentData || !Array.isArray(currentData) || currentData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No occupancy data available.</p>
        <p className="text-sm text-gray-400">
          Please ensure the database is set up and data has been generated and loaded.
        </p>
      </div>
    );
  }

  const dateKey = groupBy === 'day' ? 'date' : groupBy === 'week' ? 'week_start' : 'month_start';

  const chartData = currentData.map((item: any) => ({
    date: item[dateKey],
    occupancy: parseFloat(item.occupancy_pct?.toString() || '0'),
    adr: parseFloat(item.adr?.toString() || item.avg_adr?.toString() || '0'),
    revpar: parseFloat(item.revpar?.toString() || item.avg_revpar?.toString() || '0'),
    rooms_sold: item.rooms_sold,
  }));

  const avgOccupancy =
    currentData.reduce((sum, item) => sum + parseFloat(item.occupancy_pct?.toString() || '0'), 0) /
    currentData.length;
  const avgADR =
    currentData.reduce(
      (sum, item) => sum + parseFloat(item.adr?.toString() || item.avg_adr?.toString() || '0'),
      0
    ) / currentData.length;
  const avgRevPAR =
    currentData.reduce(
      (sum, item) =>
        sum + parseFloat(item.revpar?.toString() || item.avg_revpar?.toString() || '0'),
      0
    ) / currentData.length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg Occupancy %</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{avgOccupancy.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg ADR</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(avgADR)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg RevPAR</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(avgRevPAR)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Room Nights</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {currentData.reduce((sum, item) => sum + (item.rooms_sold || 0), 0)}
          </p>
        </div>
      </div>

      {/* Group By Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => setGroupBy('day')}
            className={`px-4 py-2 rounded ${
              groupBy === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setGroupBy('week')}
            className={`px-4 py-2 rounded ${
              groupBy === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setGroupBy('month')}
            className={`px-4 py-2 rounded ${
              groupBy === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Occupancy Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Occupancy % Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return groupBy === 'day'
                  ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              }}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="#0088FE"
              fill="#0088FE"
              fillOpacity={0.6}
              name="Occupancy %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ADR and RevPAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Average Daily Rate (ADR)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return groupBy === 'day'
                    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : date.toLocaleDateString('en-US', { month: 'short' });
                }}
              />
              <YAxis tickFormatter={(value) => `€${value}`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="adr"
                stroke="#00C49F"
                strokeWidth={2}
                name="ADR"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue per Available Room (RevPAR)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return groupBy === 'day'
                    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : date.toLocaleDateString('en-US', { month: 'short' });
                }}
              />
              <YAxis tickFormatter={(value) => `€${value}`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="revpar"
                stroke="#FF8042"
                strokeWidth={2}
                name="RevPAR"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

