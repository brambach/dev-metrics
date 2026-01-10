import { Header } from '@/components/layout/Header'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
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
        <DashboardLayout
          stats={data.stats}
          engineeringScore={data.engineeringScore}
          chartData={data.chartData}
          languageData={getLanguageBreakdown(data.user.repositories.nodes)}
          repos={data.user.repositories.nodes}
          contributionWeeks={data.user.contributionsCollection.contributionCalendar.weeks}
          headerContent={
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
          }
        />
      </>
    )
  } catch (error) {
    // Parse error message to determine error type
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const errorType = errorMessage.split(':')[0]
    const errorDetails = errorMessage.split(':').slice(1).join(':').trim()

    // Determine error title and description based on error type
    let title = 'Error Loading Profile'
    let description = errorDetails || errorMessage
    let suggestion = 'Please try again in a few moments.'
    let showExamples = false

    if (errorType === 'USER_NOT_FOUND') {
      title = 'User Not Found'
      description = `Could not find GitHub user @${username}`
      suggestion = 'Please check the spelling and try again.'
      showExamples = true
    } else if (errorType === 'RATE_LIMITED') {
      title = 'Rate Limit Exceeded'
      description = 'Too many requests to GitHub API'
      suggestion = 'Please wait a few minutes and try again.'
    } else if (errorType === 'AUTH_ERROR') {
      title = 'Authentication Error'
      description = 'Unable to authenticate with GitHub'
      suggestion = 'This is likely a configuration issue. Please contact support.'
    } else if (errorType === 'NETWORK_ERROR') {
      title = 'Network Error'
      description = 'Unable to connect to GitHub'
      suggestion = 'Please check your internet connection and try again.'
    }

    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col gap-8">
          <div className="bg-surface border border-border rounded-xl p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-3">{title}</h2>
            <p className="text-muted mb-2">
              {description}
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              {suggestion}
            </p>

            {showExamples && (
              <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                <p className="text-xs text-zinc-600 mb-3">Try searching for popular users:</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {['torvalds', 'gaearon', 'tj', 'sindresorhus'].map((exampleUsername) => (
                    <a
                      key={exampleUsername}
                      href={`/${exampleUsername}`}
                      className="text-xs px-3 py-1.5 bg-surface border border-border rounded-md hover:border-accent hover:text-accent smooth-transition"
                    >
                      @{exampleUsername}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <a
              href="/"
              className="inline-block mt-6 text-sm font-medium text-accent hover:text-white smooth-transition"
            >
              ← Back to Demo
            </a>
          </div>
        </main>
      </>
    )
  }
}
