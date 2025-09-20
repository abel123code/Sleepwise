// Calendar API service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/api';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  description?: string;
  location?: string;
  status?: string;
  htmlLink?: string;
  creator?: {
    email: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

export interface CalendarResponse {
  date: string;
  tz: string;
  calendarId: string;
  items: CalendarEvent[];
}

export interface Subtask {
  id: string;
  text: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

export interface BreakdownResponse {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  subtasks: Subtask[];
  generatedAt: string;
}

export const calendarService = {
  async getDayEvents(date: string): Promise<CalendarResponse> {
    try {
      const url = getApiUrl.calendar.dayEvents(date);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },

  // Helper function to get tomorrow's date in YYYY-MM-DD format
  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },

  // Helper function to format time from ISO string
  formatTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  // Helper function to format date from ISO string
  formatDate(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Break down event into subtasks
  async breakDownEvent(event: CalendarEvent): Promise<BreakdownResponse> {
    try {
      const url = getApiUrl.events.breakdown();
      
      // Calculate duration in minutes
      const startTime = new Date(event.start.dateTime || event.start.date || '');
      const endTime = new Date(event.end.dateTime || event.end.date || '');
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const requestBody = {
        title: event.summary,
        date: event.start.dateTime ? event.start.dateTime.split('T')[0] : event.start.date,
        startTime: event.start.dateTime ? event.start.dateTime.split('T')[1]?.split('+')[0] : '00:00:00',
        endTime: event.end.dateTime ? event.end.dateTime.split('T')[1]?.split('+')[0] : '23:59:59',
        duration: duration,
        description: event.description || '',
        location: event.location || '',
        eventType: 'meeting' // Default, could be enhanced
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error breaking down event:', error);
      throw error;
    }
  },

  // Local storage functions
  async saveEventBreakdown(eventId: string, selectedSubtasks: Subtask[]): Promise<void> {
    try {
      const breakdown = {
        eventId,
        subtasks: selectedSubtasks,
        savedAt: new Date().toISOString()
      };
      
      const existing = await this.getEventBreakdowns();
      existing[eventId] = breakdown;
      
      await AsyncStorage.setItem('eventBreakdowns', JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving event breakdown:', error);
    }
  },

  async getEventBreakdowns(): Promise<{ [eventId: string]: any }> {
    try {
      const stored = await AsyncStorage.getItem('eventBreakdowns');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting event breakdowns:', error);
      return {};
    }
  },

  async getEventBreakdown(eventId: string): Promise<any> {
    const breakdowns = await this.getEventBreakdowns();
    return breakdowns[eventId] || null;
  },

  // Clear all event breakdowns
  async clearAllBreakdowns(): Promise<void> {
    try {
      await AsyncStorage.removeItem('eventBreakdowns');
    } catch (error) {
      console.error('Error clearing breakdowns:', error);
    }
  },

  // Clear breakdown for a specific event
  async clearEventBreakdown(eventId: string): Promise<void> {
    try {
      const existing = await this.getEventBreakdowns();
      delete existing[eventId];
      await AsyncStorage.setItem('eventBreakdowns', JSON.stringify(existing));
    } catch (error) {
      console.error('Error clearing event breakdown:', error);
    }
  },

  // Update completion status of subtasks
  async updateSubtasksCompletion(eventId: string, updatedSubtasks: Subtask[]): Promise<void> {
    try {
      const existing = await this.getEventBreakdowns();
      if (existing[eventId]) {
        existing[eventId].subtasks = updatedSubtasks;
        existing[eventId].lastUpdated = new Date().toISOString();
        await AsyncStorage.setItem('eventBreakdowns', JSON.stringify(existing));
      }
    } catch (error) {
      console.error('Error updating subtasks completion:', error);
    }
  }
};
