/**
 * API Route: Weather Correlation Analysis
 * Analyzes correlation between weather/snow and ski-related revenue
 */

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || '2024-12-01';
    const endDate = searchParams.get('end_date') || '2025-04-30';

    const query = `
      SELECT 
        o.date,
        o.weather_condition,
        o.snow_depth_cm,
        o.avg_temperature_c,
        o.occupancy_pct,
        SUM(CASE 
          WHEN b.charge_category IN ('SkiPass', 'EquipmentRental') 
          THEN b.line_subtotal_eur 
          ELSE 0 
        END) as ski_revenue,
        COUNT(DISTINCT CASE 
          WHEN b.charge_category IN ('SkiPass', 'EquipmentRental') 
          THEN b.booking_id 
        END) as bookings_with_ski_charges
      FROM daily_occupancy o
      LEFT JOIN bookings_with_charges b 
        ON b.charge_date = o.date 
        AND b.booking_status = 'Stayed'
      WHERE o.date BETWEEN $1 AND $2
        AND o.room_type = 'All'
      GROUP BY o.date, o.weather_condition, o.snow_depth_cm, o.avg_temperature_c, o.occupancy_pct
      ORDER BY o.date
    `;

    const result = await pool.query(query, [startDate, endDate]);
    
    return NextResponse.json({
      start_date: startDate,
      end_date: endDate,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching weather correlation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather correlation data' },
      { status: 500 }
    );
  }
}

