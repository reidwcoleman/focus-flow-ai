/**
 * Streak Service - Track daily login streaks
 */

import supabase from '../lib/supabase'

class StreakService {
  /**
   * Check and update user's login streak
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated streak data
   */
  async checkAndUpdateStreak(userId) {
    try {
      // Get current profile with streak data
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('current_streak, longest_streak, last_login_date')
        .eq('id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

      // If no profile exists yet, create with initial streak
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            current_streak: 1,
            longest_streak: 1,
            last_login_date: today,
          })
          .select('current_streak, longest_streak, last_login_date')
          .single()

        if (createError) throw createError
        return {
          currentStreak: 1,
          longestStreak: 1,
          isNewStreak: true,
        }
      }

      // If last login was today, no change needed
      if (profile.last_login_date === today) {
        return {
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.longest_streak || 0,
          isNewStreak: false,
        }
      }

      // Calculate if streak continues or breaks
      let newStreak = 1
      let isNewStreak = false

      if (profile.last_login_date) {
        const lastLoginDate = new Date(profile.last_login_date + 'T00:00:00')
        const todayDate = new Date(today + 'T00:00:00')
        const diffTime = todayDate - lastLoginDate
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          // Consecutive day - increment streak
          newStreak = (profile.current_streak || 0) + 1
          isNewStreak = true
        } else {
          // Streak broken - reset to 1
          newStreak = 1
        }
      }

      // Update longest streak if current is higher
      const newLongestStreak = Math.max(newStreak, profile.longest_streak || 0)

      // Update profile with new streak data
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_login_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) throw updateError

      console.log('🔥 Streak updated:', {
        current: newStreak,
        longest: newLongestStreak,
        isNew: isNewStreak,
      })

      return {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        isNewStreak,
      }
    } catch (error) {
      console.error('❌ Failed to update streak:', error)
      // Return defaults on error - don't break the app
      return {
        currentStreak: 0,
        longestStreak: 0,
        isNewStreak: false,
      }
    }
  }

  /**
   * Get current streak data for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Streak data
   */
  async getStreak(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('current_streak, longest_streak, last_login_date')
        .eq('id', userId)
        .single()

      if (error) throw error

      return {
        currentStreak: data?.current_streak || 0,
        longestStreak: data?.longest_streak || 0,
        lastLoginDate: data?.last_login_date,
      }
    } catch (error) {
      console.error('Failed to get streak:', error)
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
      }
    }
  }
}

export default new StreakService()
