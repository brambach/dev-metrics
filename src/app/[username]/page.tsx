import { Header } from '@/components/layout/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { EngineeringScore } from '@/components/dashboard/EngineeringScore'
import { ContributionChart } from '@/components/dashboard/ContributionChart'
import { LanguageBreakdown } from '@/components/dashboard/LanguageBreakdown'
import { ContributionCalendar } from '@/components/dashboard/ContributionCalendar'
import { RepoList } from '@/components/dashboard/RepoList'
import { GitCommitHorizontal, GitPullRequest, CircleDot, Flame } from 'lucide-react'
import { fetchGitHubData } from '@/lib/github/fetchGitHubData'
import { getLanguageBreakdown } from '@/lib/utils'

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  try {
    // Fetch live data for the requested username
    const data = await fetchGitHubData(username)

    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex items-center justify-between animate-enter delay-0">
            <div>
              <h1 className="text-xl font-medium text-white tracking-tight">
                {data.user.name || username}
              </h1>
              <p className="text-sm text-muted mt-1">@{username}</p>
            </div>
            <button className="text-xs font-medium text-muted hover:text-white border border-border bg-surface px-3 py-1.5 rounded-md smooth-transition flex items-center gap-2 subtle-shadow hover:border-zinc-500 active:scale-95">
              <span>Filter by date</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              label="Total Commits"
              value={data.stats.totalCommits}
              change={12}
              changeLabel="this month"
              icon={GitCommitHorizontal}
              trend="up"
              delay={100}
            />
            <StatsCard
              label="Pull Requests"
              value={data.stats.totalPRs}
              change={4}
              changeLabel="this month"
              icon={GitPullRequest}
              trend="up"
              delay={150}
            />
            <StatsCard
              label="Issues"
              value={data.stats.totalIssues}
              change={0}
              changeLabel="this month"
              icon={CircleDot}
              trend="neutral"
              delay={200}
            />
            <StatsCard
              label="Current Streak"
              value={data.stats.currentStreak}
              changeLabel="consecutive days"
              icon={Flame}
              highlight
              delay={250}
            />
          </div>

          {/* Engineering Score */}
          <EngineeringScore
            score={data.engineeringScore.score}
            breakdown={data.engineeringScore.breakdown}
          />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContributionChart data={data.chartData} />
            <LanguageBreakdown data={getLanguageBreakdown(data.user.repositories.nodes)} />
          </div>

          {/* Repository List */}
          <RepoList repos={data.user.repositories.nodes} />

          {/* Contribution Calendar */}
          <ContributionCalendar weeks={data.user.contributionsCollection.contributionCalendar.weeks} />
        </main>
      </>
    )
  } catch (error) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col gap-8">
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">User Not Found</h2>
            <p className="text-muted">
              Could not find GitHub user <span className="text-accent">@{username}</span>
            </p>
            <p className="text-sm text-zinc-600 mt-4">
              Please check the username and try again.
            </p>
          </div>
        </main>
      </>
    )
  }
}
