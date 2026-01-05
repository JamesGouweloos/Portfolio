-- Hotel Booking Analytics Database Schema
-- Designed for Livigno hotel with ski resort focus

-- ============================================
-- DIMENSION TABLES
-- ============================================

-- Guest Dimension Table
CREATE TABLE IF NOT EXISTS guest_profiles (
    guest_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    country_of_residence VARCHAR(100),
    city_of_residence VARCHAR(100),
    nationality VARCHAR(100),
    family_status VARCHAR(50),
    primary_purpose_of_stay VARCHAR(50),
    travel_party_type VARCHAR(50),
    preferred_room_type VARCHAR(50),
    ski_skill_level VARCHAR(50),
    email_marketing_opt_in BOOLEAN DEFAULT FALSE,
    sms_opt_in BOOLEAN DEFAULT FALSE,
    loyalty_member BOOLEAN DEFAULT FALSE,
    loyalty_tier VARCHAR(20) DEFAULT 'None',
    -- Derived analytics fields (precomputed)
    age_at_check_in INTEGER,
    lifetime_bookings INTEGER DEFAULT 0,
    lifetime_revenue_eur DECIMAL(12, 2) DEFAULT 0.00,
    first_booking_date DATE,
    most_recent_booking_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Channel Dimension Table
CREATE TABLE IF NOT EXISTS marketing_channels (
    channel_id SERIAL PRIMARY KEY,
    channel VARCHAR(100) UNIQUE NOT NULL,
    channel_category VARCHAR(50), -- Direct, OTA, Social, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Date Dimension Table (optional, can be generated)
CREATE TABLE IF NOT EXISTS date_dimension (
    date DATE PRIMARY KEY,
    year INTEGER,
    month INTEGER,
    month_name VARCHAR(20),
    quarter INTEGER,
    week_number INTEGER,
    day_of_week INTEGER,
    day_name VARCHAR(20),
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    season VARCHAR(20), -- Winter, Spring, Summer, Fall
    is_peak_season BOOLEAN -- For Livigno: Dec-Mar is peak
);

-- ============================================
-- FACT TABLES
-- ============================================

-- Bookings and Charges Fact Table
CREATE TABLE IF NOT EXISTS bookings_with_charges (
    line_id VARCHAR(100) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    guest_id VARCHAR(50) NOT NULL,
    -- Booking-level fields
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER,
    num_guests INTEGER,
    num_adults INTEGER,
    num_children INTEGER,
    room_type VARCHAR(50),
    board_type VARCHAR(50),
    booking_status VARCHAR(50),
    booking_channel VARCHAR(100),
    booking_created_date DATE,
    country VARCHAR(100),
    -- Charge line-item fields
    charge_date DATE NOT NULL,
    charge_category VARCHAR(50),
    charge_item VARCHAR(200),
    unit_price_eur DECIMAL(10, 2),
    quantity DECIMAL(10, 2) DEFAULT 1.00,
    line_subtotal_eur DECIMAL(10, 2),
    tax_rate DECIMAL(5, 4) DEFAULT 0.10,
    line_tax_eur DECIMAL(10, 2),
    line_total_eur DECIMAL(10, 2),
    -- Booking-level revenue summaries (precomputed)
    room_revenue_eur DECIMAL(12, 2),
    fb_revenue_eur DECIMAL(12, 2),
    activities_revenue_eur DECIMAL(12, 2),
    total_revenue_eur DECIMAL(12, 2),
    discount_eur DECIMAL(10, 2) DEFAULT 0.00,
    net_revenue_eur DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guest_profiles(guest_id),
    FOREIGN KEY (booking_channel) REFERENCES marketing_channels(channel)
);

-- Daily Occupancy Fact Table
CREATE TABLE IF NOT EXISTS daily_occupancy (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    room_type VARCHAR(50) DEFAULT 'All',
    total_rooms INTEGER NOT NULL,
    rooms_sold INTEGER DEFAULT 0,
    rooms_out_of_service INTEGER DEFAULT 0,
    rooms_blocked INTEGER DEFAULT 0,
    occupancy_pct DECIMAL(5, 2),
    room_revenue_eur DECIMAL(12, 2) DEFAULT 0.00,
    adr_eur DECIMAL(10, 2), -- Average Daily Rate
    revpar_eur DECIMAL(10, 2), -- Revenue per Available Room
    weather_condition VARCHAR(50),
    avg_temperature_c DECIMAL(5, 2),
    snow_depth_cm INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, room_type)
);

-- Marketing Performance Fact Table
CREATE TABLE IF NOT EXISTS marketing_performance (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    channel VARCHAR(100) NOT NULL,
    campaign_name VARCHAR(200),
    -- Top-of-funnel metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    -- Conversion & revenue
    bookings INTEGER DEFAULT 0,
    room_nights INTEGER DEFAULT 0,
    total_revenue_eur DECIMAL(12, 2) DEFAULT 0.00,
    room_revenue_eur DECIMAL(12, 2) DEFAULT 0.00,
    -- Cost & efficiency
    marketing_cost_eur DECIMAL(10, 2) DEFAULT 0.00,
    cpc_eur DECIMAL(10, 4), -- Cost per click
    cpa_eur DECIMAL(10, 2), -- Cost per acquisition
    roas DECIMAL(10, 4), -- Return on ad spend
    conversion_rate DECIMAL(5, 4), -- bookings / sessions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel) REFERENCES marketing_channels(channel),
    UNIQUE(date, channel, campaign_name)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings_with_charges(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings_with_charges(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings_with_charges(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON bookings_with_charges(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_charge_date ON bookings_with_charges(charge_date);
CREATE INDEX IF NOT EXISTS idx_bookings_channel ON bookings_with_charges(booking_channel);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings_with_charges(booking_status);

CREATE INDEX IF NOT EXISTS idx_occupancy_date ON daily_occupancy(date);
CREATE INDEX IF NOT EXISTS idx_occupancy_room_type ON daily_occupancy(room_type);

CREATE INDEX IF NOT EXISTS idx_marketing_date ON marketing_performance(date);
CREATE INDEX IF NOT EXISTS idx_marketing_channel ON marketing_performance(channel);

CREATE INDEX IF NOT EXISTS idx_guests_country ON guest_profiles(country_of_residence);
CREATE INDEX IF NOT EXISTS idx_guests_loyalty ON guest_profiles(loyalty_tier);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Booking Summary View
CREATE OR REPLACE VIEW booking_summary AS
SELECT 
    booking_id,
    guest_id,
    check_in_date,
    check_out_date,
    nights,
    num_guests,
    room_type,
    board_type,
    booking_status,
    booking_channel,
    country,
    MAX(room_revenue_eur) as room_revenue_eur,
    MAX(fb_revenue_eur) as fb_revenue_eur,
    MAX(activities_revenue_eur) as activities_revenue_eur,
    MAX(total_revenue_eur) as total_revenue_eur,
    MAX(discount_eur) as discount_eur,
    MAX(net_revenue_eur) as net_revenue_eur
FROM bookings_with_charges
GROUP BY booking_id, guest_id, check_in_date, check_out_date, nights, 
         num_guests, room_type, board_type, booking_status, booking_channel, country;

-- Revenue by Channel View
CREATE OR REPLACE VIEW revenue_by_channel AS
SELECT 
    booking_channel,
    COUNT(DISTINCT booking_id) as total_bookings,
    SUM(room_revenue_eur) as total_room_revenue,
    SUM(fb_revenue_eur) as total_fb_revenue,
    SUM(activities_revenue_eur) as total_activities_revenue,
    SUM(net_revenue_eur) as total_net_revenue,
    AVG(nights) as avg_nights,
    SUM(nights) as total_room_nights
FROM booking_summary
WHERE booking_status = 'Stayed'
GROUP BY booking_channel;

