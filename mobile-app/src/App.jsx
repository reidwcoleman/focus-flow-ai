import { useState } from 'react'
import Dashboard from './components/Dashboard'
import AITutor from './components/AITutor'
import Planner from './components/Planner'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import Scanner from './components/Scanner'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showScanner, setShowScanner] = useState(false)
  const [scannedAssignments, setScannedAssignments] = useState([])

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'planner', label: 'Plan', icon: 'calendar' },
    { id: 'tutor', label: 'AI', icon: 'sparkles' },
    { id: 'analytics', label: 'Stats', icon: 'chart' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]

  const handleCaptureAssignment = (assignment) => {
    setScannedAssignments(prev => [...prev, assignment])
    // In a real app, this would save to backend/database
    console.log('Assignment captured:', assignment)
  }

  const getIcon = (icon, isActive) => {
    const className = "w-6 h-6"
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
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-purple/10">
      {/* Scanner Modal */}
      {showScanner && (
        <Scanner
          onClose={() => setShowScanner(false)}
          onCapture={handleCaptureAssignment}
        />
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto w-full px-4 pt-6 pb-24 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard onOpenScanner={() => setShowScanner(true)} />}
        {activeTab === 'planner' && <Planner />}
        {activeTab === 'tutor' && <AITutor />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <Settings />}
      </div>

      {/* Bottom Navigation - Premium iOS Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-neutral-200/50 safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex justify-around px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-3 flex flex-col items-center gap-1.5 transition-all ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-purple rounded-full"></div>
                )}

                {/* Icon */}
                <div className={`transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-neutral-400'
                }`}>
                  {getIcon(tab.icon, isActive)}
                </div>

                {/* Label */}
                <span className={`text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-neutral-500'
                }`}>
                  {tab.label}
                </span>

                {/* Glow Effect */}
                {isActive && tab.id === 'tutor' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-purple/10 to-transparent rounded-2xl blur-lg"></div>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App
