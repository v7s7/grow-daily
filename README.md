# 🌱 GrowDaily

**A modern, gamified habit tracker designed to help you build consistency and reach your goals every single day.**

GrowDaily combines daily task tracking with powerful progression systems, insights, and motivational features to keep you engaged and growing.

---

## ✨ Features

### 🎯 Core Functionality
- **Daily Task Tracking**: Track habits like Quran, Gym, Study, Water intake, Sleep, Phone usage, and more
- **Customizable Plans**: Select which tasks you want to track from categorized lists
- **Streak System**: Build and maintain daily streaks to stay consistent
- **Points & Rewards**: Earn points for completing tasks and maintaining streaks

### 🎮 Progression & Gamification
- **Levels & XP**: Gain experience points and level up as you complete tasks
- **Rank System**: Progress from Beginner → Apprentice → Advanced → Expert → Master → Legendary
- **Achievements**: Unlock 20+ achievements for milestones, consistency, and special accomplishments
- **Perfect Day Tracking**: Get bonus XP for completing all tasks in a day

### 📊 Insights & Analytics
- **Insights Dashboard**: View comprehensive statistics about your progress
- **Task Breakdown**: See which tasks you complete most frequently
- **Calendar View**: Visual representation of your completion history
- **Streak Analytics**: Track current streak, best streak, and perfect days

### 🔔 Smart Notifications
- **Morning Motivation**: Optional wake-up reminders
- **Evening Reminders**: Get notified if you haven't completed tasks (8 PM)
- **Streak Protection**: Late-night alerts to protect your streak (11:45 PM)
- **Achievement Celebrations**: Instant notifications when you unlock achievements

### 🎨 Modern Design
- **Premium UI**: Clean, calm interface with smooth animations
- **Dark Theme**: Eye-friendly dark mode with gold accents
- **Fully Responsive**: Perfect on all devices (mobile, tablet, desktop)
- **Accessibility**: Keyboard navigation, proper contrast, ARIA labels

### 💾 Data Management
- **Cloud Sync**: All data synced to Firebase
- **Export/Import**: Backup your data as JSON or CSV
- **Offline Support**: Core functionality works offline with sync

### 🌍 Internationalization
- **English & Arabic**: Full bilingual support with RTL layout for Arabic
- **Islamic Features**: Special support for Quran and Athkar (prayer) tracking

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/grow-daily.git
   cd grow-daily
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Copy your Firebase configuration

4. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase credentials:
     ```env
     REACT_APP_FIREBASE_API_KEY=your_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     ```

5. **Run the development server**
   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `build/` directory.

---

## 📱 Usage Guide

### First Time Setup
1. **Sign up** for an account with your email and password
2. **Choose your plan** - select which tasks you want to track
3. **Start tracking** - complete tasks daily to build streaks

### Daily Workflow
1. **Check your dashboard** - see progress and remaining tasks
2. **Complete tasks** - tap a task card and fill in details (duration, rating, etc.)
3. **Track progress** - watch your streak grow and earn achievements
4. **View insights** - analyze your performance in the Insights page

### Key Pages

| Page | Purpose |
|------|---------|
| **Home** | Dashboard showing daily progress, streak, and task grid |
| **Insights** | Detailed statistics, achievements, and analytics |
| **Calendar** | Visual history of completed days |
| **Settings** | Customize your plan, language, and preferences |
| **To-Do List** | Separate task list for general todos |
| **Task Control** | Eisenhower Matrix for priority management |

---

## 🎖️ Achievement System

Unlock achievements by completing milestones:

### Beginner
- **First Steps** (100 XP): Complete your first task
- **Perfect Day** (300 XP): Complete all tasks in a single day

### Streaks
- **Week Warrior** (500 XP): 7-day streak
- **Monthly Master** (2,000 XP): 30-day streak
- **Century Champion** (10,000 XP): 100-day streak

### Perfection
- **Perfect Week** (1,500 XP): Complete all tasks for 7 consecutive days
- **Perfect Month** (5,000 XP): Complete all tasks for 30 consecutive days

### Task-Specific
- **Quran Devotee** (1,000 XP): Complete Quran task 30 times
- **Gym Beast** (1,000 XP): Complete gym task 50 times
- **Study Scholar** (1,000 XP): Complete study task 50 times

### Special
- **Explorer** (300 XP): Try all available tasks
- **Comeback Kid** (200 XP): Rebuild a streak after breaking it

---

## 🛠️ Tech Stack

- **Frontend**: React 19.1
- **Routing**: React Router v7
- **Styling**: Styled Components + Custom CSS
- **Backend**: Firebase (Auth + Firestore)
- **State**: React Hooks + Context + Local Storage
- **Build Tool**: Create React App
- **Deployment**: Firebase Hosting / Vercel / Netlify

---

## 📂 Project Structure

```
grow-daily/
├── public/              # Static assets
│   └── icons/           # Task icons
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── tasks/       # Task-specific pages
│   │   ├── HomePage.js
│   │   ├── InsightsPage.js
│   │   ├── AuthPage.js
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   ├── progressionSystem.js   # XP, levels, achievements
│   │   ├── notifications.js       # Smart notifications
│   │   ├── dataExport.js          # Export/import
│   │   └── constants.js
│   ├── theme.js         # Design system tokens
│   ├── firebaseConfig.js
│   ├── App.js           # Main app with routing
│   └── index.js
├── .env.local           # Environment variables (not committed)
├── .env.example         # Example env file
├── package.json
└── README.md
```

---

## 🔐 Security

- **Environment Variables**: Sensitive Firebase config stored in `.env.local` (gitignored)
- **Authentication**: Firebase Auth with secure password requirements
- **Data Privacy**: User data isolated by Firebase security rules
- **Client-side Validation**: Input validation on all forms

---

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Icons from various sources
- Inspiration from habit tracking apps like Habitica, Streaks, and Productive
- Firebase for backend infrastructure

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@growdaily.app (if applicable)

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] Social features (friend streaks, leaderboards)
- [ ] Custom task creation
- [ ] Habit templates
- [ ] Weekly/monthly challenges
- [ ] Dark/light theme toggle
- [ ] More achievement categories
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

---

**Built with ❤️ for personal growth and consistent habits.**

**Start your growth journey today with GrowDaily!** 🌱
