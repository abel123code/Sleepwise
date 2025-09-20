import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserSettings } from '@/services/settingsService';

interface WelcomeMessageProps {
  settings: UserSettings;
  onOpenSettings: () => void;
}

export default function WelcomeMessage({ settings, onOpenSettings }: WelcomeMessageProps) {
  return (
    <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 shadow-sm border border-blue-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-800 mb-1">
            {settings.name ? `Welcome back, ${settings.name}! 👋` : 'Welcome back! 👋'}
          </Text>
          <Text className="text-sm text-gray-600">
            Ready to plan your day?
          </Text>
        </View>
        <TouchableOpacity
          onPress={onOpenSettings}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white text-sm font-semibold">
            ⚙️ Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
