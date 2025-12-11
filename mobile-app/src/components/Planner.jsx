/**
 * Planner Component - AI-Optimized Calendar
 * Smart calendar with AI-powered activity creation
 */

import { useState, useEffect } from 'react'
import calendarService from '../services/calendarService'
import activityParserService from '../services/activityParserService'

const Planner = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activities, setActivities] = useState([])
  const [dayActivities, setDayActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiProcessing, setAiProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  useEffect(() => {
    loadActivities()
  }, [currentDate])

  useEffect(() => {
    loadDayActivities()
  }, [selectedDate, activities])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const data = await calendarService.getActivitiesForMonth(year, month)
      setActivities(data)
    } catch (err) {
      console.error('Failed to load activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadDayActivities = () => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    const filtered = activities.filter(a => a.activity_date === dateStr)
    setDayActivities(filtered)
  }

  const handleAiCreate = async () => {
    if (!aiInput.trim()) return

    setAiProcessing(true)
    setError('')
    setSuccess('')

    try {
      // Parse activity with AI
      const activityData = await activityParserService.parseActivity(aiInput)

      // Create activity in database
      await calendarService.createActivity(activityData)

      // Reload activities
      await loadActivities()

      // Show success
      setSuccess(`Created: ${activityData.title}`)
      setAiInput('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to create activity:', err)
      setError('Failed to create activity. Try being more specific.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setAiProcessing(false)
    }
  }

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      await calendarService.toggleCompletion(id, !currentStatus)
      await loadActivities()
    } catch (err) {
      console.error('Failed to toggle completion:', err)
    }
  }

  const handleDeleteActivity = async (id) => {
    try {
      await calendarService.deleteActivity(id)
      await loadActivities()
    } catch (err) {
      console.error('Failed to delete activity:', err)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getActivitiesForDay = (day) => {
    if (!day) return []
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0]
    return activities.filter(a => a.activity_date === dateStr)
  }

  const isToday = (day) => {
    const today = new Date()
    return day &&
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate()
  }

  const isSelected = (day) => {
    return day &&
      currentDate.getFullYear() === selectedDate.getFullYear() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getTypeColor = (type) => {
    const colors = {
      task: 'bg-blue-500',
      class: 'bg-purple-500',
      study: 'bg-cyan-500',
      break: 'bg-green-500',
      event: 'bg-amber-500',
      meeting: 'bg-red-500',
      assignment: 'bg-pink-500',
    }
    return colors[type] || 'bg-blue-500'
  }

  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* AI Activity Input */}
      <div className="bg-gradient-to-br from-primary-500/10 via-dark-bg-secondary to-accent-purple/10 rounded-2xl p-5 border border-dark-border-glow shadow-dark-soft-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-cyan">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-dark-text-primary font-bold">AI Activity Creator</h3>
            <p className="text-xs text-dark-text-muted">Describe your activity naturally</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 animate-fadeIn">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-fadeIn">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAiCreate()}
            placeholder="e.g., Study chemistry tomorrow at 3pm, Math class Monday morning"
            className="flex-1 px-4 py-3 rounded-xl bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            disabled={aiProcessing}
          />
          <button
            onClick={handleAiCreate}
            disabled={aiProcessing || !aiInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {aiProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Create'
            )}
          </button>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs text-dark-text-secondary font-semibold">Ultra-Smart Examples:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAiInput("Study chemistry tomorrow at 3pm for 2 hours")}
              className="text-xs px-2 py-1 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all"
            >
              With time & duration
            </button>
            <button
              onClick={() => setAiInput("Math class Monday morning")}
              className="text-xs px-2 py-1 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all"
            >
              Relative date
            </button>
            <button
              onClick={() => setAiInput("finish physics homework by Thursday")}
              className="text-xs px-2 py-1 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all"
            >
              Assignment deadline
            </button>
            <button
              onClick={() => setAiInput("lunch break at noon for 30 minutes")}
              className="text-xs px-2 py-1 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all"
            >
              Today with specific time
            </button>
            <button
              onClick={() => setAiInput("CS101 lecture next Tuesday 2pm in library")}
              className="text-xs px-2 py-1 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all"
            >
              With location
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow shadow-dark-soft-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-dark-text-primary">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="w-9 h-9 rounded-lg bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary hover:border-primary-500 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-lg bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary hover:border-primary-500 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-dark-text-muted py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth().map((day, index) => {
            const dayActivities = getActivitiesForDay(day)
            const hasActivities = dayActivities.length > 0

            return (
              <button
                key={index}
                onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                disabled={!day}
                className={`aspect-square rounded-lg p-1 transition-all ${
                  !day
                    ? 'invisible'
                    : isSelected(day)
                    ? 'bg-gradient-to-br from-primary-500 to-accent-cyan text-white shadow-glow-cyan'
                    : isToday(day)
                    ? 'bg-primary-500/20 border-2 border-primary-500 text-dark-text-primary font-bold'
                    : 'bg-dark-bg-tertiary text-dark-text-primary hover:bg-dark-navy-dark hover:border-primary-500/50 border border-dark-border-subtle'
                } active:scale-95`}
              >
                {day && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-sm font-semibold ${isSelected(day) ? 'text-white' : ''}`}>
                      {day}
                    </span>
                    {hasActivities && (
                      <div className="flex gap-0.5 mt-1">
                        {dayActivities.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${isSelected(day) ? 'bg-white' : 'bg-primary-500'}`}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Activities */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow shadow-dark-soft-md">
        <h3 className="text-lg font-bold text-dark-text-primary mb-4">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>

        {dayActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-dark-bg-tertiary flex items-center justify-center">
              <svg className="w-8 h-8 text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-dark-text-muted text-sm">No activities for this day</p>
            <p className="text-dark-text-muted text-xs mt-1">Use AI to create one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 rounded-xl border transition-all ${
                  activity.is_completed
                    ? 'bg-dark-bg-tertiary border-dark-border-subtle opacity-60'
                    : 'bg-dark-bg-tertiary border-dark-border-glow hover:border-primary-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(activity.id, activity.is_completed)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      activity.is_completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-dark-border-glow hover:border-primary-500'
                    }`}
                  >
                    {activity.is_completed && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-semibold ${
                        activity.is_completed
                          ? 'text-dark-text-muted line-through'
                          : 'text-dark-text-primary'
                      }`}>
                        {activity.title}
                      </h4>
                      {activity.ai_generated && (
                        <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary-500/10 border border-primary-500/30">
                          <svg className="w-3 h-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-dark-text-muted">
                      {activity.start_time && (
                        <span>{activity.start_time.slice(0, 5)}</span>
                      )}
                      {activity.subject && (
                        <span className="text-dark-text-secondary font-medium">{activity.subject}</span>
                      )}
                      {activity.duration_minutes && (
                        <span>{activity.duration_minutes} min</span>
                      )}
                      <span className={`px-2 py-0.5 rounded ${getTypeColor(activity.activity_type)} text-white text-xs font-medium`}>
                        {activity.activity_type}
                      </span>
                    </div>

                    {activity.description && (
                      <p className="text-sm text-dark-text-secondary mt-2">{activity.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Planner
