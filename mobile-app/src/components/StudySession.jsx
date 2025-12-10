/**
 * StudySession Component
 * Interactive flashcard study mode with swipe gestures and SM-2 spaced repetition
 */

import { useState, useRef, useEffect } from 'react'
import { useStudy } from '../contexts/StudyContext'
import FlashCard from './FlashCard'

const StudySession = ({ deckId, cards, onComplete, onExit }) => {
  const { recordCardReview } = useStudy()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({
    needsWork: 0,
    mastered: 0
  })
  const [missedCards, setMissedCards] = useState([])
  const [showComplete, setShowComplete] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const dragStartX = useRef(0)
  const cardRef = useRef(null)

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  // Touch/Mouse event handlers for swipe gestures
  const handleDragStart = (clientX) => {
    setIsDragging(true)
    dragStartX.current = clientX
  }

  const handleDragMove = (clientX) => {
    if (!isDragging) return
    const diff = clientX - dragStartX.current
    setDragOffset(diff)
  }

  const handleDragEnd = () => {
    setIsDragging(false)

    // Swipe threshold
    const threshold = 100

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Swipe right - Mastered (rating 5)
        handleRating(5)
      } else {
        // Swipe left - Needs Work (rating 2)
        handleRating(2)
      }
    }

    setDragOffset(0)
  }

  const handleRating = (rating) => {
    // Record the review with SM-2 algorithm
    recordCardReview(currentCard.id, rating)

    // Track missed cards for review
    if (rating <= 2) {
      setMissedCards(prev => [...prev, currentCard])
    }

    // Update streak
    if (rating >= 5) {
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) {
        setBestStreak(newStreak)
      }
    } else {
      setStreak(0)
    }

    // Update stats - simplified to two categories
    setSessionStats(prev => ({
      ...prev,
      needsWork: prev.needsWork + (rating <= 2 ? 1 : 0),
      mastered: prev.mastered + (rating >= 5 ? 1 : 0)
    }))

    // Move to next card or complete
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setShowComplete(true)
    }
  }

  const reviewMissedCards = () => {
    // Start a new session with only the missed cards
    if (missedCards.length > 0) {
      // Create a new session by updating parent component
      onComplete?.()
      // Note: In a production app, we'd pass the missed cards back to start a new session
      // For now, user can close and select the deck again
    }
  }

  const accuracy = cards.length > 0 ? Math.round((sessionStats.mastered / cards.length) * 100) : 0

  if (!currentCard || showComplete) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-soft-xl">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow-primary">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Session Complete!</h2>
            <p className="text-neutral-600">Great job studying today</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{sessionStats.mastered}</div>
              <div className="text-xs text-green-600 font-semibold">Mastered</div>
              <div className="text-[10px] text-green-500 mt-1">Swiped Right ✓</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{sessionStats.needsWork}</div>
              <div className="text-xs text-amber-600 font-semibold">Needs Work</div>
              <div className="text-[10px] text-amber-500 mt-1">Swiped Left ↻</div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="space-y-3 mb-6">
            {/* Accuracy */}
            <div className="bg-neutral-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 text-sm">Accuracy</span>
                <span className={`text-lg font-bold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-amber-600'}`}>
                  {accuracy}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-amber-500'}`}
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>
            </div>

            {/* Best Streak */}
            {bestStreak > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 text-sm font-semibold">🔥 Best Streak</span>
                  <span className="text-2xl font-bold text-purple-600">{bestStreak}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="bg-neutral-50 rounded-xl p-3 text-center">
              <span className="text-neutral-600 text-sm">
                <span className="font-bold text-neutral-900">{cards.length}</span> cards reviewed
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {missedCards.length > 0 && (
              <button
                onClick={reviewMissedCards}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>↻</span>
                <span>Review {missedCards.length} Missed Card{missedCards.length !== 1 ? 's' : ''}</span>
              </button>
            )}
            <button
              onClick={onComplete || onExit}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-glow-lg hover:shadow-glow transition-all active:scale-95"
            >
              {missedCards.length > 0 ? 'Finish Later' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 safe-area-inset-top">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onExit}
              className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-all active:scale-95"
            >
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Streak Display */}
            {streak > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-soft animate-pulse-soft">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🔥</span>
                  <span className="text-white font-bold text-sm">{streak}</span>
                </div>
              </div>
            )}

            <div className="text-sm font-semibold text-neutral-600">
              {currentIndex + 1} / {cards.length}
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="h-full flex items-center justify-center px-6 pt-32 pb-48">
        <div
          ref={cardRef}
          className="w-full max-w-sm transition-all duration-200"
          style={{
            transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
            opacity: isDragging ? 0.9 : 1
          }}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => {
            if (isDragging) {
              setIsDragging(false)
              setDragOffset(0)
            }
          }}
        >
          <FlashCard card={currentCard} />
        </div>

        {/* Swipe Indicators */}
        {isDragging && (
          <>
            {/* Right Swipe - Mastered */}
            <div
              className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
              style={{
                opacity: dragOffset > 50 ? 1 : 0,
                transform: `translateY(-50%) scale(${dragOffset > 100 ? 1.1 : 1})`
              }}
            >
              <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold shadow-soft-lg flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>Mastered</span>
              </div>
            </div>

            {/* Left Swipe - Needs Work */}
            <div
              className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
              style={{
                opacity: dragOffset < -50 ? 1 : 0,
                transform: `translateY(-50%) scale(${dragOffset < -100 ? 1.1 : 1})`
              }}
            >
              <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold shadow-soft-lg flex items-center gap-2">
                <span>Needs Work</span>
                <span className="text-2xl">↻</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-900/90 to-transparent safe-area-inset-bottom pointer-events-none">
        <div className="max-w-md mx-auto px-5 py-8">
          <div className="flex items-center justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-lg">←</span>
              </div>
              <span className="text-sm font-medium">Needs Work</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Mastered</span>
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-lg">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudySession
