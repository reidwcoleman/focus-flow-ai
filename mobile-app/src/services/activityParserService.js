/**
 * Activity Parser Service - ULTRA-SMART VERSION
 * Advanced AI-powered parsing with deep context understanding
 */

import supabase from '../lib/supabase'

/**
 * Get comprehensive prompt for AI activity parsing
 * Includes current date/time context and extensive examples
 */
const getActivityParserPrompt = () => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
  const currentTime = now.toTimeString().slice(0, 5)

  // Calculate next week's dates for examples
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  return `You are an ULTRA-SMART AI calendar assistant with advanced natural language understanding. Parse activity descriptions into structured calendar events with MAXIMUM INTELLIGENCE about dates, times, and context.

=== CURRENT CONTEXT ===
Today: ${today} (${dayOfWeek})
Current Time: ${currentTime}

=== PARSING RULES ===

**DATES - Be SMART about relative dates:**
- "today" = ${today}
- "tomorrow" = ${tomorrowStr}
- "Monday", "Tuesday", etc. = NEXT occurrence of that day (if today is Tuesday and user says "Monday", use NEXT Monday)
- "next Monday" = the Monday of NEXT week (not this week)
- "this Friday" = the Friday of THIS week
- "in 3 days" = calculate from today
- "next week" = 7 days from today
- Absolute dates: "Dec 25", "12/25", "December 25th" = parse to YYYY-MM-DD
- If no date mentioned but time is given, assume TODAY

**TIMES - Parse ALL formats:**
- "3pm", "3:30pm" = 15:00:00, 15:30:00
- "9am" = 09:00:00
- "noon" = 12:00:00
- "midnight" = 00:00:00
- "morning" = 09:00:00 (default)
- "afternoon" = 14:00:00 (default)
- "evening" = 18:00:00 (default)
- "night" = 20:00:00 (default)
- "at 15:00", "15:30" = use 24-hour format directly

**DURATION - Smart estimation:**
- If "for X hours/minutes" mentioned, parse it
- If start and end time given, calculate duration_minutes
- If only start time:
  - class = 60 minutes
  - study = 120 minutes
  - meeting = 60 minutes
  - break = 15 minutes
  - assignment = null (variable)
  - task = null (variable)

**ACTIVITY TYPES - Context clues:**
- Keywords: "class", "lecture" → class
- "study", "review", "read" → study
- "homework", "assignment", "project" → assignment
- "break", "rest", "lunch" → break
- "meeting", "call", "appointment" → meeting
- "practice", "game", "event" → event
- Default → task

**SUBJECTS - Extract intelligently:**
- Look for school subjects: Math, Chemistry, Physics, Biology, English, History, etc.
- Course names: "CS101", "CHEM202"
- Topics: "algebra", "essay writing"

**LOCATION - Find if mentioned:**
- Places: "library", "room 205", "zoom", "online", "gym", etc.

=== OUTPUT FORMAT ===
Return ONLY valid JSON with these fields:
{
  "title": "Brief descriptive title",
  "description": "Optional longer description or null",
  "activity_date": "YYYY-MM-DD",
  "start_time": "HH:MM:SS or null",
  "end_time": "HH:MM:SS or null",
  "duration_minutes": integer or null,
  "activity_type": "task|class|study|break|event|meeting|assignment",
  "subject": "Subject name or null",
  "location": "Location or null",
  "is_all_day": false (true only if explicitly "all day")
}

=== COMPREHENSIVE EXAMPLES ===

Input: "Study chemistry tomorrow at 3pm for 2 hours"
Output: {"title":"Study Chemistry","description":"Chemistry study session","activity_date":"${tomorrowStr}","start_time":"15:00:00","end_time":"17:00:00","duration_minutes":120,"activity_type":"study","subject":"Chemistry","location":null,"is_all_day":false}

Input: "Math class Monday 9am to 10:30am"
Output: {"title":"Math Class","activity_date":"2025-12-15","start_time":"09:00:00","end_time":"10:30:00","duration_minutes":90,"activity_type":"class","subject":"Math","location":null,"is_all_day":false}

Input: "Team meeting next Friday afternoon in room 205"
Output: {"title":"Team Meeting","activity_date":"2025-12-19","start_time":"14:00:00","duration_minutes":60,"activity_type":"meeting","subject":null,"location":"room 205","is_all_day":false}

Input: "finish physics homework by thursday"
Output: {"title":"Physics Homework","activity_date":"2025-12-12","activity_type":"assignment","subject":"Physics","location":null,"is_all_day":false}

Input: "basketball practice tomorrow evening"
Output: {"title":"Basketball Practice","activity_date":"${tomorrowStr}","start_time":"18:00:00","duration_minutes":90,"activity_type":"event","subject":null,"location":null,"is_all_day":false}

Input: "study session for history exam this saturday morning"
Output: {"title":"Study for History Exam","activity_date":"2025-12-14","start_time":"09:00:00","duration_minutes":120,"activity_type":"study","subject":"History","location":null,"is_all_day":false}

Input: "lunch break at noon for 30 minutes"
Output: {"title":"Lunch Break","activity_date":"${today}","start_time":"12:00:00","end_time":"12:30:00","duration_minutes":30,"activity_type":"break","subject":null,"location":null,"is_all_day":false}

Input: "CS101 lecture tuesday 2pm library"
Output: {"title":"CS101 Lecture","activity_date":"2025-12-17","start_time":"14:00:00","duration_minutes":60,"activity_type":"class","subject":"CS101","location":"library","is_all_day":false}

Input: "dentist appointment next monday at 10:30am"
Output: {"title":"Dentist Appointment","activity_date":"2025-12-16","start_time":"10:30:00","duration_minutes":60,"activity_type":"event","subject":null,"location":null,"is_all_day":false}

Input: "review algebra notes tonight at 8pm"
Output: {"title":"Review Algebra Notes","activity_date":"${today}","start_time":"20:00:00","duration_minutes":60,"activity_type":"study","subject":"Algebra","location":null,"is_all_day":false}

=== YOUR TASK ===
Parse the following activity with MAXIMUM intelligence and context awareness. Think about day of week, relative dates, time zones, and natural speech patterns:`
}

const ACTIVITY_PARSER_PROMPT = getActivityParserPrompt()

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

      // Generate fresh prompt with current date/time context
      const contextualPrompt = getActivityParserPrompt()

      console.log('🧠 Parsing activity with ULTRA-SMART AI:', userInput)

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userInput }],
          systemPrompt: contextualPrompt,
          model: 'llama-3.3-70b-versatile', // Fast and accurate
          temperature: 0.2, // Very low temperature for consistent structured output
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ AI API Error:', errorText)
        throw new Error('Failed to parse activity with AI')
      }

      const data = await response.json()
      console.log('🤖 AI Response:', data)

      const aiResponse = data.response || data.message || data.content

      if (!aiResponse) {
        console.error('❌ No response from AI:', data)
        throw new Error('No response from AI')
      }

      // Parse JSON from AI response (extract first valid JSON object)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('❌ AI response did not contain JSON:', aiResponse)
        throw new Error('AI response did not contain valid JSON')
      }

      const parsed = JSON.parse(jsonMatch[0])
      console.log('✅ Parsed activity data:', parsed)

      // Validate required fields
      if (!parsed.title) {
        throw new Error('Activity must have a title')
      }

      if (!parsed.activity_date) {
        throw new Error('Activity must have a date')
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(parsed.activity_date)) {
        console.warn('⚠️ Invalid date format, using today:', parsed.activity_date)
        parsed.activity_date = new Date().toISOString().split('T')[0]
      }

      // Validate time format if provided (HH:MM:SS)
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/
      if (parsed.start_time && !timeRegex.test(parsed.start_time)) {
        console.warn('⚠️ Invalid start_time format:', parsed.start_time)
        parsed.start_time = null
      }
      if (parsed.end_time && !timeRegex.test(parsed.end_time)) {
        console.warn('⚠️ Invalid end_time format:', parsed.end_time)
        parsed.end_time = null
      }

      // Calculate end_time from start_time + duration if not provided
      if (parsed.start_time && !parsed.end_time && parsed.duration_minutes) {
        const [hours, minutes] = parsed.start_time.split(':').map(Number)
        const startDate = new Date()
        startDate.setHours(hours, minutes, 0)
        startDate.setMinutes(startDate.getMinutes() + parsed.duration_minutes)
        parsed.end_time = startDate.toTimeString().slice(0, 8)
        console.log('📊 Calculated end_time:', parsed.end_time)
      }

      // Calculate duration from start/end if not provided
      if (parsed.start_time && parsed.end_time && !parsed.duration_minutes) {
        const [startH, startM] = parsed.start_time.split(':').map(Number)
        const [endH, endM] = parsed.end_time.split(':').map(Number)
        parsed.duration_minutes = (endH * 60 + endM) - (startH * 60 + startM)
        console.log('📊 Calculated duration:', parsed.duration_minutes, 'minutes')
      }

      // Build final activity data
      const activityData = {
        title: parsed.title,
        description: parsed.description || null,
        activity_date: parsed.activity_date,
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

      console.log('✨ Final activity data:', activityData)
      return activityData
    } catch (error) {
      console.error('❌ Failed to parse activity:', error)
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
