'use client'

interface ContributionCalendarProps {
  weeks: {
    contributionDays: {
      date: string
      contributionCount: number
    }[]
  }[]
}

const COLORS = ['#161616', '#FFED4E20', '#FFED4E60', '#FFED4E']

function getColorIndex(count: number): number {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 7) return 2
  return 3
}

export function ContributionCalendar({ weeks }: ContributionCalendarProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="animate-enter delay-500 bg-surface border border-border rounded-xl p-8 overflow-hidden subtle-shadow hover:border-zinc-700 smooth-transition">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-white">Contribution Calendar</h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Less</span>
          <div className="flex gap-1">
            {COLORS.map((color, i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-[1px]" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-2">
        <div className="min-w-[720px]">
          {/* Month Labels */}
          <div className="flex text-xs text-muted mb-2 pl-8 justify-between w-full pr-8">
            {months.map(m => <span key={m}>{m}</span>)}
          </div>

          <div className="flex">
            {/* Day Labels */}
            <div className="flex flex-col gap-[3px] text-xs text-muted pr-3 pt-[13px] leading-none">
              <span className="h-[10px] invisible">Sun</span>
              <span className="h-[10px] flex items-center">Mon</span>
              <span className="h-[10px] invisible">Tue</span>
              <span className="h-[10px] flex items-center">Wed</span>
              <span className="h-[10px] invisible">Thu</span>
              <span className="h-[10px] flex items-center">Fri</span>
              <span className="h-[10px] invisible">Sat</span>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
              {weeks.flatMap((week, weekIndex) =>
                week.contributionDays.map((day, dayIndex) => {
                  // Calculate animation delay for wave effect (start at 800ms, add 15ms per column)
                  const colIndex = weekIndex
                  const delay = 800 + (colIndex * 15)
                  return (
                    <div
                      key={day.date}
                      className="w-[10px] h-[10px] rounded-[1px] hover:ring-1 hover:ring-white/50 smooth-transition cursor-pointer grid-cell-animate"
                      style={{
                        backgroundColor: COLORS[getColorIndex(day.contributionCount)],
                        animationDelay: `${delay}ms`
                      }}
                      title={`${day.contributionCount} contributions on ${day.date}`}
                    />
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
