/**
 * AI Service for Focus Flow
 * Uses Supabase Edge Function to securely proxy AI requests
 */

const AI_CONFIG = {
  // Supabase Edge Function URL
  // Replace with your actual Supabase project URL
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  edgeFunctionUrl: import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`
    : null,

  // Fallback: Direct Groq API (for local development)
  useDirectApi: import.meta.env.VITE_USE_DIRECT_API === 'true',
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
}

// Usage limits
const FREE_TIER_LIMIT = 3
const PRO_TIER_LIMIT = 250
const USAGE_KEY = 'ai_chat_usage_count'

class AIService {
  constructor() {
    this.conversationHistory = []
    // Mobile-optimized system prompt for concise responses
    this.systemPrompt = `You are an expert AI tutor for students on a mobile app. Your role is to help with homework, concepts, and studying.

CRITICAL - Mobile optimization rules:
- Keep responses BRIEF (1-2 short paragraphs max, 3-5 sentences)
- Use bullet points and lists for clarity
- Be direct and to-the-point
- Avoid lengthy explanations unless specifically asked
- Use simple formatting (**, -, numbers only)

Guidelines:
- Answer the specific question asked
- Give examples when helpful
- Be encouraging but concise
- If topic is complex, give overview first, offer to elaborate

Remember: Students are on mobile - keep it SHORT and scannable!`
  }

  /**
   * Get current usage count
   */
  getUsageCount() {
    return parseInt(localStorage.getItem(USAGE_KEY) || '0', 10)
  }

  /**
   * Increment usage count
   */
  incrementUsage() {
    const current = this.getUsageCount()
    localStorage.setItem(USAGE_KEY, String(current + 1))
    return current + 1
  }

  /**
   * Reset usage count (for pro users or monthly reset)
   */
  resetUsage() {
    localStorage.setItem(USAGE_KEY, '0')
  }

  /**
   * Check if user has remaining requests
   */
  hasRemainingRequests() {
    return this.getUsageCount() < FREE_TIER_LIMIT
  }

  /**
   * Get remaining requests
   */
  getRemainingRequests() {
    return Math.max(0, FREE_TIER_LIMIT - this.getUsageCount())
  }

  /**
   * Get usage limits
   */
  getLimits() {
    return {
      free: FREE_TIER_LIMIT,
      pro: PRO_TIER_LIMIT,
    }
  }

  /**
   * Check if AI service is properly configured
   */
  isConfigured() {
    // Check if using backend (recommended)
    if (AI_CONFIG.edgeFunctionUrl) {
      return true
    }

    // Check if using direct API (local dev only)
    if (AI_CONFIG.useDirectApi && AI_CONFIG.groqApiKey) {
      return true
    }

    return false
  }

  /**
   * Get the current provider name for display
   */
  getProviderName() {
    if (AI_CONFIG.edgeFunctionUrl) {
      return 'Groq Llama 3.1 (Secure)'
    }
    if (AI_CONFIG.useDirectApi && AI_CONFIG.groqApiKey) {
      return 'Groq Llama 3.1 (Direct)'
    }
    return 'Demo Mode'
  }

  /**
   * Send message via Supabase Edge Function (RECOMMENDED)
   */
  async sendViaBackend(userMessage) {
    if (!AI_CONFIG.edgeFunctionUrl) {
      throw new Error('Supabase URL not configured. Add VITE_SUPABASE_URL to .env')
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    })

    try {
      const response = await fetch(AI_CONFIG.edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.anonKey}`,
          'apikey': AI_CONFIG.anonKey,
        },
        body: JSON.stringify({
          messages: this.conversationHistory.slice(-10), // Last 10 messages
          systemPrompt: this.systemPrompt,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      const aiMessage = data.message || 'Sorry, I could not generate a response.'

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage,
      })

      return aiMessage
    } catch (error) {
      // Remove user message from history on error
      this.conversationHistory.pop()
      throw error
    }
  }

  /**
   * Send message directly to Groq (LOCAL DEV ONLY - NOT SECURE FOR PRODUCTION)
   */
  async sendDirectToGroq(userMessage) {
    if (!AI_CONFIG.groqApiKey) {
      throw new Error('Groq API key not configured')
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    })

    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...this.conversationHistory.slice(-10),
      ]

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.7,
          max_tokens: 300, // Reduced for mobile-optimized concise responses
          top_p: 1,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Invalid API key')
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.')
        }
        throw new Error(errorData.error?.message || 'Failed to get AI response')
      }

      const data = await response.json()
      const aiMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage,
      })

      return aiMessage
    } catch (error) {
      // Remove user message from history on error
      this.conversationHistory.pop()
      throw error
    }
  }

  /**
   * Send a message and get AI response
   * Automatically chooses backend or direct API based on configuration
   */
  async sendMessage(userMessage) {
    if (!this.isConfigured()) {
      throw new Error('AI service not configured. Please set up Supabase or add Groq API key.')
    }

    // Use backend if configured (recommended)
    if (AI_CONFIG.edgeFunctionUrl && !AI_CONFIG.useDirectApi) {
      return await this.sendViaBackend(userMessage)
    }

    // Fallback to direct API (local dev only)
    if (AI_CONFIG.useDirectApi && AI_CONFIG.groqApiKey) {
      return await this.sendDirectToGroq(userMessage)
    }

    throw new Error('No AI service configured')
  }

  /**
   * Get a demo response when API is not configured
   */
  async getDemoResponse(userMessage) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('photosynthesis')) {
      return `Great question! Photosynthesis is the process plants use to convert light energy into chemical energy. Here's how it works:

**The Process:**
1. **Light Absorption**: Chlorophyll in leaves captures sunlight
2. **Water Splitting**: Roots absorb H₂O from soil
3. **CO₂ Intake**: Leaves take in carbon dioxide from air
4. **Glucose Production**: These combine to create sugar (C₆H₁₂O₆)

**The Formula**: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

The oxygen released is what we breathe! Would you like to explore any specific part of this process?`
    }

    if (lowerMessage.includes('math') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra')) {
      return `I'd love to help with math! Math builds on itself, so let's make sure we understand the fundamentals first.

**Key Strategy:**
1. Identify what type of problem you're solving
2. Write down what you know
3. Break it into smaller steps
4. Check your work at each step

Could you share the specific problem or concept you're working on? That way I can give you targeted help with examples!`
    }

    if (lowerMessage.includes('study') || lowerMessage.includes('prepare') || lowerMessage.includes('exam') || lowerMessage.includes('test')) {
      return `Effective studying is all about smart strategies! Here's my recommended approach:

**Study Techniques That Work:**
- **Spaced Repetition**: Review material over several days, not just once
- **Active Recall**: Test yourself instead of just re-reading
- **Pomodoro Technique**: 25-min focused sessions with 5-min breaks
- **Teach It**: Explain concepts to someone else (or pretend to!)

**For Exams:**
1. Review your notes within 24 hours of learning
2. Create practice questions
3. Focus on understanding "why," not just "what"
4. Get enough sleep before the exam

What subject are you studying for? I can give more specific tips!`
    }

    // Generic helpful response
    return `That's a great question! I'm here to help you understand this better.

**To give you the best explanation**, could you tell me:
- What subject is this for?
- What specifically are you trying to understand?
- Have you learned any related concepts yet?

This will help me tailor my explanation to exactly what you need. In the meantime, remember that learning is a process - it's totally normal to not understand something right away!`
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = []
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return [...this.conversationHistory]
  }
}

// Export singleton instance
const aiService = new AIService()
export default aiService
