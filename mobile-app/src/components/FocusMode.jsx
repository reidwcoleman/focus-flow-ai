/**
 * Focus Mode - Opal-Inspired Design
 * Clean, minimal interface for app blocking with one-tap presets
 */

import { useState, useEffect } from 'react'
import appBlockingService from '../services/appBlockingService'
import { APP_LIBRARY, APPS_BY_CATEGORY, DEFAULT_BLOCKING_LISTS } from '../data/appLibrary'

const FocusMode = () => {
  // Navigation
  const [currentView, setCurrentView] = useState('home') // home, app-selector, active

  // Data
  const [blockingLists, setBlockingLists] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [stats, setStats] = useState(null)

  // Selection state
  const [selectedApps, setSelectedApps] = useState([])
  const [selectedList, setSelectedList] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(60)

  // UI state
  const [loading, setLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDurationPicker, setShowDurationPicker] = useState(false)

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
    const [session, lists, statistics] = await Promise.all([
      appBlockingService.getActiveSession(),
      appBlockingService.getBlockingLists(),
      appBlockingService.getStats(),
    ])

    setActiveSession(session)
    setBlockingLists(lists)
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

  const handleQuickStart = async (list, duration) => {
    setLoading(true)
    try {
      const session = await appBlockingService.createSession({
        blockedApps: list.app_ids,
        duration: duration,
        blockingListId: list.id,
        sessionType: 'manual',
      })

      setActiveSession(session)
      setCurrentView('active')
      await loadData()
    } catch (error) {
      console.error('Failed to start focus session:', error)
      alert('Failed to start focus session')
    } finally {
      setLoading(false)
    }
  }

  const handleStartCustom = () => {
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

  const handleStartWithCustomApps = async () => {
    if (selectedApps.length === 0) {
      alert('Please select at least one app to block')
      return
    }

    setLoading(true)
    try {
      const session = await appBlockingService.createSession({
        blockedApps: selectedApps,
        duration: selectedDuration,
        sessionType: 'manual',
      })

      setActiveSession(session)
      setCurrentView('active')
      await loadData()
    } catch (error) {
      console.error('Failed to start focus session:', error)
      alert('Failed to start focus session')
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

  // Duration presets
  const durations = [
    { minutes: 15, label: '15m', emoji: '⚡' },
    { minutes: 30, label: '30m', emoji: '🎯' },
    { minutes: 60, label: '1h', emoji: '🔥' },
    { minutes: 120, label: '2h', emoji: '💪' },
  ]

  // ===================================
  // ACTIVE SESSION VIEW (Opal-style)
  // ===================================
  if (currentView === 'active' && activeSession) {
    const progress = getProgressPercentage()

    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-bg-primary via-dark-bg-surface to-dark-bg-primary px-5 pb-24 pt-12">
        <div className="max-w-md mx-auto">
          {/* Timer Circle */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-dark-bg-tertiary"
              />
              {/* Progress Circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-emerald-500 tabular-nums mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-dark-text-muted">Focus time remaining</p>
            </div>
          </div>

          {/* Session Info */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-dark-text-primary mb-2">
              Stay focused
            </h2>
            <p className="text-sm text-dark-text-secondary">
              {activeSession.blocked_apps.length} apps blocked
            </p>
          </div>

          {/* Blocked Apps Preview */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap max-w-xs mx-auto">
            {activeSession.blocked_apps.slice(0, 6).map(appId => {
              const app = getAppById(appId)
              return app ? (
                <div
                  key={appId}
                  className="w-12 h-12 rounded-xl bg-dark-bg-tertiary border border-dark-border-subtle opacity-40 grayscale flex items-center justify-center text-xl"
                >
                  {app.icon}
                </div>
              ) : null
            })}
            {activeSession.blocked_apps.length > 6 && (
              <div className="w-12 h-12 rounded-xl bg-dark-bg-tertiary border border-dark-border-subtle opacity-40 flex items-center justify-center">
                <span className="text-xs text-dark-text-muted font-semibold">
                  +{activeSession.blocked_apps.length - 6}
                </span>
              </div>
            )}
          </div>

          {/* End Button */}
          <button
            onClick={handleEndSession}
            className="w-full py-4 px-6 bg-dark-bg-secondary border border-dark-border-glow text-dark-text-primary font-semibold rounded-2xl hover:bg-dark-bg-tertiary transition-all active:scale-95"
          >
            End Session
          </button>
        </div>
      </div>
    )
  }

  // ===================================
  // APP SELECTOR VIEW (Opal-style)
  // ===================================
  if (currentView === 'app-selector') {
    const filteredApps = searchQuery
      ? APP_LIBRARY.filter(app =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : APP_LIBRARY

    return (
      <div className="pb-6 animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 bg-dark-bg-primary/95 backdrop-blur-xl z-20 pb-4 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setCurrentView('home')}
              className="w-10 h-10 rounded-full bg-dark-bg-secondary border border-dark-border-glow flex items-center justify-center hover:border-primary-500 transition-all active:scale-95"
            >
              <svg className="w-5 h-5 text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-dark-text-primary">Select apps to block</h1>
              <p className="text-xs text-dark-text-muted">{selectedApps.length} selected</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps..."
              className="w-full px-4 py-3 pl-11 rounded-2xl bg-dark-bg-secondary border border-dark-border-glow text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:border-primary-500 transition-all"
            />
            <svg className="w-5 h-5 text-dark-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Duration Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {durations.map(preset => (
              <button
                key={preset.minutes}
                onClick={() => setSelectedDuration(preset.minutes)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all active:scale-95 ${
                  selectedDuration === preset.minutes
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-glow-green'
                    : 'bg-dark-bg-secondary border border-dark-border-glow text-dark-text-secondary'
                }`}
              >
                {preset.emoji} {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Grid */}
        <div className="space-y-6">
          {Object.entries(APPS_BY_CATEGORY).map(([category, apps]) => {
            const categoryApps = searchQuery
              ? apps.filter(app => filteredApps.includes(app))
              : apps

            if (categoryApps.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-xs font-bold text-dark-text-muted uppercase tracking-wider mb-3 px-1">
                  {category}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {categoryApps.map(app => {
                    const isSelected = selectedApps.includes(app.id)
                    return (
                      <button
                        key={app.id}
                        onClick={() => toggleApp(app.id)}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-green-500/10 ring-2 ring-green-500'
                            : 'bg-dark-bg-secondary hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-2xl shadow-soft-md ${
                          isSelected ? 'scale-95' : ''
                        }`}>
                          {app.icon}
                        </div>
                        <span className={`text-xs text-center font-medium leading-tight ${
                          isSelected ? 'text-green-400' : 'text-dark-text-muted'
                        }`}>
                          {app.name}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-glow-green">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Start Button */}
        {selectedApps.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 px-5 z-10">
            <button
              onClick={handleStartWithCustomApps}
              disabled={loading}
              className="w-full max-w-md mx-auto py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-glow-green-lg hover:shadow-glow-green-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Start Focus ({selectedDuration}min)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ===================================
  // HOME VIEW (Opal-style)
  // ===================================
  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center pt-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 mb-2">
          Focus
        </h1>
        <p className="text-sm text-dark-text-secondary">Block apps and stay in the zone</p>
      </div>

      {/* Stats */}
      {stats && stats.totalSessions > 0 && (
        <div className="bg-dark-bg-secondary rounded-3xl p-5 border border-dark-border-glow">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.totalHoursBlocked || 0}h</div>
              <div className="text-xs text-dark-text-muted mt-1">Focused</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-500">{stats.totalSessions}</div>
              <div className="text-xs text-dark-text-muted mt-1">Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-cyan">{stats.longestStreak || 0}</div>
              <div className="text-xs text-dark-text-muted mt-1">Day Streak</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Start Presets */}
      <div>
        <h3 className="text-sm font-bold text-dark-text-secondary uppercase tracking-wide mb-3 px-1">Quick Start</h3>
        <div className="space-y-3">
          {blockingLists.slice(0, 4).map(list => {
            const appCount = list.app_ids?.length || 0
            const previewApps = list.app_ids?.slice(0, 4).map(getAppById).filter(Boolean) || []

            return (
              <div
                key={list.id}
                className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow hover:border-primary-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 flex items-center justify-center text-2xl">
                      {list.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark-text-primary">{list.name}</h4>
                      <p className="text-xs text-dark-text-muted">{appCount} apps</p>
                    </div>
                  </div>
                </div>

                {/* App Preview */}
                <div className="flex gap-2 mb-4">
                  {previewApps.map(app => (
                    <div
                      key={app.id}
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-lg shadow-soft-sm`}
                    >
                      {app.icon}
                    </div>
                  ))}
                  {appCount > 4 && (
                    <div className="w-10 h-10 rounded-xl bg-dark-bg-tertiary border border-dark-border-subtle flex items-center justify-center">
                      <span className="text-xs text-dark-text-muted font-semibold">+{appCount - 4}</span>
                    </div>
                  )}
                </div>

                {/* Duration Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {durations.map(preset => (
                    <button
                      key={preset.minutes}
                      onClick={() => handleQuickStart(list, preset.minutes)}
                      disabled={loading}
                      className="py-2.5 px-3 bg-dark-bg-tertiary border border-dark-border-glow hover:border-green-500 hover:bg-green-500/10 text-dark-text-primary font-semibold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom Block Button */}
      <button
        onClick={handleStartCustom}
        className="w-full py-5 px-6 bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan text-white font-bold text-lg rounded-2xl shadow-soft-lg hover:shadow-glow-cyan-lg transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Custom Block</span>
      </button>

      {/* Database Setup Reminder */}
      {(!blockingLists || blockingLists.length === 0) && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-4 border border-amber-500/30">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">⚠️</div>
            <div>
              <h4 className="text-sm font-semibold text-dark-text-primary mb-1">Setup Required</h4>
              <p className="text-xs text-dark-text-secondary leading-relaxed">
                Run FOCUS_MODE_DATABASE.sql in Supabase to enable Focus Mode features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FocusMode
