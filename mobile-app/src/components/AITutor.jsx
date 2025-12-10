import { useState, useEffect, useRef } from 'react'
import aiService from '../services/aiService'

const AITutor = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hi! I'm your AI tutor. I can help you understand concepts, solve problems, and prepare for exams. What would you like to work on today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const lastMessageRef = useRef(null)
  const textareaRef = useRef(null)

  // Check usage limit on component mount
  useEffect(() => {
    const checkUsage = async () => {
      const count = await aiService.getUsageCount()
      setUsageCount(count)

      const hasRequests = await aiService.hasRemainingRequests()
      if (!hasRequests) {
        setShowUpgradeModal(true)
      }
    }
    checkUsage()
  }, [])

  // Auto-scroll to top of last message when new AI responses arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      // Only scroll to top of message for AI responses
      if (lastMessage.role === 'assistant') {
        scrollToLastMessage()
      }
    }
  }, [messages])

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (isTyping) {
      scrollToLastMessage()
    }
  }, [isTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [inputValue])

  const scrollToLastMessage = () => {
    // Scroll to the START of the last message (not the bottom)
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    // Check usage limit before sending
    const hasRequests = await aiService.hasRemainingRequests()
    if (!hasRequests) {
      setShowUpgradeModal(true)
      return
    }

    const userMessage = inputValue.trim()
    setInputValue('')
    setError('')

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newUserMessage])

    // Show typing indicator
    setIsTyping(true)
    setIsLoading(true)

    try {
      // Get AI response
      let aiResponse
      if (aiService.isConfigured()) {
        aiResponse = await aiService.sendMessage(userMessage)
      } else {
        aiResponse = await aiService.getDemoResponse(userMessage)
      }

      // Increment usage count after successful response
      const newCount = await aiService.incrementUsage()
      setUsageCount(newCount)

      // Add AI response
      const newAiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, newAiMessage])

      // Check if this was the last free request
      const hasRequests = await aiService.hasRemainingRequests()
      if (!hasRequests) {
        setTimeout(() => setShowUpgradeModal(true), 1000)
      }
    } catch (err) {
      console.error('AI Error:', err)
      setError(err.message || 'Failed to get response. Please try again.')

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I'm having trouble processing that right now. ${err.message || 'Please try again.'}`,
        timestamp: new Date(),
        isError: true,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question) => {
    setInputValue(question)
    textareaRef.current?.focus()
  }

  const quickQuestions = [
    "Explain this concept",
    "Practice problems",
    "Study tips",
    "Quiz me",
  ]

  const formatMessageContent = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text (**text**)
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')

        // Headers
        if (line.startsWith('**') && line.endsWith(':**')) {
          return `<div class="font-bold text-[15px] mt-3 mb-1.5" key=${i}>${line.replace(/\*\*/g, '')}</div>`
        }

        // Bullet points
        if (line.trim().startsWith('- ')) {
          return `<div class="ml-3 my-1" key=${i}>• ${line.substring(2)}</div>`
        }

        // Numbered lists
        if (/^\d+\./.test(line.trim())) {
          return `<div class="ml-3 my-1" key=${i}>${line}</div>`
        }

        return line
      })
      .join('<br/>')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Clean Minimal Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-text-primary tracking-tight">AI Tutor</h2>
            <p className="text-sm text-dark-text-secondary mt-0.5">
              {aiService.isConfigured() ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-soft shadow-glow-cyan"></span>
                  Powered by {aiService.getProviderName()}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Demo Mode
                </span>
              )}
            </p>
          </div>

          {/* Clear chat button */}
          <button
            onClick={() => {
              setMessages([{
                id: Date.now(),
                role: 'assistant',
                content: "Chat cleared! What would you like to learn about?",
                timestamp: new Date(),
              }])
              aiService.clearHistory()
            }}
            className="p-2.5 rounded-xl bg-dark-bg-secondary hover:bg-dark-bg-tertiary border border-dark-border-glow transition-all duration-200 active:scale-95"
          >
            <svg className="w-5 h-5 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Usage Counter */}
        <div className="mt-3 flex items-center justify-between px-3 py-2 bg-primary-500/10 rounded-xl border border-primary-500/30 shadow-dark-soft">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-dark-text-primary">
              {aiService.getLimits().free - usageCount} / {aiService.getLimits().free} free chats left
            </span>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="text-xs font-semibold text-accent-purple hover:text-accent-purple-light transition-colors"
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="flex-shrink-0 px-3.5 py-2 bg-dark-bg-secondary border border-dark-border-glow hover:border-accent-purple hover:bg-accent-purple/10 rounded-full text-sm font-medium text-dark-text-primary hover:text-accent-purple-light transition-all duration-200 active:scale-95 shadow-dark-soft"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scroll-smooth scrollbar-thin">
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
            style={{ animationDelay: `${index * 0.02}s` }}
          >
            {/* Assistant Avatar */}
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-purple-dark flex items-center justify-center shadow-soft">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-2.5 ${
                message.role === 'assistant'
                  ? message.isError
                    ? 'bg-red-900/20 border border-red-700/40 shadow-dark-soft'
                    : 'bg-dark-bg-secondary border border-dark-border-glow shadow-dark-soft-md'
                  : 'bg-gradient-to-br from-accent-purple via-accent-purple-dark to-accent-purple-dark text-white shadow-glow-purple'
              }`}>
                <div
                  className={`text-[15px] leading-relaxed ${
                    message.role === 'assistant'
                      ? message.isError ? 'text-red-400' : 'text-dark-text-primary'
                      : 'text-white'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: formatMessageContent(message.content)
                  }}
                />
              </div>
              <div className={`mt-1 px-1 text-[11px] text-dark-text-muted font-medium`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* User Avatar */}
            {message.role === 'user' && (
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-cyan">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div ref={lastMessageRef} className="flex gap-2.5 animate-fadeInUp">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-purple-dark flex items-center justify-center shadow-glow-purple">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="bg-dark-bg-secondary border border-dark-border-glow rounded-2xl px-4 py-3 shadow-dark-soft-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 mb-3 p-3 bg-red-900/20 border border-red-700/40 rounded-xl animate-fadeIn shadow-dark-soft">
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Premium Input Area */}
      <div className="flex-shrink-0 bg-dark-bg-secondary rounded-2xl p-3 shadow-dark-soft-md border border-dark-border-glow focus-within:border-accent-purple focus-within:shadow-glow-purple transition-all duration-200">
        <div className="flex items-end gap-2.5">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 resize-none bg-transparent text-dark-text-primary placeholder:text-dark-text-muted focus:outline-none py-2 text-[15px] leading-relaxed"
            rows={1}
            disabled={isLoading}
            style={{ maxHeight: '120px' }}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple to-accent-purple-dark hover:from-accent-purple-dark hover:to-accent-purple-dark disabled:from-dark-bg-tertiary disabled:to-dark-navy-dark flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed active:scale-95 shadow-glow-purple disabled:shadow-none"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-dark-bg-secondary rounded-3xl shadow-2xl border border-dark-border-glow max-w-sm w-full p-6 animate-fadeInUp">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-purple-dark flex items-center justify-center shadow-glow-purple">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-dark-text-primary text-center mb-2">
              Upgrade to Pro
            </h3>

            {/* Description */}
            <p className="text-dark-text-secondary text-center mb-6">
              You've used all your free AI chats. Upgrade to Pro for 250 chats per month plus exclusive features!
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/40">
                  <svg className="w-3 h-3 text-accent-purple-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-dark-text-primary font-medium">250 AI chats per month</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/40">
                  <svg className="w-3 h-3 text-accent-purple-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-dark-text-primary font-medium">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/40">
                  <svg className="w-3 h-3 text-accent-purple-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-dark-text-primary font-medium">Advanced study analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/40">
                  <svg className="w-3 h-3 text-accent-purple-light" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-dark-text-primary font-medium">Export study notes</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-primary-500/10 to-accent-purple/10 rounded-xl p-4 mb-6 border border-primary-500/30">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-dark-text-primary">$4.99</span>
                <span className="text-dark-text-secondary font-medium">/month</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  // In a real app, this would navigate to payment flow
                  alert('Payment integration coming soon! Pro features will be available shortly.')
                }}
                className="w-full py-3.5 bg-gradient-to-r from-accent-purple to-accent-purple-dark hover:from-accent-purple-dark hover:to-accent-purple-dark text-white font-semibold rounded-xl shadow-glow-purple hover:shadow-glow-purple-lg transition-all duration-200 active:scale-98"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3 text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AITutor
