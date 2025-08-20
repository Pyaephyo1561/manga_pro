# Manga Reader Website

A modern, responsive manga reader website built with React.js, featuring a beautiful UI and smooth user experience.

## Features

- 🏠 **Home Page**: Featured manga, recent updates, and popular series
- 🔍 **Search & Filter**: Advanced search with multiple filter options
- 📚 **Manga Details**: Comprehensive information about each manga series
- 📖 **Reader**: Full-featured manga reader with zoom, navigation, and reading modes
- ❤️ **Library**: Personal favorites and reading history management
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Beautiful design with smooth animations and transitions

## Tech Stack

- **Frontend**: React.js 18
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Create React App

## Screenshots

### Home Page
- Hero section with call-to-action
- Featured manga grid
- Recent updates section
- Popular manga recommendations

### Manga Details
- Cover image and information
- Rating and status
- Chapter list with navigation
- Genre tags and descriptions

### Reader
- Full-screen reading experience
- Zoom controls (50% - 200%)
- Page navigation with keyboard support
- Reading mode selection (vertical/horizontal)

### Search & Library
- Advanced search functionality
- Multiple filter options
- Grid and list view modes
- Personal library management

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd manga-reader
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Navigation bar component
│   └── MangaCard.js    # Manga card component
├── pages/              # Page components
│   ├── Home.js         # Home page
│   ├── MangaDetail.js  # Manga details page
│   ├── Reader.js       # Manga reader page
│   ├── Search.js       # Search page
│   └── Library.js      # Library page
├── App.js              # Main app component with routing
├── index.js            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## Features in Detail

### Navigation
- Responsive navigation bar
- Mobile-friendly hamburger menu
- Active page highlighting
- Smooth transitions

### Manga Cards
- Hover effects and animations
- Rating display with stars
- Status indicators
- Genre tags
- Chapter count and last update

### Search Functionality
- Real-time search
- Multiple filter options:
  - Status (Ongoing, Completed, Hiatus)
  - Genre (Action, Adventure, Comedy, etc.)
  - Year (2015-2024)
  - Minimum rating (3.0+ to 4.5+)
- Search by title, description, or genre

### Reader Experience
- **Zoom Controls**: 50% to 200% zoom levels
- **Navigation**: Arrow keys, click navigation, and progress bar
- **Reading Modes**: Vertical and horizontal scrolling
- **Fullscreen**: Immersive reading experience
- **Keyboard Shortcuts**: Arrow keys for navigation

### Library Management
- **Favorites**: Save and organize favorite manga
- **Reading History**: Track your reading progress
- **View Modes**: Grid and list layouts
- **Search & Filter**: Find manga in your library
- **Management**: Remove items and clear history

## Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    // ... more shades
  },
  dark: {
    50: '#f8fafc',
    100: '#f1f5f9',
    // ... more shades
  }
}
```

### Animations
Animation settings can be adjusted in the Tailwind config:

```javascript
animation: {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
}
```

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Reading progress tracking
- [ ] Offline reading support
- [ ] Multiple language support
- [ ] Dark/light theme toggle
- [ ] Social features (comments, ratings)
- [ ] Recommendation system
- [ ] Advanced reading options

## Backend Integration

This is currently a frontend-only application with mock data. To integrate with a backend:

1. Replace mock data with API calls
2. Implement user authentication
3. Add data persistence
4. Set up image hosting for manga covers and pages
5. Implement real-time updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by [Lucide React](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Styling framework: [Tailwind CSS](https://tailwindcss.com/)

## Support

If you encounter any issues or have questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include browser version and device information
4. Provide steps to reproduce the problem

---

**Happy Reading! 📚✨**
# manga-app
