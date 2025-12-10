/**
 * Activity Parser Service
 * Uses AI to parse natural language activity descriptions into structured data
 */

import supabase from '../lib/supabase'

const ACTIVITY_PARSER_PROMPT = `You are an AI assistant that parses natural language activity descriptions into structured calendar events.

Extract the following information from the user's input:
- title: Brief title for the activity
- description: Optional description
- activity_date: Date in YYYY-MM-DD format (use context if relative like "tomorrow", "next Monday")
- start_time: Start time in HH:MM:SS format (24-hour), or null if not specified
- end_time: End time in HH:MM:SS format (24-hour), or null if not specified
- duration_minutes: Duration in minutes, or null if not specified
- activity_type: One of: task, class, study, break, event, meeting, assignment
- subject: Subject/topic if mentioned (e.g., "Math", "Chemistry")
- location: Location if mentioned
- is_all_day: true if it's an all-day event

Today's date: ${new Date().toISOString().split('T')[0]}

Return ONLY a valid JSON object with these fields. No additional text.

Examples:
Input: "Study chemistry tomorrow at 3pm for 2 hours"
Output: {"title":"Study chemistry","activity_type":"study","subject":"Chemistry","activity_date":"2025-12-11","start_time":"15:00:00","duration_minutes":120,"is_all_day":false}

Input: "Math class Monday 9am to 10:30am"
Output: {"title":"Math class","activity_type":"class","subject":"Math","activity_date":"2025-12-16","start_time":"09:00:00","end_time":"10:30:00","is_all_day":false}

Input: "Team meeting next Friday afternoon"
Output: {"title":"Team meeting","activity_type":"meeting","activity_date":"2025-12-20","start_time":"14:00:00","is_all_day":false}

Now parse this:`

class ActivityParserService {
  /**
   * Parse natural language activity description using AI
   * @param {string} userInput - Natural language description
   * @returns {Promise<Object>} Parsed activity data
   */
  async parseActivity(userInput) {
    try {
      // Use Supabase Edge Function for AI parsing
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured')
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userInput }],
          systemPrompt: ACTIVITY_PARSER_PROMPT,
          model: 'llama-3.3-70b-versatile', // Fast and accurate
          temperature: 0.3, // Lower temperature for more consistent parsing
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('AI API Error:', errorText)
        throw new Error('Failed to parse activity with AI')
      }

      const data = await response.json()
      console.log('AI Response:', data)

      const aiResponse = data.response || data.message || data.content

      if (!aiResponse) {
        console.error('No response from AI:', data)
        throw new Error('No response from AI')
      }

      // Parse JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('AI response did not contain JSON:', aiResponse)
        throw new Error('AI response did not contain valid JSON')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate required fields
      if (!parsed.title) {
        throw new Error('Activity must have a title')
      }

      // Set defaults
      const activityData = {
        title: parsed.title,
        description: parsed.description || null,
        activity_date: parsed.activity_date || new Date().toISOString().split('T')[0],
        start_time: parsed.start_time || null,
        end_time: parsed.end_time || null,
        duration_minutes: parsed.duration_minutes || null,
        activity_type: parsed.activity_type || 'task',
        subject: parsed.subject || null,
        location: parsed.location || null,
        color: this.getColorForType(parsed.activity_type || 'task'),
        is_all_day: parsed.is_all_day || false,
        ai_generated: true,
      }

      return activityData
    } catch (error) {
      console.error('Failed to parse activity:', error)
      throw error
    }
  }

  /**
   * Get color for activity type
   * @param {string} type
   * @returns {string} Hex color
   */
  getColorForType(type) {
    const colors = {
      task: '#3B82F6',      // Blue
      class: '#8B5CF6',     // Purple
      study: '#06B6D4',     // Cyan
      break: '#10B981',     // Green
      event: '#F59E0B',     // Amber
      meeting: '#EF4444',   // Red
      assignment: '#EC4899', // Pink
    }
    return colors[type] || '#3B82F6'
  }

  /**
   * Parse relative dates (e.g., "tomorrow", "next Monday")
   * @param {string} dateStr
   * @returns {Date}
   */
  parseRelativeDate(dateStr) {
    const today = new Date()
    const lower = dateStr.toLowerCase()

    if (lower === 'today') {
      return today
    }

    if (lower === 'tomorrow') {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      return tomorrow
    }

    // Add more relative date parsing as needed
    return today
  }
}

export default new ActivityParserService()
