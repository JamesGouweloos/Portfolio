# Data Model Design

## Overview

This document describes the data model for the Hotel Booking Analytics system. The design follows dimensional modeling principles (star schema) optimized for analytical queries.

## Core Design Principles

1. **Fact Tables**: Store measurable business events (bookings, occupancy, marketing spend)
2. **Dimension Tables**: Store descriptive attributes (guests, channels, dates)
3. **Grain**: Each fact table has a clear grain (one row per booking line item, one row per day, etc.)
4. **Keys**: Proper primary and foreign keys maintain referential integrity
5. **Indexes**: Strategic indexes optimize common query patterns

## Entity Relationship Diagram

```
guest_profiles (dimension)
    ↑
    │ guest_id (FK)
    │
bookings_with_charges (fact)
    │
    ├─→ booking_channel (FK) → marketing_channels (dimension)
    │
    └─→ charge_date → daily_occupancy (fact)
                      └─→ date → date_dimension (dimension, optional)

marketing_performance (fact)
    └─→ channel (FK) → marketing_channels (dimension)
```

## Table Descriptions

### Dimension Tables

#### guest_profiles
**Grain**: One row per guest

**Purpose**: Stores guest demographic information and precomputed lifetime analytics.

**Key Fields**:
- `guest_id` (PK): Unique guest identifier
- Demographics: name, DOB, gender, country, nationality
- Preferences: preferred room type, ski skill level, purpose of stay
- Marketing: opt-in flags, loyalty tier
- Analytics (precomputed): lifetime bookings, lifetime revenue, first/last booking dates

**Relationships**:
- One-to-many with `bookings_with_charges` via `guest_id`

#### marketing_channels
**Grain**: One row per marketing channel

**Purpose**: Dimension table for marketing channels with categorization.

**Key Fields**:
- `channel_id` (PK): Auto-increment ID
- `channel` (UK): Channel name (e.g., "Direct-Web", "OTA-Expedia")
- `channel_category`: High-level category (Direct, OTA, Social, etc.)

**Relationships**:
- One-to-many with `bookings_with_charges` via `booking_channel`
- One-to-many with `marketing_performance` via `channel`

#### date_dimension (Optional)
**Grain**: One row per calendar date

**Purpose**: Pre-computed date attributes for time-based analysis.

**Key Fields**:
- `date` (PK): Calendar date
- Temporal attributes: year, month, quarter, week, day of week
- Business attributes: is_weekend, is_holiday, season, is_peak_season

**Note**: Can be generated on-the-fly in SQL, but pre-computing improves query performance.

### Fact Tables

#### bookings_with_charges
**Grain**: One row per booking line item (charge component)

**Purpose**: Core fact table storing all booking and revenue details at the line-item level.

**Key Fields**:

**Booking-Level** (repeated for each line item):
- `booking_id`: Unique booking identifier
- `guest_id` (FK): Links to guest_profiles
- `check_in_date`, `check_out_date`: Stay dates
- `nights`: Calculated stay length
- `num_guests`, `num_adults`, `num_children`: Guest counts
- `room_type`: Room category
- `board_type`: Meal plan
- `booking_status`: Stayed, Cancelled, No-show
- `booking_channel` (FK): Links to marketing_channels
- `booking_created_date`: When booking was made
- `country`: Guest origin country

**Line-Item Level**:
- `line_id` (PK): Unique line item identifier
- `charge_date`: Date of charge
- `charge_category`: Room, F&B, Spa, SkiPass, EquipmentRental, etc.
- `charge_item`: Specific item description
- `unit_price_eur`: Price per unit
- `quantity`: Number of units
- `line_subtotal_eur`: quantity × unit_price
- `tax_rate`: Tax percentage
- `line_tax_eur`: Tax amount
- `line_total_eur`: Total including tax

**Precomputed Booking Totals** (repeated for each line item):
- `room_revenue_eur`: Sum of room charges for booking
- `fb_revenue_eur`: Sum of F&B charges
- `activities_revenue_eur`: Sum of activity charges
- `total_revenue_eur`: Total revenue
- `discount_eur`: Discounts applied
- `net_revenue_eur`: Total minus discounts

**Design Notes**:
- Denormalized structure for query performance
- Booking-level fields repeated for each line item to enable single-table queries
- Can be aggregated to booking-level using `booking_id` GROUP BY

**Relationships**:
- Many-to-one with `guest_profiles` via `guest_id`
- Many-to-one with `marketing_channels` via `booking_channel`

#### daily_occupancy
**Grain**: One row per date (optionally per room type)

**Purpose**: Daily occupancy and revenue metrics for fast dashboard queries.

**Key Fields**:
- `id` (PK): Auto-increment
- `date`: Calendar date
- `room_type`: Room category or "All"
- `total_rooms`: Total room inventory
- `rooms_sold`: Occupied rooms
- `rooms_out_of_service`: Maintenance
- `rooms_blocked`: Group blocks
- `occupancy_pct`: Calculated occupancy percentage
- `room_revenue_eur`: Sum of room revenue for date
- `adr_eur`: Average Daily Rate (room_revenue / rooms_sold)
- `revpar_eur`: Revenue per Available Room
- `weather_condition`: Weather description
- `avg_temperature_c`: Average temperature
- `snow_depth_cm`: Snow depth (for ski resort)

**Design Notes**:
- Can be regenerated from `bookings_with_charges` during ETL
- Pre-aggregated for fast dashboard queries
- Weather data added for correlation analysis

**Relationships**:
- Can join to `bookings_with_charges` via `charge_date = date`

#### marketing_performance
**Grain**: One row per channel per date (optionally per campaign)

**Purpose**: Marketing funnel and ROI metrics by channel.

**Key Fields**:

**Identity**:
- `id` (PK): Auto-increment
- `date`: Performance date
- `channel` (FK): Links to marketing_channels
- `campaign_name`: Optional campaign identifier

**Top-of-Funnel**:
- `impressions`: Ad impressions
- `clicks`: Ad clicks
- `sessions`: Website sessions from channel

**Conversion & Revenue**:
- `bookings`: Number of bookings attributed
- `room_nights`: Total room nights
- `total_revenue_eur`: Revenue attributed to channel
- `room_revenue_eur`: Room revenue portion

**Cost & Efficiency**:
- `marketing_cost_eur`: Marketing spend
- `cpc_eur`: Cost per click
- `cpa_eur`: Cost per acquisition
- `roas`: Return on ad spend (revenue / cost)
- `conversion_rate`: bookings / sessions

**Design Notes**:
- Supports last-touch attribution model
- Can be extended for multi-touch attribution
- ROAS and conversion_rate can be calculated on-the-fly or precomputed

**Relationships**:
- Many-to-one with `marketing_channels` via `channel`

## Key Relationships

### Primary Keys
- `guest_profiles.guest_id`
- `bookings_with_charges.line_id`
- `daily_occupancy.id`
- `marketing_performance.id`
- `marketing_channels.channel_id`

### Foreign Keys
- `bookings_with_charges.guest_id` → `guest_profiles.guest_id`
- `bookings_with_charges.booking_channel` → `marketing_channels.channel`
- `marketing_performance.channel` → `marketing_channels.channel`

### Date Relationships
- `bookings_with_charges.charge_date` can join to `daily_occupancy.date`
- `bookings_with_charges.check_in_date` can join to `daily_occupancy.date`
- `marketing_performance.date` can join to `daily_occupancy.date`

## Index Strategy

### High-Selectivity Indexes
- `bookings_with_charges(guest_id)` - Frequent guest lookups
- `bookings_with_charges(booking_id)` - Booking aggregation
- `bookings_with_charges(booking_channel)` - Channel analysis

### Date Range Indexes
- `bookings_with_charges(check_in_date)` - Date range filters
- `bookings_with_charges(charge_date)` - Daily revenue queries
- `daily_occupancy(date)` - Time series queries
- `marketing_performance(date)` - Marketing trends

### Composite Indexes (Potential)
- `bookings_with_charges(booking_status, check_in_date)` - Active bookings by date
- `daily_occupancy(date, room_type)` - Already covered by UNIQUE constraint

## Data Consistency Rules

1. **Occupancy Consistency**: Each occupied night in `daily_occupancy` should trace back to at least one "Stayed" booking in `bookings_with_charges`

2. **Revenue Consistency**: Sum of `line_total_eur` for a booking should equal `total_revenue_eur` (within rounding)

3. **Channel Consistency**: All `booking_channel` values in `bookings_with_charges` should exist in `marketing_channels`

4. **Guest Consistency**: All `guest_id` values in `bookings_with_charges` should exist in `guest_profiles`

## Query Patterns

### Common Analytical Queries

1. **Revenue by Channel**
   ```sql
   SELECT booking_channel, SUM(net_revenue_eur)
   FROM bookings_with_charges
   WHERE booking_status = 'Stayed'
   GROUP BY booking_channel
   ```

2. **Daily Occupancy Trend**
   ```sql
   SELECT date, occupancy_pct, adr_eur, revpar_eur
   FROM daily_occupancy
   WHERE date BETWEEN :start AND :end
   ORDER BY date
   ```

3. **Marketing ROI**
   ```sql
   SELECT channel, 
          SUM(total_revenue_eur) / SUM(marketing_cost_eur) as roas
   FROM marketing_performance
   GROUP BY channel
   ```

4. **Guest Lifetime Value**
   ```sql
   SELECT loyalty_tier, AVG(lifetime_revenue_eur)
   FROM guest_profiles
   GROUP BY loyalty_tier
   ```

## Data Generation Patterns

The synthetic data generation script (`scripts/generate_data.py`) creates realistic patterns:

1. **Seasonality**: Higher prices and ski activity in Dec-Mar (peak season)
2. **Channel Distribution**: Mix of direct and OTA channels
3. **Guest Behavior**: Some guests have multiple bookings (loyalty)
4. **Weather Correlation**: Snow depth correlates with ski revenue
5. **Booking Status**: 85% Stayed, 10% Cancelled, 5% No-show

## Future Enhancements

1. **Additional Dimensions**:
   - Room dimension (room number, floor, amenities)
   - Staff dimension (for service quality analysis)
   - Package dimension (promotional packages)

2. **Additional Facts**:
   - Guest satisfaction scores
   - Service requests/incidents
   - Inventory levels (for forecasting)

3. **Slowly Changing Dimensions**:
   - Track guest profile changes over time
   - Track channel performance changes

4. **Aggregated Facts**:
   - Pre-aggregated monthly summaries
   - Materialized views for common queries

