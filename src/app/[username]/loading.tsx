import { Header } from '@/components/layout/Header'

export default function UserPageLoading() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col gap-8">
        {/* Page Header Skeleton */}
        <div className="flex items-center justify-between animate-pulse">
          <div>
            <div className="h-6 w-48 bg-surface rounded-md mb-2" />
            <div className="h-4 w-24 bg-surface rounded-md" />
          </div>
          <div className="h-8 w-32 bg-surface rounded-md" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-surface border border-border rounded-xl p-6 h-32"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-background rounded" />
                <div className="w-4 h-4 bg-background rounded" />
              </div>
              <div className="h-8 w-16 bg-background rounded mb-3" />
              <div className="h-4 w-20 bg-background rounded" />
            </div>
          ))}
        </div>

        {/* Engineering Score Skeleton */}
        <div className="animate-pulse bg-surface border border-border rounded-xl p-10 flex flex-col items-center justify-center">
          <div className="w-[280px] h-[280px] rounded-full bg-background mb-10" />
          <div className="flex gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-5 w-12 bg-background rounded" />
                <div className="h-3 w-16 bg-background rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-surface border border-border rounded-xl p-8 h-[380px]"
            >
              <div className="h-4 w-32 bg-background rounded mb-6" />
              <div className="h-64 bg-background rounded" />
            </div>
          ))}
        </div>

        {/* Repository List Skeleton */}
        <div className="animate-pulse bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-8 py-5 border-b border-border">
            <div className="h-4 w-36 bg-background rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-8 py-5 border-b border-border last:border-0">
              <div className="flex items-center gap-5">
                <div className="w-9 h-9 rounded bg-background" />
                <div>
                  <div className="h-4 w-40 bg-background rounded mb-2" />
                  <div className="h-3 w-24 bg-background rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contribution Calendar Skeleton */}
        <div className="animate-pulse bg-surface border border-border rounded-xl p-8">
          <div className="h-4 w-48 bg-background rounded mb-6" />
          <div className="h-32 bg-background rounded" />
        </div>
      </main>
    </>
  )
}
