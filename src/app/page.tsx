import { Header } from '@/components/layout/Header'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
  calculateEngineeringScore,
  calculateStreak,
  transformToChartData,
  getLanguageBreakdown,
} from '@/lib/utils'
import demoData from '@/data/demo.json'
import { GitHubUser } from '@/lib/github/types'

export default async function Home() {
  // Use cached demo data for instant loading (0 API calls)
  const user = demoData.user as GitHubUser
  const { contributionsCollection, repositories } = user

  // Calculate stats from demo data
  const engineeringScore = calculateEngineeringScore(user)
  const allContributionDays = contributionsCollection.contributionCalendar.weeks.flatMap(
    (week) => week.contributionDays
  )
  const currentStreak = calculateStreak(allContributionDays)
  const chartData = transformToChartData(contributionsCollection.contributionCalendar.weeks)

  const data = {
    user,
    stats: {
      totalCommits: contributionsCollection.totalCommitContributions,
      totalPRs: contributionsCollection.totalPullRequestContributions,
      totalIssues: contributionsCollection.totalIssueContributions,
      currentStreak,
    },
    engineeringScore,
    chartData,
  }

  return (
    <>
      <Header />
      <DashboardLayout
        stats={data.stats}
        engineeringScore={data.engineeringScore}
        chartData={data.chartData}
        languageData={getLanguageBreakdown(data.user.repositories.nodes)}
        repos={data.user.repositories.nodes}
        contributionWeeks={data.user.contributionsCollection.contributionCalendar.weeks}
        headerContent={
          <div className="flex items-center justify-between animate-enter delay-0">
            <h1 className="text-xl font-medium text-white tracking-tight">Overview</h1>
            <button className="text-xs font-medium text-muted hover:text-white border border-border bg-surface px-3 py-1.5 rounded-md smooth-transition flex items-center gap-2 subtle-shadow hover:border-zinc-500 active:scale-95">
              <span>Filter by date</span>
            </button>
          </div>
        }
      />
    </>
  )
}
