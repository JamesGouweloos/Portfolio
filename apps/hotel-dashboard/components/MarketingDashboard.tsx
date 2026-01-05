/**
 * Marketing Performance Dashboard Component
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MarketingData {
  channel: string;
  total_impressions: number;
  total_clicks: number;
  total_sessions: number;
  total_bookings: number;
  total_revenue: string;
  total_cost: string;
  avg_cpc: number;
  avg_cpa: number;
  avg_roas: number;
  overall_roas: number;
}

export default function MarketingDashboard({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [channelData, setChannelData] = useState<MarketingData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'channel' | 'date'>('channel');

  useEffect(() => {
    fetchMarketingData();
  }, [startDate, endDate, groupBy]);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/marketing?group_by=${groupBy}&start_date=${startDate}&end_date=${endDate}`
      );
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      
      if (groupBy === 'channel') {
        setChannelData(Array.isArray(data.data) ? data.data : []);
      } else {
        setTimeSeriesData(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching marketing data:', error);
      // Set empty arrays on error
      if (groupBy === 'channel') {
        setChannelData([]);
      } else {
        setTimeSeriesData([]);
      }
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
    return <div className="text-center py-12">Loading marketing data...</div>;
  }

  // Handle empty data for channel view
  if (groupBy === 'channel' && (!channelData || !Array.isArray(channelData) || channelData.length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No marketing data available.</p>
        <p className="text-sm text-gray-400">
          Please ensure the database is set up and data has been generated and loaded.
        </p>
      </div>
    );
  }

  // Handle empty data for date view
  if (groupBy === 'date' && (!timeSeriesData || !Array.isArray(timeSeriesData) || timeSeriesData.length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No marketing data available.</p>
        <p className="text-sm text-gray-400">
          Please ensure the database is set up and data has been generated and loaded.
        </p>
      </div>
    );
  }

  const totalRevenue = channelData.reduce(
    (sum, item) => sum + parseFloat(item.total_revenue),
    0
  );
  const totalCost = channelData.reduce(
    (sum, item) => sum + parseFloat(item.total_cost),
    0
  );
  const overallROAS = totalCost > 0 ? totalRevenue / totalCost : 0;

  if (groupBy === 'channel') {
    const chartData = channelData.map((item) => ({
      name: item.channel,
      revenue: parseFloat(item.total_revenue),
      cost: parseFloat(item.total_cost),
      roas: parseFloat(item.overall_roas?.toString() || '0'),
      bookings: item.total_bookings,
      cpa: parseFloat(item.avg_cpa?.toString() || '0'),
    }));

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Marketing Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Marketing Cost</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalCost)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Overall ROAS</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{overallROAS.toFixed(2)}x</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {channelData.reduce((sum, item) => sum + item.total_bookings, 0)}
            </p>
          </div>
        </div>

        {/* Group By Selector */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-4">
            <button
              onClick={() => setGroupBy('channel')}
              className={`px-4 py-2 rounded ${
                groupBy === 'channel' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              By Channel
            </button>
            <button
              onClick={() => setGroupBy('date')}
              className={`px-4 py-2 rounded ${
                groupBy === 'date' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              By Date
            </button>
          </div>
        </div>

        {/* Revenue vs Cost */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Marketing Cost by Channel</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
              <Bar dataKey="cost" fill="#FF8042" name="Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS by Channel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Return on Ad Spend (ROAS) by Channel</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}x`} />
              <Bar dataKey="roas" fill="#0088FE" name="ROAS" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost per Acquisition */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Cost per Acquisition (CPA) by Channel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `€${value}`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="cpa" fill="#FFBB28" name="CPA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  } else {
    const chartData = timeSeriesData.map((item) => ({
      date: item.date,
      revenue: parseFloat(item.total_revenue),
      cost: parseFloat(item.total_cost),
      roas: parseFloat(item.roas?.toString() || '0'),
      bookings: item.total_bookings,
    }));

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-4">
            <button
              onClick={() => setGroupBy('channel')}
              className={`px-4 py-2 rounded ${
                groupBy === 'channel' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              By Channel
            </button>
            <button
              onClick={() => setGroupBy('date')}
              className={`px-4 py-2 rounded ${
                groupBy === 'date' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              By Date
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Marketing Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis yAxisId="left" tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'ROAS') return `${value.toFixed(2)}x`;
                  return formatCurrency(value);
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#00C49F"
                name="Revenue"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cost"
                stroke="#FF8042"
                name="Cost"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="roas"
                stroke="#0088FE"
                name="ROAS"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}

