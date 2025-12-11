/**
 * Focus Mode - Modern App Blocking System
 * Complete redesign with blocking lists, scheduling, and polished UI
 */

import { useState, useEffect } from 'react'
import appBlockingService from '../services/appBlockingService'
import { APP_LIBRARY, APPS_BY_CATEGORY, APP_CATEGORIES, DEFAULT_BLOCKING_LISTS } from '../data/appLibrary'

const FocusMode = () => {
  // Navigation
  const [currentView, setCurrentView] = useState('home') // home, app-selector, time-picker, schedule, active

  // Data
  const [blockingLists, setBlockingLists] = useState([])
  const [scheduledBlocks, setScheduledBlocks] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [stats, setStats] = useState(null)

  // Selection state
  const [selectedApps, setSelectedApps] = useState([])
  const [selectedList, setSelectedList] = useState(null)
  const [duration, setDuration] = useState(60)
  const [scheduleType, setScheduleType] = useState('once') // once, daily, weekly
  const [selectedDays, setSelectedDays] = useState([]) // For weekly
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')

  // UI state
  const [loading, setLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showListCreator, setShowListCreator] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  // Timer countdown for active session
  useEffect(() => {
    if (!activeSession) return

    const interval = setInterval(() => {
      const now = new Date()
      const endTime = new Date(activeSession.end_time)
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))

      setTimeRemaining(remaining)

      if (remaining === 0) {
        handleEndSession()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSession])

  const loadData = async () => {
    const [session, lists, schedules, statistics] = await Promise.all([
      appBlockingService.getActiveSession(),
      appBlockingService.getBlockingLists(),
      appBlockingService.getScheduledBlocks(),
      appBlockingService.getStats(),
    ])

    setActiveSession(session)
    setBlockingLists(lists)
    setScheduledBlocks(schedules)
    setStats(statistics)

    if (session) {
      setCurrentView('active')
    }

    // Create default lists if none exist
    if (lists.length === 0) {
      await createDefaultLists()
    }
  }

  const createDefaultLists = async () => {
    for (const preset of DEFAULT_BLOCKING_LISTS) {
      await appBlockingService.createBlockingList({
        name: preset.name,
        description: preset.description,
        appIds: preset.appIds,
        icon: preset.icon,
        color: preset.color,
        isDefault: true,
      })
    }
    const lists = await appBlockingService.getBlockingLists()
    setBlockingLists(lists)
  }

  const handleStartWithList = (list) => {
    setSelectedList(list)
    setSelectedApps(list.app_ids)
    setCurrentView('time-picker')
  }

  const handleStartCustom = () => {
    setSelectedList(null)
    setSelectedApps([])
    setCurrentView('app-selector')
  }

  const toggleApp = (appId) => {
    setSelectedApps(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    )
  }

  const handleStartFocus = async () => {
    if (selectedApps.length === 0) {
      alert('Please select at least one app to block')
      return
    }

    setLoading(true)
    try {
      const session = await appBlockingService.createSession({
        blockedApps: selectedApps,
        duration: duration,
        blockingListId: selectedList?.id,
        sessionType: 'manual',
      })

      setActiveSession(session)
      setCurrentView('active')
      await loadData()
    } catch (error) {
      console.error('Failed to start focus session:', error)
      alert('Failed to start focus session. Make sure you ran the SQL migration!')
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!activeSession) return

    try {
      await appBlockingService.endSession(activeSession.id)
      setActiveSession(null)
      setCurrentView('home')
      setSelectedApps([])
      setSelectedList(null)
      await loadData()
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim() || selectedApps.length === 0) {
      alert('Please enter a name and select apps')
      return
    }

    try {
      await appBlockingService.createBlockingList({
        name: newListName,
        appIds: selectedApps,
        icon: '📌',
        color: '#3B82F6',
      })

      setShowListCreator(false)
      setNewListName('')
      await loadData()
    } catch (error) {
      console.error('Failed to create list:', error)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!activeSession) return 0
    const total = activeSession.duration_minutes * 60
    const elapsed = total - timeRemaining
    return Math.min(100, (elapsed / total) * 100)
  }

  const getAppById = (appId) => APP_LIBRARY.find(a => a.id === appId)

  // Filter apps by search
  const filteredApps = searchQuery
    ? APP_LIBRARY.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : APP_LIBRARY

  // ===================================
  // ACTIVE SESSION VIEW
  // ===================================
  if (currentView === 'active' && activeSession) {
    const progress = getProgressPercentage()

    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg-primary via-dark-bg-surface to-dark-navy-dark px-5 pb-24">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center pt-8 mb-8 animate-fadeIn">
            <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-glow-green-lg animate-pulse-slow">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Focus Active</h1>
            <p className="text-dark-text-secondary">Stay focused, you got this!</p>
          </div>

          {/* Timer */}
          <div className="bg-dark-bg-secondary rounded-3xl p-8 border border-dark-border-glow shadow-dark-soft-xl mb-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2 tabular-nums">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-dark-text-muted text-sm">Time Remaining</p>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-dark-bg-tertiary rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 shadow-glow-green"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-dark-text-muted mt-2">
              <span>{Math.floor(progress)}% Complete</span>
              <span>{activeSession.duration_minutes} min total</span>
            </div>
          </div>

          {/* Blocked Apps */}
          <div className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow shadow-dark-soft-md mb-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-dark-text-primary mb-4 flex items-center gap-2">
              <span>🚫</span>
              <span>Blocked Apps</span>
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {activeSession.blocked_apps.map(appId => {
                const app = getAppById(appId)
                return app ? (
                  <div key={appId} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-dark-bg-tertiary border border-red-500/30 opacity-50">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-2xl grayscale`}>
                      {app.icon}
                    </div>
                    <span className="text-xs text-dark-text-muted text-center line-through leading-tight">{app.name}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>

          {/* End Button */}
          <button
            onClick={handleEndSession}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all active:scale-95"
          >
            End Focus Session Early
          </button>
        </div>
      </div>
    )
  }

  // ===================================
  // APP SELECTOR VIEW
  // ===================================
  if (currentView === 'app-selector') {
    return (
      <div className="pb-6 animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-dark-bg-primary/95 backdrop-blur-xl z-10 pb-4 mb-4 border-b border-dark-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView('home')}
              className="w-10 h-10 rounded-xl bg-dark-bg-secondary border border-dark-border-glow flex items-center justify-center hover:border-primary-500 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-dark-text-primary">Select Apps</h1>
              <p className="text-xs text-dark-text-muted">{selectedApps.length} selected</p>
            </div>
            <button
              onClick={() => setCurrentView('time-picker')}
              disabled={selectedApps.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm"
            >
              Next
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps..."
              className="w-full px-4 py-3 pl-11 rounded-xl bg-dark-bg-secondary border border-dark-border-glow text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            <svg className="w-5 h-5 text-dark-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Apps by Category */}
        <div className="space-y-6">
          {Object.entries(APPS_BY_CATEGORY).map(([category, apps]) => {
            const categoryApps = searchQuery
              ? apps.filter(app => filteredApps.includes(app))
              : apps

            if (categoryApps.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-bold text-dark-text-secondary uppercase tracking-wide mb-3 px-1">
                  {category}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {categoryApps.map(app => {
                    const isSelected = selectedApps.includes(app.id)
                    return (
                      <button
                        key={app.id}
                        onClick={() => toggleApp(app.id)}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                          isSelected
                            ? 'border-primary-500 shadow-glow-cyan'
                            : 'border-dark-border-subtle hover:border-dark-border-glow'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-2xl shadow-soft-md`}>
                          {app.icon}
                        </div>
                        <span className={`text-xs text-center font-medium leading-tight ${
                          isSelected ? 'text-primary-500' : 'text-dark-text-muted'
                        }`}>
                          {app.name}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shadow-glow-cyan">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Save as List Button */}
        {selectedApps.length > 0 && (
          <div className="sticky bottom-0 bg-dark-bg-primary/95 backdrop-blur-xl pt-4 mt-6 border-t border-dark-border-subtle">
            <button
              onClick={() => setShowListCreator(true)}
              className="w-full py-3 px-6 bg-dark-bg-secondary border-2 border-dashed border-primary-500/50 text-primary-500 font-semibold rounded-xl hover:bg-primary-500/10 transition-all active:scale-95"
            >
              💾 Save as Blocking List
            </button>
          </div>
        )}

        {/* List Creator Modal */}
        {showListCreator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5">
            <div className="bg-dark-bg-secondary rounded-2xl p-6 border border-dark-border-glow shadow-dark-soft-xl max-w-sm w-full animate-fadeIn">
              <h3 className="text-xl font-bold text-dark-text-primary mb-4">Save Blocking List</h3>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name (e.g., Study Time)"
                className="w-full px-4 py-3 rounded-xl bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowListCreator(false)}
                  className="flex-1 py-3 px-4 bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-secondary font-semibold rounded-xl hover:bg-dark-bg-primary transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateList}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow-cyan transition-all active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===================================
  // TIME PICKER VIEW
  // ===================================
  if (currentView === 'time-picker') {
    const durations = [
      { minutes: 15, label: '15 min', emoji: '⚡', desc: 'Quick focus' },
      { minutes: 30, label: '30 min', emoji: '🎯', desc: 'Short session' },
      { minutes: 60, label: '1 hour', emoji: '🔥', desc: 'Standard' },
      { minutes: 120, label: '2 hours', emoji: '💪', desc: 'Deep work' },
      { minutes: 240, label: '4 hours', emoji: '🚀', desc: 'Extended' },
      { minutes: 480, label: '8 hours', emoji: '🌙', desc: 'Full day' },
    ]

    return (
      <div className="pb-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentView('app-selector')}
            className="w-10 h-10 rounded-xl bg-dark-bg-secondary border border-dark-border-glow flex items-center justify-center hover:border-primary-500 transition-all active:scale-95"
          >
            <svg className="w-5 h-5 text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-dark-text-primary">Choose Duration</h1>
            <p className="text-xs text-dark-text-muted">{selectedApps.length} apps selected</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Duration Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {durations.map(preset => (
            <button
              key={preset.minutes}
              onClick={() => setDuration(preset.minutes)}
              className={`p-6 rounded-2xl border-2 transition-all active:scale-95 ${
                duration === preset.minutes
                  ? 'bg-green-500/20 border-green-500 shadow-glow-green'
                  : 'bg-dark-bg-secondary border-dark-border-glow hover:border-dark-border-glow-hover'
              }`}
            >
              <div className="text-4xl mb-2">{preset.emoji}</div>
              <div className={`text-lg font-bold mb-1 ${
                duration === preset.minutes ? 'text-green-400' : 'text-dark-text-primary'
              }`}>
                {preset.label}
              </div>
              <div className="text-xs text-dark-text-muted">{preset.desc}</div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleStartFocus}
            disabled={loading}
            className="w-full py-5 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-soft-lg hover:shadow-glow-green-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start Focus Now</span>
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentView('schedule')}
            className="w-full py-4 px-6 bg-dark-bg-secondary border-2 border-primary-500/50 text-primary-500 font-semibold rounded-xl hover:bg-primary-500/10 transition-all active:scale-95"
          >
            📅 Schedule for Later
          </button>
        </div>
      </div>
    )
  }

  // ===================================
  // SCHEDULE VIEW (Implementation continues in next message due to length)
  // ===================================
  // This will be added in the next section

  // ===================================
  // HOME VIEW (Main)
  // ===================================
  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-text-primary mb-1">Focus Mode</h1>
        <p className="text-sm text-dark-text-secondary">Block distracting apps and stay productive</p>
      </div>

      {/* Stats */}
      {stats && stats.totalSessions > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-bg-secondary rounded-xl p-4 text-center border border-dark-border-glow">
            <div className="text-xl font-bold text-primary-500">{stats.totalSessions}</div>
            <div className="text-xs text-dark-text-muted mt-1">Sessions</div>
          </div>
          <div className="bg-dark-bg-secondary rounded-xl p-4 text-center border border-dark-border-glow">
            <div className="text-xl font-bold text-green-500">{stats.totalHoursBlocked}h</div>
            <div className="text-xs text-dark-text-muted mt-1">Focused</div>
          </div>
          <div className="bg-dark-bg-secondary rounded-xl p-4 text-center border border-dark-border-glow">
            <div className="text-xl font-bold text-accent-cyan">{Math.round((stats.completedSessions / stats.totalSessions) * 100)}%</div>
            <div className="text-xs text-dark-text-muted mt-1">Complete</div>
          </div>
        </div>
      )}

      {/* Quick Start */}
      <button
        onClick={handleStartCustom}
        className="w-full py-5 px-6 bg-gradient-to-r from-primary-500 to-accent-cyan text-white font-bold text-lg rounded-xl shadow-soft-lg hover:shadow-glow-cyan-lg transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Start Custom Block</span>
      </button>

      {/* Blocking Lists */}
      <div>
        <h3 className="text-lg font-bold text-dark-text-primary mb-3">Quick Start Lists</h3>
        <div className="grid grid-cols-2 gap-3">
          {blockingLists.slice(0, 4).map(list => {
            const appCount = list.app_ids?.length || 0
            return (
              <button
                key={list.id}
                onClick={() => handleStartWithList(list)}
                className="p-4 rounded-xl bg-dark-bg-secondary border border-dark-border-glow hover:border-primary-500 transition-all active:scale-95 text-left"
              >
                <div className="text-3xl mb-2">{list.icon}</div>
                <div className="text-sm font-bold text-dark-text-primary mb-1">{list.name}</div>
                <div className="text-xs text-dark-text-muted">{appCount} apps</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* iOS Tip */}
      <div className="bg-gradient-to-br from-primary-500/10 to-accent-purple/10 rounded-2xl p-4 border border-primary-500/30">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-2xl">💡</div>
          <div>
            <h4 className="text-sm font-semibold text-dark-text-primary mb-1">Database Setup Required</h4>
            <p className="text-xs text-dark-text-secondary leading-relaxed">
              Run FOCUS_MODE_DATABASE.sql in Supabase to fix 404 errors and enable all features!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FocusMode
