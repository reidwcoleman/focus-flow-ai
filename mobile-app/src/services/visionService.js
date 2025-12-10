/**
 * Vision AI Service for Focus Flow
 * Handles OCR and image analysis using Groq Llama 3.3
 */

const VISION_CONFIG = {
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  groqEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
  visionModel: 'llama-3.3-70b-versatile',
  maxTokens: 2000,
  temperature: 0.3, // Lower for more consistent extraction
}

class VisionService {
  constructor() {
    this.isConfigured = !!VISION_CONFIG.groqApiKey
  }

  /**
   * Process handwritten notes image into structured text
   * @param {string} base64Image - Base64 encoded image (with or without data URL prefix)
   * @returns {Promise<{rawText: string, formattedContent: string, title: string, subject: string, tags: string[], confidence: number}>}
   */
  async processHandwrittenNotes(base64Image) {
    const cleanBase64 = this._cleanBase64(base64Image)

    if (!this.isConfigured) {
      console.warn('Groq API key not configured, using demo mode')
      return this._getDemoNotesResponse()
    }

    const prompt = this._getHandwritingPrompt()

    try {
      const response = await fetch(VISION_CONFIG.groqEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VISION_CONFIG.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: VISION_CONFIG.visionModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${cleanBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: VISION_CONFIG.maxTokens,
          temperature: VISION_CONFIG.temperature
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Groq API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      // Parse JSON response from AI
      return this._parseNotesResponse(aiResponse)
    } catch (error) {
      console.error('Vision service error (handwriting):', error)
      throw new Error(`Failed to process handwritten notes: ${error.message}`)
    }
  }

  /**
   * Process textbook/notes image into flashcards
   * @param {string} base64Image - Base64 encoded image
   * @returns {Promise<{flashcards: Array<{front: string, back: string, hint?: string, difficulty: string}>, title: string, subject: string}>}
   */
  async processTextbookToFlashcards(base64Image) {
    const cleanBase64 = this._cleanBase64(base64Image)

    if (!this.isConfigured) {
      console.warn('Groq API key not configured, using demo mode')
      return this._getDemoFlashcardsResponse()
    }

    const prompt = this._getFlashcardPrompt()

    try {
      const response = await fetch(VISION_CONFIG.groqEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VISION_CONFIG.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: VISION_CONFIG.visionModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${cleanBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: VISION_CONFIG.maxTokens,
          temperature: 0.4 // Slightly higher for creative flashcard generation
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Groq API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      // Parse JSON response from AI
      return this._parseFlashcardsResponse(aiResponse)
    } catch (error) {
      console.error('Vision service error (flashcards):', error)
      throw new Error(`Failed to generate flashcards: ${error.message}`)
    }
  }

  /**
   * Generic OCR text extraction
   * @param {string} base64Image - Base64 encoded image
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async extractText(base64Image) {
    const cleanBase64 = this._cleanBase64(base64Image)

    if (!this.isConfigured) {
      return { text: 'Demo OCR text', confidence: 0.95 }
    }

    const prompt = 'Extract all text from this image. Return only the text, preserving line breaks and formatting.'

    try {
      const response = await fetch(VISION_CONFIG.groqEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VISION_CONFIG.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: VISION_CONFIG.visionModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${cleanBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        text: data.choices[0].message.content,
        confidence: 0.85 // Groq doesn't provide confidence, using estimate
      }
    } catch (error) {
      console.error('Vision service error (OCR):', error)
      throw new Error(`Failed to extract text: ${error.message}`)
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Remove data URL prefix from base64 if present
   */
  _cleanBase64(base64Image) {
    return base64Image.replace(/^data:image\/\w+;base64,/, '')
  }

  /**
   * Prompt for handwriting extraction and organization
   */
  _getHandwritingPrompt() {
    return `You are an expert at reading handwritten notes and organizing them into clean, typed documents.

Analyze this handwritten image and extract all text. Then organize it intelligently.

INSTRUCTIONS:
1. Transcribe all handwritten text exactly as written
2. Organize into logical sections with headings where appropriate
3. Identify key terms, concepts, and important points
4. Format as clean Markdown (use ##, **, bullet lists)
5. Infer a title for these notes
6. Detect the subject area (e.g., Chemistry, Math, History)
7. Extract relevant tags/keywords

Return your response as a JSON object with this structure:
{
  "rawText": "exact transcription with line breaks",
  "formattedContent": "organized Markdown content with ## headings, **bold**, and lists",
  "title": "appropriate title for these notes",
  "subject": "detected subject (Chemistry, Math, Biology, etc.)",
  "tags": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.95
}

Be thorough but concise. Focus on clarity and organization.`
  }

  /**
   * Prompt for flashcard generation from textbook/notes
   */
  _getFlashcardPrompt() {
    return `You are an expert educator creating effective flashcards for student learning.

Analyze this textbook page or notes image and create flashcards that will help students learn the material.

FLASHCARD CREATION RULES:
1. Identify KEY TERMS and their definitions
2. Extract IMPORTANT CONCEPTS that need explanation
3. Find FACTS, dates, formulas, or data points
4. Create questions that test understanding, not just memorization
5. Make the front (question) clear and specific
6. Make the back (answer) concise but complete
7. Add hints for complex topics (optional)
8. Rate difficulty: easy, medium, or hard

Create 5-15 high-quality flashcards (prioritize quality over quantity).

Return your response as a JSON object with this structure:
{
  "flashcards": [
    {
      "front": "What is...?",
      "back": "Clear, concise answer",
      "hint": "Optional hint for difficult cards",
      "difficulty": "easy | medium | hard"
    }
  ],
  "title": "suggested deck title",
  "subject": "detected subject area"
}

Focus on active recall and understanding.`
  }

  /**
   * Parse AI response for notes extraction
   */
  _parseNotesResponse(aiResponse) {
    try {
      // Try to extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                        aiResponse.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)

      // Validate required fields
      return {
        rawText: parsed.rawText || '',
        formattedContent: parsed.formattedContent || parsed.rawText || '',
        title: parsed.title || 'Untitled Notes',
        subject: parsed.subject || 'General',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        confidence: parsed.confidence || 0.85
      }
    } catch (error) {
      console.error('Failed to parse notes response:', error)
      // Fallback: use raw response as content
      return {
        rawText: aiResponse,
        formattedContent: aiResponse,
        title: 'Untitled Notes',
        subject: 'General',
        tags: [],
        confidence: 0.7
      }
    }
  }

  /**
   * Parse AI response for flashcards
   */
  _parseFlashcardsResponse(aiResponse) {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                        aiResponse.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0]
      const parsed = JSON.parse(jsonStr)

      // Validate flashcards array
      if (!Array.isArray(parsed.flashcards)) {
        throw new Error('Invalid flashcards format')
      }

      return {
        flashcards: parsed.flashcards.map((card, index) => ({
          front: card.front || `Question ${index + 1}`,
          back: card.back || 'No answer provided',
          hint: card.hint || null,
          difficulty: card.difficulty || 'medium'
        })),
        title: parsed.title || 'Untitled Deck',
        subject: parsed.subject || 'General'
      }
    } catch (error) {
      console.error('Failed to parse flashcards response:', error)
      // Fallback: create a single card with the response
      return {
        flashcards: [{
          front: 'Flashcard generation failed',
          back: 'Please try again with a different image',
          hint: null,
          difficulty: 'medium'
        }],
        title: 'Error Deck',
        subject: 'General'
      }
    }
  }

  /**
   * Demo mode response for notes
   */
  _getDemoNotesResponse() {
    return {
      rawText: `Chemistry Notes - Acid-Base Reactions\n\nDefinition: An acid-base reaction involves the transfer of a proton (H+) from one species to another.\n\nKey Concepts:\n- Bronsted-Lowry acids are proton donors\n- Bases are proton acceptors\n- Conjugate acid-base pairs\n\npH Scale:\n- pH < 7: acidic\n- pH = 7: neutral\n- pH > 7: basic\n\nCommon Acids:\n- HCl (hydrochloric acid)\n- H2SO4 (sulfuric acid)\n- CH3COOH (acetic acid)`,
      formattedContent: `## Chemistry Notes - Acid-Base Reactions\n\n**Definition:** An acid-base reaction involves the transfer of a proton (H+) from one species to another.\n\n### Key Concepts\n- **Bronsted-Lowry acids** are proton donors\n- **Bases** are proton acceptors\n- **Conjugate acid-base pairs** - differ by one proton\n\n### pH Scale\n- pH < 7: acidic\n- pH = 7: neutral  \n- pH > 7: basic\n\n### Common Acids\n- HCl (hydrochloric acid)\n- H₂SO₄ (sulfuric acid)\n- CH₃COOH (acetic acid)`,
      title: 'Chemistry Notes - Acid-Base Reactions',
      subject: 'Chemistry',
      tags: ['acids', 'bases', 'pH', 'chemistry', 'proton transfer'],
      confidence: 0.95
    }
  }

  /**
   * Demo mode response for flashcards
   */
  _getDemoFlashcardsResponse() {
    return {
      flashcards: [
        {
          front: 'What is a Bronsted-Lowry acid?',
          back: 'A proton (H+) donor',
          hint: 'Think about what the acid gives away',
          difficulty: 'easy'
        },
        {
          front: 'What is a Bronsted-Lowry base?',
          back: 'A proton (H+) acceptor',
          hint: 'Think about what the base receives',
          difficulty: 'easy'
        },
        {
          front: 'What is the pH of a neutral solution?',
          back: '7',
          hint: 'Right in the middle of the pH scale',
          difficulty: 'easy'
        },
        {
          front: 'If a solution has pH < 7, is it acidic or basic?',
          back: 'Acidic',
          hint: 'Lower pH means more H+ ions',
          difficulty: 'easy'
        },
        {
          front: 'What is a conjugate acid-base pair?',
          back: 'Two species that differ by one proton (H+)',
          hint: 'They are related by the transfer of one proton',
          difficulty: 'medium'
        },
        {
          front: 'What is the chemical formula for hydrochloric acid?',
          back: 'HCl',
          difficulty: 'easy'
        },
        {
          front: 'What is the chemical formula for sulfuric acid?',
          back: 'H₂SO₄',
          difficulty: 'medium'
        },
        {
          front: 'What happens in an acid-base reaction?',
          back: 'A proton (H+) is transferred from the acid to the base',
          difficulty: 'medium'
        }
      ],
      title: 'Acid-Base Reactions',
      subject: 'Chemistry'
    }
  }

  /**
   * Check if service is properly configured
   */
  isReady() {
    return this.isConfigured
  }

  /**
   * Get configuration status
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      model: VISION_CONFIG.visionModel,
      provider: 'Groq'
    }
  }
}

// Export singleton instance
export default new VisionService()
