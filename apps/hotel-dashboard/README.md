# Hotel Booking Analytics Dashboard

A comprehensive end-to-end analytics platform for hotel booking data, designed for the Livigno hotel with ski resort focus. This project demonstrates full-stack data engineering and analytics capabilities.

## 🏗️ Architecture Overview

```
CSV Data → Python ETL → PostgreSQL → Next.js API → React Dashboard
```

### Components

1. **Data Generation** (`scripts/generate_data.py`)
   - Generates realistic synthetic hotel booking data
   - Creates 4 core datasets: bookings, occupancy, marketing, guests
   - Models winter seasonality and ski resort patterns

2. **ETL Pipeline** (`scripts/etl_pipeline.py`)
   - Validates and cleans CSV data
   - Loads data into PostgreSQL with proper relationships
   - Calculates derived metrics (lifetime value, age at check-in, etc.)

3. **Database Schema** (`database/schema.sql`)
   - Star schema design with fact and dimension tables
   - Proper foreign keys and constraints
   - Optimized indexes for query performance
   - Pre-built views for common analytics queries

4. **Next.js API Routes** (`app/api/`)
   - RESTful endpoints for all analytics dimensions
   - Efficient SQL queries with date filtering
   - JSON responses optimized for dashboard consumption

5. **React Dashboard** (`app/` & `components/`)
   - Interactive visualizations using Recharts
   - Multiple analytics views: Revenue, Occupancy, Marketing, Guests, Weather
   - Real-time filtering and dimension switching

## 📊 Data Model

### Core Keys
- `booking_id` - Primary key for bookings, foreign key in line items
- `guest_id` - Primary key for guest demographics, foreign key in bookings
- `stay_date` - Granularity for occupancy + daily revenue
- `channel` - Links marketing performance to bookings

### Fact Tables
1. **bookings_with_charges** - Booking-level and line-item revenue data
2. **daily_occupancy** - Daily occupancy metrics by date and room type
3. **marketing_performance** - Marketing metrics by channel and date

### Dimension Tables
1. **guest_profiles** - Guest demographics and lifetime analytics
2. **marketing_channels** - Channel metadata
3. **date_dimension** - Optional date dimension for time-based analysis

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Portfolio
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb hotel_analytics
   
   # Run schema
   psql -d hotel_analytics -f database/schema.sql
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Generate sample data**
   ```bash
   python scripts/generate_data.py
   ```

6. **Run ETL pipeline**
   ```bash
   python scripts/etl_pipeline.py
   ```

7. **Install Node.js dependencies**
   ```bash
   npm install
   ```

8. **Run the Next.js development server**
   ```bash
   npm run dev
   ```

9. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
Portfolio/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── revenue/route.ts
│   │   ├── occupancy/route.ts
│   │   ├── marketing/route.ts
│   │   ├── guests/route.ts
│   │   └── weather-correlation/route.ts
│   ├── page.tsx                # Main dashboard page
│   ├── layout.tsx
│   └── globals.css
├── components/                 # React dashboard components
│   ├── RevenueDashboard.tsx
│   ├── OccupancyDashboard.tsx
│   ├── MarketingDashboard.tsx
│   ├── GuestAnalytics.tsx
│   └── WeatherCorrelation.tsx
├── database/
│   └── schema.sql              # PostgreSQL schema
├── scripts/
│   ├── generate_data.py       # Data generation script
│   └── etl_pipeline.py         # ETL pipeline
├── lib/
│   └── db.ts                   # Database connection utility
├── data/                       # Generated CSV files (gitignored)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🔍 Analytics Capabilities

### Revenue Analytics
- Revenue breakdown by channel, room type, and country
- Time series revenue trends
- Revenue composition (Room, F&B, Activities)
- Average revenue per booking

### Occupancy Analytics
- Daily/weekly/monthly occupancy trends
- Average Daily Rate (ADR) analysis
- Revenue per Available Room (RevPAR)
- Room utilization metrics

### Marketing Performance
- Channel-level ROI and ROAS
- Cost per Acquisition (CPA)
- Conversion rates by channel
- Marketing spend vs revenue

### Guest Analytics
- Guest segmentation by country, age, loyalty tier
- Lifetime value analysis
- Booking patterns by purpose of stay
- Guest distribution visualizations

### Weather Correlation
- Correlation between snow depth and ski revenue
- Temperature impact on occupancy
- Weather condition analysis
- Seasonal patterns

## 🛠️ Technology Stack

- **Backend**: Next.js 14 (App Router), TypeScript
- **Database**: PostgreSQL
- **Data Processing**: Python 3.8+, psycopg2
- **Frontend**: React 18, Recharts, Tailwind CSS
- **Data Generation**: Python with realistic patterns

## 📈 Key Features

1. **End-to-End Pipeline**: Complete data flow from generation to visualization
2. **Dimensional Modeling**: Star schema with proper fact/dimension separation
3. **Realistic Data**: Synthetic data that mirrors real hotel booking patterns
4. **Interactive Dashboards**: Dynamic filtering and dimension switching
5. **Performance Optimized**: Indexed database queries and efficient API routes
6. **Production Ready**: Error handling, type safety, and scalable architecture

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_NAME=hotel_analytics
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
```

### Data Generation Parameters

Edit `scripts/generate_data.py` to customize:
- Date ranges
- Number of guests/bookings
- Room types and pricing
- Channel distribution
- Seasonal patterns

## 📝 API Endpoints

- `GET /api/revenue?dimension={channel|room_type|country|date}&start_date=&end_date=`
- `GET /api/occupancy?group_by={day|week|month}&start_date=&end_date=`
- `GET /api/marketing?group_by={channel|date}&start_date=&end_date=`
- `GET /api/guests?dimension={country|age|loyalty|purpose}`
- `GET /api/weather-correlation?start_date=&end_date=`

## 🎯 Use Cases

This project demonstrates:
- Data modeling and schema design
- ETL pipeline development
- RESTful API design
- Interactive data visualization
- Full-stack TypeScript development
- Database optimization and indexing
- Real-world analytics scenarios

## 📚 Next Steps

Potential enhancements:
- Add authentication and user management
- Implement real-time data updates
- Add export functionality (CSV, PDF reports)
- Create advanced forecasting models
- Add A/B testing analysis
- Implement alerting for KPI thresholds

## 📄 License

This project is for portfolio/demonstration purposes.

## 🤝 Contributing

This is a portfolio project. Feel free to fork and adapt for your own use case.

