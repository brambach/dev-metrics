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
    // Enhanced error handling with specific error types
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      // User not found
      if (errorMessage.includes('could not resolve to a user')) {
        throw new Error(`USER_NOT_FOUND: GitHub user '@${username}' does not exist`)
      }

      // Rate limiting
      if (errorMessage.includes('rate limit') || errorMessage.includes('api rate limit')) {
        throw new Error('RATE_LIMITED: GitHub API rate limit exceeded. Please try again later.')
      }

      // Authentication issues
      if (errorMessage.includes('bad credentials') || errorMessage.includes('unauthorized')) {
        throw new Error('AUTH_ERROR: Invalid GitHub token. Please check your configuration.')
      }

      // Network errors
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new Error('NETWORK_ERROR: Unable to connect to GitHub. Please check your internet connection.')
      }
    }

    // Generic error fallback
    console.error('Error fetching GitHub data:', error)
    throw new Error(`Failed to fetch data for user: ${username}`)
  }
}
