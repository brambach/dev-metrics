# GitHub Engineering Dashboard - Architecture Plan

## Honest Critique of Your Approach

### What Will Break

1. **"Total commits this week/month" is a trap.** The GitHub API doesn't have a "get all commits for user" endpoint. You'd need to:
   - List all repos (paginated)
   - For each repo, fetch commits filtered by author (paginated)
   - That's potentially 50+ API calls just for commit counts
   - **Solution:** Use the GraphQL API's `contributionsCollection` instead - one call gets all contribution data

2. **Unauthenticated rate limit (60/hr) is unusable.** A single dashboard load could hit 20+ calls. Two refreshes = rate limited.

3. **"No database" + "real-time" = poor UX.** Every page load = 3-5 second wait. Users will bounce.

4. **OAuth for portfolio is overkill.** Setting up GitHub OAuth requires a registered app, callback URLs, and adds complexity. For a portfolio piece, there's a simpler approach.

### What's Unrealistic for This Weekend

- Team view (multiple users) - scope creep
- Commit history charts per repo - too many API calls
- "Real-time" anything - you need caching
- Repository detail pages with full commit history - Phase 2

### What You're Missing

1. **GraphQL API is mandatory** for your use case. REST API requires too many calls.
2. **Static generation with ISR** would give you <2s loads AND reduce API calls
3. **Demo mode isn't optional** - it's required for portfolio credibility
4. **Error boundaries** - GitHub API can fail, your app shouldn't

---

## Architecture Decision: Authentication Strategy

### Recommended: Hybrid Approach

```
┌─────────────────────────────────────────────────────────┐
│                    PUBLIC VISITORS                       │
├─────────────────────────────────────────────────────────┤
│  Option 1: Demo Mode (default)                          │
│  - Pre-fetched data from YOUR GitHub profile            │
│  - Stored as JSON, refreshed via cron/ISR               │
│  - Zero API calls for visitors                          │
│  - Instant load, always works                           │
├─────────────────────────────────────────────────────────┤
│  Option 2: "Try with your profile"                      │
│  - User enters their GitHub username                    │
│  - Uses YOUR server-side PAT (hidden from client)       │
│  - Rate limited to your 5,000/hr budget                 │
│  - Add aggressive caching (5-min TTL)                   │
├─────────────────────────────────────────────────────────┤
│  Option 3: Full OAuth (Phase 3, optional)               │
│  - User authenticates with their own GitHub             │
│  - Gets their own rate limit                            │
│  - Required only for private repo access                │
└─────────────────────────────────────────────────────────┘
```

**Why NOT OAuth for MVP:**
- Requires GitHub App registration
- Callback URL configuration
- Token storage/refresh logic
- Privacy policy requirements
- Overkill for public repo data

**Why hybrid works:**
- Demo mode = instant portfolio showcase
- "Try your username" = proves it's real, not fake data
- Your PAT stays server-side (secure)
- 5,000 calls/hr is plenty for demo traffic

---

## GitHub API Strategy

### Use GraphQL API (not REST)

One GraphQL query replaces 20+ REST calls:

```graphql
query UserDashboard($username: String!) {
  user(login: $username) {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
    repositories(first: 10, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        name
        pushedAt
        primaryLanguage { name color }
        stargazerCount
        forkCount
      }
    }
  }
}
```

**This single query gives you:**
- Total commits (week/month/year)
- Total PRs and issues
- Contribution heatmap data (like GitHub profile)
- Top 10 active repos with languages

### Metrics: Easy vs Hard

| Metric | Difficulty | API Calls | Phase |
|--------|-----------|-----------|-------|
| Total contributions (commits/PRs/issues) | Easy | 1 GraphQL | MVP |
| Contribution calendar/heatmap | Easy | 1 GraphQL | MVP |
| Active repositories list | Easy | 1 GraphQL | MVP |
| Language breakdown (top repos) | Easy | 1 GraphQL | MVP |
| Commit streak | Easy | Parse calendar data | MVP |
| Avg commits per day | Easy | Math on calendar | MVP |
| PR merge rate | Medium | 2-3 calls | Phase 2 |
| Code review stats | Hard | Many calls | Phase 3 |
| Lines of code | Very Hard | Clone repos | Never |
| "Productivity score" | Easy | Calculated metric | MVP |

### Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    CACHING LAYERS                        │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Demo Data (your profile)                      │
│  - JSON file generated at build time                    │
│  - Refreshed every 6 hours via Vercel Cron              │
│  - Zero runtime API calls for demo                      │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Server-side Cache (other users)               │
│  - In-memory Map with 5-minute TTL                      │
│  - Key: username, Value: dashboard data                 │
│  - Prevents duplicate fetches                           │
├─────────────────────────────────────────────────────────┤
│  Layer 3: HTTP Cache Headers                            │
│  - stale-while-revalidate pattern                       │
│  - CDN caches responses at edge                         │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Client-side (React Query / SWR)               │
│  - Prevents refetch on navigation                       │
│  - Background revalidation                              │
└─────────────────────────────────────────────────────────┘
```

**Recommended: SWR over React Query**
- Lighter weight (4kb vs 13kb)
- Better fit for read-heavy dashboards
- Built-in stale-while-revalidate
- Simpler API for your use case

---

## File Structure

```
github-dashboard/
├── app/
│   ├── layout.tsx              # Root layout, theme, fonts
│   ├── page.tsx                # Landing/demo dashboard
│   ├── [username]/
│   │   └── page.tsx            # User-specific dashboard
│   ├── api/
│   │   └── github/
│   │       └── [username]/
│   │           └── route.ts    # API route for fetching user data
│   └── globals.css             # Tailwind + custom properties
│
├── components/
│   ├── dashboard/
│   │   ├── DashboardShell.tsx     # Layout wrapper
│   │   ├── StatsGrid.tsx          # Key metrics cards
│   │   ├── EngineeringScore.tsx   # Circular gauge (0-100)
│   │   ├── ContributionChart.tsx  # Activity over time
│   │   ├── LanguageBreakdown.tsx  # Pie/donut chart
│   │   ├── RepoList.tsx           # Active repositories
│   │   └── ContributionCalendar.tsx # GitHub-style heatmap
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx           # Loading states
│   │   └── ErrorBoundary.tsx
│   └── layout/
│       ├── Header.tsx
│       └── UserSearch.tsx         # "Try your username" input
│
├── lib/
│   ├── github/
│   │   ├── client.ts           # GraphQL client setup
│   │   ├── queries.ts          # GraphQL query definitions
│   │   └── types.ts            # TypeScript types for API responses
│   ├── cache.ts                # Server-side caching logic
│   └── utils.ts                # Date formatting, calculations
│
├── data/
│   └── demo.json               # Pre-fetched demo data (your profile)
│
├── hooks/
│   └── useGitHubData.ts        # SWR hook for client-side fetching
│
└── public/
    └── og-image.png            # Social share image
```

### Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        PAGE LOAD                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Demo Mode?     │
                    └─────────────────┘
                      │           │
                     Yes          No
                      │           │
                      ▼           ▼
            ┌─────────────┐  ┌──────────────────┐
            │ Import JSON │  │ Check server     │
            │ (0 API)     │  │ cache            │
            └─────────────┘  └──────────────────┘
                      │           │
                      │      Cache miss?
                      │           │
                      │           ▼
                      │    ┌──────────────────┐
                      │    │ GraphQL API call │
                      │    │ (1 request)      │
                      │    └──────────────────┘
                      │           │
                      ▼           ▼
            ┌─────────────────────────────────┐
            │     Server Component renders    │
            │     with data (SSR)             │
            └─────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │     Client hydrates             │
            │     SWR caches locally          │
            └─────────────────────────────────┘
```

---

## MVP Feature List (This Weekend)

### Must Have (Saturday)

1. **Demo Dashboard (your profile)**
   - Pre-fetched data, instant load
   - Stats grid: commits, PRs, issues, streak
   - **Engineering Score** (circular gauge, 0-100)
   - Contribution chart (30 days)
   - Language breakdown
   - Active repos list

2. **"Try Your Profile" Feature**
   - Username input in header
   - Navigates to /[username]
   - Same dashboard, live data

3. **Dark Theme UI**
   - Background: #0a0a0a
   - Cards: #141414 with subtle border
   - Accent: #FFED4E (your yellow)
   - Text: white/gray hierarchy

4. **Core Components**
   - StatsGrid with 4 key metrics
   - Simple bar chart (last 7 days)
   - Repo list with language dots
   - Loading skeletons

### Should Have (Sunday)

5. **Contribution Calendar**
   - GitHub-style heatmap
   - Uses calendar data from GraphQL
   - Impressive visual, minimal code

6. **Error Handling**
   - User not found state
   - Rate limit exceeded state
   - Network error state

7. **Polish**
   - Subtle hover animations
   - Responsive mobile layout
   - Meta tags + OG image

### Won't Have (Phase 2+)

- Team/org view
- Repository detail pages
- PR/issue breakdown pages
- OAuth authentication
- Historical comparisons
- Export functionality

---

## The Killer Feature: "Engineering Score"

### What Makes This Stand Out

Most GitHub dashboards show raw numbers. Engineering managers want **insights**.

Create a calculated "Engineering Score" (0-100) that synthesizes:
- Consistency (daily contributions)
- Impact (PRs merged vs commits)
- Collaboration (issues, reviews)
- Recency (activity in last 30 days)

```typescript
function calculateEngineeringScore(data: GitHubData): number {
  const consistency = (data.activeDays / 30) * 25;        // 0-25 points
  const volume = Math.min(data.totalContributions / 100, 1) * 25; // 0-25 points
  const prRatio = (data.prs / (data.commits + 1)) * 25;   // 0-25 points
  const recency = data.contributedToday ? 25 : data.daysAgo * -2 + 25; // 0-25 points

  return Math.round(consistency + volume + prRatio + recency);
}
```

**Display it prominently:**
- Large circular gauge
- "Your engineering score: 78"
- Breakdown of what contributes to score
- Compare to "average active developer"

**Why this works for portfolio:**
- Shows you can translate data into business insights
- Engineering managers love quantified metrics
- Differentiates from clone dashboards
- Sparks conversation in interviews

---

## Performance Strategy

### Target: < 1.5s First Contentful Paint

```
Demo Mode:
├── JSON import: ~0ms (bundled)
├── Server render: ~50ms
├── Network (Vercel Edge): ~100ms
└── Total: < 200ms ✓

Live User Mode:
├── Cache hit: ~50ms
├── Cache miss + API: ~800ms
├── Server render: ~100ms
├── Network: ~200ms
└── Total: < 1.2s ✓
```

### Implementation Details

1. **Server Components by Default**
   - Dashboard page is server component
   - Fetches data before sending HTML
   - User sees content, not loading spinner

2. **Streaming with Suspense**
   - Shell renders immediately
   - Charts stream in as ready
   - Progressive enhancement

3. **Client Components Only When Needed**
   - UserSearch input (interactivity)
   - Chart animations (Recharts)
   - Theme toggle (if added)

---

## Technical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| GitHub API rate limit | Medium | High | Server-side PAT + aggressive caching |
| GraphQL query complexity | Low | Medium | Use simple, tested queries |
| Vercel cold starts | Low | Low | Edge runtime for API routes |
| User enters invalid username | High | Low | Graceful error state |
| Your PAT gets exposed | Medium | Critical | Only use in server components/routes |
| Demo data gets stale | Low | Low | Vercel cron job every 6 hours |

### Security Considerations

```typescript
// NEVER do this (client-side):
const client = new GraphQLClient(url, {
  headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } // EXPOSED!
});

// ALWAYS do this (server-side only):
// In app/api/github/[username]/route.ts
export async function GET(request: Request) {
  // Token only accessed on server
  const data = await fetchGitHubData(username, process.env.GITHUB_TOKEN);
  return Response.json(data);
}
```

---

## Implementation Order (with aura.build Integration)

### Recommended Approach: Option C (Hybrid) - Modified

**Why Option C wins:**
- aura.build excels at: visual polish, complex components (gauges, heatmaps), consistent styling
- Your plan excels at: data architecture, Next.js patterns, performance
- **Key insight**: Generate UI first, but treat aura.build output as a "component library" not a "page to modify"

### The Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    AURA.BUILD OUTPUT                         │
│  (Full page with all visual elements)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │     EXTRACT     │             │     DISCARD     │
    ├─────────────────┤             ├─────────────────┤
    │ • Tailwind      │             │ • Page structure│
    │   config/colors │             │ • Data fetching │
    │ • EngineeringScore│           │ • State mgmt    │
    │   gauge component│            │ • Any hooks     │
    │ • Heatmap/calendar│           │ • API calls     │
    │ • Chart configs │             │ • Layout wrapper│
    │ • Card styling  │             │                 │
    │ • Animations    │             │                 │
    └─────────────────┘             └─────────────────┘
              │
              ▼
    ┌─────────────────────────────────────────────────────────┐
    │              YOUR NEXT.JS ARCHITECTURE                   │
    │  (Server components, proper data flow, API routes)      │
    │                                                          │
    │  Drop extracted components into clean structure          │
    └─────────────────────────────────────────────────────────┘
```

---

### aura.build Output Analysis

**Files received:**
- `aura-build.html` - Complete dashboard (557 lines)
- `aura-screenshot-1.png` - Top section (header, stats, score, charts)
- `aura-screenshot-2.png` - Bottom section (charts, repos, calendar)

**What aura.build generated:**

| Component | Quality | Complexity | Extract? |
|-----------|---------|------------|----------|
| Header with search | Excellent | Low | ✅ Yes - adapt for Next.js |
| Stats Grid (4 cards) | Excellent | Low | ✅ Yes - extract component |
| Engineering Score gauge | Excellent | High | ✅ Yes - key visual |
| 30-Day Activity chart | Good | Medium | ⚠️ Convert Chart.js → Recharts |
| Languages donut | Good | Medium | ⚠️ Convert Chart.js → Recharts |
| Repository List | Excellent | Low | ✅ Yes - extract component |
| Contribution Calendar | Excellent | High | ✅ Yes - extract heatmap logic |
| Animations/transitions | Excellent | Medium | ✅ Yes - keep CSS |

**Technical stack in aura output:**
```
├── Tailwind CDN → Convert to tailwind.config.ts
├── Chart.js → Convert to Recharts (better React integration)
├── Iconify CDN → Convert to lucide-react
├── Vanilla JS → Convert to React components
└── Inline styles → Keep in Tailwind classes
```

---

### Integration Workflow

#### Step 1: Extract Tailwind Config (from aura-build.html lines 12-37)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#141414',
        border: '#262626',
        accent: '#FFED4E',
        muted: '#a1a1aa'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: [],
}
export default config
```

#### Step 2: Extract Global CSS (from aura-build.html lines 39-100)

```css
/* app/globals.css - Add these custom utilities */

/* Premium Shadow Utilities */
.subtle-shadow { box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
.glow-shadow:hover {
  box-shadow: 0 0 40px -10px rgba(255, 237, 78, 0.15);
}

/* Smooth Transitions */
.smooth-transition { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }

/* Gauge Animation */
.progress-ring-circle {
  transition: stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1);
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}

/* Hide Scrollbar */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

#### Step 3: Component Extraction Map

| aura-build.html Lines | Extract To | Props Needed |
|-----------------------|------------|--------------|
| 105-133 (Header) | `components/layout/Header.tsx` | `onSearch: (username: string) => void` |
| 148-230 (Stats Grid) | `components/dashboard/StatsCard.tsx` | `{ label, value, change, icon, trend }` |
| 232-263 (Score Gauge) | `components/dashboard/EngineeringScore.tsx` | `{ score, breakdown }` |
| 266-287 (Charts) | `components/dashboard/ContributionChart.tsx` | `{ data: { date, count }[] }` |
| 266-287 (Charts) | `components/dashboard/LanguageBreakdown.tsx` | `{ data: { name, value, color }[] }` |
| 289-381 (Repo List) | `components/dashboard/RepoList.tsx` | `{ repos: Repository[] }` |
| 383-426 (Calendar) | `components/dashboard/ContributionCalendar.tsx` | `{ weeks: Week[] }` |

#### Step 4: EngineeringScore Component (Key Visual)

Extract from lines 232-263, convert to React:

```tsx
// components/dashboard/EngineeringScore.tsx
'use client'

import { useEffect, useRef } from 'react'

interface EngineeringScoreProps {
  score: number
  breakdown: {
    consistency: number
    volume: number
    impact: number
    recency: number
  }
}

export function EngineeringScore({ score, breakdown }: EngineeringScoreProps) {
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (circleRef.current) {
      const circumference = 753.98 // 2 * PI * 120
      const offset = circumference - (score / 100) * circumference
      circleRef.current.style.strokeDashoffset = String(offset)
    }
  }, [score])

  return (
    <div className="bg-surface border border-border rounded-xl p-10 flex flex-col items-center">
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="120" fill="none" stroke="#262626" strokeWidth="8" />
          <circle
            ref={circleRef}
            className="progress-ring-circle"
            cx="150" cy="150" r="120"
            fill="none" stroke="#FFED4E" strokeWidth="8"
            strokeDasharray="753.98" strokeDashoffset="753.98"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-semibold text-white">{score}</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Score</span>
        </div>
      </div>
      <div className="w-full max-w-3xl mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <span className="text-base font-medium text-white">{value}%</span>
            <span className="text-xs text-zinc-500 font-medium capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### Step 5: StatsCard Component

Extract card pattern from lines 149-167:

```tsx
// components/dashboard/StatsCard.tsx
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  highlight?: boolean
}

export function StatsCard({ label, value, change, changeLabel, icon: Icon, trend, highlight }: StatsCardProps) {
  return (
    <div className={`
      group bg-surface border border-border rounded-xl p-6
      hover:border-accent/30 smooth-transition subtle-shadow glow-shadow
      hover:scale-[1.02] cursor-default relative overflow-hidden
      ${highlight ? 'ring-1 ring-accent/20' : ''}
    `}>
      {highlight && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent opacity-[0.03] blur-3xl rounded-full" />
      )}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-sm font-medium text-muted group-hover:text-zinc-300">{label}</span>
        <Icon className="w-[18px] h-[18px] text-zinc-600 group-hover:text-accent smooth-transition" />
      </div>
      <span className="text-3xl font-medium text-white">{value.toLocaleString()}</span>
      {change !== undefined && (
        <div className="mt-3 flex items-center text-xs text-muted">
          <span className={`flex items-center gap-0.5 mr-2 px-1.5 py-0.5 rounded border
            ${trend === 'up' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : ''}
            ${trend === 'down' ? 'text-red-500 bg-red-500/10 border-red-500/20' : ''}
            ${trend === 'neutral' ? 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' : ''}
          `}>
            {trend === 'up' && '↑'}{trend === 'down' && '↓'}{trend === 'neutral' && '–'}
            {change}%
          </span>
          <span>{changeLabel}</span>
        </div>
      )}
    </div>
  )
}
```

#### Step 6: Chart Conversion (Chart.js → Recharts)

aura.build uses Chart.js. Convert to Recharts for React:

```tsx
// components/dashboard/ContributionChart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ContributionChartProps {
  data: { date: string; count: number }[]
}

export function ContributionChart({ data }: ContributionChartProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-8 h-[380px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-white">30-Day Activity</h3>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis dataKey="date" hide />
          <YAxis
            stroke="#262626"
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141414',
              border: '1px solid #262626',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="count" fill="#FFED4E" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

#### Step 7: ContributionCalendar Component

Extract heatmap logic from lines 383-426 and JS lines 526-554:

```tsx
// components/dashboard/ContributionCalendar.tsx
'use client'

interface ContributionCalendarProps {
  weeks: {
    contributionDays: {
      date: string
      contributionCount: number
    }[]
  }[]
}

const COLORS = ['#161616', '#FFED4E20', '#FFED4E60', '#FFED4E']

function getColorIndex(count: number): number {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 7) return 2
  return 3
}

export function ContributionCalendar({ weeks }: ContributionCalendarProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="bg-surface border border-border rounded-xl p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-white">Contribution Calendar</h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Less</span>
          <div className="flex gap-1">
            {COLORS.map((color, i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-[1px]" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[720px]">
          <div className="flex text-xs text-muted mb-2 pl-8 justify-between pr-8">
            {months.map(m => <span key={m}>{m}</span>)}
          </div>
          <div className="flex">
            <div className="flex flex-col gap-[3px] text-xs text-muted pr-3 pt-[13px]">
              <span className="h-[10px] invisible">S</span>
              <span className="h-[10px]">Mon</span>
              <span className="h-[10px] invisible">T</span>
              <span className="h-[10px]">Wed</span>
              <span className="h-[10px] invisible">T</span>
              <span className="h-[10px]">Fri</span>
              <span className="h-[10px] invisible">S</span>
            </div>
            <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
              {weeks.flatMap(week =>
                week.contributionDays.map((day, i) => (
                  <div
                    key={day.date}
                    className="w-[10px] h-[10px] rounded-[1px] hover:ring-1 hover:ring-white/50 smooth-transition"
                    style={{ backgroundColor: COLORS[getColorIndex(day.contributionCount)] }}
                    title={`${day.contributionCount} contributions on ${day.date}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### Refactoring Checklist

| aura.build Element | Action | Why |
|--------------------|--------|-----|
| Color values in JSX | Move to Tailwind config | Maintainability |
| Hardcoded numbers | Replace with props | Real data |
| `onClick` handlers | Keep or adapt | Usually fine |
| `useState` for UI | Keep if local (hover, etc.) | Fine for UI state |
| `useState` for data | DELETE | Use server components |
| `useEffect` for fetch | DELETE | Server-side fetching |
| Mock data arrays | DELETE | Replace with types |
| Inline styles | Convert to Tailwind | Consistency |
| `className` strings | Keep | Should work |
| SVG icons | Keep | Visual assets |
| Recharts components | Keep, update data prop | Just wire up data |

---

### Updated Schedule (aura.build files ready)

**Status:** aura-build.html, screenshots received ✅

#### Day 1 (Saturday)

**Morning Session (9am - 12pm)**

1. **Next.js Setup (20 min)** ⭐ START HERE
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   npm i @octokit/graphql recharts lucide-react swr
   ```

2. **Apply aura.build Styling (30 min)**
   - Copy Tailwind config from Step 1 above
   - Copy global CSS utilities from Step 2 above
   - Add Inter font to layout.tsx

3. **Extract Components (2 hrs)**
   - Create `components/dashboard/EngineeringScore.tsx` (Step 4 code)
   - Create `components/dashboard/StatsCard.tsx` (Step 5 code)
   - Create `components/dashboard/ContributionChart.tsx` (Step 6 code)
   - Create `components/dashboard/ContributionCalendar.tsx` (Step 7 code)
   - Create `components/dashboard/RepoList.tsx` (extract from lines 289-381)
   - Create `components/layout/Header.tsx` (extract from lines 105-133)

**Afternoon Session (1pm - 6pm)**

4. **GitHub GraphQL Integration (1.5 hrs)**
   - Create `lib/github/client.ts` with @octokit/graphql
   - Create `lib/github/queries.ts` with main query
   - Create `lib/github/types.ts` with TypeScript interfaces
   - Test query with your GitHub username

5. **Data Transform Layer (1 hr)**
   - Create `lib/utils.ts` with:
     - `calculateEngineeringScore()` function
     - `transformContributionData()` for charts
     - `formatRelativeDate()` for "2 days ago"

6. **Wire Up Main Dashboard (1.5 hrs)**
   - Create `app/page.tsx` as server component
   - Fetch your GitHub data
   - Pass to extracted components
   - Verify renders match aura-screenshot

7. **Create Demo Data (30 min)**
   - Save your live data to `data/demo.json`
   - Update page.tsx to use demo data by default
   - Verify instant load without API calls

#### Day 2 (Sunday)

**Morning Session (9am - 12pm)**

8. **Language Breakdown Chart (1 hr)**
   - Create `components/dashboard/LanguageBreakdown.tsx`
   - Use Recharts PieChart/donut
   - Match aura's color scheme

9. **Dynamic User Routes (1.5 hrs)**
   - Create `app/[username]/page.tsx`
   - Create `app/api/github/[username]/route.ts` with caching
   - Add server-side 5-minute cache

10. **Header & Search (1 hr)**
    - Wire up Header component
    - Add search input with keyboard shortcut hint
    - Navigate to /[username] on submit

**Afternoon Session (1pm - 5pm)**

11. **Error States (45 min)**
    - Create `components/ui/ErrorState.tsx`
    - Handle: user not found, rate limit, network error
    - Match aura's card styling

12. **Loading States (45 min)**
    - Create skeleton components
    - Add Suspense boundaries
    - Test loading UX

13. **Mobile Responsive (1 hr)**
    - Test all breakpoints
    - Fix any overflow issues
    - Verify calendar scrolls horizontally

14. **Final Polish (1 hr)**
    - Add meta tags in layout.tsx
    - Create OG image
    - Test all animations
    - Lighthouse audit

15. **Deploy (30 min)**
    - `git init && git add . && git commit`
    - Push to GitHub
    - Connect Vercel
    - Add GITHUB_TOKEN env var
    - Test production URL

---

### Key Gotchas with aura.build Integration

1. **Server vs Client Components**
   - aura.build likely generates client components (`"use client"`)
   - Your data fetching should be in server components
   - Keep aura's visual components as client, wrap with server data fetching

2. **Data Structure Mismatch**
   - aura.build will use mock data like `{ commits: 150 }`
   - Your GitHub API returns `contributionsCollection.totalCommitContributions`
   - Create a transform function in `lib/utils.ts`

3. **Responsive Breakpoints**
   - Verify aura's breakpoints match your needs
   - May need to adjust grid columns for mobile

4. **Animation Performance**
   - If aura uses heavy animations, consider removing for mobile
   - Framer Motion should be fine, but test on real device

---

### Original Implementation Order (Without aura.build)

*Kept below for reference if aura.build doesn't work out*

#### Day 1 (Saturday) - Foundation

1. **Setup (30 min)**
   - `npx create-next-app@latest` with TypeScript, Tailwind, App Router
   - Install: `@octokit/graphql`, `recharts`, `swr`, `framer-motion`
   - Configure Tailwind dark theme + yellow accent

2. **GitHub Integration (2 hrs)**
   - Create GraphQL client in `lib/github/client.ts`
   - Write main query in `lib/github/queries.ts`
   - Create types from query response
   - Test with your username

3. **API Route (1 hr)**
   - `/api/github/[username]/route.ts`
   - Add server-side caching
   - Error handling for 404/rate limit

4. **Dashboard Components (3 hrs)**
   - DashboardShell layout
   - StatsGrid with 4 metrics
   - EngineeringScore gauge (circular progress)
   - RepoList component
   - Basic styling

5. **Demo Mode (1 hr)**
   - Fetch your data, save to `data/demo.json`
   - Import in main page
   - Verify instant load

#### Day 2 (Sunday) - Polish

6. **Charts (2 hrs)**
   - ContributionChart (bar/area)
   - LanguageBreakdown (donut)
   - ContributionCalendar (heatmap)

7. **User Search (1 hr)**
   - Header with search input
   - Navigation to /[username]
   - SWR hook for client-side caching

8. **Error States (1 hr)**
   - User not found
   - Rate limited
   - Network error

9. **Responsive + Polish (2 hrs)**
   - Mobile layout adjustments
   - Loading skeletons
   - Subtle animations
   - Meta tags

10. **Deploy (30 min)**
    - Push to GitHub
    - Connect to Vercel
    - Add GITHUB_TOKEN env var
    - Test production

---

## Environment Variables & GitHub PAT Setup

### Creating Your Personal Access Token

1. Go to https://github.com/settings/tokens?type=beta (Fine-grained tokens)
2. Click "Generate new token"
3. Configure:
   - **Token name:** `github-dashboard-dev`
   - **Expiration:** 90 days (can regenerate later)
   - **Repository access:** Public Repositories (read-only)
   - **Permissions:**
     - Account permissions → **Read-only** for: Profile, Email
     - No repository permissions needed (public repos are readable by default)
4. Generate and copy the token immediately

### Environment File

```env
# .env.local (never commit this file)
GITHUB_TOKEN=github_pat_xxxxxxxxxxxx

# For Vercel deployment, add this as an environment variable
# in Project Settings → Environment Variables
```

### Why Fine-Grained Token?
- More secure than classic tokens
- Minimal permissions = smaller blast radius
- GitHub's recommended approach for new projects

---

## Verification Plan

1. **Demo mode works offline**
   - Disconnect network, load `/` - should still render

2. **Live data fetches correctly**
   - Go to `/octocat` - should show GitHub mascot's data
   - Check network tab - only 1 API call

3. **Rate limiting handled**
   - Spam refresh 10 times - should not break
   - Check server logs for cache hits

4. **Mobile responsive**
   - Chrome DevTools mobile view
   - All cards stack vertically
   - Charts resize appropriately

5. **Performance**
   - Lighthouse score > 90
   - First Contentful Paint < 1.5s

---

## Summary

**Your plan is solid but needs these adjustments:**

1. **Switch to GraphQL API** - mandatory for feasible metrics
2. **Add demo mode** - non-negotiable for portfolio
3. **Server-side PAT** - simpler than OAuth, still secure
4. **Add Engineering Score** - your killer differentiator
5. **Use SWR** - lightweight caching that works

**Realistic weekend scope:**
- Full demo dashboard with your profile
- "Try your username" feature
- 4-5 chart visualizations
- Mobile responsive
- Deployed to Vercel

**What makes this exceptional:**
- Engineering Score (insight, not just data)
- Instant demo load (professional feel)
- Real data capability (proves it works)
- Clean, dark UI (looks like internal tool)
