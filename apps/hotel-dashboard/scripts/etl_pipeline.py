"""
ETL Pipeline for Hotel Booking Analytics
Loads CSV data into PostgreSQL with validation and feature engineering
"""

import csv
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from decimal import Decimal
import os
from typing import Dict, List, Any

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'hotel_analytics'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'port': os.getenv('DB_PORT', '5432')
}


def connect_db():
    """Create database connection"""
    return psycopg2.connect(**DB_CONFIG)


def calculate_age_at_check_in(date_of_birth, check_in_date):
    """Calculate age at check-in"""
    if not date_of_birth or not check_in_date:
        return None
    birth = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
    check_in = datetime.strptime(check_in_date, '%Y-%m-%d').date()
    age = check_in.year - birth.year - ((check_in.month, check_in.day) < (birth.month, birth.day))
    return age


def load_guest_profiles(conn, csv_path):
    """Load and process guest profiles"""
    print("Loading guest profiles...")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        guests = list(reader)
    
    # Update guest analytics fields from bookings
    with conn.cursor() as cur:
        # Get booking statistics per guest
        cur.execute("""
            SELECT 
                guest_id,
                COUNT(DISTINCT booking_id) as bookings,
                SUM(net_revenue_eur) as revenue,
                MIN(check_in_date) as first_booking,
                MAX(check_in_date) as last_booking
            FROM bookings_with_charges
            WHERE booking_status = 'Stayed'
            GROUP BY guest_id
        """)
        
        guest_stats = {row[0]: {
            'bookings': row[1],
            'revenue': row[2] or Decimal('0.00'),
            'first_booking': row[3],
            'last_booking': row[4]
        } for row in cur.fetchall()}
    
    # Update guests with calculated fields
    for guest in guests:
        guest_id = guest['guest_id']
        stats = guest_stats.get(guest_id, {})
        
        guest['lifetime_bookings'] = stats.get('bookings', 0)
        guest['lifetime_revenue_eur'] = str(stats.get('revenue', Decimal('0.00')))
        guest['first_booking_date'] = stats.get('first_booking')
        guest['most_recent_booking_date'] = stats.get('last_booking')
        
        # Calculate age at first check-in
        if guest['first_booking_date']:
            guest['age_at_check_in'] = calculate_age_at_check_in(
                guest['date_of_birth'],
                guest['first_booking_date']
            )
        else:
            guest['age_at_check_in'] = None
    
    # Insert into database
    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO guest_profiles (
                guest_id, first_name, last_name, email, date_of_birth, gender,
                country_of_residence, city_of_residence, nationality, family_status,
                primary_purpose_of_stay, travel_party_type, preferred_room_type,
                ski_skill_level, email_marketing_opt_in, sms_opt_in,
                loyalty_member, loyalty_tier, age_at_check_in, lifetime_bookings,
                lifetime_revenue_eur, first_booking_date, most_recent_booking_date
            ) VALUES %s
            ON CONFLICT (guest_id) DO UPDATE SET
                lifetime_bookings = EXCLUDED.lifetime_bookings,
                lifetime_revenue_eur = EXCLUDED.lifetime_revenue_eur,
                first_booking_date = EXCLUDED.first_booking_date,
                most_recent_booking_date = EXCLUDED.most_recent_booking_date,
                age_at_check_in = EXCLUDED.age_at_check_in,
                updated_at = CURRENT_TIMESTAMP
            """,
            [(
                g['guest_id'], g['first_name'], g['last_name'], g['email'],
                g['date_of_birth'], g['gender'], g['country_of_residence'],
                g['city_of_residence'], g['nationality'], g['family_status'],
                g['primary_purpose_of_stay'], g['travel_party_type'],
                g['preferred_room_type'], g['ski_skill_level'],
                g['email_marketing_opt_in'].lower() == 'true',
                g['sms_opt_in'].lower() == 'true',
                g['loyalty_member'].lower() == 'true',
                g['loyalty_tier'], g.get('age_at_check_in'),
                g['lifetime_bookings'], g['lifetime_revenue_eur'],
                g['first_booking_date'], g['most_recent_booking_date']
            ) for g in guests]
        )
        conn.commit()
        print(f"Loaded {len(guests)} guest profiles")


def load_marketing_channels(conn):
    """Load marketing channel dimension"""
    print("Loading marketing channels...")
    
    channels = [
        ('Direct-Web', 'Direct'),
        ('Direct-Phone', 'Direct'),
        ('OTA-Booking.com', 'OTA'),
        ('OTA-Expedia', 'OTA'),
        ('TravelAgent', 'Travel Agent'),
        ('Corporate', 'Corporate'),
        ('Social-Paid', 'Social'),
        ('Social-Organic', 'Social'),
        ('Email', 'Email'),
        ('Search-Ads', 'Paid Search')
    ]
    
    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO marketing_channels (channel, channel_category, description)
            VALUES %s
            ON CONFLICT (channel) DO NOTHING
            """,
            [(ch, cat, f'{cat} channel') for ch, cat in channels]
        )
        conn.commit()
        print(f"Loaded {len(channels)} marketing channels")


def load_bookings(conn, csv_path):
    """Load bookings and charges"""
    print("Loading bookings and charges...")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        bookings = list(reader)
    
    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO bookings_with_charges (
                line_id, booking_id, guest_id, check_in_date, check_out_date,
                nights, num_guests, num_adults, num_children, room_type,
                board_type, booking_status, booking_channel, booking_created_date,
                country, charge_date, charge_category, charge_item,
                unit_price_eur, quantity, line_subtotal_eur, tax_rate,
                line_tax_eur, line_total_eur, room_revenue_eur, fb_revenue_eur,
                activities_revenue_eur, total_revenue_eur, discount_eur, net_revenue_eur
            ) VALUES %s
            ON CONFLICT (line_id) DO UPDATE SET
                updated_at = CURRENT_TIMESTAMP
            """,
            [(
                b['line_id'], b['booking_id'], b['guest_id'],
                b['check_in_date'], b['check_out_date'], int(b['nights']),
                int(b['num_guests']), int(b['num_adults']), int(b['num_children']),
                b['room_type'], b['board_type'], b['booking_status'],
                b['booking_channel'], b['booking_created_date'], b['country'],
                b['charge_date'], b['charge_category'], b['charge_item'],
                Decimal(b['unit_price_eur']), Decimal(b['quantity']),
                Decimal(b['line_subtotal_eur']), Decimal(b['tax_rate']),
                Decimal(b['line_tax_eur']), Decimal(b['line_total_eur']),
                Decimal(b['room_revenue_eur']) if b['room_revenue_eur'] else None,
                Decimal(b['fb_revenue_eur']) if b['fb_revenue_eur'] else None,
                Decimal(b['activities_revenue_eur']) if b['activities_revenue_eur'] else None,
                Decimal(b['total_revenue_eur']) if b['total_revenue_eur'] else None,
                Decimal(b['discount_eur']) if b['discount_eur'] else None,
                Decimal(b['net_revenue_eur']) if b['net_revenue_eur'] else None
            ) for b in bookings]
        )
        conn.commit()
        print(f"Loaded {len(bookings)} booking line items")


def load_occupancy(conn, csv_path):
    """Load daily occupancy"""
    print("Loading daily occupancy...")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        occupancy = list(reader)
    
    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO daily_occupancy (
                date, room_type, total_rooms, rooms_sold,
                rooms_out_of_service, rooms_blocked, occupancy_pct,
                room_revenue_eur, adr_eur, revpar_eur,
                weather_condition, avg_temperature_c, snow_depth_cm
            ) VALUES %s
            ON CONFLICT (date, room_type) DO UPDATE SET
                rooms_sold = EXCLUDED.rooms_sold,
                rooms_out_of_service = EXCLUDED.rooms_out_of_service,
                rooms_blocked = EXCLUDED.rooms_blocked,
                occupancy_pct = EXCLUDED.occupancy_pct,
                room_revenue_eur = EXCLUDED.room_revenue_eur,
                adr_eur = EXCLUDED.adr_eur,
                revpar_eur = EXCLUDED.revpar_eur,
                weather_condition = EXCLUDED.weather_condition,
                avg_temperature_c = EXCLUDED.avg_temperature_c,
                snow_depth_cm = EXCLUDED.snow_depth_cm
            """,
            [(
                o['date'], o['room_type'], int(o['total_rooms']),
                int(o['rooms_sold']), int(o['rooms_out_of_service']),
                int(o['rooms_blocked']), Decimal(o['occupancy_pct']),
                Decimal(o['room_revenue_eur']), Decimal(o['adr_eur']),
                Decimal(o['revpar_eur']), o['weather_condition'],
                Decimal(o['avg_temperature_c']), int(o['snow_depth_cm'])
            ) for o in occupancy]
        )
        conn.commit()
        print(f"Loaded {len(occupancy)} occupancy records")


def load_marketing(conn, csv_path):
    """Load marketing performance"""
    print("Loading marketing performance...")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        marketing = list(reader)
    
    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO marketing_performance (
                date, channel, campaign_name, impressions, clicks, sessions,
                bookings, room_nights, total_revenue_eur, room_revenue_eur,
                marketing_cost_eur, cpc_eur, cpa_eur, roas, conversion_rate
            ) VALUES %s
            ON CONFLICT (date, channel, campaign_name) DO UPDATE SET
                impressions = EXCLUDED.impressions,
                clicks = EXCLUDED.clicks,
                sessions = EXCLUDED.sessions,
                bookings = EXCLUDED.bookings,
                room_nights = EXCLUDED.room_nights,
                total_revenue_eur = EXCLUDED.total_revenue_eur,
                room_revenue_eur = EXCLUDED.room_revenue_eur,
                marketing_cost_eur = EXCLUDED.marketing_cost_eur,
                cpc_eur = EXCLUDED.cpc_eur,
                cpa_eur = EXCLUDED.cpa_eur,
                roas = EXCLUDED.roas,
                conversion_rate = EXCLUDED.conversion_rate
            """,
            [(
                m['date'], m['channel'], m['campaign_name'],
                int(m['impressions']), int(m['clicks']), int(m['sessions']),
                int(m['bookings']), int(m['room_nights']),
                Decimal(m['total_revenue_eur']), Decimal(m['room_revenue_eur']),
                Decimal(m['marketing_cost_eur']), Decimal(m['cpc_eur']),
                Decimal(m['cpa_eur']), Decimal(m['roas']), Decimal(m['conversion_rate'])
            ) for m in marketing]
        )
        conn.commit()
        print(f"Loaded {len(marketing)} marketing performance records")


def main():
    """Main ETL pipeline"""
    print("Starting ETL pipeline...")
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Get the project root (parent of scripts directory)
    project_root = os.path.dirname(script_dir)
    # Change to project root so relative paths work correctly
    os.chdir(project_root)
    
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Connect to database
    conn = connect_db()
    
    try:
        # Load dimensions first
        load_marketing_channels(conn)
        
        # Load fact tables
        if os.path.exists('data/guest_profiles.csv'):
            load_guest_profiles(conn, 'data/guest_profiles.csv')
        
        if os.path.exists('data/bookings_with_charges.csv'):
            load_bookings(conn, 'data/bookings_with_charges.csv')
            # Reload guests to update lifetime stats
            if os.path.exists('data/guest_profiles.csv'):
                load_guest_profiles(conn, 'data/guest_profiles.csv')
        
        if os.path.exists('data/daily_occupancy.csv'):
            load_occupancy(conn, 'data/daily_occupancy.csv')
        
        if os.path.exists('data/marketing_performance.csv'):
            load_marketing(conn, 'data/marketing_performance.csv')
        
        print("\nETL pipeline completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error during ETL: {e}")
        raise
    finally:
        conn.close()


if __name__ == '__main__':
    main()

