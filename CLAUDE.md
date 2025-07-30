# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern dashboard application for Windows and Mac with a beautiful dark interface. The project aims to create a comprehensive desktop dashboard that integrates multiple information sources and utilities.

### Features
- **Newsfeeds**: RSS feeds with category filtering and source management
- **Weather Widget**: Advanced weather with forecasts, multiple locations, and API integration
- **Travel & Commute**: Route planning with departure/destination management and public transport
- **Quick Access Shortcuts**: Customizable shortcuts with icons, colors, and easy editing
- **Todo Management**: Full CRUD task management with localStorage persistence
- **Theme System**: Multiple themes including dark, light, and auto modes
- **Livestreams**: IPTV, YouTube, and embedded livestream support
- **AI Chat**: Integrated AI assistant for productivity
- **Mini Games**: Entertainment widgets including Snake and 2048
- **Dynamic Tiles**: Drag-and-drop, resizable tiles with fullscreen support

## Project Status

✅ **v1.1.0** - Enhanced dashboard with theme system, improved UX, and advanced features

## Development Setup

### Installation
```bash
npm install
```

### Development Commands
- `npm run dev` - Start the app in development mode with DevTools
- `npm start` - Start the app in production mode
- `npm run build` - Build for all platforms
- `npm run build-win` - Build for Windows
- `npm run build-mac` - Build for Mac
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Tech Stack
- **Framework**: Tauri for native performance with web UI
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Icons**: Lucide React
- **Storage**: localStorage for todos and shortcuts
- **HTTP**: Axios for API requests (ready for real data sources)

## Architecture

Cross-platform desktop application built with Tauri + React for optimal performance and beautiful UI.

### Current Implementation
- **Dashboard Grid Layout**: Responsive 12-column grid with glassmorphism effects
- **News Feeds Component**: Mock data with smooth loading states and category filters
- **Weather Widget**: Animated weather display with detailed metrics
- **Interactive Todo List**: Full CRUD operations with localStorage persistence
- **Quick Access Shortcuts**: Customizable shortcuts with icon and color options
- **Dark Theme**: Modern dark UI with smooth transitions and hover effects

### Directory Structure
```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard layout
│   ├── NewsFeeds.tsx    # News feeds with filtering
│   ├── WeatherWidget.tsx # Weather display
│   ├── TodoList.tsx     # Task management
│   └── Shortcuts.tsx    # Quick access links
├── hooks/              # Custom React hooks (ready for expansion)
├── utils/              # Utility functions (ready for expansion)
├── types/              # TypeScript type definitions (ready for expansion)
├── App.tsx             # Root component
├── main.tsx            # React entry point
└── index.css           # Global styles with Tailwind

src-tauri/              # Tauri backend (Rust)
├── src/main.rs         # Tauri main process
├── Cargo.toml          # Rust dependencies
└── tauri.conf.json     # Tauri configuration
```

### v1.1.0 Features Implemented
✅ **Enhanced Theme System**: Dark, light, and auto themes with dynamic switching
✅ **Improved Drag & Drop**: Better tile dragging with visual feedback and touch support
✅ **Advanced Weather Widget**: Hourly/weekly forecasts, multiple locations, weather alerts
✅ **Public Transport Integration**: Real-time transit data and multi-modal route planning
✅ **Enhanced Travel Widget**: Departure/destination management with location swapping
✅ **Fixed Quick Links**: Resolved disappearing edit buttons with improved hover states
✅ **News Feed Enhancements**: Better height constraints and source management
✅ **Tile Management**: Resizable tiles with dynamic size controls
✅ **Performance Optimizations**: Faster loading and better responsive design

### Previous Features (v1.0.0)
✅ Beautiful dark theme with glassmorphism effects
✅ Smooth animations and transitions  
✅ Responsive 12-column grid layout
✅ News feeds with category filtering
✅ Weather widget with animated icons
✅ Full-featured todo list with localStorage
✅ Customizable shortcuts with icons and colors
✅ Interactive tile system with fullscreen support

## Notes

- The repository has Claude Code permissions configured to allow `find` and `ls` bash commands
- Update this file as the project structure and development practices are established