// Settings service for managing user preferences
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  name?: string;
  sleepHours?: number;
  getReadyMinutes?: number;
  commuteMinutes?: number;
}

export interface SettingsFormData {
  name: string;
  sleepHours: string;
  getReadyMinutes: string;
  commuteMinutes: string;
}

const SETTINGS_KEY = 'user_settings';

export const settingsService = {
  // Save user settings to local storage
  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  // Get user settings from local storage
  async getSettings(): Promise<UserSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  },

  // Update specific setting
  async updateSetting(key: keyof UserSettings, value: any): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, [key]: value };
      await this.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  },

  // Clear all settings
  async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error('Error clearing settings:', error);
      throw error;
    }
  },

  // Validate settings form data
  validateSettingsForm(data: SettingsFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate sleep hours (1-24)
    const sleepHours = parseInt(data.sleepHours);
    if (isNaN(sleepHours) || sleepHours < 1 || sleepHours > 24) {
      errors.push('Sleep hours must be between 1 and 24');
    }

    // Validate get ready time (0-480 minutes, i.e., 0-8 hours)
    const getReadyMinutes = parseInt(data.getReadyMinutes);
    if (isNaN(getReadyMinutes) || getReadyMinutes < 0 || getReadyMinutes > 480) {
      errors.push('Get ready time must be between 0 and 480 minutes');
    }

    // Validate commute time (0-300 minutes, i.e., 0-5 hours)
    const commuteMinutes = parseInt(data.commuteMinutes);
    if (isNaN(commuteMinutes) || commuteMinutes < 0 || commuteMinutes > 300) {
      errors.push('Commute time must be between 0 and 300 minutes');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Convert form data to settings object
  formDataToSettings(data: SettingsFormData): UserSettings {
    return {
      name: data.name.trim() || undefined,
      sleepHours: parseInt(data.sleepHours),
      getReadyMinutes: parseInt(data.getReadyMinutes),
      commuteMinutes: parseInt(data.commuteMinutes)
    };
  }
};
