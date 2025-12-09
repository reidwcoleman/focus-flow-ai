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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
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
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">AI Tutor</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              {aiService.isConfigured() ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
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
            className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors active:scale-95"
          >
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="flex-shrink-0 px-3.5 py-2 bg-white border border-neutral-200 hover:border-purple-300 hover:bg-purple-50 rounded-full text-sm font-medium text-neutral-700 hover:text-purple-700 transition-all active:scale-95 shadow-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scroll-smooth px-1">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            {/* Assistant Avatar */}
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className={`flex flex-col max-w-[82%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-2.5 ${
                message.role === 'assistant'
                  ? message.isError
                    ? 'bg-red-50 border border-red-200 shadow-sm'
                    : 'bg-white border border-neutral-200 shadow-sm'
                  : 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-md'
              }`}>
                <div
                  className={`text-[15px] leading-relaxed ${
                    message.role === 'assistant'
                      ? message.isError ? 'text-red-800' : 'text-neutral-800'
                      : 'text-white'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: formatMessageContent(message.content)
                  }}
                />
              </div>
              <div className={`mt-1 px-1 text-[11px] text-neutral-400 font-medium`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* User Avatar */}
            {message.role === 'user' && (
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2.5 animate-fadeIn">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
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
        <div className="flex-shrink-0 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Premium Input Area */}
      <div className="flex-shrink-0 bg-white rounded-2xl p-3 shadow-lg border border-neutral-200 focus-within:border-purple-300 transition-colors">
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
            className="flex-1 resize-none bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none py-2 text-[15px] leading-relaxed"
            rows={1}
            disabled={isLoading}
            style={{ maxHeight: '120px' }}
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-neutral-300 disabled:to-neutral-400 flex items-center justify-center transition-all disabled:cursor-not-allowed active:scale-95 shadow-md disabled:shadow-none"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AITutor
