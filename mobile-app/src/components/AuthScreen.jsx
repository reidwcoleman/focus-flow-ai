/**
 * Auth Screen Component
 * Handles user sign up and sign in
 */

import { useState } from 'react'
import authService from '../services/authService'

const AuthScreen = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (isSignUp) {
        result = await authService.signUp(email, password)
      } else {
        result = await authService.signIn(email, password)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        // Success!
        if (onAuthSuccess) {
          onAuthSuccess(result.user)
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg-primary via-dark-navy to-dark-navy-light flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-dark-bg-secondary rounded-3xl shadow-2xl border border-dark-border-glow p-8 animate-fadeInUp">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-cyan">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Focus Flow AI</h1>
          <p className="text-dark-text-secondary">AI-powered study companion</p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-dark-text-primary text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-dark-text-primary text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-dark-bg-tertiary border border-dark-border-glow text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/40 animate-fadeIn">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-accent-cyan text-white font-bold rounded-xl shadow-soft-lg hover:shadow-glow-cyan transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-primary-500 hover:text-primary-400 font-semibold transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>

        {/* Info */}
        {isSignUp && (
          <div className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
            <p className="text-primary-400 text-sm text-center">
              📧 You'll receive a confirmation email after signing up
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthScreen
