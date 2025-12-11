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
  const [showExamples, setShowExamples] = useState(false)

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
    <div className="space-y-4 pb-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-text-primary mb-1">Smart Calendar</h1>
        <p className="text-sm text-dark-text-secondary">AI-powered activity planning</p>
      </div>

      {/* AI Activity Input */}
      <div className="bg-gradient-to-br from-primary-500/10 via-dark-bg-secondary to-accent-purple/10 rounded-2xl p-4 border border-dark-border-glow shadow-dark-soft-lg">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-3 p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 animate-fadeIn">
            <p className="text-green-400 text-xs font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 animate-fadeIn">
            <p className="text-red-400 text-xs font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAiCreate()}
            placeholder="Study chemistry tomorrow at 3pm..."
            className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            disabled={aiProcessing}
          />
          <button
            onClick={handleAiCreate}
            disabled={aiProcessing || !aiInput.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-cyan text-white text-sm font-semibold rounded-xl hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-1.5"
          >
            {aiProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Create</span>
              </>
            )}
          </button>
        </div>

        {/* Pro Tip */}
        <div className="mt-2.5 flex items-start gap-1.5 text-[10px] text-dark-text-muted">
          <svg className="w-3 h-3 flex-shrink-0 mt-0.5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>
            <span className="font-semibold text-primary-500">Pro tip:</span> Use specific dates like "on the 17th" for best accuracy. Days of the week like "Monday" or "Friday" also work well!
          </p>
        </div>

        {/* Collapsible Examples */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="mt-2 flex items-center gap-1.5 text-xs text-dark-text-secondary hover:text-primary-500 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${showExamples ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium">{showExamples ? 'Hide' : 'Show'} examples</span>
        </button>

        {showExamples && (
          <div className="mt-2 grid grid-cols-2 gap-2 animate-fadeIn">
            <button
              onClick={() => { setAiInput("Study chemistry tomorrow at 3pm for 2 hours"); setShowExamples(false); }}
              className="text-xs px-2.5 py-2 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all text-left"
            >
              Study tomorrow 3pm
            </button>
            <button
              onClick={() => { setAiInput("Math quiz on Friday"); setShowExamples(false); }}
              className="text-xs px-2.5 py-2 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all text-left"
            >
              Quiz on Friday
            </button>
            <button
              onClick={() => { setAiInput("finish physics homework on the 17th"); setShowExamples(false); }}
              className="text-xs px-2.5 py-2 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all text-left"
            >
              Homework on 17th
            </button>
            <button
              onClick={() => { setAiInput("chemistry lab Monday at 2pm"); setShowExamples(false); }}
              className="text-xs px-2.5 py-2 rounded-lg bg-dark-bg-tertiary border border-dark-border-subtle text-dark-text-muted hover:text-primary-500 hover:border-primary-500/50 transition-all text-left"
            >
              Lab Monday 2pm
            </button>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-dark-bg-secondary rounded-2xl p-4 border border-dark-border-glow shadow-dark-soft-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-text-primary">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-1.5">
            <button
              onClick={previousMonth}
              className="w-8 h-8 rounded-lg bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary hover:border-primary-500 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary hover:border-primary-500 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-dark-text-muted py-1">
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
                className={`aspect-square rounded-lg p-0.5 transition-all text-center ${
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
                    <span className={`text-xs font-semibold ${isSelected(day) ? 'text-white' : ''}`}>
                      {day}
                    </span>
                    {hasActivities && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayActivities.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={`w-0.5 h-0.5 rounded-full ${isSelected(day) ? 'bg-white' : 'bg-primary-500'}`}
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
      <div className="bg-dark-bg-secondary rounded-2xl p-4 border border-dark-border-glow shadow-dark-soft-md">
        <h3 className="text-base font-bold text-dark-text-primary mb-3">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </h3>

        {dayActivities.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-dark-bg-tertiary flex items-center justify-center border border-dark-border-glow">
              <svg className="w-6 h-6 text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-dark-text-secondary text-sm">No activities</p>
            <p className="text-dark-text-muted text-xs mt-0.5">Use AI to create one</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dayActivities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-xl border transition-all ${
                  activity.is_completed
                    ? 'bg-dark-bg-tertiary border-dark-border-subtle opacity-60'
                    : 'bg-dark-bg-tertiary border-dark-border-glow'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => handleToggleComplete(activity.id, activity.is_completed)}
                    className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                      activity.is_completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-dark-border-glow hover:border-primary-500'
                    }`}
                  >
                    {activity.is_completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-semibold leading-tight ${
                        activity.is_completed
                          ? 'text-dark-text-muted line-through'
                          : 'text-dark-text-primary'
                      }`}>
                        {activity.title}
                      </h4>
                      {activity.ai_generated && (
                        <div className="flex-shrink-0 flex items-center px-1.5 py-0.5 rounded bg-primary-500/10 border border-primary-500/30">
                          <svg className="w-2.5 h-2.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-dark-text-muted">
                      {activity.start_time && (
                        <span className="font-medium">{activity.start_time.slice(0, 5)}</span>
                      )}
                      {activity.duration_minutes && (
                        <span>{activity.duration_minutes}min</span>
                      )}
                      {activity.subject && (
                        <span className="text-dark-text-secondary font-medium">{activity.subject}</span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded ${getTypeColor(activity.activity_type)} text-white font-medium`}>
                        {activity.activity_type}
                      </span>
                    </div>

                    {activity.description && (
                      <p className="text-xs text-dark-text-secondary mt-1.5 line-clamp-2">{activity.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
