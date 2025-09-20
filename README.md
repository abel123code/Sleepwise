# WTH MVP - Sleep Optimizer & AI Counselling App

## 🎯 Project Overview

This is a React Native mobile application built with Expo that provides sleep optimization and AI counselling features. The app integrates with Google Calendar to analyze your schedule and provide personalized sleep recommendations.

### Key Features

- **📅 Calendar Integration**: Fetches Google Calendar events to analyze your schedule
- **😴 Sleep Optimizer**: Calculates optimal bedtime and wake-up times based on your events
- **⏰ Android Alarm Integration**: Sets alarms directly on Android devices
- **🧘‍♀️ AI Counselling**: Personal AI counselling support with call functionality
- **⚙️ Personalized Settings**: Customizable sleep, commute, and preparation times

## 🏗️ Architecture

The application consists of two main components:

### Frontend (React Native + Expo)

- **Location**: `frontend/` directory
- **Framework**: Expo React Native with TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Storage**: AsyncStorage for user preferences

### Backend (Node.js + Express)

- **Location**: `backend/` directory
- **Framework**: Node.js with Express
- **Google Integration**: Google Calendar API
- **Authentication**: OAuth 2.0 for Google services
- **API Endpoints**: RESTful API for calendar data

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- ngrok account (for tunneling)
- Google Cloud Console project with Calendar API enabled

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Google Calendar API**:

   - Create a Google Cloud Console project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Download credentials and place in backend directory

4. **Start the backend server**:

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

5. **Start ngrok tunnel** (in a separate terminal):
   ```bash
   ngrok http 3000
   ```
   This creates a public URL (e.g., `https://abc123.ngrok-free.app`) that exposes your local server.

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Update API configuration**:

   - Open `frontend/config/api.ts`
   - **IMPORTANT**: Update `API_BASE_URL` with your ngrok URL from step 5 of backend setup:

   ```typescript
   export const API_BASE_URL = "https://your-ngrok-url.ngrok-free.app";
   ```

   **Example**: If your ngrok URL is `https://abc123.ngrok-free.app`, then:

   ```typescript
   export const API_BASE_URL = "https://abc123.ngrok-free.app";
   ```

   ⚠️ **Critical**: The app will not work without this configuration update!

4. **Start the Expo development server**:

   ```bash
   npm run start
   ```

5. **Run on device/emulator**:
   - Scan QR code with Expo Go app (for physical device)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 📱 APK Generation

### Why the APK Won't Work Standalone

The generated APK file contains the frontend application but **requires a live backend server** to function properly. Here's why:

1. **API Dependencies**: The app makes HTTP requests to backend endpoints for:

   - Fetching Google Calendar events
   - Processing sleep optimization calculations
   - Managing user settings

2. **Google Calendar Integration**: The backend handles:

   - OAuth 2.0 authentication with Google
   - Calendar API calls
   - Data processing and formatting

3. **Real-time Data**: The app needs live calendar data to provide accurate sleep recommendations

### To Generate APK (for demonstration purposes):

```bash
cd frontend
npx expo build:android
```

**Note**: This APK will only work when:

- The backend server is running (`npm run dev`)
- ngrok tunnel is active (`ngrok http 3000`)
- The frontend's API configuration points to the correct ngrok URL

## 🔧 Configuration Files

### Frontend Configuration

- **`frontend/config/api.ts`**: API base URL and endpoint definitions
- **`frontend/constants/theme.ts`**: App theme and color definitions
- **`frontend/services/`**: API service functions and data management

### ⚠️ Critical Configuration Step

**The most important configuration step is updating the API URL in `frontend/config/api.ts`:**

1. After starting ngrok (`ngrok http 3000`), copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
2. Open `frontend/config/api.ts`
3. Replace the `API_BASE_URL` value with your ngrok URL:

```typescript
// Before (example)
export const API_BASE_URL = "https://749693501703.ngrok-free.app";

// After (your ngrok URL)
export const API_BASE_URL = "https://your-actual-ngrok-url.ngrok-free.app";
```

**Without this step, the app will show network errors and cannot fetch calendar data!**

### Backend Configuration

- **`backend/server.js`**: Main server file with Express setup
- **`backend/src/routes/`**: API route definitions
- **`backend/package.json`**: Dependencies and scripts

## 📊 API Endpoints

The backend provides the following endpoints:

- **`GET /calendar/day?date=YYYY-MM-DD`**: Fetch calendar events for a specific date
- **`POST /calls/trigger`**: Trigger AI counselling call functionality
- **`GET /events/breakdown`**: Get detailed event breakdown

## 🎨 UI Components

### Main Screens

- **Calendar Tab**: Displays calendar events with personalized welcome message
- **Call Tab**: AI counselling support with phone number input
- **Sleep Tab**: Sleep optimizer with bedtime/wake-up calculations

### Key Components

- **`SettingsModal`**: User preferences configuration
- **`WelcomeMessage`**: Personalized greeting with settings access
- **`SleepOptimizerScreen`**: Main sleep calculation and alarm setting interface

## 🔐 Security & Privacy

- **OAuth 2.0**: Secure Google Calendar authentication
- **Local Storage**: User preferences stored locally on device

## 📝 Development Notes

### For Judges/Demo Purposes

This application demonstrates:

- **Full-stack mobile development** with React Native and Node.js
- **Third-party API integration** with Google Calendar
- **Cross-platform compatibility** (iOS/Android)
- **Real-time data processing** and user personalization
- **Native device integration** (Android alarm setting)

The APK file is generated for demonstration purposes but requires the full development environment to function as intended.

## 🚀 Future Enhancements

- iOS alarm integration
- Push notifications for sleep reminders
- Sleep tracking integration
- Advanced AI counselling features
- Offline mode with cached data

---

**Built with ❤️ using Expo, React Native, and Node.js**
