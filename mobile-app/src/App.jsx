import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import AITutor from './components/AITutor'
import Planner from './components/Planner'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import Scanner from './components/Scanner'
import StudyHub from './components/StudyHub'
import Account from './components/Account'
import AuthScreen from './components/AuthScreen'
import { StudyProvider } from './contexts/StudyContext'
import authService from './services/authService'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showScanner, setShowScanner] = useState(false)
  const [scannedAssignments, setScannedAssignments] = useState([])
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await authService.getCurrentUser()
      setUser(user)
      setAuthLoading(false)
    }

    checkAuth()

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'planner', label: 'Plan', icon: 'calendar' },
    { id: 'study', label: 'Study', icon: 'book' },
    { id: 'scan', label: 'Scan', icon: 'camera', isCenter: true },
    { id: 'tutor', label: 'AI', icon: 'sparkles' },
    { id: 'analytics', label: 'Stats', icon: 'chart' },
    { id: 'account', label: 'Account', icon: 'user' },
  ]

  const handleCaptureAssignment = (assignment) => {
    setScannedAssignments(prev => [...prev, assignment])
    // In a real app, this would save to backend/database
    console.log('Assignment captured:', assignment)
  }

  const getIcon = (icon, isActive, isCenter = false) => {
    const className = isCenter ? "w-7 h-7" : "w-6 h-6"
    const strokeWidth = isActive ? 2.5 : 2

    switch (icon) {
      case 'home':
        return (
          <svg className={className} fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      case 'calendar':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'camera':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'sparkles':
        return (
          <svg className={className} fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
      case 'chart':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'settings':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case 'book':
        return (
          <svg className={className} fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'user':
        return (
          <svg className={className} fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      default:
        return null
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-accent-purple to-accent-pink flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white text-lg font-semibold">Loading Focus Flow...</p>
        </div>
      </div>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen onAuthSuccess={(user) => setUser(user)} />
  }

  return (
    <StudyProvider>
      <div className="min-h-screen bg-gradient-to-br from-dark-bg-primary via-dark-bg-surface to-dark-navy-dark">
        {/* Scanner Modal */}
        {showScanner && (
          <Scanner
            onClose={() => setShowScanner(false)}
            onCapture={handleCaptureAssignment}
          />
        )}

        {/* Main Content */}
        <div className="max-w-md mx-auto w-full px-5 pt-6 pb-24 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard onOpenScanner={() => setShowScanner(true)} />}
          {activeTab === 'planner' && <Planner />}
          {activeTab === 'tutor' && <AITutor />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'study' && <StudyHub />}
          {activeTab === 'account' && <Account />}
        </div>

      {/* Bottom Navigation - Premium iOS Style with Center Scan Button */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-bg-secondary border-t border-dark-border-glow safe-area-inset-bottom shadow-dark-soft-lg backdrop-blur-xl">
        <div className="max-w-md mx-auto flex justify-around items-end px-1 relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const isCenter = tab.isCenter

            // Center scan button gets special treatment
            if (isCenter) {
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setShowScanner(true)
                    setActiveTab('dashboard') // Go back to dashboard after opening scanner
                  }}
                  className="relative flex-1 flex flex-col items-center -mt-8 transition-all duration-200 active:scale-95"
                >
                  {/* Large Cyan Square Container */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan shadow-glow-cyan-lg flex items-center justify-center mb-1 border-4 border-dark-bg-secondary">
                    <div className="text-white">
                      {getIcon(tab.icon, true, true)}
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-[11px] font-semibold tracking-tight text-primary-500">
                    {tab.label}
                  </span>
                </button>
              )
            }

            // Regular nav buttons
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-2.5 flex flex-col items-center gap-1 transition-all duration-200 ${
                  isActive ? 'scale-105' : 'scale-100 active:scale-95'
                }`}
              >
                {/* Active Indicator with Cyan Glow */}
                {isActive && (
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full shadow-glow-cyan"></div>
                )}

                {/* Icon Container */}
                <div className={`transition-all duration-200 ${
                  isActive
                    ? 'text-primary-500 drop-shadow-[0_0_8px_rgba(88,166,255,0.5)]'
                    : 'text-dark-text-muted active:text-dark-text-secondary'
                }`}>
                  {getIcon(tab.icon, isActive, false)}
                </div>

                {/* Label */}
                <span className={`text-[11px] font-semibold tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-dark-text-muted'
                }`}>
                  {tab.label}
                </span>

                {/* Glow Effect for AI Tab */}
                {isActive && tab.id === 'tutor' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-purple/10 to-transparent rounded-2xl pointer-events-none"></div>
                )}
              </button>
            )
          })}
        </div>
      </nav>
      </div>
    </StudyProvider>
  )
}

export default App
