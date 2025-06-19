# Design Thinking - User Research Tool

A Vue.js application that helps UX researchers, designers, and product teams map user journeys using the Design Thinking methodology. This tool enables you to organize user research findings across different phases of the user experience, categorizing insights into Thinking 🧠, Doing ✋, and Feeling 💭.

## What This App Helps With

### User Journey Mapping

- **Phase-based organization**: Create and customize phases of your user journey (e.g., Discovery, Onboarding, Usage, Support)
- **Three-dimensional analysis**: Map user insights across three key dimensions:
  - **Thinking** 🧠: What users are thinking, their mental models, and cognitive processes
  - **Doing** ✋: What users are actually doing, their actions and behaviors
  - **Feeling** 💭: How users feel emotionally during each phase

### Research Workflow

- **Drag-and-drop interface**: Easily move notepads between phases and categories
- **Real-time editing**: Edit notes directly in the interface
- **Data persistence**: Your work is automatically saved locally
- **Export functionality**: Export your research data for further analysis

### Use Cases

- **UX Research**: Organize findings from user interviews and usability studies
- **Design Thinking Workshops**: Facilitate collaborative mapping sessions
- **Product Development**: Align team understanding of user needs and pain points
- **Journey Mapping**: Create comprehensive user journey maps for service design

## Features

- ✨ **Interactive drag-and-drop** interface for organizing research notes
- 📝 **Real-time editing** of notepads with auto-save
- 🔄 **Flexible phase management** - add, remove, and rename phases
- 📊 **Three-dimensional categorization** (Thinking, Doing, Feeling)
- 💾 **Local data persistence** - your work is automatically saved
- 📤 **Data export** functionality
- 📱 **Responsive design** that works on desktop and tablet
- 🎨 **Modern, intuitive UI** with smooth animations

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

You can check your versions by running:

```bash
node --version
npm --version
```

## Installation & Setup

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd design-thinking-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

To start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Production Build

To build the application for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## How to Use the App

1. **Add Phases**: Click "Add Phase" to create new phases in your user journey
2. **Create Notepads**: Use the sidebar to add new notepads with your research findings
3. **Organize Insights**: Drag notepads from the sidebar to the appropriate phase and category (Thinking, Doing, or Feeling)
4. **Edit Content**: Click on any notepad to edit its content
5. **Export Data**: Use the "Export Data" button to save your research for further analysis

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint to check code quality
- `npm run format` - Format code with Prettier

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Vue Draggable** - Drag and drop functionality
- **VueUse** - Vue composition utilities

## Browser Support

This application works best in modern browsers that support ES6+ features:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
