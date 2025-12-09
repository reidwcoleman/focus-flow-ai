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
  const [timeRemaining] = useState(28)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [inputValue])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

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

      // Add AI response
      const newAiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, newAiMessage])
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
    { text: "📚 Explain concept", icon: "📚" },
    { text: "✏️ Practice problems", icon: "✏️" },
    { text: "📝 Study guide", icon: "📝" },
    { text: "🎯 Quiz me", icon: "🎯" },
  ]

  const formatMessageContent = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text (**text**)
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

        // Headers
        if (line.startsWith('**') && line.endsWith(':**')) {
          return `<div class="font-bold text-base mt-3 mb-1" key=${i}>${line.replace(/\*\*/g, '')}</div>`
        }

        // Bullet points
        if (line.trim().startsWith('- ')) {
          return `<div class="ml-4 my-1" key=${i}>• ${line.substring(2)}</div>`
        }

        // Numbered lists
        if (/^\d+\./.test(line.trim())) {
          return `<div class="ml-4 my-1" key=${i}>${line}</div>`
        }

        return line
      })
      .join('<br/>')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Premium Header */}
      <div className="flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-5 shadow-glow-lg mb-4">
        {/* Animated gradient orbs */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-300/30 rounded-full blur-2xl animate-pulse delay-75"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">AI Tutor</h3>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <span className="text-xs font-semibold text-white">Premium</span>
                </div>
                <span className="text-xs text-white/80">{timeRemaining}min left</span>
              </div>
            </div>
          </div>

          <button className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 border border-white/30">
            Ultra ✨
          </button>
        </div>

        {/* API Status Banner */}
        {!aiService.isConfigured() && (
          <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-white font-medium">Demo Mode Active</p>
                <p className="text-xs text-white/80 mt-0.5">
                  Get a FREE Groq API key for lightning-fast AI tutoring!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question.text)}
              className="flex-shrink-0 px-4 py-2.5 bg-white border-2 border-neutral-200 hover:border-purple-400 rounded-xl text-sm font-medium text-neutral-700 hover:text-purple-600 transition-all active:scale-95 shadow-sm hover:shadow-md"
            >
              {question.text}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scroll-smooth">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Assistant Avatar */}
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className={`flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-3 shadow-md ${
                message.role === 'assistant'
                  ? message.isError
                    ? 'bg-red-50 border-2 border-red-200'
                    : 'bg-white border-2 border-neutral-200'
                  : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-glow'
              }`}>
                <div
                  className={`text-sm leading-relaxed ${
                    message.role === 'assistant'
                      ? message.isError ? 'text-red-800' : 'text-neutral-800'
                      : 'text-white'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: formatMessageContent(message.content)
                  }}
                />
              </div>
              <div className={`mt-1.5 px-2 text-xs text-neutral-400 font-medium`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* User Avatar */}
            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-fadeIn">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="bg-white border-2 border-neutral-200 rounded-2xl px-5 py-4 shadow-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 mb-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl animate-fadeIn">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Premium Input Area */}
      <div className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-lg border-2 border-neutral-200 hover:border-purple-300 transition-colors">
        <div className="flex items-end gap-3">
          <button className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 hover:from-neutral-200 hover:to-neutral-300 flex items-center justify-center transition-all active:scale-95 shadow-sm">
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

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
            placeholder="Ask me anything about your studies..."
            className="flex-1 resize-none bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none max-h-32 py-2.5 text-sm leading-relaxed"
            rows={1}
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-neutral-300 disabled:to-neutral-400 flex items-center justify-center transition-all disabled:cursor-not-allowed active:scale-95 shadow-glow disabled:shadow-none"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="flex-shrink-0 mt-3 relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 rounded-2xl p-4 shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-2xl"></div>
        <div className="relative flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">
              Upgrade to Ultra for Unlimited AI Tutoring
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Plus advanced features, priority support, and more!
            </p>
          </div>
          <button className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-md">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  )
}

export default AITutor
