"""
Synthetic Data Generation Script for Hotel Booking Analytics
Generates realistic data for Livigno hotel with ski resort focus
"""

import csv
import random
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

# Configuration
START_DATE = datetime(2024, 12, 1)
END_DATE = datetime(2025, 4, 30)
NUM_GUESTS = 500
NUM_BOOKINGS = 800
ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Family', 'Premium']
BOARD_TYPES = ['Room only', 'B&B', 'Half-board', 'Full-board']
BOOKING_STATUSES = ['Stayed', 'Cancelled', 'No-show']
BOOKING_CHANNELS = [
    'Direct-Web', 'Direct-Phone', 'OTA-Booking.com', 'OTA-Expedia', 
    'TravelAgent', 'Corporate', 'Social-Paid', 'Social-Organic'
]
CHARGE_CATEGORIES = {
    'Room': ['Room Night', 'Room Upgrade', 'Late Checkout'],
    'F&B': ['Breakfast Buffet', 'Dinner Buffet', 'Room Service', 'Bar', 'Restaurant'],
    'Spa': ['Massage', 'Spa Package', 'Sauna Access', 'Wellness Treatment'],
    'SkiPass': ['Ski Pass – Full Day', 'Ski Pass – Half Day', 'Ski Pass – Multi Day'],
    'EquipmentRental': ['Ski Rental – Standard', 'Ski Rental – Premium', 'Snowboard Rental', 'Boots Rental'],
    'AirportTransfer': ['Airport Transfer – One Way', 'Airport Transfer – Round Trip'],
    'Other': ['Parking', 'WiFi Premium', 'Laundry Service', 'Mini Bar']
}
COUNTRIES = ['Italy', 'Switzerland', 'Germany', 'UK', 'Netherlands', 'France', 'Austria', 'USA', 'Canada']
GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
FAMILY_STATUSES = ['Solo', 'Couple', 'Family-with-children', 'Group-of-friends']
PURPOSE_OF_STAY = ['Leisure-Ski', 'Leisure-Summer', 'Business', 'Event', 'Other']
SKI_SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Non-skier']
WEATHER_CONDITIONS = ['Sunny', 'Snow', 'Blizzard', 'Rain', 'Overcast']
LOYALTY_TIERS = ['None', 'Silver', 'Gold', 'Platinum']

# Room capacity
ROOM_CAPACITY = {
    'Standard': 2,
    'Deluxe': 2,
    'Suite': 4,
    'Family': 4,
    'Premium': 2
}

TOTAL_ROOMS = 100
ROOM_DISTRIBUTION = {
    'Standard': 50,
    'Deluxe': 30,
    'Family': 15,
    'Suite': 4,
    'Premium': 1
}


def generate_guest_id(index):
    """Generate unique guest ID"""
    return f"GUEST-{str(index).zfill(6)}"


def generate_booking_id(index):
    """Generate unique booking ID"""
    return f"LIV-2025-{str(index).zfill(6)}"


def generate_line_id(booking_id, line_num):
    """Generate unique line item ID"""
    return f"{booking_id}-LINE-{str(line_num).zfill(3)}"


def random_date(start, end):
    """Generate random date between start and end"""
    delta = end - start
    days = random.randint(0, delta.days)
    return start + timedelta(days=days)


def is_peak_season(date):
    """Check if date is in peak season (Dec-Mar for Livigno)"""
    return date.month in [12, 1, 2, 3]


def get_weather_for_date(date):
    """Generate weather based on season"""
    if is_peak_season(date):
        # Winter: more snow
        weather = random.choices(
            ['Sunny', 'Snow', 'Blizzard', 'Overcast'],
            weights=[30, 40, 10, 20]
        )[0]
        temp = random.randint(-10, 5)
        snow_depth = random.randint(20, 150) if weather in ['Snow', 'Blizzard'] else random.randint(10, 80)
    else:
        # Shoulder season
        weather = random.choices(
            ['Sunny', 'Rain', 'Overcast'],
            weights=[50, 20, 30]
        )[0]
        temp = random.randint(5, 15)
        snow_depth = random.randint(0, 30)
    
    return weather, temp, snow_depth


def generate_guest_profiles():
    """Generate guest profiles dataset"""
    guests = []
    
    for i in range(1, NUM_GUESTS + 1):
        guest_id = generate_guest_id(i)
        birth_year = random.randint(1950, 2005)
        birth_month = random.randint(1, 12)
        birth_day = random.randint(1, 28)
        date_of_birth = datetime(birth_year, birth_month, birth_day).date()
        
        guest = {
            'guest_id': guest_id,
            'first_name': f'Guest{i}',
            'last_name': f'LastName{random.randint(1, 100)}',
            'email': f'guest{i}@example.com',
            'date_of_birth': date_of_birth.isoformat(),
            'gender': random.choice(GENDERS),
            'country_of_residence': random.choice(COUNTRIES),
            'city_of_residence': f'City{random.randint(1, 50)}',
            'nationality': random.choice(COUNTRIES),
            'family_status': random.choice(FAMILY_STATUSES),
            'primary_purpose_of_stay': random.choice(PURPOSE_OF_STAY),
            'travel_party_type': random.choice(['Friends', 'Family', 'Couple', 'Corporate group']),
            'preferred_room_type': random.choice(ROOM_TYPES),
            'ski_skill_level': random.choice(SKI_SKILL_LEVELS),
            'email_marketing_opt_in': random.choice([True, False]),
            'sms_opt_in': random.choice([True, False]),
            'loyalty_member': random.choice([True, False]),
            'loyalty_tier': random.choice(LOYALTY_TIERS) if random.random() > 0.3 else 'None',
            'age_at_check_in': None,  # Will be calculated
            'lifetime_bookings': 0,  # Will be calculated
            'lifetime_revenue_eur': '0.00',
            'first_booking_date': None,
            'most_recent_booking_date': None
        }
        guests.append(guest)
    
    return guests


def generate_bookings_with_charges(guests):
    """Generate bookings and charge line items"""
    bookings_data = []
    booking_summaries = {}  # Track booking-level totals
    
    # Assign some guests multiple bookings
    guest_booking_counts = {g['guest_id']: random.choices([1, 2, 3, 4], weights=[60, 25, 10, 5])[0] 
                           for g in guests}
    
    booking_index = 1
    
    for guest in guests:
        guest_id = guest['guest_id']
        num_bookings = guest_booking_counts[guest_id]
        
        for _ in range(num_bookings):
            if booking_index > NUM_BOOKINGS:
                break
                
            booking_id = generate_booking_id(booking_index)
            booking_created = random_date(START_DATE - timedelta(days=90), START_DATE)
            check_in = random_date(START_DATE, END_DATE - timedelta(days=7))
            nights = random.choices([1, 2, 3, 4, 5, 7, 14], weights=[10, 20, 25, 20, 15, 8, 2])[0]
            check_out = check_in + timedelta(days=nights)
            
            if check_out > END_DATE:
                continue
            
            room_type = random.choice(ROOM_TYPES)
            board_type = random.choice(BOARD_TYPES)
            booking_status = random.choices(
                BOOKING_STATUSES,
                weights=[85, 10, 5]  # Most bookings are stayed
            )[0]
            booking_channel = random.choice(BOOKING_CHANNELS)
            
            max_guests = ROOM_CAPACITY.get(room_type, 2)
            num_adults = random.randint(1, max_guests)
            num_children = random.randint(0, max(0, max_guests - num_adults))
            num_guests = num_adults + num_children
            
            # Initialize booking totals
            booking_summaries[booking_id] = {
                'room_revenue': Decimal('0.00'),
                'fb_revenue': Decimal('0.00'),
                'activities_revenue': Decimal('0.00'),
                'total_revenue': Decimal('0.00'),
                'discount': Decimal(str(random.uniform(0, 50))) if random.random() < 0.2 else Decimal('0.00')
            }
            
            # Generate room charges (one per night)
            room_price_base = {
                'Standard': 120,
                'Deluxe': 180,
                'Suite': 350,
                'Family': 200,
                'Premium': 250
            }
            
            for night in range(nights):
                charge_date = check_in + timedelta(days=night)
                line_num = night + 1
                line_id = generate_line_id(booking_id, line_num)
                
                # Room charge
                base_price = room_price_base[room_type]
                if is_peak_season(charge_date):
                    price_multiplier = random.uniform(1.2, 1.5)
                else:
                    price_multiplier = random.uniform(0.8, 1.0)
                
                unit_price = Decimal(str(base_price * price_multiplier))
                quantity = Decimal('1.00')
                subtotal = unit_price * quantity
                tax_rate = Decimal('0.10')
                tax = subtotal * tax_rate
                total = subtotal + tax
                
                booking_summaries[booking_id]['room_revenue'] += subtotal
                booking_summaries[booking_id]['total_revenue'] += total
                
                bookings_data.append({
                    'line_id': line_id,
                    'booking_id': booking_id,
                    'guest_id': guest_id,
                    'check_in_date': check_in.isoformat(),
                    'check_out_date': check_out.isoformat(),
                    'nights': nights,
                    'num_guests': num_guests,
                    'num_adults': num_adults,
                    'num_children': num_children,
                    'room_type': room_type,
                    'board_type': board_type,
                    'booking_status': booking_status,
                    'booking_channel': booking_channel,
                    'booking_created_date': booking_created.isoformat(),
                    'country': guest['country_of_residence'],
                    'charge_date': charge_date.isoformat(),
                    'charge_category': 'Room',
                    'charge_item': 'Room Night',
                    'unit_price_eur': str(unit_price),
                    'quantity': str(quantity),
                    'line_subtotal_eur': str(subtotal),
                    'tax_rate': str(tax_rate),
                    'line_tax_eur': str(tax),
                    'line_total_eur': str(total),
                    'room_revenue_eur': None,  # Will be filled
                    'fb_revenue_eur': None,
                    'activities_revenue_eur': None,
                    'total_revenue_eur': None,
                    'discount_eur': None,
                    'net_revenue_eur': None
                })
            
            # Generate F&B charges (if board type includes meals)
            if board_type in ['B&B', 'Half-board', 'Full-board']:
                for night in range(nights):
                    charge_date = check_in + timedelta(days=night)
                    line_num = len([b for b in bookings_data if b['booking_id'] == booking_id]) + 1
                    line_id = generate_line_id(booking_id, line_num)
                    
                    if board_type == 'B&B':
                        items = ['Breakfast Buffet']
                    elif board_type == 'Half-board':
                        items = ['Breakfast Buffet', 'Dinner Buffet']
                    else:
                        items = ['Breakfast Buffet', 'Lunch Buffet', 'Dinner Buffet']
                    
                    for item in items:
                        unit_price = Decimal(str(random.uniform(15, 45) * num_guests))
                        quantity = Decimal('1.00')
                        subtotal = unit_price * quantity
                        tax = subtotal * Decimal('0.10')
                        total = subtotal + tax
                        
                        booking_summaries[booking_id]['fb_revenue'] += subtotal
                        booking_summaries[booking_id]['total_revenue'] += total
                        
                        bookings_data.append({
                            'line_id': line_id,
                            'booking_id': booking_id,
                            'guest_id': guest_id,
                            'check_in_date': check_in.isoformat(),
                            'check_out_date': check_out.isoformat(),
                            'nights': nights,
                            'num_guests': num_guests,
                            'num_adults': num_adults,
                            'num_children': num_children,
                            'room_type': room_type,
                            'board_type': board_type,
                            'booking_status': booking_status,
                            'booking_channel': booking_channel,
                            'booking_created_date': booking_created.isoformat(),
                            'country': guest['country_of_residence'],
                            'charge_date': charge_date.isoformat(),
                            'charge_category': 'F&B',
                            'charge_item': item,
                            'unit_price_eur': str(unit_price),
                            'quantity': str(quantity),
                            'line_subtotal_eur': str(subtotal),
                            'tax_rate': '0.10',
                            'line_tax_eur': str(tax),
                            'line_total_eur': str(total),
                            'room_revenue_eur': None,
                            'fb_revenue_eur': None,
                            'activities_revenue_eur': None,
                            'total_revenue_eur': None,
                            'discount_eur': None,
                            'net_revenue_eur': None
                        })
                        line_num += 1
            
            # Generate activity charges (ski-related, spa, etc.)
            if booking_status == 'Stayed' and is_peak_season(check_in):
                # Higher probability of ski activities in peak season
                activity_probability = 0.7
            else:
                activity_probability = 0.3
            
            if random.random() < activity_probability:
                num_activities = random.randint(1, 5)
                for _ in range(num_activities):
                    charge_date = random_date(check_in, check_out - timedelta(days=1))
                    line_num = len([b for b in bookings_data if b['booking_id'] == booking_id]) + 1
                    line_id = generate_line_id(booking_id, line_num)
                    
                    category = random.choice(['SkiPass', 'EquipmentRental', 'Spa', 'AirportTransfer', 'Other'])
                    charge_item = random.choice(CHARGE_CATEGORIES[category])
                    
                    if category == 'SkiPass':
                        unit_price = Decimal(str(random.uniform(40, 80) * num_adults))
                    elif category == 'EquipmentRental':
                        unit_price = Decimal(str(random.uniform(25, 60) * num_adults))
                    elif category == 'Spa':
                        unit_price = Decimal(str(random.uniform(80, 200)))
                    elif category == 'AirportTransfer':
                        unit_price = Decimal(str(random.uniform(100, 250)))
                    else:
                        unit_price = Decimal(str(random.uniform(10, 50)))
                    
                    quantity = Decimal('1.00')
                    subtotal = unit_price * quantity
                    tax = subtotal * Decimal('0.10')
                    total = subtotal + tax
                    
                    booking_summaries[booking_id]['activities_revenue'] += subtotal
                    booking_summaries[booking_id]['total_revenue'] += total
                    
                    bookings_data.append({
                        'line_id': line_id,
                        'booking_id': booking_id,
                        'guest_id': guest_id,
                        'check_in_date': check_in.isoformat(),
                        'check_out_date': check_out.isoformat(),
                        'nights': nights,
                        'num_guests': num_guests,
                        'num_adults': num_adults,
                        'num_children': num_children,
                        'room_type': room_type,
                        'board_type': board_type,
                        'booking_status': booking_status,
                        'booking_channel': booking_channel,
                        'booking_created_date': booking_created.isoformat(),
                        'country': guest['country_of_residence'],
                        'charge_date': charge_date.isoformat(),
                        'charge_category': category,
                        'charge_item': charge_item,
                        'unit_price_eur': str(unit_price),
                        'quantity': str(quantity),
                        'line_subtotal_eur': str(subtotal),
                        'tax_rate': '0.10',
                        'line_tax_eur': str(tax),
                        'line_total_eur': str(total),
                        'room_revenue_eur': None,
                        'fb_revenue_eur': None,
                        'activities_revenue_eur': None,
                        'total_revenue_eur': None,
                        'discount_eur': None,
                        'net_revenue_eur': None
                    })
            
            booking_index += 1
    
    # Fill in booking-level summaries
    for booking_id, summary in booking_summaries.items():
        for row in bookings_data:
            if row['booking_id'] == booking_id:
                row['room_revenue_eur'] = str(summary['room_revenue'])
                row['fb_revenue_eur'] = str(summary['fb_revenue'])
                row['activities_revenue_eur'] = str(summary['activities_revenue'])
                row['total_revenue_eur'] = str(summary['total_revenue'])
                row['discount_eur'] = str(summary['discount'])
                row['net_revenue_eur'] = str(summary['total_revenue'] - summary['discount'])
    
    return bookings_data


def generate_daily_occupancy(bookings_data):
    """Generate daily occupancy from bookings"""
    occupancy_data = []
    current_date = START_DATE
    
    # Aggregate bookings by date
    date_bookings = {}
    for booking in bookings_data:
        if booking['booking_status'] != 'Stayed':
            continue
        
        # Handle both date (YYYY-MM-DD) and datetime (YYYY-MM-DDTHH:MM:SS) formats
        check_in_str = booking['check_in_date']
        check_out_str = booking['check_out_date']
        
        # Parse date, handling both formats
        if 'T' in check_in_str:
            check_in = datetime.fromisoformat(check_in_str).date()
        else:
            check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
        
        if 'T' in check_out_str:
            check_out = datetime.fromisoformat(check_out_str).date()
        else:
            check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
        
        room_type = booking['room_type']
        
        date = check_in
        while date < check_out:
            if date not in date_bookings:
                date_bookings[date] = {}
            if room_type not in date_bookings[date]:
                date_bookings[date][room_type] = {
                    'rooms_sold': 0,
                    'revenue': Decimal('0.00')
                }
            
            date_bookings[date][room_type]['rooms_sold'] += 1
            if booking['charge_category'] == 'Room':
                date_bookings[date][room_type]['revenue'] += Decimal(booking['line_subtotal_eur'])
            
            date += timedelta(days=1)
    
    # Generate occupancy records
    current_date = START_DATE
    while current_date <= END_DATE:
        date_str = current_date.date().isoformat()
        weather, temp, snow_depth = get_weather_for_date(current_date)
        
        # Overall occupancy
        total_rooms_sold = sum(
            sum(rt_data['rooms_sold'] for rt_data in date_data.values())
            for date_data in date_bookings.values()
            if date_data
        ) if current_date.date() in date_bookings else 0
        
        rooms_sold_today = sum(
            rt_data['rooms_sold']
            for rt_data in date_bookings.get(current_date.date(), {}).values()
        )
        
        rooms_out_of_service = random.randint(0, 5) if random.random() < 0.1 else 0
        rooms_blocked = random.randint(0, 10) if random.random() < 0.15 else 0
        available_rooms = TOTAL_ROOMS - rooms_out_of_service - rooms_blocked
        
        room_revenue = sum(
            rt_data['revenue']
            for rt_data in date_bookings.get(current_date.date(), {}).values()
        )
        
        occupancy_pct = (rooms_sold_today / available_rooms * 100) if available_rooms > 0 else 0
        adr = (room_revenue / rooms_sold_today) if rooms_sold_today > 0 else Decimal('0.00')
        revpar = (room_revenue / available_rooms) if available_rooms > 0 else Decimal('0.00')
        
        occupancy_data.append({
            'date': date_str,
            'room_type': 'All',
            'total_rooms': TOTAL_ROOMS,
            'rooms_sold': rooms_sold_today,
            'rooms_out_of_service': rooms_out_of_service,
            'rooms_blocked': rooms_blocked,
            'occupancy_pct': f"{occupancy_pct:.2f}",
            'room_revenue_eur': str(room_revenue),
            'adr_eur': str(adr),
            'revpar_eur': str(revpar),
            'weather_condition': weather,
            'avg_temperature_c': str(temp),
            'snow_depth_cm': str(snow_depth)
        })
        
        current_date += timedelta(days=1)
    
    return occupancy_data


def generate_marketing_performance(bookings_data):
    """Generate marketing performance data"""
    marketing_data = []
    current_date = START_DATE
    
    # Aggregate bookings by date and channel
    channel_performance = {}
    
    for booking in bookings_data:
        if booking['booking_status'] != 'Stayed':
            continue
        
        # Handle both date (YYYY-MM-DD) and datetime (YYYY-MM-DDTHH:MM:SS) formats
        check_in_str = booking['check_in_date']
        if 'T' in check_in_str:
            check_in = datetime.fromisoformat(check_in_str).date()
        else:
            check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
        
        channel = booking['booking_channel']
        
        if check_in not in channel_performance:
            channel_performance[check_in] = {}
        if channel not in channel_performance[check_in]:
            channel_performance[check_in][channel] = {
                'bookings': set(),
                'room_nights': 0,
                'revenue': Decimal('0.00')
            }
        
        booking_id = booking['booking_id']
        channel_performance[check_in][channel]['bookings'].add(booking_id)
        channel_performance[check_in][channel]['revenue'] += Decimal(booking['line_total_eur'])
    
    # Generate marketing records
    current_date = START_DATE
    while current_date <= END_DATE:
        date_str = current_date.date().isoformat()
        
        for channel in BOOKING_CHANNELS:
            perf = channel_performance.get(current_date.date(), {}).get(channel, {
                'bookings': set(),
                'room_nights': 0,
                'revenue': Decimal('0.00')
            })
            
            bookings_count = len(perf['bookings'])
            room_nights = perf['room_nights']
            revenue = perf['revenue']
            
            # Generate funnel metrics
            sessions = random.randint(50, 500) if bookings_count > 0 else random.randint(10, 100)
            clicks = random.randint(int(sessions * 0.3), int(sessions * 0.7))
            impressions = random.randint(clicks * 2, clicks * 10)
            
            # Generate costs (higher for paid channels)
            if 'Paid' in channel or 'OTA' in channel or 'Ads' in channel:
                marketing_cost = Decimal(str(random.uniform(100, 2000)))
            elif channel in ['Direct-Web', 'Direct-Phone']:
                marketing_cost = Decimal(str(random.uniform(10, 100)))
            else:
                marketing_cost = Decimal(str(random.uniform(50, 500)))
            
            cpc = (marketing_cost / clicks) if clicks > 0 else Decimal('0.00')
            cpa = (marketing_cost / bookings_count) if bookings_count > 0 else Decimal('0.00')
            roas = (revenue / marketing_cost) if marketing_cost > 0 else Decimal('0.00')
            conversion_rate = (bookings_count / sessions) if sessions > 0 else Decimal('0.00')
            
            marketing_data.append({
                'date': date_str,
                'channel': channel,
                'campaign_name': f'{channel} Campaign {current_date.strftime("%Y-%m")}',
                'impressions': impressions,
                'clicks': clicks,
                'sessions': sessions,
                'bookings': bookings_count,
                'room_nights': room_nights,
                'total_revenue_eur': str(revenue),
                'room_revenue_eur': str(revenue * Decimal('0.7')),  # Approximate
                'marketing_cost_eur': str(marketing_cost),
                'cpc_eur': str(cpc),
                'cpa_eur': str(cpa),
                'roas': str(roas),
                'conversion_rate': str(conversion_rate)
            })
        
        current_date += timedelta(days=1)
    
    return marketing_data


def write_csv(filename, data, fieldnames):
    """Write data to CSV file"""
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    print(f"Generated {filename} with {len(data)} rows")


def main():
    print("Generating synthetic hotel booking data...")
    
    # Generate guests
    print("Generating guest profiles...")
    guests = generate_guest_profiles()
    guest_fields = list(guests[0].keys())
    write_csv('data/guest_profiles.csv', guests, guest_fields)
    
    # Generate bookings
    print("Generating bookings and charges...")
    bookings = generate_bookings_with_charges(guests)
    booking_fields = list(bookings[0].keys())
    write_csv('data/bookings_with_charges.csv', bookings, booking_fields)
    
    # Generate occupancy
    print("Generating daily occupancy...")
    occupancy = generate_daily_occupancy(bookings)
    occupancy_fields = list(occupancy[0].keys())
    write_csv('data/daily_occupancy.csv', occupancy, occupancy_fields)
    
    # Generate marketing
    print("Generating marketing performance...")
    marketing = generate_marketing_performance(bookings)
    marketing_fields = list(marketing[0].keys())
    write_csv('data/marketing_performance.csv', marketing, marketing_fields)
    
    print("\nData generation complete!")
    print(f"Generated {len(guests)} guests, {len(set(b['booking_id'] for b in bookings))} bookings")


if __name__ == '__main__':
    import os
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Get the project root (parent of scripts directory)
    project_root = os.path.dirname(script_dir)
    # Change to project root so relative paths work correctly
    os.chdir(project_root)
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    main()

