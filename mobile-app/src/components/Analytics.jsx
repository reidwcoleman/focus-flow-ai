const Analytics = () => {
  const grades = [
    { subject: 'Math', current: 92, predicted: 94, trend: 'up', color: 'cyan' },
    { subject: 'Chemistry', current: 88, predicted: 90, trend: 'up', color: 'purple' },
    { subject: 'English', current: 95, predicted: 95, trend: 'stable', color: 'blue' },
    { subject: 'History', current: 85, predicted: 87, trend: 'up', color: 'amber' },
  ]

  const weeklyActivity = [
    { day: 'Mon', hours: 3.5, focus: 85 },
    { day: 'Tue', hours: 4.2, focus: 92 },
    { day: 'Wed', hours: 3.8, focus: 88 },
    { day: 'Thu', hours: 5.1, focus: 95 },
    { day: 'Fri', hours: 4.5, focus: 90 },
    { day: 'Sat', hours: 2.3, focus: 78 },
    { day: 'Sun', hours: 1.8, focus: 70 },
  ]

  const maxHours = Math.max(...weeklyActivity.map(d => d.hours))

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'from-green-500 to-emerald-600'
    if (grade >= 80) return 'from-blue-500 to-primary-600'
    if (grade >= 70) return 'from-amber-500 to-orange-600'
    return 'from-red-500 to-rose-600'
  }

  const getSubjectColor = (color) => {
    const colors = {
      cyan: 'from-cyan-500 to-blue-500',
      purple: 'from-purple-500 to-pink-500',
      blue: 'from-blue-500 to-primary-600',
      amber: 'from-amber-500 to-orange-500',
    }
    return colors[color] || 'from-neutral-400 to-neutral-500'
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Overall Performance */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-navy to-dark-navy-light p-6 shadow-dark-soft-lg border border-dark-border-glow">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-dark-text-primary mb-1">Performance</h2>
              <p className="text-dark-text-secondary text-sm">Your academic overview</p>
            </div>
            <div className="px-3 py-1.5 bg-primary-500/20 backdrop-blur-sm rounded-full border border-primary-500/30">
              <span className="text-primary-500 font-semibold text-sm">GPA 3.8</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-bg-secondary/50 backdrop-blur-sm rounded-xl p-4 border border-dark-border-glow">
              <div className="text-3xl font-bold text-dark-text-primary mb-1">89.5</div>
              <div className="text-dark-text-secondary text-xs">Avg Grade</div>
            </div>
            <div className="bg-dark-bg-secondary/50 backdrop-blur-sm rounded-xl p-4 border border-dark-border-glow">
              <div className="text-3xl font-bold text-dark-text-primary mb-1">24</div>
              <div className="text-dark-text-secondary text-xs">Study Hours</div>
            </div>
            <div className="bg-dark-bg-secondary/50 backdrop-blur-sm rounded-xl p-4 border border-dark-border-glow">
              <div className="text-3xl font-bold text-dark-text-primary mb-1">96%</div>
              <div className="text-dark-text-secondary text-xs">On Time</div>
            </div>
          </div>
        </div>

        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent-purple/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grade Predictions */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 shadow-dark-soft-md border border-dark-border-glow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dark-text-primary">Grade Predictions</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary-500/30">
            <svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs font-medium text-primary-500">AI Powered</span>
          </div>
        </div>

        <div className="space-y-4">
          {grades.map((grade) => (
            <div key={grade.subject}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getSubjectColor(grade.color)} shadow-dark-soft`}></div>
                  <div>
                    <div className="font-semibold text-dark-text-primary text-sm">{grade.subject}</div>
                    <div className="text-xs text-dark-text-secondary">Current: {grade.current}%</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary-500">
                    {grade.predicted}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span>+{grade.predicted - grade.current}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-dark-bg-primary rounded-full overflow-hidden shadow-dark-inner">
                <div
                  className={`absolute h-full bg-gradient-to-r ${getGradeColor(grade.current)} transition-all`}
                  style={{ width: `${grade.current}%` }}
                ></div>
                <div
                  className="absolute h-full border-2 border-dashed border-green-500 bg-transparent"
                  style={{ width: `${grade.predicted}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 shadow-dark-soft-md border border-dark-border-glow">
        <h3 className="font-bold text-dark-text-primary mb-4">This Week's Activity</h3>

        <div className="flex items-end justify-between gap-2 h-40 mb-4">
          {weeklyActivity.map((day, index) => {
            const height = (day.hours / maxHours) * 100
            const isToday = index === new Date().getDay() - 1

            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex flex-col justify-end h-32">
                  <div
                    className={`w-full rounded-t-xl transition-all ${
                      isToday
                        ? 'bg-gradient-to-t from-primary-500 to-accent-cyan shadow-glow-cyan'
                        : 'bg-gradient-to-t from-dark-bg-tertiary to-dark-navy-dark'
                    }`}
                    style={{ height: `${height}%` }}
                  >
                    {day.hours > 0 && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-dark-text-primary">
                        {day.hours}h
                      </div>
                    )}
                  </div>
                </div>
                <div className={`text-xs font-medium ${isToday ? 'text-primary-500' : 'text-dark-text-muted'}`}>
                  {day.day}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t border-dark-border-subtle">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-dark-text-primary">24.2h</div>
              <div className="text-xs text-dark-text-secondary">Total Study Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-500">86%</div>
              <div className="text-xs text-dark-text-secondary">Avg Focus Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/40 rounded-2xl p-4 shadow-dark-soft">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-dark-soft mb-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-semibold text-green-400 text-sm mb-1">Strengths</h4>
          <p className="text-xs text-green-300">Consistent study habits</p>
        </div>

        <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/40 rounded-2xl p-4 shadow-dark-soft">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-dark-soft mb-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h4 className="font-semibold text-amber-400 text-sm mb-1">Focus On</h4>
          <p className="text-xs text-amber-300">Weekend study time</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-accent-purple/10 via-dark-bg-tertiary to-primary-500/10 rounded-2xl p-5 border border-dark-border-glow shadow-dark-soft-md">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-purple-dark flex items-center justify-center shadow-glow-purple">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-dark-text-primary mb-1.5">AI Recommendation</h4>
            <p className="text-sm text-dark-text-secondary leading-relaxed mb-3">
              You're on track for a 3.9 GPA this semester! Focus an extra 30 minutes on Chemistry this week to boost your predicted grade to 92%.
            </p>
            <button className="text-sm font-semibold text-primary-500 hover:text-primary-400">
              View detailed insights →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
