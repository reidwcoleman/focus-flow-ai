const Planner = () => {
  const studyPlan = [
    {
      id: 1,
      time: '4:00 PM',
      duration: '45min',
      title: 'Calculus Problem Set',
      subject: 'Math',
      type: 'study',
      aiSuggested: true,
      completed: true,
    },
    {
      id: 2,
      time: '5:00 PM',
      duration: '30min',
      title: 'Break & Snack',
      subject: null,
      type: 'break',
      aiSuggested: true,
      completed: true,
    },
    {
      id: 3,
      time: '5:30 PM',
      duration: '1h 15min',
      title: 'Chemistry Lab Report',
      subject: 'Chemistry',
      type: 'study',
      aiSuggested: true,
      completed: false,
      current: true,
    },
    {
      id: 4,
      time: '6:45 PM',
      duration: '15min',
      title: 'Quick Review',
      subject: 'English',
      type: 'review',
      aiSuggested: true,
      completed: false,
    },
    {
      id: 5,
      time: '7:00 PM',
      duration: '1h',
      title: 'Dinner Break',
      subject: null,
      type: 'break',
      aiSuggested: false,
      completed: false,
    },
  ]

  const getTypeColor = (type) => {
    switch (type) {
      case 'study': return 'from-primary-500 to-primary-600'
      case 'break': return 'from-green-500 to-emerald-600'
      case 'review': return 'from-amber-500 to-orange-600'
      default: return 'from-neutral-400 to-neutral-500'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'study':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'break':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'review':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-dark-bg-secondary rounded-2xl p-6 shadow-dark-soft-md border border-dark-border-glow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-dark-text-primary mb-1">Today's Plan</h2>
            <p className="text-sm text-dark-text-secondary">AI-optimized for your peak performance</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 shadow-glow-cyan">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple animate-pulse shadow-glow-cyan"></div>
            <span className="text-xs font-medium text-primary-500">
              AI Active
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-dark-text-secondary">Today's Progress</span>
            <span className="text-xs font-bold text-primary-500">40%</span>
          </div>
          <div className="w-full h-3 bg-dark-bg-primary rounded-full overflow-hidden shadow-dark-inner">
            <div className="h-full w-[40%] bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full shadow-glow-cyan transition-all"></div>
          </div>
        </div>
      </div>

      {/* Study Plan Timeline */}
      <div className="space-y-3">
        {studyPlan.map((item, index) => (
          <div
            key={item.id}
            className={`relative ${item.current ? 'scale-105' : ''} transition-all`}
          >
            {/* Connecting Line */}
            {index < studyPlan.length - 1 && (
              <div className={`absolute left-[29px] top-16 w-0.5 h-6 ${
                item.completed ? 'bg-gradient-to-b from-primary-500 to-accent-cyan' : 'bg-dark-border-subtle'
              }`}></div>
            )}

            <div className={`relative bg-dark-bg-secondary rounded-2xl p-4 shadow-dark-soft-md border transition-all ${
              item.current
                ? 'border-primary-500 shadow-glow-cyan'
                : item.completed
                ? 'border-dark-border-glow opacity-60'
                : 'border-dark-border-glow'
            }`}>
              <div className="flex gap-4">
                {/* Time & Status Indicator */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                    item.completed
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 shadow-dark-soft'
                      : item.current
                      ? `bg-gradient-to-br ${getTypeColor(item.type)} shadow-glow-cyan`
                      : 'bg-gradient-to-br from-dark-bg-tertiary to-dark-navy-dark'
                  }`}>
                    {item.completed ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      getTypeIcon(item.type)
                    )}

                    {item.current && (
                      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary-500 to-accent-cyan opacity-40 blur animate-pulse"></div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-dark-text-primary">{item.time}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${
                        item.completed ? 'text-dark-text-muted line-through' : 'text-dark-text-primary'
                      }`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs">
                        {item.subject && (
                          <span className="text-dark-text-secondary font-medium">{item.subject}</span>
                        )}
                        <span className="text-dark-text-muted">{item.duration}</span>
                      </div>
                    </div>

                    {item.aiSuggested && (
                      <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-500/10 border border-primary-500/30">
                        <svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs font-medium text-primary-500">AI</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {item.current && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 px-4 bg-gradient-to-r from-primary-500 to-accent-cyan text-white text-sm font-semibold rounded-xl hover:shadow-glow-cyan transition-all active:scale-95">
                        Start Now
                      </button>
                      <button className="px-4 py-2 bg-dark-bg-tertiary text-dark-text-secondary text-sm font-medium rounded-xl hover:bg-dark-navy-dark border border-dark-border-glow transition-all active:scale-95">
                        Skip
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Smart Insights */}
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
            <h4 className="font-semibold text-dark-text-primary mb-1">AI Insight</h4>
            <p className="text-sm text-dark-text-secondary leading-relaxed">
              Based on your focus patterns, you're most productive between 4-6 PM. I've scheduled your hardest tasks during this window.
            </p>
          </div>
        </div>
      </div>

      {/* Adjust Plan Button */}
      <button className="w-full py-3 px-4 bg-dark-bg-secondary border-2 border-dark-border-glow text-dark-text-primary font-semibold rounded-xl hover:border-primary-500 hover:text-primary-500 transition-all active:scale-95 shadow-dark-soft">
        Adjust Plan
      </button>
    </div>
  )
}

export default Planner
