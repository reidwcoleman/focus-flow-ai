/**
 * AI Service for Focus Flow
 * Uses Groq - Lightning fast, completely FREE AI
 */

const AI_CONFIG = {
  // Groq API Key (100% FREE!)
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',

  // Model: Llama 3.1 70B - Fast and high quality
  model: 'llama-3.1-70b-versatile',

  // Endpoint
  apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
}

class AIService {
  constructor() {
    this.conversationHistory = []
    this.systemPrompt = `You are an expert AI tutor for students. Your role is to:

1. Help students understand academic concepts clearly and thoroughly
2. Provide step-by-step explanations for complex topics
3. Create practice problems and quiz questions
4. Offer study strategies and learning tips
5. Be encouraging, patient, and supportive
6. Adapt your explanations to the student's level of understanding

Guidelines:
- Keep responses concise but thorough (2-4 paragraphs max)
- Use examples and analogies to clarify concepts
- Break down complex topics into simpler parts
- Ask follow-up questions to check understanding
- Use proper formatting for formulas and equations
- Be positive and motivating

You're helping middle school, high school, and early college students succeed academically.`
  }

  /**
   * Check if AI service is properly configured
   */
  isConfigured() {
    return Boolean(AI_CONFIG.apiKey)
  }

  /**
   * Get the current provider name for display
   */
  getProviderName() {
    return this.isConfigured() ? 'Groq Llama 3.1' : 'Demo Mode'
  }

  /**
   * Send a message and get AI response from Groq
   * @param {string} userMessage - The user's question/message
   * @returns {Promise<string>} - AI response
   */
  async sendMessage(userMessage) {
    if (!this.isConfigured()) {
      throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.')
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    })

    try {
      // Build messages for Groq (OpenAI-compatible API)
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...this.conversationHistory.slice(-10), // Keep last 10 messages
      ]

      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 600,
          top_p: 1,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Groq API key.')
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Free tier allows 30 requests/min. Please wait a moment.')
        }
        if (response.status === 400) {
          throw new Error('Invalid request. Please try again.')
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
      // Remove the user message from history on error
      this.conversationHistory.pop()
      throw error
    }
  }

  /**
   * Get a demo response when API is not configured
   * @param {string} userMessage - The user's question
   * @returns {Promise<string>} - Demo response
   */
  async getDemoResponse(userMessage) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    // Generate contextual demo responses
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('photosynthesis')) {
      return `Great question! Photosynthesis is the process plants use to convert light energy into chemical energy. Here's how it works:

**The Process:**
1. **Light Absorption**: Chlorophyll in leaves captures sunlight
2. **Water Splitting**: Roots absorb H₂O from soil
3. **CO₂ Intake**: Leaves take in carbon dioxide from air
4. **Glucose Production**: These combine to create sugar (C₆H₁₂O₆)

**The Formula**: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

The oxygen released is what we breathe! Would you like to explore any specific part of this process?

*💡 Tip: Get REAL AI tutoring by adding a FREE Groq API key!*`
    }

    if (lowerMessage.includes('math') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra')) {
      return `I'd love to help with math! Math builds on itself, so let's make sure we understand the fundamentals first.

**Key Strategy:**
1. Identify what type of problem you're solving
2. Write down what you know
3. Break it into smaller steps
4. Check your work at each step

Could you share the specific problem or concept you're working on? That way I can give you targeted help with examples!

*💡 Tip: Get step-by-step solutions with a FREE Groq API key!*`
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

What subject are you studying for? I can give more specific tips!

*💡 Tip: Unlock unlimited tutoring with a FREE Groq API key!*`
    }

    // Generic helpful response
    return `That's a great question! I'm here to help you understand this better.

**To give you the best explanation**, could you tell me:
- What subject is this for?
- What specifically are you trying to understand?
- Have you learned any related concepts yet?

This will help me tailor my explanation to exactly what you need. In the meantime, remember that learning is a process - it's totally normal to not understand something right away!

**🚀 Want LIGHTNING-FAST AI tutoring?**
Get a FREE Groq API key (takes 30 seconds):
1. Visit https://console.groq.com/keys
2. Sign up (no credit card needed!)
3. Create an API key
4. Add to .env file: VITE_GROQ_API_KEY=your-key
5. Restart app - get blazing fast AI responses!

**Why Groq?**
- ✅ 100% FREE (no credit card)
- ✅ LIGHTNING FAST (100+ tokens/second!)
- ✅ Powered by Llama 3.1 70B
- ✅ 30 requests/min free tier`
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
