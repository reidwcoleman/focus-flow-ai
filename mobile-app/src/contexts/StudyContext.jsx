/**
 * Study Context for Focus Flow
 * Global state management for notes and flashcards
 */

import { createContext, useContext, useState, useEffect } from 'react'
import notesService from '../services/notesService'
import flashcardService from '../services/flashcardService'

const StudyContext = createContext(null)

export function StudyProvider({ children }) {
  // Notes state
  const [notes, setNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(true)

  // Flashcards state
  const [decks, setDecks] = useState([])
  const [flashcards, setFlashcards] = useState([])
  const [flashcardsLoading, setFlashcardsLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    loadNotes()
    loadFlashcards()
  }, [])

  // ===== NOTES ACTIONS =====

  const loadNotes = () => {
    setNotesLoading(true)
    try {
      const loadedNotes = notesService.getAllNotes()
      setNotes(loadedNotes)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setNotesLoading(false)
    }
  }

  const addNote = (noteData) => {
    try {
      const newNote = notesService.createNote(noteData)
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (error) {
      console.error('Failed to add note:', error)
      return null
    }
  }

  const updateNote = (id, updates) => {
    try {
      const updatedNote = notesService.updateNote(id, updates)
      if (updatedNote) {
        setNotes(prev => prev.map(note =>
          note.id === id ? updatedNote : note
        ))
      }
      return updatedNote
    } catch (error) {
      console.error('Failed to update note:', error)
      return null
    }
  }

  const deleteNote = (id) => {
    try {
      const success = notesService.deleteNote(id)
      if (success) {
        setNotes(prev => prev.filter(note => note.id !== id))
      }
      return success
    } catch (error) {
      console.error('Failed to delete note:', error)
      return false
    }
  }

  const searchNotes = (query) => {
    return notesService.searchNotes(query)
  }

  const getNotesBySubject = (subject) => {
    return notesService.getNotesBySubject(subject)
  }

  const toggleNoteFavorite = (id) => {
    try {
      const updatedNote = notesService.toggleFavorite(id)
      if (updatedNote) {
        setNotes(prev => prev.map(note =>
          note.id === id ? updatedNote : note
        ))
      }
      return updatedNote
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      return null
    }
  }

  // ===== FLASHCARD ACTIONS =====

  const loadFlashcards = () => {
    setFlashcardsLoading(true)
    try {
      const loadedDecks = flashcardService.getAllDecks()
      const loadedCards = flashcardService.flashcards // Access all cards
      setDecks(loadedDecks)
      setFlashcards(loadedCards)
    } catch (error) {
      console.error('Failed to load flashcards:', error)
    } finally {
      setFlashcardsLoading(false)
    }
  }

  const addDeck = (deckData) => {
    try {
      const newDeck = flashcardService.createDeck(deckData)
      setDecks(prev => [newDeck, ...prev])
      return newDeck
    } catch (error) {
      console.error('Failed to add deck:', error)
      return null
    }
  }

  const updateDeck = (id, updates) => {
    try {
      const updatedDeck = flashcardService.updateDeck(id, updates)
      if (updatedDeck) {
        setDecks(prev => prev.map(deck =>
          deck.id === id ? updatedDeck : deck
        ))
      }
      return updatedDeck
    } catch (error) {
      console.error('Failed to update deck:', error)
      return null
    }
  }

  const deleteDeck = (id) => {
    try {
      const success = flashcardService.deleteDeck(id)
      if (success) {
        setDecks(prev => prev.filter(deck => deck.id !== id))
        // Reload flashcards to remove deleted deck's cards
        loadFlashcards()
      }
      return success
    } catch (error) {
      console.error('Failed to delete deck:', error)
      return false
    }
  }

  const addCard = (cardData) => {
    try {
      const newCard = flashcardService.createCard(cardData)
      if (newCard) {
        setFlashcards(prev => [...prev, newCard])
        // Update deck's cardIds
        setDecks(prev => prev.map(deck =>
          deck.id === cardData.deckId
            ? { ...deck, cardIds: [...deck.cardIds, newCard.id] }
            : deck
        ))
      }
      return newCard
    } catch (error) {
      console.error('Failed to add card:', error)
      return null
    }
  }

  const updateCard = (id, updates) => {
    try {
      const updatedCard = flashcardService.updateCard(id, updates)
      if (updatedCard) {
        setFlashcards(prev => prev.map(card =>
          card.id === id ? updatedCard : card
        ))
      }
      return updatedCard
    } catch (error) {
      console.error('Failed to update card:', error)
      return null
    }
  }

  const deleteCard = (id) => {
    try {
      const success = flashcardService.deleteCard(id)
      if (success) {
        setFlashcards(prev => prev.filter(card => card.id !== id))
        // Reload decks to update cardIds
        loadFlashcards()
      }
      return success
    } catch (error) {
      console.error('Failed to delete card:', error)
      return false
    }
  }

  const addDeckWithCards = (deckData, cardsData) => {
    try {
      const result = flashcardService.createDeckWithCards(deckData, cardsData)
      setDecks(prev => [result.deck, ...prev])
      setFlashcards(prev => [...prev, ...result.cards])
      return result
    } catch (error) {
      console.error('Failed to add deck with cards:', error)
      return null
    }
  }

  const recordCardReview = (cardId, rating) => {
    try {
      const updatedCard = flashcardService.recordReview(cardId, rating)
      if (updatedCard) {
        setFlashcards(prev => prev.map(card =>
          card.id === cardId ? updatedCard : card
        ))
      }
      return updatedCard
    } catch (error) {
      console.error('Failed to record review:', error)
      return null
    }
  }

  const getDueCards = (deckId = null) => {
    return flashcardService.getDueCards(deckId)
  }

  const getCardsByDeck = (deckId) => {
    return flashcardService.getCardsByDeck(deckId)
  }

  const getDeckStats = (deckId) => {
    return flashcardService.getDeckStats(deckId)
  }

  // ===== STATISTICS =====

  const getNotesStats = () => {
    return notesService.getStatistics()
  }

  const getFlashcardsStats = () => {
    return flashcardService.getOverallStats()
  }

  // Context value
  const value = {
    // Notes
    notes,
    notesLoading,
    addNote,
    updateNote,
    deleteNote,
    searchNotes,
    getNotesBySubject,
    toggleNoteFavorite,
    getNotesStats,
    loadNotes,

    // Flashcards
    decks,
    flashcards,
    flashcardsLoading,
    addDeck,
    updateDeck,
    deleteDeck,
    addCard,
    updateCard,
    deleteCard,
    addDeckWithCards,
    recordCardReview,
    getDueCards,
    getCardsByDeck,
    getDeckStats,
    getFlashcardsStats,
    loadFlashcards,
  }

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  )
}

// Custom hook for using the study context
export function useStudy() {
  const context = useContext(StudyContext)
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider')
  }
  return context
}

export default StudyContext
