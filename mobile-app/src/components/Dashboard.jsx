import { useState, useEffect } from 'react'
import canvasService from '../services/canvasService'

const Dashboard = ({ onOpenScanner }) => {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Chemistry Lab Report',
      subject: 'Chemistry',
      dueDate: '2025-12-12',
      priority: 'high',
      progress: 30,
      aiCaptured: true,
      timeEstimate: '2h 30m',
    },
    {
      id: 2,
      title: 'Chapter 7-9 Reading',
      subject: 'English',
      dueDate: '2025-12-11',
      priority: 'medium',
      progress: 60,
      aiCaptured: false,
      timeEstimate: '45m',
    },
    {
      id: 3,
      title: 'Calculus Problem Set',
      subject: 'Math',
      dueDate: '2025-12-10',
      priority: 'high',
      progress: 0,
      aiCaptured: true,
      timeEstimate: '1h 15m',
    },
  ])
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(false)

  useEffect(() => {
    loadCanvasAssignments()
  }, [])

  const loadCanvasAssignments = async () => {
    if (canvasService.isConnected()) {
      setIsLoadingCanvas(true)
      try {
        const canvasAssignments = await canvasService.getUpcomingAssignments()

        // Transform Canvas assignments to our format
        const transformed = canvasAssignments.map((assignment, index) => ({
          id: assignment.id || `canvas-${index}`,
          title: assignment.title,
          subject: assignment.subject,
          dueDate: assignment.dueDate,
          priority: determinePriority(assignment.dueDate),
          progress: assignment.submitted ? 100 : 0,
          aiCaptured: false,
          timeEstimate: estimateTime(assignment.points),
          source: 'canvas',
        }))

        // Merge with existing assignments
        setAssignments(prev => [...transformed, ...prev.filter(a => a.source !== 'canvas')])
      } catch (error) {
        console.error('Failed to load Canvas assignments:', error)
      } finally {
        setIsLoadingCanvas(false)
      }
    }
  }

  const determinePriority = (dueDate) => {
    if (!dueDate) return 'medium'
    const now = new Date()
    const due = new Date(dueDate)
    const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

    if (daysUntil <= 1) return 'high'
    if (daysUntil <= 3) return 'medium'
    return 'low'
  }

  const estimateTime = (points) => {
    if (!points) return '1h'
    if (points <= 10) return '30m'
    if (points <= 50) return '1h 30m'
    return '2h 30m'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'from-red-500/10 to-orange-500/10 border-red-500/20'
      case 'medium': return 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20'
      case 'low': return 'from-green-500/10 to-emerald-500/10 border-green-500/20'
      default: return 'from-neutral-100 to-neutral-50 border-neutral-200'
    }
  }

  const getSubjectColor = (subject) => {
    const colors = {
      'Chemistry': 'bg-purple-500',
      'English': 'bg-blue-500',
      'Math': 'bg-cyan-500',
      'History': 'bg-amber-500',
      'Physics': 'bg-green-500',
    }
    return colors[subject] || 'bg-neutral-500'
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays < 0) return 'Overdue'
    return `${diffDays} days`
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Header with AI Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 p-6 shadow-soft-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft shadow-sm"></div>
            <span className="text-white/95 text-sm font-medium tracking-tight">AI Active</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1.5 tracking-tight">Good afternoon, Alex</h2>
          <p className="text-white/85 text-sm">You have 3 assignments due this week</p>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary-700/30 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenScanner}
          className="relative overflow-hidden bg-white rounded-2xl p-4 shadow-soft border border-neutral-150 hover:shadow-soft-md hover:border-neutral-200 transition-all duration-200 active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-soft">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-neutral-900 text-sm tracking-tight">Scan</div>
              <div className="text-xs text-neutral-500">Homework</div>
            </div>
          </div>
        </button>

        <button className="relative overflow-hidden bg-white rounded-2xl p-4 shadow-soft border border-neutral-150 hover:shadow-soft-md hover:border-neutral-200 transition-all duration-200 active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-purple to-accent-purple-dark flex items-center justify-center shadow-soft">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-neutral-900 text-sm tracking-tight">AI Tutor</div>
              <div className="text-xs text-neutral-500">Ask anything</div>
            </div>
          </div>
        </button>
      </div>

      {/* Assignments Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">Upcoming</h3>
          <div className="flex items-center gap-2">
            {isLoadingCanvas && (
              <div className="flex items-center gap-2 text-xs text-primary-600">
                <div className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Syncing...</span>
              </div>
            )}
            {canvasService.isConnected() && (
              <button
                onClick={loadCanvasAssignments}
                className="text-sm text-primary-600 font-medium hover:text-primary-700 active:scale-95 transition-transform"
              >
                Refresh
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getPriorityColor(assignment.priority)} border p-5 shadow-soft hover:shadow-soft-md transition-all duration-200 active:scale-[0.99]`}
            >
              {/* AI Badge */}
              {assignment.aiCaptured && (
                <div className="absolute top-3.5 right-3.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 shadow-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple shadow-glow-primary"></div>
                    <span className="text-xs font-semibold text-neutral-700 tracking-tight">AI</span>
                  </div>
                </div>
              )}

              {/* Subject Badge */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${getSubjectColor(assignment.subject)} shadow-xs`}></div>
                <span className="text-xs font-semibold text-neutral-600 tracking-tight">{assignment.subject}</span>
              </div>

              {/* Title */}
              <h4 className="text-base font-semibold text-neutral-900 mb-2.5 pr-16 tracking-tight leading-snug">
                {assignment.title}
              </h4>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-neutral-600 mb-3.5">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{assignment.timeEstimate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">{getDaysUntilDue(assignment.dueDate)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-600 tracking-tight">Progress</span>
                  <span className="text-xs font-bold text-primary-600">{assignment.progress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-200/80 rounded-full overflow-hidden shadow-inner-soft">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${assignment.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Session CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 shadow-soft-lg">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-bold mb-1 tracking-tight">Ready to focus?</h3>
              <p className="text-neutral-400 text-sm">Start your AI-optimized study session</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow-primary">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <button className="w-full mt-4 py-3 px-4 bg-white text-neutral-900 font-semibold rounded-xl hover:bg-neutral-50 transition-all duration-200 active:scale-[0.98] shadow-soft">
            Start Session
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  )
}

export default Dashboard
