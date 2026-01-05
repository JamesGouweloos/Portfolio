/**
 * API Route: Guest Analytics
 * Returns guest demographics and behavior metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dimension = searchParams.get('dimension') || 'country'; // country, age, loyalty, purpose

    let query = '';

    switch (dimension) {
      case 'country':
        query = `
          SELECT 
            country_of_residence as dimension_value,
            COUNT(*) as guest_count,
            SUM(lifetime_bookings) as total_bookings,
            SUM(lifetime_revenue_eur) as total_revenue,
            AVG(lifetime_revenue_eur) as avg_lifetime_value
          FROM guest_profiles
          GROUP BY country_of_residence
          ORDER BY guest_count DESC
          LIMIT 20
        `;
        break;

      case 'age':
        query = `
          SELECT 
            CASE 
              WHEN age_at_check_in < 25 THEN '18-24'
              WHEN age_at_check_in < 35 THEN '25-34'
              WHEN age_at_check_in < 45 THEN '35-44'
              WHEN age_at_check_in < 55 THEN '45-54'
              WHEN age_at_check_in < 65 THEN '55-64'
              ELSE '65+'
            END as dimension_value,
            COUNT(*) as guest_count,
            SUM(lifetime_bookings) as total_bookings,
            SUM(lifetime_revenue_eur) as total_revenue,
            AVG(lifetime_revenue_eur) as avg_lifetime_value
          FROM guest_profiles
          WHERE age_at_check_in IS NOT NULL
          GROUP BY 
            CASE 
              WHEN age_at_check_in < 25 THEN '18-24'
              WHEN age_at_check_in < 35 THEN '25-34'
              WHEN age_at_check_in < 45 THEN '35-44'
              WHEN age_at_check_in < 55 THEN '45-54'
              WHEN age_at_check_in < 65 THEN '55-64'
              ELSE '65+'
            END
          ORDER BY dimension_value
        `;
        break;

      case 'loyalty':
        query = `
          SELECT 
            loyalty_tier as dimension_value,
            COUNT(*) as guest_count,
            SUM(lifetime_bookings) as total_bookings,
            SUM(lifetime_revenue_eur) as total_revenue,
            AVG(lifetime_revenue_eur) as avg_lifetime_value
          FROM guest_profiles
          GROUP BY loyalty_tier
          ORDER BY 
            CASE loyalty_tier
              WHEN 'Platinum' THEN 1
              WHEN 'Gold' THEN 2
              WHEN 'Silver' THEN 3
              ELSE 4
            END
        `;
        break;

      case 'purpose':
        query = `
          SELECT 
            primary_purpose_of_stay as dimension_value,
            COUNT(*) as guest_count,
            SUM(lifetime_bookings) as total_bookings,
            SUM(lifetime_revenue_eur) as total_revenue,
            AVG(lifetime_revenue_eur) as avg_lifetime_value
          FROM guest_profiles
          GROUP BY primary_purpose_of_stay
          ORDER BY guest_count DESC
        `;
        break;

      default:
        return NextResponse.json({ error: 'Invalid dimension' }, { status: 400 });
    }

    const result = await pool.query(query);
    
    return NextResponse.json({
      dimension,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching guest data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest data' },
      { status: 500 }
    );
  }
}

