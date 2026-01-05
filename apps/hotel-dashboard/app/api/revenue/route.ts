/**
 * API Route: Revenue Analytics
 * Returns revenue breakdown by various dimensions
 */

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dimension = searchParams.get('dimension') || 'channel'; // channel, room_type, country, date
    const startDate = searchParams.get('start_date') || '2024-12-01';
    const endDate = searchParams.get('end_date') || '2025-04-30';

    let query = '';
    let params: string[] = [];

    switch (dimension) {
      case 'channel':
        query = `
          SELECT 
            booking_channel as dimension_value,
            COUNT(DISTINCT booking_id) as total_bookings,
            SUM(room_revenue_eur) as room_revenue,
            SUM(fb_revenue_eur) as fb_revenue,
            SUM(activities_revenue_eur) as activities_revenue,
            SUM(net_revenue_eur) as total_revenue,
            AVG(nights) as avg_nights
          FROM bookings_with_charges
          WHERE booking_status = 'Stayed'
            AND check_in_date BETWEEN $1 AND $2
          GROUP BY booking_channel
          ORDER BY total_revenue DESC
        `;
        params = [startDate, endDate];
        break;

      case 'room_type':
        query = `
          SELECT 
            room_type as dimension_value,
            COUNT(DISTINCT booking_id) as total_bookings,
            SUM(room_revenue_eur) as room_revenue,
            SUM(fb_revenue_eur) as fb_revenue,
            SUM(activities_revenue_eur) as activities_revenue,
            SUM(net_revenue_eur) as total_revenue,
            AVG(nights) as avg_nights
          FROM bookings_with_charges
          WHERE booking_status = 'Stayed'
            AND check_in_date BETWEEN $1 AND $2
          GROUP BY room_type
          ORDER BY total_revenue DESC
        `;
        params = [startDate, endDate];
        break;

      case 'country':
        query = `
          SELECT 
            country as dimension_value,
            COUNT(DISTINCT booking_id) as total_bookings,
            SUM(room_revenue_eur) as room_revenue,
            SUM(fb_revenue_eur) as fb_revenue,
            SUM(activities_revenue_eur) as activities_revenue,
            SUM(net_revenue_eur) as total_revenue,
            AVG(nights) as avg_nights
          FROM bookings_with_charges
          WHERE booking_status = 'Stayed'
            AND check_in_date BETWEEN $1 AND $2
          GROUP BY country
          ORDER BY total_revenue DESC
          LIMIT 20
        `;
        params = [startDate, endDate];
        break;

      case 'date':
        query = `
          SELECT 
            charge_date as dimension_value,
            SUM(CASE WHEN charge_category = 'Room' THEN line_subtotal_eur ELSE 0 END) as room_revenue,
            SUM(CASE WHEN charge_category = 'F&B' THEN line_subtotal_eur ELSE 0 END) as fb_revenue,
            SUM(CASE WHEN charge_category IN ('SkiPass', 'EquipmentRental', 'Spa', 'AirportTransfer') 
                THEN line_subtotal_eur ELSE 0 END) as activities_revenue,
            SUM(line_subtotal_eur) as total_revenue
          FROM bookings_with_charges
          WHERE booking_status = 'Stayed'
            AND charge_date BETWEEN $1 AND $2
          GROUP BY charge_date
          ORDER BY charge_date
        `;
        params = [startDate, endDate];
        break;

      default:
        return NextResponse.json({ error: 'Invalid dimension' }, { status: 400 });
    }

    const result = await pool.query(query, params);
    
    return NextResponse.json({
      dimension,
      start_date: startDate,
      end_date: endDate,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}

