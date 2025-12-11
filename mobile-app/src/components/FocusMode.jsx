/**
 * Focus Mode Component - App Blocking like Opal
 * Block distracting apps to improve focus and productivity
 */

import { useState, useEffect } from 'react'
import appBlockingService from '../services/appBlockingService'

// Common iOS apps with emoji icons
const POPULAR_APPS = [
  { id: 'instagram', name: 'Instagram', icon: '📷', category: 'social' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', category: 'social' },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', category: 'social' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', category: 'social' },
  { id: 'facebook', name: 'Facebook', icon: '👥', category: 'social' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', category: 'entertainment' },
  { id: 'netflix', name: 'Netflix', icon: '🎬', category: 'entertainment' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', category: 'social' },
  { id: 'discord', name: 'Discord', icon: '💬', category: 'social' },
  { id: 'twitch', name: 'Twitch', icon: '🎮', category: 'entertainment' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', category: 'entertainment' },
  { id: 'games', name: 'Games', icon: '🎮', category: 'games' },
  { id: 'safari', name: 'Safari', icon: '🧭', category: 'productivity' },
  { id: 'chrome', name: 'Chrome', icon: '🌐', category: 'productivity' },
  { id: 'messages', name: 'Messages', icon: '💬', category: 'communication' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱', category: 'communication' },
]

const DURATION_PRESETS = [
  { minutes: 15, label: '15 min', emoji: '⚡' },
  { minutes: 30, label: '30 min', emoji: '🎯' },
  { minutes: 60, label: '1 hour', emoji: '🔥' },
  { minutes: 120, label: '2 hours', emoji: '💪' },
  { minutes: 240, label: '4 hours', emoji: '🚀' },
  { minutes: 480, label: '8 hours', emoji: '🌙' },
]

const FocusMode = () => {
  const [selectedApps, setSelectedApps] = useState([])
  const [duration, setDuration] = useState(60) // Default 1 hour
  const [activeSession, setActiveSession] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [stats, setStats] = useState(null)
  const [showSetup, setShowSetup] = useState(true)
  const [loading, setLoading] = useState(false)

  // Load active session and stats on mount
  useEffect(() => {
    loadActiveSession()
    loadStats()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (!activeSession) return

    const interval = setInterval(() => {
      const now = new Date()
      const endTime = new Date(activeSession.end_time)
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))

      setTimeRemaining(remaining)

      // Auto-end session when timer expires
      if (remaining === 0) {
        handleEndSession()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeSession])

  const loadActiveSession = async () => {
    const session = await appBlockingService.getActiveSession()
    if (session) {
      setActiveSession(session)
      setShowSetup(false)
    }
  }

  const loadStats = async () => {
    const statistics = await appBlockingService.getStats()
    setStats(statistics)
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
      })

      setActiveSession(session)
      setShowSetup(false)

      // Open iOS Shortcuts integration
      const shortcutURL = appBlockingService.generateShortcutURL(selectedApps, duration)
      console.log('📱 iOS Shortcut URL:', shortcutURL)
    } catch (error) {
      console.error('Failed to start focus session:', error)
      alert('Failed to start focus session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!activeSession) return

    try {
      await appBlockingService.endSession(activeSession.id)
      setActiveSession(null)
      setShowSetup(true)
      setSelectedApps([])
      await loadStats()
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

  // Active Session UI
  if (activeSession && !showSetup) {
    const progress = getProgressPercentage()

    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-bg-primary via-dark-bg-surface to-dark-navy-dark p-5 pb-24">
        {/* Focus Active Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-glow-green-lg animate-pulse-slow">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Focus Active</h1>
          <p className="text-dark-text-secondary">Stay focused and productive</p>
        </div>

        {/* Timer Display */}
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
            <span>{activeSession.duration_minutes} min session</span>
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
              const app = POPULAR_APPS.find(a => a.id === appId)
              return app ? (
                <div key={appId} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-dark-bg-tertiary border border-red-500/30 opacity-50">
                  <span className="text-3xl grayscale">{app.icon}</span>
                  <span className="text-xs text-dark-text-muted text-center line-through">{app.name}</span>
                </div>
              ) : null
            })}
          </div>
        </div>

        {/* Motivation */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl p-5 border border-green-500/30 mb-6 animate-fadeIn">
          <p className="text-center text-dark-text-secondary italic">
            "You're doing great! Stay focused and achieve your goals. 🎯"
          </p>
        </div>

        {/* End Session Button */}
        <button
          onClick={handleEndSession}
          className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all active:scale-95"
        >
          End Focus Session Early
        </button>

        {/* Stats */}
        {stats && (
          <div className="mt-6 grid grid-cols-3 gap-3 animate-fadeIn">
            <div className="bg-dark-bg-secondary rounded-xl p-4 text-center border border-dark-border-glow">
              <div className="text-2xl font-bold text-primary-500">{stats.totalSessions}</div>
              <div className="text-xs text-dark-text-muted mt-1">Sessions</div>
            </div>
            <div className="bg-dark-bg-secondary rounded-xl p-4 text-center border border-dark-border-glow">
              <div className="text-2xl font-bold text-green-500">{stats.totalHoursBlocked}h</div>
              <div className="text-xs text-dark-text-muted mt-1">Focused</div>
            </div>
            <div className="bg-dark-bg-secondary rounded-xl p-4 text-center border border-dark-border-glow">
              <div className="text-2xl font-bold text-accent-cyan">{stats.completedSessions}</div>
              <div className="text-xs text-dark-text-muted mt-1">Completed</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Setup UI
  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-text-primary mb-1">Focus Mode</h1>
        <p className="text-sm text-dark-text-secondary">Block distracting apps and stay productive</p>
      </div>

      {/* Stats Cards */}
      {stats && stats.totalSessions > 0 && (
        <div className="grid grid-cols-3 gap-3 animate-fadeIn">
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
            <div className="text-xs text-dark-text-muted mt-1">Completed</div>
          </div>
        </div>
      )}

      {/* Select Apps */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow shadow-dark-soft-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-dark-text-primary">Select Apps to Block</h3>
          <span className="text-xs text-dark-text-muted px-2 py-1 rounded-lg bg-primary-500/10 border border-primary-500/30">
            {selectedApps.length} selected
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {POPULAR_APPS.map(app => {
            const isSelected = selectedApps.includes(app.id)
            return (
              <button
                key={app.id}
                onClick={() => toggleApp(app.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-primary-500/20 border-primary-500 shadow-glow-cyan'
                    : 'bg-dark-bg-tertiary border-dark-border-subtle hover:border-dark-border-glow'
                }`}
              >
                <span className="text-3xl">{app.icon}</span>
                <span className={`text-xs text-center font-medium ${
                  isSelected ? 'text-primary-500' : 'text-dark-text-muted'
                }`}>
                  {app.name}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {selectedApps.length > 0 && (
          <button
            onClick={() => setSelectedApps([])}
            className="mt-4 w-full py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Duration Selection */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow shadow-dark-soft-md">
        <h3 className="text-lg font-bold text-dark-text-primary mb-4">Focus Duration</h3>
        <div className="grid grid-cols-3 gap-3">
          {DURATION_PRESETS.map(preset => (
            <button
              key={preset.minutes}
              onClick={() => setDuration(preset.minutes)}
              className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${
                duration === preset.minutes
                  ? 'bg-green-500/20 border-green-500 shadow-glow-green'
                  : 'bg-dark-bg-tertiary border-dark-border-subtle hover:border-dark-border-glow'
              }`}
            >
              <div className="text-2xl mb-1">{preset.emoji}</div>
              <div className={`text-sm font-semibold ${
                duration === preset.minutes ? 'text-green-400' : 'text-dark-text-secondary'
              }`}>
                {preset.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Start Focus Button */}
      <button
        onClick={handleStartFocus}
        disabled={selectedApps.length === 0 || loading}
        className="w-full py-5 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-soft-lg hover:shadow-glow-green-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Starting Focus...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Start Focus Mode</span>
          </>
        )}
      </button>

      {/* iOS Integration Tip */}
      <div className="bg-gradient-to-br from-primary-500/10 to-accent-purple/10 rounded-2xl p-4 border border-primary-500/30">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-2xl">💡</div>
          <div>
            <h4 className="text-sm font-semibold text-dark-text-primary mb-1">iOS Screen Time Integration</h4>
            <p className="text-xs text-dark-text-secondary leading-relaxed">
              For full app blocking, set up Screen Time restrictions for selected apps in iOS Settings. Focus Mode will remind you to stay focused!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FocusMode
