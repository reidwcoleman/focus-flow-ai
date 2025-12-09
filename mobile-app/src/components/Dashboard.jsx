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
    <div className="space-y-6 pb-6">
      {/* Header with AI Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-purple p-6 shadow-glow">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium">AI Active</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-white">Good afternoon, Alex</h2>
          </div>
          <p className="text-white/80 text-sm">You have 3 assignments due this week</p>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent-purple/20 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenScanner}
          className="relative overflow-hidden group bg-white rounded-2xl p-4 shadow-soft border border-neutral-100 hover:shadow-lg transition-all active:scale-95">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-neutral-900 text-sm">Scan</div>
              <div className="text-xs text-neutral-500">Homework</div>
            </div>
          </div>
        </button>

        <button className="relative overflow-hidden group bg-white rounded-2xl p-4 shadow-soft border border-neutral-100 hover:shadow-lg transition-all active:scale-95">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shadow-glow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-neutral-900 text-sm">AI Tutor</div>
              <div className="text-xs text-neutral-500">Ask anything</div>
            </div>
          </div>
        </button>
      </div>

      {/* Assignments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neutral-900">Upcoming</h3>
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
                className="text-sm text-primary-600 font-medium hover:text-primary-700"
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
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getPriorityColor(assignment.priority)} border backdrop-blur-sm p-5 shadow-soft hover:shadow-lg transition-all`}
            >
              {/* AI Badge */}
              {assignment.aiCaptured && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple"></div>
                    <span className="text-xs font-medium text-neutral-700">AI</span>
                  </div>
                </div>
              )}

              {/* Subject Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${getSubjectColor(assignment.subject)} shadow-sm`}></div>
                <span className="text-xs font-medium text-neutral-600">{assignment.subject}</span>
              </div>

              {/* Title */}
              <h4 className="text-base font-semibold text-neutral-900 mb-2 pr-16">
                {assignment.title}
              </h4>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-neutral-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{assignment.timeEstimate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{getDaysUntilDue(assignment.dueDate)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-700">Progress</span>
                  <span className="text-xs font-semibold text-primary-600">{assignment.progress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 shadow-glow"
                    style={{ width: `${assignment.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Session CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 shadow-xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-bold mb-1">Ready to focus?</h3>
              <p className="text-neutral-400 text-sm">Start your AI-optimized study session</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-glow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <button className="w-full mt-4 py-3 px-4 bg-white text-neutral-900 font-semibold rounded-xl hover:bg-neutral-100 transition-all active:scale-95">
            Start Session
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

export default Dashboard
