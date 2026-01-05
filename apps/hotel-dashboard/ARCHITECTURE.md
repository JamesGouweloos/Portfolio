# System Architecture

## Overview

This document describes the end-to-end architecture of the Hotel Booking Analytics Dashboard, from data generation through visualization.

## Architecture Diagram

```
┌─────────────────┐
│  Data Generation │
│  (Python Script) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CSV Files     │
│  (4 datasets)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ETL Pipeline  │
│  (Python Script) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js API    │
│   (API Routes)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Dashboard│
│  (Components)   │
└─────────────────┘
```

## Component Details

### 1. Data Generation Layer

**Technology**: Python 3.8+

**Script**: `scripts/generate_data.py`

**Responsibilities**:
- Generate realistic synthetic hotel booking data
- Create 4 core datasets with proper relationships
- Model business patterns (seasonality, channel distribution, guest behavior)
- Output CSV files for ETL processing

**Key Features**:
- Configurable parameters (date ranges, guest counts, etc.)
- Realistic data patterns (winter seasonality, ski activities)
- Proper referential integrity (guest IDs, booking IDs)
- Weather data generation for correlation analysis

**Output**:
- `data/guest_profiles.csv`
- `data/bookings_with_charges.csv`
- `data/daily_occupancy.csv`
- `data/marketing_performance.csv`

### 2. ETL Pipeline Layer

**Technology**: Python 3.8+, psycopg2

**Script**: `scripts/etl_pipeline.py`

**Responsibilities**:
- Validate CSV data structure
- Clean and transform data
- Load data into PostgreSQL
- Calculate derived metrics (lifetime value, age at check-in)
- Maintain referential integrity

**Process Flow**:
1. Load dimension tables first (marketing_channels)
2. Load fact tables (bookings, occupancy, marketing)
3. Update dimension tables with calculated fields (guest lifetime stats)
4. Verify data consistency

**Key Features**:
- Transaction management (rollback on errors)
- Upsert logic (handles re-runs)
- Data type conversion and validation
- Foreign key constraint handling

### 3. Database Layer

**Technology**: PostgreSQL 12+

**Schema**: `database/schema.sql`

**Architecture**:
- Star schema design (fact and dimension tables)
- Proper indexing for query performance
- Foreign key constraints for data integrity
- Views for common analytical queries

**Tables**:
- **Dimensions**: guest_profiles, marketing_channels, date_dimension
- **Facts**: bookings_with_charges, daily_occupancy, marketing_performance

**Optimization**:
- Strategic indexes on foreign keys and date columns
- Pre-aggregated daily occupancy for fast queries
- Materialized views (optional, for future enhancement)

### 4. API Layer

**Technology**: Next.js 14 (App Router), TypeScript

**Location**: `app/api/`

**Architecture**:
- RESTful API routes
- Type-safe with TypeScript
- Connection pooling via `lib/db.ts`
- Error handling and validation

**Endpoints**:
- `GET /api/revenue` - Revenue analytics by dimension
- `GET /api/occupancy` - Occupancy metrics
- `GET /api/marketing` - Marketing performance
- `GET /api/guests` - Guest analytics
- `GET /api/weather-correlation` - Weather impact analysis

**Features**:
- Date range filtering
- Dimension switching (channel, room type, country, etc.)
- Aggregation options (daily, weekly, monthly)
- Efficient SQL queries with proper indexing

### 5. Frontend Layer

**Technology**: React 18, Next.js 14, Recharts, Tailwind CSS

**Architecture**:
- Server-side rendering with Next.js App Router
- Client-side interactivity with React hooks
- Component-based architecture
- Responsive design with Tailwind CSS

**Components**:
- `app/page.tsx` - Main dashboard with tab navigation
- `components/RevenueDashboard.tsx` - Revenue analytics
- `components/OccupancyDashboard.tsx` - Occupancy metrics
- `components/MarketingDashboard.tsx` - Marketing ROI
- `components/GuestAnalytics.tsx` - Guest segmentation
- `components/WeatherCorrelation.tsx` - Weather impact

**Features**:
- Interactive charts (bar, line, pie, area, composed)
- Date range filtering
- Dimension switching
- Real-time data updates
- Responsive layout

## Data Flow

### Write Path (Data Loading)

1. **Generate Data**
   ```
   Python script → CSV files
   ```

2. **ETL Process**
   ```
   CSV files → Python ETL → PostgreSQL
   ```

3. **Data Validation**
   ```
   PostgreSQL constraints → Error handling → Rollback if needed
   ```

### Read Path (Dashboard Queries)

1. **User Interaction**
   ```
   React component → State change → API call
   ```

2. **API Processing**
   ```
   Next.js API route → SQL query → PostgreSQL
   ```

3. **Response**
   ```
   PostgreSQL → JSON → React component → Chart update
   ```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 12+
- **ORM/Driver**: pg (node-postgres)

### Frontend
- **Framework**: React 18
- **Charts**: Recharts 2.10+
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns

### Data Processing
- **Language**: Python 3.8+
- **Database Driver**: psycopg2
- **Environment**: Virtual environment (venv)

## Scalability Considerations

### Current Design
- Suitable for small to medium datasets (thousands of bookings)
- Single database instance
- Client-side rendering for dashboards

### Scaling Options

1. **Database Scaling**
   - Read replicas for analytics queries
   - Partitioning for large date ranges
   - Materialized views for pre-aggregated data

2. **API Scaling**
   - Next.js API routes can be deployed to serverless
   - Add caching layer (Redis) for frequent queries
   - Implement query result caching

3. **Frontend Scaling**
   - Static generation for dashboard pages
   - Client-side pagination for large datasets
   - Virtual scrolling for long lists

4. **Data Processing Scaling**
   - Batch processing for large ETL jobs
   - Incremental loading instead of full reloads
   - Parallel processing for independent datasets

## Security Considerations

### Current Implementation
- Environment variables for database credentials
- No authentication (portfolio project)
- SQL injection prevention via parameterized queries

### Production Enhancements
- Add authentication (NextAuth.js, Auth0, etc.)
- API rate limiting
- Input validation and sanitization
- HTTPS enforcement
- Database connection encryption
- Audit logging

## Deployment Architecture

### Development
```
Local machine:
├── Python venv (data generation, ETL)
├── PostgreSQL (local instance)
└── Next.js dev server (localhost:3000)
```

### Production (Recommended)
```
Cloud Infrastructure:
├── PostgreSQL (Managed service: AWS RDS, Heroku Postgres)
├── Next.js (Vercel, AWS Amplify, or containerized)
├── Data Processing (Scheduled jobs: AWS Lambda, cron)
└── File Storage (S3, or database-only approach)
```

## Monitoring and Observability

### Recommended Additions
- **Application Monitoring**: Sentry, LogRocket
- **Database Monitoring**: pg_stat_statements, slow query logs
- **API Monitoring**: Response time tracking, error rates
- **Dashboard Analytics**: User interaction tracking

## Performance Optimization

### Implemented
- Database indexes on foreign keys and dates
- Connection pooling in Next.js API routes
- Efficient SQL queries with proper joins
- Client-side state management to reduce API calls

### Future Enhancements
- Query result caching (Redis, in-memory)
- Database query optimization (EXPLAIN ANALYZE)
- Lazy loading for dashboard components
- Code splitting for smaller bundle sizes
- CDN for static assets

## Error Handling

### Current Implementation
- Try-catch blocks in API routes
- Database transaction rollback on errors
- User-friendly error messages in UI
- Console logging for debugging

### Production Enhancements
- Structured logging (Winston, Pino)
- Error tracking (Sentry)
- Retry logic for transient failures
- Graceful degradation for partial failures

