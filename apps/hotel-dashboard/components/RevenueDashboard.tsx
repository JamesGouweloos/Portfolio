/**
 * Revenue Analytics Dashboard Component
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueData {
  dimension_value: string;
  total_bookings: number;
  room_revenue: string;
  fb_revenue: string;
  activities_revenue: string;
  total_revenue: string;
  avg_nights: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function RevenueDashboard({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [channelData, setChannelData] = useState<RevenueData[]>([]);
  const [roomTypeData, setRoomTypeData] = useState<RevenueData[]>([]);
  const [countryData, setCountryData] = useState<RevenueData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dimension, setDimension] = useState<'channel' | 'room_type' | 'country'>('channel');

  useEffect(() => {
    fetchRevenueData();
  }, [startDate, endDate, dimension]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Fetch by dimension
      const res = await fetch(
        `/api/revenue?dimension=${dimension}&start_date=${startDate}&end_date=${endDate}`
      );
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      
      if (dimension === 'channel') {
        setChannelData(Array.isArray(data.data) ? data.data : []);
      } else if (dimension === 'room_type') {
        setRoomTypeData(Array.isArray(data.data) ? data.data : []);
      } else {
        setCountryData(Array.isArray(data.data) ? data.data : []);
      }

      // Fetch time series
      const tsRes = await fetch(
        `/api/revenue?dimension=date&start_date=${startDate}&end_date=${endDate}`
      );
      if (!tsRes.ok) {
        throw new Error(`API error: ${tsRes.status}`);
      }
      const tsData = await tsRes.json();
      setTimeSeriesData(Array.isArray(tsData.data) ? tsData.data : []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      // Set empty arrays on error to prevent crashes
      if (dimension === 'channel') {
        setChannelData([]);
      } else if (dimension === 'room_type') {
        setRoomTypeData([]);
      } else {
        setCountryData([]);
      }
      setTimeSeriesData([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    if (dimension === 'channel') return channelData;
    if (dimension === 'room_type') return roomTypeData;
    return countryData;
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
    return <div className="text-center py-12">Loading revenue data...</div>;
  }

  const currentData = getCurrentData();
  
  // Handle empty or undefined data
  if (!currentData || !Array.isArray(currentData) || currentData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No revenue data available.</p>
        <p className="text-sm text-gray-400">
          Please ensure the database is set up and data has been generated and loaded.
        </p>
      </div>
    );
  }

  const chartData = currentData.map((item) => ({
    name: item.dimension_value,
    revenue: parseFloat(item.total_revenue),
    room: parseFloat(item.room_revenue),
    fb: parseFloat(item.fb_revenue),
    activities: parseFloat(item.activities_revenue),
  }));

  const pieData = currentData.slice(0, 6).map((item) => ({
    name: item.dimension_value,
    value: parseFloat(item.total_revenue),
  }));

  const totalRevenue = currentData.reduce(
    (sum, item) => sum + parseFloat(item.total_revenue),
    0
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {currentData.reduce((sum, item) => sum + item.total_bookings, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg Revenue per Booking</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(
              totalRevenue / currentData.reduce((sum, item) => sum + item.total_bookings, 1)
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg Nights</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {(
              currentData.reduce(
                (sum, item) => sum + parseFloat(item.avg_nights || '0'),
                0
              ) / currentData.length
            ).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Dimension Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => setDimension('channel')}
            className={`px-4 py-2 rounded ${
              dimension === 'channel'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            By Channel
          </button>
          <button
            onClick={() => setDimension('room_type')}
            className={`px-4 py-2 rounded ${
              dimension === 'room_type'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            By Room Type
          </button>
          <button
            onClick={() => setDimension('country')}
            className={`px-4 py-2 rounded ${
              dimension === 'country'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            By Country
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Revenue Breakdown by {dimension === 'channel' ? 'Channel' : dimension === 'room_type' ? 'Room Type' : 'Country'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="room" stackId="a" fill="#0088FE" name="Room" />
              <Bar dataKey="fb" stackId="a" fill="#00C49F" name="F&B" />
              <Bar dataKey="activities" stackId="a" fill="#FFBB28" name="Activities" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Series Revenue */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Daily Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="dimension_value"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="room_revenue"
              stroke="#0088FE"
              name="Room Revenue"
            />
            <Line
              type="monotone"
              dataKey="fb_revenue"
              stroke="#00C49F"
              name="F&B Revenue"
            />
            <Line
              type="monotone"
              dataKey="activities_revenue"
              stroke="#FFBB28"
              name="Activities Revenue"
            />
            <Line
              type="monotone"
              dataKey="total_revenue"
              stroke="#FF8042"
              strokeWidth={2}
              name="Total Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

