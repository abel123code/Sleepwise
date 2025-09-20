// API Configuration
// This file centralizes the API base URL so it can be easily updated when ngrok URL changes
//
// TO UPDATE NGROK URL:
// 1. Start your ngrok tunnel: ngrok http 3000
// 2. Copy the new ngrok URL (e.g., https://abc123.ngrok-free.app)
// 3. Update the API_BASE_URL below with your new ngrok URL
// 4. Save this file - all API calls will now use the new URL

// Current ngrok URL - update this when your ngrok URL changes
export const API_BASE_URL = 'https://749693501703.ngrok-free.app';

// API endpoints
export const API_ENDPOINTS = {
  // Calendar endpoints
  CALENDAR: {
    DAY_EVENTS: '/calendar/day',
  },
  
  // Events endpoints
  EVENTS: {
    BREAKDOWN: '/api/events/breakdown',
  },
  
  // Calls endpoints
  CALLS: {
    TRIGGER: '/api/calls/trigger',
    STATUS: '/api/calls/status',
  },
  
  // Auth endpoints
  AUTH: {
    GOOGLE_CALLBACK: '/api/auth/callback/google',
  },
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get full endpoint URLs
export const getApiUrl = {
  calendar: {
    dayEvents: (date: string) => buildApiUrl(`${API_ENDPOINTS.CALENDAR.DAY_EVENTS}?date=${date}`),
  },
  events: {
    breakdown: () => buildApiUrl(API_ENDPOINTS.EVENTS.BREAKDOWN),
  },
  calls: {
    trigger: () => buildApiUrl(API_ENDPOINTS.CALLS.TRIGGER),
    status: (callId: string) => buildApiUrl(`${API_ENDPOINTS.CALLS.STATUS}/${callId}`),
  },
  auth: {
    googleCallback: () => buildApiUrl(API_ENDPOINTS.AUTH.GOOGLE_CALLBACK),
  },
};
