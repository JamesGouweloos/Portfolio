/**
 * Guest Analytics Dashboard Component
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
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

interface GuestData {
  dimension_value: string;
  guest_count: number;
  total_bookings: number;
  total_revenue: string;
  avg_lifetime_value: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function GuestAnalytics() {
  const [countryData, setCountryData] = useState<GuestData[]>([]);
  const [ageData, setAgeData] = useState<GuestData[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<GuestData[]>([]);
  const [purposeData, setPurposeData] = useState<GuestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dimension, setDimension] = useState<'country' | 'age' | 'loyalty' | 'purpose'>('country');

  useEffect(() => {
    fetchGuestData();
  }, [dimension]);

  const fetchGuestData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guests?dimension=${dimension}`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const data = await res.json();
      
      if (dimension === 'country') {
        setCountryData(Array.isArray(data.data) ? data.data : []);
      } else if (dimension === 'age') {
        setAgeData(Array.isArray(data.data) ? data.data : []);
      } else if (dimension === 'loyalty') {
        setLoyaltyData(Array.isArray(data.data) ? data.data : []);
      } else {
        setPurposeData(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching guest data:', error);
      // Set empty arrays on error
      if (dimension === 'country') {
        setCountryData([]);
      } else if (dimension === 'age') {
        setAgeData([]);
      } else if (dimension === 'loyalty') {
        setLoyaltyData([]);
      } else {
        setPurposeData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    if (dimension === 'country') return countryData;
    if (dimension === 'age') return ageData;
    if (dimension === 'loyalty') return loyaltyData;
    return purposeData;
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
    return <div className="text-center py-12">Loading guest data...</div>;
  }

  const currentData = getCurrentData();
  const chartData = currentData.map((item) => ({
    name: item.dimension_value,
    guests: item.guest_count,
    revenue: parseFloat(item.total_revenue),
    avgLTV: parseFloat(item.avg_lifetime_value),
  }));

  const pieData = currentData.slice(0, 6).map((item) => ({
    name: item.dimension_value,
    value: item.guest_count,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Guests</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {currentData.reduce((sum, item) => sum + item.guest_count, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Lifetime Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(
              currentData.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0)
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Avg Lifetime Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(
              currentData.reduce((sum, item) => sum + parseFloat(item.avg_lifetime_value), 0) /
                currentData.length
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {currentData.reduce((sum, item) => sum + item.total_bookings, 0)}
          </p>
        </div>
      </div>

      {/* Dimension Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => setDimension('country')}
            className={`px-4 py-2 rounded ${
              dimension === 'country' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            By Country
          </button>
          <button
            onClick={() => setDimension('age')}
            className={`px-4 py-2 rounded ${
              dimension === 'age' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            By Age
          </button>
          <button
            onClick={() => setDimension('loyalty')}
            className={`px-4 py-2 rounded ${
              dimension === 'loyalty' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            By Loyalty Tier
          </button>
          <button
            onClick={() => setDimension('purpose')}
            className={`px-4 py-2 rounded ${
              dimension === 'purpose' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            By Purpose
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Guest Distribution by {dimension === 'country' ? 'Country' : dimension === 'age' ? 'Age' : dimension === 'loyalty' ? 'Loyalty Tier' : 'Purpose'}
          </h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lifetime Value */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Average Lifetime Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="avgLTV" fill="#00C49F" name="Avg LTV" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Segment */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Total Revenue by Segment</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="revenue" fill="#0088FE" name="Total Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

