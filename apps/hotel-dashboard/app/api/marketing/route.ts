/**
 * API Route: Marketing Performance
 * Returns marketing metrics by channel
 */

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || '2024-12-01';
    const endDate = searchParams.get('end_date') || '2025-04-30';
    const groupBy = searchParams.get('group_by') || 'channel'; // channel, date

    let query = '';

    if (groupBy === 'channel') {
      query = `
        SELECT 
          channel,
          SUM(impressions) as total_impressions,
          SUM(clicks) as total_clicks,
          SUM(sessions) as total_sessions,
          SUM(bookings) as total_bookings,
          SUM(room_nights) as total_room_nights,
          SUM(total_revenue_eur) as total_revenue,
          SUM(marketing_cost_eur) as total_cost,
          AVG(cpc_eur) as avg_cpc,
          AVG(cpa_eur) as avg_cpa,
          AVG(roas) as avg_roas,
          AVG(conversion_rate) as avg_conversion_rate,
          CASE 
            WHEN SUM(marketing_cost_eur) > 0 
            THEN SUM(total_revenue_eur) / SUM(marketing_cost_eur)
            ELSE 0
          END as overall_roas
        FROM marketing_performance
        WHERE date BETWEEN $1 AND $2
        GROUP BY channel
        ORDER BY total_revenue DESC
      `;
    } else if (groupBy === 'date') {
      query = `
        SELECT 
          date,
          SUM(impressions) as total_impressions,
          SUM(clicks) as total_clicks,
          SUM(sessions) as total_sessions,
          SUM(bookings) as total_bookings,
          SUM(total_revenue_eur) as total_revenue,
          SUM(marketing_cost_eur) as total_cost,
          CASE 
            WHEN SUM(marketing_cost_eur) > 0 
            THEN SUM(total_revenue_eur) / SUM(marketing_cost_eur)
            ELSE 0
          END as roas
        FROM marketing_performance
        WHERE date BETWEEN $1 AND $2
        GROUP BY date
        ORDER BY date
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
    console.error('Error fetching marketing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing data' },
      { status: 500 }
    );
  }
}

