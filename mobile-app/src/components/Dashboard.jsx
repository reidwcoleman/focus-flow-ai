import { useState, useEffect } from 'react'
import canvasService from '../services/canvasService'
import authService from '../services/authService'
import assignmentsService from '../services/assignmentsService'

const Dashboard = ({ onOpenScanner }) => {
  const [userName, setUserName] = useState('there')
  const [assignments, setAssignments] = useState([])
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(false)
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'medium',
    timeEstimate: '',
  })

  useEffect(() => {
    loadUserName()
    loadAssignments()
    loadCanvasAssignments()
  }, [])

  const loadUserName = async () => {
    const { user } = await authService.getCurrentUser()
    await authService.refreshUserProfile()
    const profile = authService.getUserProfile()

    // Use full_name if available, otherwise use email username
    const name = profile?.full_name || user?.email?.split('@')[0] || 'there'
    setUserName(name)
  }

  const loadAssignments = async () => {
    setIsLoadingAssignments(true)
    try {
      const { data, error } = await assignmentsService.getUpcomingAssignments()
      if (error) throw error

      // Convert to app format
      const formatted = assignmentsService.toAppFormatBatch(data)
      setAssignments(formatted)
    } catch (error) {
      console.error('Failed to load assignments:', error)
    } finally {
      setIsLoadingAssignments(false)
    }
  }

  const handleCreateAssignment = async () => {
    if (!newAssignment.title.trim()) {
      alert('Please enter a title')
      return
    }

    try {
      const { data, error } = await assignmentsService.createAssignment({
        title: newAssignment.title,
        subject: newAssignment.subject,
        dueDate: newAssignment.dueDate || null,
        priority: newAssignment.priority,
        timeEstimate: newAssignment.timeEstimate || null,
        source: 'manual',
      })

      if (error) throw error

      // Reload assignments
      await loadAssignments()

      // Reset form and close modal
      setNewAssignment({
        title: '',
        subject: '',
        dueDate: '',
        priority: 'medium',
        timeEstimate: '',
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to create assignment:', error)
      alert('Failed to create assignment')
    }
  }

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

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
      case 'high': return 'from-red-900/30 to-orange-900/30 border-red-700/40'
      case 'medium': return 'from-yellow-900/30 to-amber-900/30 border-yellow-700/40'
      case 'low': return 'from-green-900/30 to-emerald-900/30 border-green-700/40'
      default: return 'from-dark-bg-secondary to-dark-bg-tertiary border-dark-border-subtle'
    }
  }

  const getSubjectColor = (subject) => {
    const colors = {
      'Chemistry': 'bg-purple-600',
      'English': 'bg-amber-600',
      'Math': 'bg-cyan-600',
      'History': 'bg-orange-600',
      'Physics': 'bg-green-600',
    }
    return colors[subject] || 'bg-neutral-600'
  }

  const getSubjectBgColor = (subject) => {
    const colors = {
      'Chemistry': 'bg-dark-subject-chemistry',
      'English': 'bg-dark-subject-english',
      'Math': 'bg-dark-subject-math',
      'History': 'bg-dark-subject-history',
      'Physics': 'bg-dark-subject-physics',
    }
    return colors[subject] || 'bg-dark-bg-secondary'
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-navy to-dark-navy-light p-6 shadow-dark-soft-lg border border-dark-border-glow">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft shadow-glow-cyan"></div>
            <span className="text-dark-text-primary text-sm font-medium tracking-tight">AI Active</span>
          </div>
          <h2 className="text-2xl font-bold text-dark-text-primary mb-1.5 tracking-tight">{getTimeOfDayGreeting()}, {userName}</h2>
          <p className="text-dark-text-secondary text-sm">
            {assignments.length === 0
              ? 'No assignments - add one to get started!'
              : `You have ${assignments.length} assignment${assignments.length === 1 ? '' : 's'}`
            }
          </p>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-dark-navy-dark/50 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenScanner}
          className="relative overflow-hidden bg-dark-bg-secondary rounded-2xl p-4 shadow-dark-soft-md border border-dark-border-glow hover:shadow-rim-light hover:border-primary-500/30 transition-all duration-200 active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-cyan">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-dark-text-primary text-sm tracking-tight">Scan</div>
              <div className="text-xs text-dark-text-muted">Homework</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="relative overflow-hidden bg-dark-bg-secondary rounded-2xl p-4 shadow-dark-soft-md border border-dark-border-glow hover:shadow-glow-green hover:border-green-500/30 transition-all duration-200 active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-glow-green">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-dark-text-primary text-sm tracking-tight">Add</div>
              <div className="text-xs text-dark-text-muted">Assignment</div>
            </div>
          </div>
        </button>
      </div>

      {/* Assignments Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-lg font-bold text-dark-text-primary tracking-tight">Upcoming</h3>
          <div className="flex items-center gap-2">
            {isLoadingCanvas && (
              <div className="flex items-center gap-2 text-xs text-primary-500">
                <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Syncing...</span>
              </div>
            )}
            {canvasService.isConnected() && (
              <button
                onClick={loadCanvasAssignments}
                className="text-sm text-primary-500 font-medium hover:text-primary-400 active:scale-95 transition-transform"
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
              className={`relative overflow-hidden rounded-2xl ${getSubjectBgColor(assignment.subject)} border border-dark-border-glow p-5 shadow-dark-soft-md hover:shadow-rim-light transition-all duration-200 active:scale-[0.99]`}
            >
              {/* AI Badge */}
              {assignment.aiCaptured && (
                <div className="absolute top-3.5 right-3.5">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-bg-secondary/80 shadow-dark-soft border border-dark-border-glow">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple shadow-glow-cyan"></div>
                    <span className="text-xs font-semibold text-dark-text-primary tracking-tight">AI</span>
                  </div>
                </div>
              )}

              {/* Subject Badge */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${getSubjectColor(assignment.subject)} shadow-xs`}></div>
                <span className="text-xs font-semibold text-dark-text-secondary tracking-tight">{assignment.subject}</span>
              </div>

              {/* Title */}
              <h4 className="text-base font-semibold text-dark-text-primary mb-2.5 pr-16 tracking-tight leading-snug">
                {assignment.title}
              </h4>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-dark-text-secondary mb-3.5">
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
                  <span className="text-xs font-semibold text-dark-text-secondary tracking-tight">Progress</span>
                  <span className="text-xs font-bold text-primary-500">{assignment.progress}%</span>
                </div>
                <div className="w-full h-2 bg-dark-bg-primary rounded-full overflow-hidden shadow-dark-inner">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all duration-500 shadow-glow-cyan"
                    style={{ width: `${assignment.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Session CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-navy-dark to-dark-bg-tertiary p-6 shadow-dark-soft-lg border border-dark-border-glow">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-dark-text-primary font-bold mb-1 tracking-tight">Ready to focus?</h3>
              <p className="text-dark-text-muted text-sm">Start your AI-optimized study session</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-cyan">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <button className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow-cyan transition-all duration-200 active:scale-[0.98] shadow-dark-soft">
            Start Session
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-dark-bg-secondary rounded-3xl p-6 max-w-md w-full shadow-2xl border border-dark-border-glow animate-scaleIn">
            <h3 className="text-xl font-bold text-dark-text-primary mb-4">Add Assignment</h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1.5">Title *</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g., Math Homework Ch. 5"
                  className="w-full px-4 py-2.5 bg-dark-bg-tertiary border border-dark-border-subtle rounded-xl text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1.5">Subject</label>
                <input
                  type="text"
                  value={newAssignment.subject}
                  onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                  placeholder="e.g., Math, Chemistry"
                  className="w-full px-4 py-2.5 bg-dark-bg-tertiary border border-dark-border-subtle rounded-xl text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-bg-tertiary border border-dark-border-subtle rounded-xl text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1.5">Priority</label>
                <select
                  value={newAssignment.priority}
                  onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-bg-tertiary border border-dark-border-subtle rounded-xl text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Time Estimate */}
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-1.5">Time Estimate</label>
                <input
                  type="text"
                  value={newAssignment.timeEstimate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, timeEstimate: e.target.value })}
                  placeholder="e.g., 1h 30m"
                  className="w-full px-4 py-2.5 bg-dark-bg-tertiary border border-dark-border-subtle rounded-xl text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewAssignment({
                    title: '',
                    subject: '',
                    dueDate: '',
                    priority: 'medium',
                    timeEstimate: '',
                  })
                }}
                className="flex-1 py-2.5 px-4 bg-dark-bg-tertiary text-dark-text-primary font-semibold rounded-xl hover:bg-dark-bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow-cyan transition-all active:scale-95"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
