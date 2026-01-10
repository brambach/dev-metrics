import { Star, GitFork, LayoutDashboard, Server, BrainCircuit } from 'lucide-react'

interface Repository {
  name: string
  primaryLanguage: {
    name: string
    color: string
  } | null
  stargazerCount: number
  forkCount: number
  pushedAt: string
}

interface RepoListProps {
  repos: Repository[]
}

const iconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  api: Server,
  ml: BrainCircuit,
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'today'
  if (diffInDays === 1) return '1 day ago'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 14) return '1 week ago'
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 60) return '1 month ago'
  return `${Math.floor(diffInDays / 30)} months ago`
}

function getIconForRepo(repoName: string) {
  const name = repoName.toLowerCase()
  if (name.includes('dashboard')) return iconMap.dashboard
  if (name.includes('api') || name.includes('service')) return iconMap.api
  if (name.includes('ml') || name.includes('pipeline')) return iconMap.ml
  return LayoutDashboard
}

export function RepoList({ repos }: RepoListProps) {
  return (
    <div className="animate-enter delay-500 bg-surface border border-border rounded-xl overflow-hidden subtle-shadow">
      <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface">
        <h3 className="text-sm font-medium text-white">Active Repositories</h3>
        <button className="text-xs text-zinc-500 hover:text-white smooth-transition">View all</button>
      </div>
      <div className="divide-y divide-border">
        {repos.map((repo) => {
          const Icon = getIconForRepo(repo.name)
          return (
            <div
              key={repo.name}
              className="group px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[#1a1a1a] transition-colors duration-200 cursor-pointer gap-4 sm:gap-0"
            >
              <div className="flex items-center gap-5">
                <div className="w-9 h-9 rounded bg-[#1e1e1e] border border-border flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:scale-110 group-hover:border-accent/20 smooth-transition">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200 group-hover:text-accent smooth-transition">
                    {repo.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    {repo.primaryLanguage && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: repo.primaryLanguage.color }} />
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                          {repo.primaryLanguage.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8 text-xs text-zinc-500 pl-14 sm:pl-0">
                <div className="flex items-center gap-1.5 min-w-[60px] hover:text-zinc-300 smooth-transition">
                  <Star className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{repo.stargazerCount}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-[60px] hover:text-zinc-300 smooth-transition">
                  <GitFork className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{repo.forkCount}</span>
                </div>
                <div className="min-w-[90px] text-right text-zinc-600">{getRelativeTime(repo.pushedAt)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
