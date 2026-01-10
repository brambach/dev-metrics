require('dotenv').config({ path: '.env.local' })
const { graphql } = require('@octokit/graphql')
const fs = require('fs')
const path = require('path')

const USER_DASHBOARD_QUERY = `
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

async function generateDemoData() {
  const username = process.argv[2] || 'brambach'
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable not set')
    process.exit(1)
  }

  try {
    console.log(`Fetching data for ${username}...`)

    const client = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    })

    const data = await client(USER_DASHBOARD_QUERY, { username })

    // Save to data/demo.json
    const dataDir = path.join(__dirname, '..', 'src', 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const filePath = path.join(dataDir, 'demo.json')
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    console.log(`✓ Demo data saved to ${filePath}`)
    console.log(`✓ Total commits: ${data.user.contributionsCollection.totalCommitContributions}`)
    console.log(`✓ Repositories: ${data.user.repositories.nodes.length}`)
  } catch (error) {
    console.error('Error generating demo data:', error.message)
    process.exit(1)
  }
}

generateDemoData()
