export interface GitHubUser {
  name: string
  login: string
  avatarUrl: string
  contributionsCollection: ContributionsCollection
  repositories: {
    nodes: Repository[]
  }
}

export interface ContributionsCollection {
  totalCommitContributions: number
  totalPullRequestContributions: number
  totalIssueContributions: number
  restrictedContributionsCount: number
  contributionCalendar: ContributionCalendar
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: Week[]
}

export interface Week {
  contributionDays: ContributionDay[]
}

export interface ContributionDay {
  contributionCount: number
  date: string
}

export interface Repository {
  name: string
  description: string | null
  pushedAt: string
  stargazerCount: number
  forkCount: number
  primaryLanguage: Language | null
}

export interface Language {
  name: string
  color: string
}

export interface DashboardData {
  user: GitHubUser
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
}
