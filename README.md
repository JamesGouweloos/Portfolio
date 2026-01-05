# Portfolio - Monorepo

A monorepo containing my portfolio website and project showcases.

## Structure

```
Portfolio/
├── apps/
│   ├── portfolio/          # Main portfolio website
│   └── hotel-dashboard/   # Hotel Booking Analytics Dashboard
├── packages/              # Shared packages (future)
└── README.md
```

## Projects

### Hotel Booking Analytics Dashboard

A comprehensive end-to-end analytics platform for hotel booking data, demonstrating full-stack data engineering capabilities.

**Tech Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- PostgreSQL
- Python (Data Generation & ETL)
- Tailwind CSS
- Recharts

**Features:**
- Revenue analytics by channel, room type, and country
- Daily occupancy metrics (ADR, RevPAR)
- Marketing performance and ROI analysis
- Guest segmentation and lifetime value
- Weather correlation with ski revenue

See [Hotel_Dashboard/README.md](./Hotel_Dashboard/README.md) for detailed documentation.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- PostgreSQL 12+ (for local development)

### Development

Each app can be run independently:

```bash
# Hotel Dashboard
cd apps/hotel-dashboard
npm install
npm run dev
```

## Deployment

This monorepo is configured for Firebase deployment. See individual app READMEs for deployment instructions.

## License

Portfolio projects - for demonstration purposes.

