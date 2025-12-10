/**
 * StudyHub Component
 * Central hub for Notes and Flashcards features
 */

import { useState } from 'react'
import { useStudy } from '../contexts/StudyContext'
import StudySession from './StudySession'

const StudyHub = () => {
  const {
    notes,
    notesLoading,
    decks,
    flashcardsLoading,
    getDueCards,
    getCardsByDeck,
    getNotesStats,
    getFlashcardsStats
  } = useStudy()

  const [activeSection, setActiveSection] = useState('overview')
  const [studySession, setStudySession] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)

  const notesStats = getNotesStats()
  const flashcardsStats = getFlashcardsStats()
  const dueCards = getDueCards()

  const startDailyReview = () => {
    if (dueCards.length > 0) {
      setStudySession({
        cards: dueCards,
        title: 'Daily Review'
      })
    }
  }

  const startDeckStudy = (deckId) => {
    const deck = decks.find(d => d.id === deckId)
    if (!deck) return

    const cards = getCardsByDeck(deckId)
    const dueCardsForDeck = cards.filter(card =>
      new Date(card.nextReviewDate) <= new Date()
    )

    if (dueCardsForDeck.length > 0) {
      setStudySession({
        deckId,
        cards: dueCardsForDeck,
        title: deck.title
      })
    } else {
      // Study all cards if none are due
      setStudySession({
        deckId,
        cards: cards,
        title: deck.title
      })
    }
  }

  const handleSessionComplete = () => {
    setStudySession(null)
  }

  // Render study session if active
  if (studySession) {
    return (
      <StudySession
        deckId={studySession.deckId}
        cards={studySession.cards}
        onComplete={handleSessionComplete}
        onExit={handleSessionComplete}
      />
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">Study Hub</h1>
          <p className="text-neutral-600">Your notes and flashcards</p>
        </div>
      </div>

      {/* Daily Review Widget */}
      {dueCards.length > 0 && (
        <div className="bg-gradient-to-br from-accent-purple to-accent-pink rounded-2xl p-6 shadow-soft-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Daily Review</h3>
                <p className="text-white/90 text-sm">{dueCards.length} cards waiting</p>
              </div>
            </div>
            <button
              onClick={startDailyReview}
              className="px-5 py-2.5 bg-white text-accent-purple font-semibold rounded-xl shadow-soft hover:shadow-soft-md transition-all active:scale-95"
            >
              Start
            </button>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: '35%' }}
            ></div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Notes Card */}
        <button
          onClick={() => setActiveSection('notes')}
          className="bg-white rounded-2xl p-5 shadow-soft-md hover:shadow-soft-lg transition-all active:scale-95 text-left"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center shadow-glow-purple">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">
            {notesLoading ? '...' : notesStats.totalNotes}
          </div>
          <div className="text-neutral-600 text-sm font-medium">Notes</div>
        </button>

        {/* Flashcards Card */}
        <button
          onClick={() => setActiveSection('flashcards')}
          className="bg-white rounded-2xl p-5 shadow-soft-md hover:shadow-soft-lg transition-all active:scale-95 text-left"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-primary-500 flex items-center justify-center shadow-soft">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-neutral-900 mb-1">
            {flashcardsLoading ? '...' : flashcardsStats.totalDecks}
          </div>
          <div className="text-neutral-600 text-sm font-medium">Decks</div>
        </button>
      </div>

      {/* Recent Notes Section */}
      <div className="bg-white rounded-2xl p-5 shadow-soft-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neutral-900">Recent Notes</h3>
          <button className="text-primary-600 text-sm font-semibold hover:text-primary-700">
            View All
          </button>
        </div>

        {notesLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-neutral-500 text-sm mb-1">No notes yet</p>
            <p className="text-neutral-400 text-xs">Use the scanner to convert handwritten notes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-900 text-sm truncate">{note.title}</div>
                  <div className="text-neutral-500 text-xs">{note.subject}</div>
                </div>
                <div className="text-neutral-400 text-xs flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flashcard Decks Section */}
      <div className="bg-white rounded-2xl p-5 shadow-soft-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neutral-900">Flashcard Decks</h3>
          <button className="text-primary-600 text-sm font-semibold hover:text-primary-700">
            View All
          </button>
        </div>

        {flashcardsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-neutral-500 text-sm mb-1">No decks yet</p>
            <p className="text-neutral-400 text-xs">Use the scanner to create flashcards from textbooks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.slice(0, 3).map((deck) => {
              const dueCount = getDueCards(deck.id).length
              return (
                <div
                  key={deck.id}
                  onClick={() => startDeckStudy(deck.id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-all cursor-pointer active:scale-95"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 text-sm truncate">{deck.title}</div>
                    <div className="text-neutral-500 text-xs">
                      {deck.cardIds.length} cards • {deck.subject}
                    </div>
                  </div>
                  {dueCount > 0 && (
                    <div className="px-2 py-1 rounded-lg bg-accent-purple/20">
                      <span className="text-accent-purple text-xs font-bold">{dueCount}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Note Viewer Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-fadeInUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{selectedNote.title}</h3>
                  <p className="text-sm text-neutral-500">{selectedNote.subject}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-all active:scale-95"
              >
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              {/* Note Content with Enhanced Typography */}
              <div className="mb-6">
                <div
                  className="text-neutral-900 leading-loose text-base"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    lineHeight: '1.8',
                    letterSpacing: '0.01em'
                  }}
                >
                  {selectedNote.content
                    .replace(/\.\.\./g, '')
                    .replace(/\/\/\//g, '')
                    .replace(/---/g, '')
                    .replace(/\*\*/g, '')
                    .replace(/##/g, '')
                    .replace(/#/g, '')
                    .replace(/\*/g, '')
                    .replace(/_/g, '')
                    .replace(/~/g, '')
                    .replace(/`/g, '')
                    .trim()
                    .split('\n')
                    .filter(line => line.trim())
                    .map((line, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {line.trim()}
                      </p>
                    ))
                  }
                </div>
              </div>

              {/* Note Metadata */}
              <div className="pt-6 border-t border-neutral-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-500 font-medium mb-1">Created</div>
                    <div className="text-neutral-900">
                      {new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500 font-medium mb-1">Last Updated</div>
                    <div className="text-neutral-900">
                      {new Date(selectedNote.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-neutral-200 flex gap-3">
              <button
                onClick={() => setSelectedNote(null)}
                className="flex-1 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold rounded-xl transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudyHub
