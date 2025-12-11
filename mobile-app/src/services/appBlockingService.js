/**
 * App Blocking Service - iOS Focus Mode Integration
 * Manages app blocking sessions and integrates with iOS Screen Time
 */

import supabase from '../lib/supabase'

class AppBlockingService {
  /**
   * Get all blocking sessions for the current user
   * @returns {Promise<Array>} Array of blocking sessions
   */
  async getBlockingSessions() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('blocking_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get blocking sessions:', error)
      return []
    }
  }

  /**
   * Get active blocking session
   * @returns {Promise<Object|null>} Active session or null
   */
  async getActiveSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('blocking_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('end_time', now)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Failed to get active session:', error)
      return null
    }
  }

  /**
   * Create a new blocking session
   * @param {Object} sessionData - Session configuration
   * @returns {Promise<Object>} Created session
   */
  async createSession(sessionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { blockedApps, duration, customEndTime } = sessionData

      const startTime = new Date()
      const endTime = customEndTime || new Date(startTime.getTime() + duration * 60 * 1000)

      const { data, error } = await supabase
        .from('blocking_sessions')
        .insert({
          user_id: user.id,
          blocked_apps: blockedApps,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: duration,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      console.log('✅ Created blocking session:', data)
      return data
    } catch (error) {
      console.error('❌ Failed to create session:', error)
      throw error
    }
  }

  /**
   * End a blocking session
   * @param {string} sessionId - Session ID to end
   * @returns {Promise<Object>} Updated session
   */
  async endSession(sessionId) {
    try {
      const { data, error } = await supabase
        .from('blocking_sessions')
        .update({
          is_active: false,
          actual_end_time: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Ended blocking session:', data)
      return data
    } catch (error) {
      console.error('❌ Failed to end session:', error)
      throw error
    }
  }

  /**
   * Get blocking statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: sessions, error } = await supabase
        .from('blocking_sessions')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      const totalSessions = sessions.length
      const completedSessions = sessions.filter(s => !s.is_active).length
      const totalMinutesBlocked = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
      const mostBlockedApps = this.getMostBlockedApps(sessions)

      return {
        totalSessions,
        completedSessions,
        totalMinutesBlocked,
        totalHoursBlocked: Math.floor(totalMinutesBlocked / 60),
        mostBlockedApps,
      }
    } catch (error) {
      console.error('Failed to get stats:', error)
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalMinutesBlocked: 0,
        totalHoursBlocked: 0,
        mostBlockedApps: [],
      }
    }
  }

  /**
   * Get most blocked apps
   * @param {Array} sessions - All sessions
   * @returns {Array} Most blocked apps with counts
   */
  getMostBlockedApps(sessions) {
    const appCounts = {}

    sessions.forEach(session => {
      session.blocked_apps.forEach(app => {
        appCounts[app] = (appCounts[app] || 0) + 1
      })
    })

    return Object.entries(appCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([app, count]) => ({ app, count }))
  }

  /**
   * Generate iOS Shortcut URL for Screen Time integration
   * @param {Array} apps - Apps to block
   * @param {number} minutes - Duration in minutes
   * @returns {string} Shortcut URL
   */
  generateShortcutURL(apps, minutes) {
    // This creates a URL scheme to integrate with iOS Shortcuts
    // User would need to create a Shortcut that responds to this URL
    const params = new URLSearchParams({
      apps: apps.join(','),
      duration: minutes,
      action: 'block',
    })

    return `shortcuts://run-shortcut?name=FocusFlowBlock&input=${encodeURIComponent(params.toString())}`
  }
}

export default new AppBlockingService()
