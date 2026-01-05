/**
 * Main Dashboard Page
 * Hotel Booking Analytics Dashboard for Livigno Hotel
 */

'use client';

import React, { useState, useEffect } from 'react';
import RevenueDashboard from '@/components/RevenueDashboard';
import OccupancyDashboard from '@/components/OccupancyDashboard';
import MarketingDashboard from '@/components/MarketingDashboard';
import GuestAnalytics from '@/components/GuestAnalytics';
import WeatherCorrelation from '@/components/WeatherCorrelation';
import { format } from 'date-fns';

export default function Home() {
  const [startDate, setStartDate] = useState('2024-12-01');
  const [endDate, setEndDate] = useState('2025-04-30');
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Livigno Hotel Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Comprehensive booking, revenue, and marketing analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'revenue', label: 'Revenue' },
              { id: 'occupancy', label: 'Occupancy' },
              { id: 'marketing', label: 'Marketing' },
              { id: 'guests', label: 'Guests' },
              { id: 'weather', label: 'Weather Correlation' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'revenue' && (
          <RevenueDashboard startDate={startDate} endDate={endDate} />
        )}
        {activeTab === 'occupancy' && (
          <OccupancyDashboard startDate={startDate} endDate={endDate} />
        )}
        {activeTab === 'marketing' && (
          <MarketingDashboard startDate={startDate} endDate={endDate} />
        )}
        {activeTab === 'guests' && <GuestAnalytics />}
        {activeTab === 'weather' && (
          <WeatherCorrelation startDate={startDate} endDate={endDate} />
        )}
      </main>
    </div>
  );
}

