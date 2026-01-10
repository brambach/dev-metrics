# DevMetrics

A premium GitHub engineering analytics dashboard built with Next.js 16, featuring real-time data visualization and an intelligent Engineering Score algorithm.

![DevMetrics Dashboard](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **Engineering Score (0-100)** - Synthesizes consistency, volume, impact, and recency into a single metric
- **Real-time GitHub Data** - GraphQL API integration with single-query efficiency
- **Demo Mode** - Instant loading with cached data (0 API calls)
- **Live User Search** - Enter any GitHub username for real-time analytics
- **Interactive Visualizations** - Contribution charts, language breakdown, heatmap calendar
- **Premium Animations** - Orchestrated micro-interactions and staggered reveals
- **Mobile Responsive** - Optimized for all screen sizes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token ([Create one here](https://github.com/settings/tokens))

### Installation

```bash
# Clone the repository
git clone https://github.com/brambach/dev-metrics.git
cd dev-metrics

# Install dependencies
npm install

# Create environment file
echo "GITHUB_TOKEN=your_token_here" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Data Viz:** Recharts
- **API:** GitHub GraphQL v4
- **Deployment:** Vercel

### Key Design Decisions

**GraphQL over REST**
- Single query replaces 20+ REST calls
- Reduces latency from 5s → <1s
- More efficient rate limit usage

**Demo Mode Architecture**
- Pre-fetched JSON for instant portfolio showcase
- Server-side PAT (secure, no OAuth complexity)
- Aggressive caching (5min TTL)

**Engineering Score Algorithm**
```typescript
Score = Consistency (25) + Volume (25) + Impact (25) + Recency (25)
- Consistency: Active days in last 30 days
- Volume: Total contributions normalized to 100
- Impact: PR-to-commit ratio
- Recency: Days since last contribution
```

## 📁 Project Structure

```
dev-metrics/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Demo dashboard
│   │   ├── [username]/page.tsx   # Dynamic user page
│   │   └── globals.css           # Tailwind + animations
│   ├── components/
│   │   ├── dashboard/            # StatsCard, EngineeringScore, etc.
│   │   └── layout/               # Header, navigation
│   ├── lib/
│   │   ├── github/               # API client, queries, types
│   │   └── utils.ts              # Score calculations
│   └── data/
│       └── demo.json             # Cached demo data
├── scripts/
│   └── generate-demo-data.js     # Refresh demo data
└── tailwind.config.ts
```

## 🎨 Design Philosophy

**Premium Internal Tool Aesthetic**
- Dark theme (#0a0a0a background)
- Subtle shadows and borders
- Yellow accent (#FFED4E)
- Micro-interactions on every hover
- Staggered animations (choreographed reveals)

**Inspired by:** Linear, Vercel, Stripe dashboards

## 🔑 Environment Variables

Create `.env.local` with:

```env
GITHUB_TOKEN=github_pat_xxxxxxxxxxxx
```

**Token Permissions:** Read-only access to public repositories

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brambach/dev-metrics)

1. Click "Deploy to Vercel"
2. Add `GITHUB_TOKEN` environment variable
3. Deploy

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Regenerate demo data
node scripts/generate-demo-data.js
```

## 📊 Performance

- **Demo Mode:** <200ms First Contentful Paint
- **Live Mode:** <1.2s with cache hit
- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices)

## 🎯 What Makes This Portfolio-Worthy

1. **Business Insight** - Engineering Score translates data into actionable metric
2. **Technical Depth** - GraphQL optimization, caching strategy, TypeScript
3. **Attention to Detail** - 10+ micro-interactions, orchestrated animations
4. **Production-Ready** - Error handling, loading states, responsive design
5. **Scalable Architecture** - Clean separation of concerns, reusable components

## 📝 License

MIT

## 🙏 Acknowledgments

- Design inspired by [aura.build](https://aura.build)
- GitHub GraphQL API documentation
- Next.js team for App Router

---

**Built by [@brambach](https://github.com/brambach)** | [Live Demo](https://dev-metrics.vercel.app)
