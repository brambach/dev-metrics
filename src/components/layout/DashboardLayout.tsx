import { StatsCard } from '@/components/dashboard/StatsCard'
import { EngineeringScore } from '@/components/dashboard/EngineeringScore'
import { ContributionChart } from '@/components/dashboard/ContributionChart'
import { LanguageBreakdown } from '@/components/dashboard/LanguageBreakdown'
import { ContributionCalendar } from '@/components/dashboard/ContributionCalendar'
import { RepoList } from '@/components/dashboard/RepoList'
import { GitCommitHorizontal, GitPullRequest, CircleDot, Flame } from 'lucide-react'
import { Repository, Week } from '@/lib/github/types'

interface DashboardLayoutProps {
  stats: {
    totalCommits: number
    totalPRs: number
    totalIssues: number
    currentStreak: number
  }
  engineeringScore: {
    score: number
    breakdown: {
      consistency: number
      volume: number
      impact: number
      recency: number
    }
  }
  chartData: {
    date: string
    count: number
  }[]
  languageData: {
    name: string
    value: number
    color: string
  }[]
  repos: Repository[]
  contributionWeeks: Week[]
  headerContent: React.ReactNode
}

export function DashboardLayout({
  stats,
  engineeringScore,
  chartData,
  languageData,
  repos,
  contributionWeeks,
  headerContent,
}: DashboardLayoutProps) {
  return (
    <main className="pt-24 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col gap-8" role="main">
      {/* Page Header */}
      {headerContent}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Commits"
          value={stats.totalCommits}
          change={12}
          changeLabel="this month"
          icon={GitCommitHorizontal}
          trend="up"
          delay={100}
        />
        <StatsCard
          label="Pull Requests"
          value={stats.totalPRs}
          change={4}
          changeLabel="this month"
          icon={GitPullRequest}
          trend="up"
          delay={150}
        />
        <StatsCard
          label="Issues"
          value={stats.totalIssues}
          change={0}
          changeLabel="this month"
          icon={CircleDot}
          trend="neutral"
          delay={200}
        />
        <StatsCard
          label="Current Streak"
          value={stats.currentStreak}
          changeLabel="consecutive days"
          icon={Flame}
          highlight
          delay={250}
        />
      </div>

      {/* Engineering Score */}
      <EngineeringScore
        score={engineeringScore.score}
        breakdown={engineeringScore.breakdown}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ContributionChart data={chartData} />
        <LanguageBreakdown data={languageData} />
      </div>

      {/* Repository List */}
      <RepoList repos={repos} />

      {/* Contribution Calendar */}
      <ContributionCalendar weeks={contributionWeeks} />
    </main>
  )
}
