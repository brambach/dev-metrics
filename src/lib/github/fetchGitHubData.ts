import { githubClient } from './client'
import { USER_DASHBOARD_QUERY } from './queries'
import { GitHubUser, DashboardData } from './types'
import {
  calculateEngineeringScore,
  calculateStreak,
  transformToChartData,
} from '../utils'

export async function fetchGitHubData(username: string): Promise<DashboardData> {
  try {
    const response = await githubClient<{ user: GitHubUser }>(USER_DASHBOARD_QUERY, {
      username,
    })

    const user = response.user
    const { contributionsCollection, repositories } = user

    // Calculate engineering score
    const engineeringScore = calculateEngineeringScore(user)

    // Calculate streak
    const allContributionDays = contributionsCollection.contributionCalendar.weeks
      .flatMap(week => week.contributionDays)
    const currentStreak = calculateStreak(allContributionDays)

    // Transform chart data
    const chartData = transformToChartData(contributionsCollection.contributionCalendar.weeks)

    return {
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
  } catch (error) {
    console.error('Error fetching GitHub data:', error)
    throw new Error(`Failed to fetch data for user: ${username}`)
  }
}
