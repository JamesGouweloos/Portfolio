/**
 * API Route: Occupancy Analytics
 * Returns daily occupancy metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || '2024-12-01';
    const endDate = searchParams.get('end_date') || '2025-04-30';
    const groupBy = searchParams.get('group_by') || 'day'; // day, week, month

    let query = '';

    if (groupBy === 'day') {
      query = `
        SELECT 
          date,
          SUM(rooms_sold) as rooms_sold,
          AVG(occupancy_pct) as occupancy_pct,
          SUM(room_revenue_eur) as room_revenue,
          AVG(adr_eur) as adr,
          AVG(revpar_eur) as revpar,
          weather_condition,
          avg_temperature_c,
          snow_depth_cm
        FROM daily_occupancy
        WHERE date BETWEEN $1 AND $2
          AND room_type = 'All'
        GROUP BY date, weather_condition, avg_temperature_c, snow_depth_cm
        ORDER BY date
      `;
    } else if (groupBy === 'week') {
      query = `
        SELECT 
          DATE_TRUNC('week', date)::date as week_start,
          SUM(rooms_sold) as rooms_sold,
          AVG(occupancy_pct) as avg_occupancy_pct,
          SUM(room_revenue_eur) as room_revenue,
          AVG(adr_eur) as avg_adr,
          AVG(revpar_eur) as avg_revpar
        FROM daily_occupancy
        WHERE date BETWEEN $1 AND $2
          AND room_type = 'All'
        GROUP BY DATE_TRUNC('week', date)
        ORDER BY week_start
      `;
    } else if (groupBy === 'month') {
      query = `
        SELECT 
          DATE_TRUNC('month', date)::date as month_start,
          SUM(rooms_sold) as rooms_sold,
          AVG(occupancy_pct) as avg_occupancy_pct,
          SUM(room_revenue_eur) as room_revenue,
          AVG(adr_eur) as avg_adr,
          AVG(revpar_eur) as avg_revpar
        FROM daily_occupancy
        WHERE date BETWEEN $1 AND $2
          AND room_type = 'All'
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month_start
      `;
    }

    const result = await pool.query(query, [startDate, endDate]);
    
    return NextResponse.json({
      group_by: groupBy,
      start_date: startDate,
      end_date: endDate,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching occupancy data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occupancy data' },
      { status: 500 }
    );
  }
}

