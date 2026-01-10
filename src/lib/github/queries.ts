export const USER_DASHBOARD_QUERY = `
  query UserDashboard($username: String!) {
    user(login: $username) {
      name
      login
      avatarUrl
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        restrictedContributionsCount
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
      repositories(first: 10, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER) {
        nodes {
          name
          description
          pushedAt
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
        }
      }
    }
  }
`
