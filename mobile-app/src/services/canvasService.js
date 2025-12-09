// Canvas LMS API Integration Service

const CANVAS_CONFIG = {
  // User will configure their institution's Canvas domain
  baseUrl: localStorage.getItem('canvas_domain') || '',
  accessToken: localStorage.getItem('canvas_token') || '',
}

export const canvasService = {
  // Set Canvas credentials
  setCredentials(domain, token) {
    // Ensure domain has proper format
    const formattedDomain = domain.includes('http') ? domain : `https://${domain}`
    localStorage.setItem('canvas_domain', formattedDomain)
    localStorage.setItem('canvas_token', token)
    CANVAS_CONFIG.baseUrl = formattedDomain
    CANVAS_CONFIG.accessToken = token
  },

  // Check if Canvas is connected
  isConnected() {
    return !!(CANVAS_CONFIG.baseUrl && CANVAS_CONFIG.accessToken)
  },

  // Disconnect Canvas
  disconnect() {
    localStorage.removeItem('canvas_domain')
    localStorage.removeItem('canvas_token')
    localStorage.removeItem('canvas_demo_mode')
    CANVAS_CONFIG.baseUrl = ''
    CANVAS_CONFIG.accessToken = ''
  },

  // Make authenticated API request to Canvas
  async makeRequest(endpoint, options = {}) {
    if (!this.isConnected()) {
      throw new Error('Canvas not connected')
    }

    const url = `${CANVAS_CONFIG.baseUrl}/api/v1${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${CANVAS_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        mode: 'cors',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid access token. Please check your Canvas token.')
        }
        if (response.status === 403) {
          throw new Error('Access denied. Your token may not have the required permissions.')
        }
        throw new Error(`Canvas API error: ${response.status} - ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Canvas API request failed:', error)

      // Check if it's a CORS error
      if (error.message.includes('CORS') || error.name === 'TypeError') {
        throw new Error('CORS error: Canvas may be blocking browser requests. This is a browser security limitation. In production, use a backend proxy.')
      }

      throw error
    }
  },

  // Enable demo mode with mock data
  enableDemoMode() {
    localStorage.setItem('canvas_demo_mode', 'true')
    localStorage.setItem('canvas_domain', 'demo.instructure.com')
    localStorage.setItem('canvas_token', 'demo_token_' + Date.now())
    CANVAS_CONFIG.baseUrl = 'demo.instructure.com'
    CANVAS_CONFIG.accessToken = 'demo_token_' + Date.now()
  },

  // Check if in demo mode
  isDemoMode() {
    return localStorage.getItem('canvas_demo_mode') === 'true'
  },

  // Get current user info
  async getCurrentUser() {
    if (this.isDemoMode()) {
      return {
        id: 12345,
        name: 'Alex Student',
        email: 'alex.student@school.edu',
        login_id: 'astudent',
        avatar_url: null,
      }
    }
    return await this.makeRequest('/users/self')
  },

  // Get all active courses
  async getCourses() {
    if (this.isDemoMode()) {
      return [
        { id: 101, name: 'AP Chemistry', course_code: 'CHEM301' },
        { id: 102, name: 'English Literature', course_code: 'ENG201' },
        { id: 103, name: 'Calculus AB', course_code: 'MATH401' },
        { id: 104, name: 'World History', course_code: 'HIST202' },
        { id: 105, name: 'Physics', course_code: 'PHYS301' },
      ]
    }
    return await this.makeRequest('/courses?enrollment_state=active&per_page=100')
  },

  // Get assignments for all courses
  async getAllAssignments() {
    if (this.isDemoMode()) {
      const now = new Date()
      return [
        {
          id: 'canvas-1001',
          title: 'Acid-Base Titration Lab Report',
          subject: 'AP Chemistry',
          dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Complete lab report with calculations and error analysis',
          points: 100,
          submissionTypes: ['online_upload'],
          htmlUrl: '#',
          courseId: 101,
          submitted: false,
          graded: false,
          source: 'canvas',
        },
        {
          id: 'canvas-1002',
          title: 'Shakespeare Essay: Macbeth Themes',
          subject: 'English Literature',
          dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Analyze three major themes in Macbeth (5 pages)',
          points: 150,
          submissionTypes: ['online_text_entry'],
          htmlUrl: '#',
          courseId: 102,
          submitted: false,
          graded: false,
          source: 'canvas',
        },
        {
          id: 'canvas-1003',
          title: 'Integration Practice Problems',
          subject: 'Calculus AB',
          dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Complete problems 1-25 from Chapter 6',
          points: 50,
          submissionTypes: ['online_upload'],
          htmlUrl: '#',
          courseId: 103,
          submitted: false,
          graded: false,
          source: 'canvas',
        },
        {
          id: 'canvas-1004',
          title: 'WWI Causes Research Paper',
          subject: 'World History',
          dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Research and analyze the causes of World War I',
          points: 120,
          submissionTypes: ['online_upload'],
          htmlUrl: '#',
          courseId: 104,
          submitted: false,
          graded: false,
          source: 'canvas',
        },
        {
          id: 'canvas-1005',
          title: 'Newton\'s Laws Lab',
          subject: 'Physics',
          dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Complete lab on Newton\'s Laws of Motion',
          points: 80,
          submissionTypes: ['online_upload'],
          htmlUrl: '#',
          courseId: 105,
          submitted: false,
          graded: false,
          source: 'canvas',
        },
      ]
    }

    try {
      const courses = await this.getCourses()
      const allAssignments = []

      for (const course of courses) {
        try {
          const assignments = await this.makeRequest(
            `/courses/${course.id}/assignments?per_page=100`
          )

          // Transform Canvas assignments to our format
          const transformedAssignments = assignments.map(assignment => ({
            id: `canvas-${assignment.id}`,
            title: assignment.name,
            subject: course.name,
            dueDate: assignment.due_at,
            description: assignment.description,
            points: assignment.points_possible,
            submissionTypes: assignment.submission_types,
            htmlUrl: assignment.html_url,
            courseId: course.id,
            submitted: assignment.has_submitted_submissions,
            graded: !!assignment.grade,
            grade: assignment.grade,
            source: 'canvas',
          }))

          allAssignments.push(...transformedAssignments)
        } catch (error) {
          console.error(`Failed to fetch assignments for course ${course.id}:`, error)
        }
      }

      return allAssignments
    } catch (error) {
      console.error('Failed to fetch Canvas assignments:', error)
      return []
    }
  },

  // Get grades for all courses
  async getAllGrades() {
    if (this.isDemoMode()) {
      return [
        { courseId: 101, courseName: 'AP Chemistry', currentGrade: 'A-', currentScore: 91.5, finalGrade: 'A-', finalScore: 91.5 },
        { courseId: 102, courseName: 'English Literature', currentGrade: 'A', currentScore: 95.2, finalGrade: 'A', finalScore: 95.2 },
        { courseId: 103, courseName: 'Calculus AB', currentGrade: 'B+', currentScore: 88.7, finalGrade: 'B+', finalScore: 88.7 },
        { courseId: 104, courseName: 'World History', currentGrade: 'A-', currentScore: 90.1, finalGrade: 'A-', finalScore: 90.1 },
        { courseId: 105, courseName: 'Physics', currentGrade: 'B', currentScore: 85.3, finalGrade: 'B', finalScore: 85.3 },
      ]
    }

    try {
      const courses = await this.getCourses()
      const grades = []

      for (const course of courses) {
        try {
          const enrollments = await this.makeRequest(
            `/courses/${course.id}/enrollments?user_id=self`
          )

          for (const enrollment of enrollments) {
            if (enrollment.grades) {
              grades.push({
                courseId: course.id,
                courseName: course.name,
                currentGrade: enrollment.grades.current_grade,
                currentScore: enrollment.grades.current_score,
                finalGrade: enrollment.grades.final_grade,
                finalScore: enrollment.grades.final_score,
              })
            }
          }
        } catch (error) {
          console.error(`Failed to fetch grades for course ${course.id}:`, error)
        }
      }

      return grades
    } catch (error) {
      console.error('Failed to fetch Canvas grades:', error)
      return []
    }
  },

  // Get upcoming assignments (due in next 7 days)
  async getUpcomingAssignments() {
    const allAssignments = await this.getAllAssignments()
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return allAssignments
      .filter(assignment => {
        if (!assignment.dueDate) return false
        const dueDate = new Date(assignment.dueDate)
        return dueDate >= now && dueDate <= sevenDaysFromNow && !assignment.submitted
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  },

  // Submit assignment (for future use)
  async submitAssignment(courseId, assignmentId, submission) {
    return await this.makeRequest(
      `/courses/${courseId}/assignments/${assignmentId}/submissions`,
      {
        method: 'POST',
        body: JSON.stringify({ submission }),
      }
    )
  },
}

export default canvasService
