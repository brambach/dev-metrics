import { GitHubUser, ContributionDay, Week, Repository } from './github/types'

export function calculateEngineeringScore(user: GitHubUser) {
  const { contributionsCollection } = user
  const { contributionCalendar } = contributionsCollection

  // Calculate active days in last 30 days
  const last30Days = contributionCalendar.weeks
    .flatMap(week => week.contributionDays)
    .slice(-30)
  const activeDays = last30Days.filter(day => day.contributionCount > 0).length

  // Consistency: 0-25 points based on active days in last 30
  const consistency = Math.round((activeDays / 30) * 25)

  // Volume: 0-25 points based on total contributions (capped at 100/month)
  const totalContributions = contributionsCollection.totalCommitContributions +
    contributionsCollection.totalPullRequestContributions +
    contributionsCollection.totalIssueContributions
  const volume = Math.round(Math.min(totalContributions / 100, 1) * 25)

  // Impact: 0-25 points based on PR ratio
  const commits = contributionsCollection.totalCommitContributions || 1
  const prs = contributionsCollection.totalPullRequestContributions
  const prRatio = prs / commits
  const impact = Math.round(Math.min(prRatio, 1) * 25)

  // Recency: 0-25 points based on recent activity
  const contributedToday = last30Days[last30Days.length - 1]?.contributionCount > 0
  const daysAgo = last30Days.reverse().findIndex(day => day.contributionCount > 0)
  const recency = contributedToday ? 25 : Math.max(0, 25 - (daysAgo * 2))

  const score = consistency + volume + impact + recency

  return {
    score: Math.min(score, 100),
    breakdown: {
      consistency: Math.round((consistency / 25) * 100),
      volume: Math.round((volume / 25) * 100),
      impact: Math.round((impact / 25) * 100),
      recency: Math.round((recency / 25) * 100),
    }
  }
}

export function calculateStreak(contributionDays: ContributionDay[]): number {
  if (contributionDays.length === 0) return 0

  const sortedDays = [...contributionDays].reverse() // Most recent first
  let streak = 0

  // Check if the most recent day is today (or very recent)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const mostRecentDay = new Date(sortedDays[0].date)
  mostRecentDay.setHours(0, 0, 0, 0)

  const isTodayOrYesterday = Math.abs(today.getTime() - mostRecentDay.getTime()) <= 24 * 60 * 60 * 1000

  // Start counting from the first day, but skip today if it has no contributions
  // (streak should continue if you had activity yesterday but not yet today)
  let startIndex = 0
  if (isTodayOrYesterday && sortedDays[0].contributionCount === 0) {
    startIndex = 1 // Skip today if it's incomplete
  }

  // Count consecutive days with contributions
  for (let i = startIndex; i < sortedDays.length; i++) {
    if (sortedDays[i].contributionCount > 0) {
      streak++
    } else {
      break // Stop at first day with no contributions
    }
  }

  return streak
}

export function transformToChartData(weeks: Week[]) {
  const last30Days = weeks
    .flatMap(week => week.contributionDays)
    .slice(-30)

  return last30Days.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: day.contributionCount
  }))
}

export function getLanguageBreakdown(repositories: Repository[]) {
  const languageCounts: Record<string, number> = {}

  repositories.forEach(repo => {
    if (repo.primaryLanguage) {
      const lang = repo.primaryLanguage.name
      languageCounts[lang] = (languageCounts[lang] || 0) + 1
    }
  })

  return Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      value: count,
      color: repositories.find(r => r.primaryLanguage?.name === name)?.primaryLanguage?.color || '#FFED4E'
    }))
    .sort((a, b) => b.value - a.value)
}
