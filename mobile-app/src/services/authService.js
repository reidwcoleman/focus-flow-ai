/**
 * Authentication Service
 * Handles user signup, login, logout, and session management with Supabase
 */

import supabase from '../lib/supabase'

class AuthService {
  constructor() {
    this.currentUser = null
    this.session = null
    this._loadSession()
  }

  /**
   * Load current session on initialization
   * @private
   */
  async _loadSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.currentUser = session?.user || null
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  /**
   * Sign up a new user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, session, error}>}
   */
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { user: null, session: null, error }
      }

      this.currentUser = data.user
      this.session = data.session

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { user: null, session: null, error }
    }
  }

  /**
   * Sign in an existing user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, session, error}>}
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, session: null, error }
      }

      this.currentUser = data.user
      this.session = data.session

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, session: null, error }
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<{error}>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()

      this.currentUser = null
      this.session = null

      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  /**
   * Get current session
   * @returns {Promise<{session, error}>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      this.session = session
      this.currentUser = session?.user || null

      return { session, error }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, error }
    }
  }

  /**
   * Get current user
   * @returns {Promise<{user, error}>}
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      this.currentUser = user

      return { user, error }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error }
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser !== null && this.session !== null
  }

  /**
   * Get user ID
   * @returns {string|null}
   */
  getUserId() {
    return this.currentUser?.id || null
  }

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Called when auth state changes
   * @returns {Object} Subscription object
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      this.session = session
      this.currentUser = session?.user || null
      callback(event, session)
    })

    return subscription
  }

  /**
   * Send password reset email
   * @param {string} email
   * @returns {Promise<{data, error}>}
   */
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      return { data, error }
    } catch (error) {
      console.error('Password reset error:', error)
      return { data: null, error }
    }
  }

  /**
   * Update user password
   * @param {string} newPassword
   * @returns {Promise<{user, error}>}
   */
  async updatePassword(newPassword) {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      return { user, error }
    } catch (error) {
      console.error('Update password error:', error)
      return { user: null, error }
    }
  }
}

// Export singleton instance
export default new AuthService()
