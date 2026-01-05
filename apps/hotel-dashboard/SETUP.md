# Setup Guide

## Step-by-Step Setup Instructions

### 1. Database Setup

#### Install PostgreSQL
- Download and install PostgreSQL from https://www.postgresql.org/download/
- Note your postgres user password during installation

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hotel_analytics;

# Exit psql
\q
```

#### Run Schema
```bash
psql -U postgres -d hotel_analytics -f database/schema.sql
```

### 2. Python Environment Setup

#### Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your database credentials
# Use your actual PostgreSQL password
```

### 3. Generate Data

```bash
# This will create CSV files in the data/ directory
python scripts/generate_data.py
```

Expected output:
- `data/guest_profiles.csv`
- `data/bookings_with_charges.csv`
- `data/daily_occupancy.csv`
- `data/marketing_performance.csv`

### 4. Load Data into Database

```bash
# Run ETL pipeline
python scripts/etl_pipeline.py
```

This will:
- Load marketing channels dimension
- Load guest profiles
- Load bookings and charges
- Update guest lifetime statistics
- Load daily occupancy
- Load marketing performance

### 5. Next.js Setup

#### Install Dependencies
```bash
npm install
```

#### Configure Environment
The `.env` file you created for Python will also be used by Next.js (via `next.config.js`).

#### Run Development Server
```bash
npm run dev
```

### 6. Access Dashboard

Open your browser and navigate to:
```
http://localhost:3000
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running**
   ```bash
   # Windows
   # Check Services for PostgreSQL
   
   # Mac/Linux
   sudo service postgresql status
   ```

2. **Verify credentials in .env**
   - Ensure DB_HOST, DB_NAME, DB_USER, DB_PASSWORD are correct
   - Default port is 5432

3. **Test connection**
   ```bash
   psql -U postgres -d hotel_analytics
   ```

### Python Issues

1. **Module not found errors**
   ```bash
   # Ensure virtual environment is activated
   pip install -r requirements.txt
   ```

2. **CSV generation errors**
   - Ensure `data/` directory exists
   - Check file permissions

### Next.js Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000 or use different port
   npm run dev -- -p 3001
   ```

2. **API route errors**
   - Check database connection
   - Verify environment variables are loaded
   - Check browser console for errors

### Data Issues

1. **Empty dashboard**
   - Verify data was loaded: `psql -d hotel_analytics -c "SELECT COUNT(*) FROM bookings_with_charges;"`
   - Regenerate data if needed
   - Re-run ETL pipeline

2. **Missing relationships**
   - Ensure schema was run completely
   - Check foreign key constraints: `psql -d hotel_analytics -c "\d bookings_with_charges"`

## Verification Queries

Run these in PostgreSQL to verify setup:

```sql
-- Check table counts
SELECT 'guests' as table_name, COUNT(*) as count FROM guest_profiles
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings_with_charges
UNION ALL
SELECT 'occupancy', COUNT(*) FROM daily_occupancy
UNION ALL
SELECT 'marketing', COUNT(*) FROM marketing_performance;

-- Check revenue totals
SELECT 
  SUM(net_revenue_eur) as total_revenue,
  COUNT(DISTINCT booking_id) as total_bookings
FROM bookings_with_charges
WHERE booking_status = 'Stayed';

-- Check date ranges
SELECT 
  MIN(date) as min_date,
  MAX(date) as max_date
FROM daily_occupancy;
```

## Production Deployment

For production deployment:

1. **Set up production database**
   - Use managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
   - Update connection string in environment variables

2. **Build Next.js application**
   ```bash
   npm run build
   npm start
   ```

3. **Set up environment variables**
   - Use secure secret management
   - Never commit `.env` files

4. **Configure CORS and security**
   - Update `next.config.js` for production settings
   - Add authentication if needed

