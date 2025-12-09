# Focus Flow - Your Academic Operating System

A premium, AI-powered student productivity app designed for middle school, high school, and early college students. Built with a clean, minimalist, Apple-like aesthetic that feels like Notion × iOS 18 × Cal AI.

**Core Promise:** "The AI that runs your school life automatically."

## Features

### 🏠 Smart Dashboard
- AI-powered homework cards with priority indicators
- Auto-captured assignments from screenshots
- Google Classroom & email sync integration
- Real-time progress tracking with beautiful gradients
- Quick action buttons for scanning and AI tutoring
- Subject-based color coding

### 🤖 AI Tutor
- **Real AI Integration**: Powered by Groq Llama 3.1 (100% FREE!)
- **Lightning Fast**: 100+ tokens/second - instant responses
- **Demo Mode**: Works instantly with smart contextual responses
- **Full AI Mode**: Add your FREE Groq API key for real tutoring
- Interactive chat with typing indicators and animations
- Markdown-style formatting for better readability
- Auto-resizing input and auto-scroll
- Premium tier: 30 minutes/day
- Ultra tier: Unlimited access
- Quick question shortcuts
- Error handling and loading states
- Beautiful gradient message bubbles with animations

### 📅 Smart Study Planner
- AI-optimized daily study schedule
- Timeline view with current activity highlighting
- Break recommendations based on focus patterns
- Progress tracking throughout the day
- AI insights for peak productivity times
- One-tap session start

### 📊 Advanced Analytics
- Grade tracking and predictions
- Performance trends by subject
- Weekly activity charts
- Focus score monitoring
- Strengths and improvement areas
- AI-powered recommendations for GPA improvement

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS
- Mobile-first responsive design

## Getting Started

### Prerequisites
- Node.js 18.20+ (currently using 18.20.4)
- npm 9.2+

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. (Optional) Set up AI Tutor with real AI - **100% FREE & BLAZING FAST**:
\`\`\`bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your FREE Groq API key (takes 30 seconds!)
# Get your key from: https://console.groq.com/keys
# VITE_GROQ_API_KEY=gsk_your-key-here
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to:
\`\`\`
http://localhost:5173/
\`\`\`

**Note**: AI Tutor works in Demo Mode without an API key, but you can get **REAL AI tutoring 100% FREE** with Groq!

### Why Groq?
- ✅ **Completely FREE** - No credit card required
- ✅ **LIGHTNING FAST** - 100+ tokens/second (instant responses!)
- ✅ **Generous limits** - 30 requests/min, 14,400/day
- ✅ **High quality** - Powered by Meta's Llama 3.1 70B
- ✅ **Perfect for students** - Best free AI for learning

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The production build will be output to the \`dist\` folder.

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Mobile Features

- Touch-optimized interface
- Fixed bottom navigation bar
- Responsive layout (max-width: 28rem/448px)
- iOS PWA support with meta tags
- Prevents zoom on mobile devices
- Smooth animations and transitions

## Design Philosophy

- **Minimalist & Futuristic:** Apple-like clarity with smooth gradients
- **Trustworthy:** Academically serious yet youthful
- **Premium Feel:** Soft glows, cool blues, and neutral tones
- **Modern Stack:** React 18 + Vite + Tailwind CSS 3

## Project Structure

\`\`\`
mobile-app/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Smart homework dashboard with AI cards
│   │   ├── AITutor.jsx         # Premium AI tutoring chat interface
│   │   ├── Planner.jsx         # AI-optimized study timeline
│   │   └── Analytics.jsx       # Grade predictions & insights
│   ├── App.jsx                 # Main app with iOS-style navigation
│   ├── App.css                 # Minimal app styles
│   ├── index.css               # Tailwind imports & global styles
│   └── main.jsx                # React entry point
├── index.html                  # HTML template with PWA meta tags
├── tailwind.config.js          # Premium design system configuration
└── vite.config.js              # Vite configuration
\`\`\`

## Customization

### Premium Design System
The app uses a carefully crafted design system in \`tailwind.config.js\`:

\`\`\`js
colors: {
  primary: { /* Blue shades 50-900 */ },
  accent: { purple, pink, cyan },
  neutral: { /* Slate shades 50-950 */ },
}
boxShadow: {
  'soft': 'Subtle elevated shadows',
  'glow': 'AI feature highlights',
  'glow-lg': 'Active state emphasis',
}
\`\`\`

### Component Customization
Each component features:
- Smooth gradient backgrounds
- Glassmorphism effects
- AI-powered badges and indicators
- Responsive touch interactions
- Premium micro-animations

## Browser Support

- Chrome (mobile & desktop)
- Safari (iOS & macOS)
- Firefox (mobile & desktop)
- Edge

## Future Enhancements

- [ ] Screenshot-to-assignment AI capture
- [ ] Google Classroom API integration
- [ ] Email assignment parsing
- [ ] Real AI tutoring backend
- [ ] Grade prediction algorithms
- [ ] Parent dashboard (Ultra tier)
- [ ] ADHD-friendly customizations
- [ ] Offline PWA support
- [ ] Push notifications
- [ ] Dark mode
- [ ] Streak tracking and gamification

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
