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
    again: 0,
    hard: 0,
    good: 0,
    easy: 0
  })
  const [showComplete, setShowComplete] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

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
    const threshold = 80

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Swipe right - Easy
        handleRating(5)
      } else {
        // Swipe left - Again
        handleRating(1)
      }
    }

    setDragOffset(0)
  }

  const handleRating = (rating) => {
    // Record the review with SM-2 algorithm
    recordCardReview(currentCard.id, rating)

    // Update stats
    setSessionStats(prev => ({
      ...prev,
      again: prev.again + (rating <= 2 ? 1 : 0),
      hard: prev.hard + (rating === 3 ? 1 : 0),
      good: prev.good + (rating === 4 ? 1 : 0),
      easy: prev.easy + (rating === 5 ? 1 : 0)
    }))

    // Move to next card or complete
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setShowComplete(true)
    }
  }

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
            <div className="bg-neutral-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-neutral-900">{cards.length}</div>
              <div className="text-xs text-neutral-600">Cards Reviewed</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{sessionStats.easy}</div>
              <div className="text-xs text-green-600">Easy</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{sessionStats.good}</div>
              <div className="text-xs text-blue-600">Good</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{sessionStats.again}</div>
              <div className="text-xs text-red-600">Again</div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={onComplete || onExit}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-glow-lg hover:shadow-glow transition-all active:scale-95"
          >
            Done
          </button>
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
            <div
              className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity"
              style={{ opacity: dragOffset > 50 ? 1 : 0 }}
            >
              <div className="px-6 py-3 bg-green-500 text-white rounded-2xl font-bold shadow-soft-lg">
                Easy
              </div>
            </div>
            <div
              className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity"
              style={{ opacity: dragOffset < -50 ? 1 : 0 }}
            >
              <div className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold shadow-soft-lg">
                Again
              </div>
            </div>
          </>
        )}
      </div>

      {/* Rating Buttons */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200/60 safe-area-inset-bottom shadow-soft-lg">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="grid grid-cols-4 gap-3">
            {/* Again - Rating 1 */}
            <button
              onClick={() => handleRating(1)}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-red-50 hover:bg-red-100 transition-all active:scale-95"
            >
              <span className="text-2xl">❌</span>
              <span className="text-xs font-semibold text-red-600">Again</span>
            </button>

            {/* Hard - Rating 3 */}
            <button
              onClick={() => handleRating(3)}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-all active:scale-95"
            >
              <span className="text-2xl">😐</span>
              <span className="text-xs font-semibold text-yellow-600">Hard</span>
            </button>

            {/* Good - Rating 4 */}
            <button
              onClick={() => handleRating(4)}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all active:scale-95"
            >
              <span className="text-2xl">👍</span>
              <span className="text-xs font-semibold text-blue-600">Good</span>
            </button>

            {/* Easy - Rating 5 */}
            <button
              onClick={() => handleRating(5)}
              className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-green-50 hover:bg-green-100 transition-all active:scale-95"
            >
              <span className="text-2xl">✅</span>
              <span className="text-xs font-semibold text-green-600">Easy</span>
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-neutral-500">
            Swipe right for Easy, left for Again
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudySession
