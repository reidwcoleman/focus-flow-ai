/**
 * Account Component
 * User profile management with Canvas integration and logout
 */

import { useState, useEffect } from 'react'
import authService from '../services/authService'

export default function Account() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [canvasUrl, setCanvasUrl] = useState('')
  const [isEditingCanvas, setIsEditingCanvas] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const { user } = await authService.getCurrentUser()
    setUser(user)

    // Refresh profile from server
    await authService.refreshUserProfile()
    const profile = authService.getUserProfile()

    setProfile(profile)
    setNewName(profile?.full_name || user?.email?.split('@')[0] || '')
    setCanvasUrl(profile?.canvas_url || '')
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const result = await authService.updateUserProfile({ full_name: newName.trim() })

      if (result.error) {
        console.error('Update error:', result.error)
        setError(`Failed to update name: ${result.error.message || 'Unknown error'}`)
      } else {
        setSuccess('Name updated successfully!')
        setIsEditingName(false)
        await loadUserData()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      console.error('Update exception:', err)
      setError(`Failed to update name: ${err.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCanvas = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const result = await authService.updateUserProfile({ canvas_url: canvasUrl.trim() })

      if (result.error) {
        setError('Failed to update Canvas URL')
      } else {
        setSuccess('Canvas integration updated!')
        setIsEditingCanvas(false)
        await loadUserData()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError('Failed to update Canvas URL')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await authService.signOut()
    if (error) {
      setError('Failed to log out. Please try again.')
    }
    // The auth state change will trigger the app to show the login screen
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-cyan-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-dark-text-primary mb-1">Account Settings</h1>
        <p className="text-dark-text-muted text-sm">{user?.email}</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-fadeIn">
          <p className="text-green-400 text-sm text-center">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fadeIn">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Profile Name Card */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow shadow-dark-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-dark-text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Display Name
          </h2>
          {!isEditingName && (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingName ? (
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-dark-bg-primary border border-dark-border-glow rounded-xl px-4 py-3 text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="Enter your name"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-primary-600 to-accent-cyan text-white font-semibold py-2.5 rounded-xl hover:shadow-glow-cyan-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false)
                  setNewName(profile?.full_name || user?.email?.split('@')[0] || '')
                }}
                disabled={saving}
                className="flex-1 bg-dark-bg-primary border border-dark-border-glow text-dark-text-secondary font-semibold py-2.5 rounded-xl hover:bg-dark-bg-surface transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-dark-text-primary text-lg">
            {profile?.full_name || user?.email?.split('@')[0] || 'Not set'}
          </p>
        )}
      </div>

      {/* Canvas Integration Card */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow shadow-dark-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-dark-text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Canvas Integration
          </h2>
          {!isEditingCanvas && (
            <button
              onClick={() => setIsEditingCanvas(true)}
              className="text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingCanvas ? (
          <div className="space-y-3">
            <input
              type="url"
              value={canvasUrl}
              onChange={(e) => setCanvasUrl(e.target.value)}
              className="w-full bg-dark-bg-primary border border-dark-border-glow rounded-xl px-4 py-3 text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="https://your-school.instructure.com"
              autoFocus
            />
            <p className="text-xs text-dark-text-muted">
              Enter your Canvas LMS URL to enable integration features
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSaveCanvas}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-accent-purple to-accent-pink text-white font-semibold py-2.5 rounded-xl hover:shadow-glow-purple-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditingCanvas(false)
                  setCanvasUrl(profile?.canvas_url || '')
                }}
                disabled={saving}
                className="flex-1 bg-dark-bg-primary border border-dark-border-glow text-dark-text-secondary font-semibold py-2.5 rounded-xl hover:bg-dark-bg-surface transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-dark-text-primary mb-2">
              {profile?.canvas_url || 'Not configured'}
            </p>
            {profile?.canvas_url && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Connected
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Info Card */}
      <div className="bg-dark-bg-secondary rounded-2xl p-5 border border-dark-border-glow shadow-dark-card">
        <h2 className="text-lg font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Account Information
        </h2>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-dark-text-muted mb-1">Email</p>
            <p className="text-dark-text-primary">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-dark-text-muted mb-1">Account Type</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                profile?.is_pro
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
              }`}>
                {profile?.is_pro ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-semibold py-3.5 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Log Out
      </button>
    </div>
  )
}
