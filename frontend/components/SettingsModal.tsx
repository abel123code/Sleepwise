import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { settingsService, SettingsFormData, UserSettings } from '@/services/settingsService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
}

export default function SettingsModal({ visible, onClose, onSave }: SettingsModalProps) {
  const [formData, setFormData] = useState<SettingsFormData>({
    name: '',
    sleepHours: '8',
    getReadyMinutes: '30',
    commuteMinutes: '15'
  });
  const [loading, setLoading] = useState(false);

  // Load existing settings when modal opens
  useEffect(() => {
    if (visible) {
      loadExistingSettings();
    }
  }, [visible]);

  const loadExistingSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      setFormData({
        name: settings.name || '',
        sleepHours: settings.sleepHours?.toString() || '8',
        getReadyMinutes: settings.getReadyMinutes?.toString() || '30',
        commuteMinutes: settings.commuteMinutes?.toString() || '15'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    // Validate form data
    const validation = settingsService.validateSettingsForm(formData);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      const settings = settingsService.formDataToSettings(formData);
      await settingsService.saveSettings(settings);
      onSave(settings);
      onClose();
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Settings',
      'Are you sure you want to clear all your settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsService.clearSettings();
              setFormData({
                name: '',
                sleepHours: '8',
                getReadyMinutes: '30',
                commuteMinutes: '15'
              });
              onClose();
              Alert.alert('Success', 'Settings cleared successfully!');
            } catch (error) {
              console.error('Error clearing settings:', error);
              Alert.alert('Error', 'Failed to clear settings.');
            }
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="flex-1 px-6 py-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-8">
                <View>
                  <Text className="text-3xl font-bold text-gray-800">
                    ⚙️ Settings
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    Personalize your experience
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-gray-200"
                >
                  <Text className="text-gray-600 text-xl font-semibold">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Personal Information Section */}
              <View className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                <View className="flex-row items-center mb-6">
                  <View className="bg-blue-100 rounded-full p-3 mr-4">
                    <Text className="text-2xl">👤</Text>
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-gray-800">
                      Personal Information
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Tell us about yourself
                    </Text>
                  </View>
                </View>
                
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    Your Name (Optional)
                  </Text>
                  <TextInput
                    className="border-2 border-gray-200 rounded-xl px-4 py-4 text-lg bg-gray-50 focus:border-blue-400 focus:bg-white"
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  <Text className="text-xs text-gray-500 mt-2 flex-row items-center">
                    💡 This will personalize your welcome message
                  </Text>
                </View>
              </View>

              {/* Daily Routine Section */}
              <View className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                <View className="flex-row items-center mb-6">
                  <View className="bg-green-100 rounded-full p-3 mr-4">
                    <Text className="text-2xl">🕐</Text>
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-gray-800">
                      Daily Routine
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Help us understand your schedule
                    </Text>
                  </View>
                </View>
                
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    How many hours of sleep do you need?
                  </Text>
                  <TextInput
                    className="border-2 border-gray-200 rounded-xl px-4 py-4 text-lg bg-gray-50 focus:border-green-400 focus:bg-white"
                    placeholder="8"
                    placeholderTextColor="#9CA3AF"
                    value={formData.sleepHours}
                    onChangeText={(text) => setFormData({ ...formData, sleepHours: text })}
                    keyboardType="numeric"
                    autoCorrect={false}
                  />
                  <Text className="text-xs text-gray-500 mt-2 flex-row items-center">
                    😴 Hours (1-24)
                  </Text>
                </View>

                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    How long does it take you to get ready?
                  </Text>
                  <TextInput
                    className="border-2 border-gray-200 rounded-xl px-4 py-4 text-lg bg-gray-50 focus:border-green-400 focus:bg-white"
                    placeholder="30"
                    placeholderTextColor="#9CA3AF"
                    value={formData.getReadyMinutes}
                    onChangeText={(text) => setFormData({ ...formData, getReadyMinutes: text })}
                    keyboardType="numeric"
                    autoCorrect={false}
                  />
                  <Text className="text-xs text-gray-500 mt-2 flex-row items-center">
                    🚿 Minutes (0-480)
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    How long is your commute?
                  </Text>
                  <TextInput
                    className="border-2 border-gray-200 rounded-xl px-4 py-4 text-lg bg-gray-50 focus:border-green-400 focus:bg-white"
                    placeholder="15"
                    placeholderTextColor="#9CA3AF"
                    value={formData.commuteMinutes}
                    onChangeText={(text) => setFormData({ ...formData, commuteMinutes: text })}
                    keyboardType="numeric"
                    autoCorrect={false}
                  />
                  <Text className="text-xs text-gray-500 mt-2 flex-row items-center">
                    🚗 Minutes (0-300)
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="space-y-4">
                <TouchableOpacity
                  className={`rounded-2xl py-5 px-6 shadow-lg ${
                    loading 
                      ? 'bg-gray-400' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-2xl mr-3">
                      {loading ? '⏳' : '💾'}
                    </Text>
                    <Text className="text-black text-center font-bold text-lg">
                      {loading ? 'Saving...' : 'Save Settings'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl py-5 px-6 shadow-lg"
                  onPress={handleClear}
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-2xl mr-3">🗑️</Text>
                    <Text className="text-black text-center font-bold text-lg">
                      Clear All Settings
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Help Text */}
              <View className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <View className="flex-row items-start">
                  <View className="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                    <Text className="text-lg">💡</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-800 font-semibold text-sm mb-2">
                      Pro Tip
                    </Text>
                    <Text className="text-blue-700 text-sm leading-5">
                      These settings help personalize your experience and can be used to provide better scheduling recommendations and AI counselling support.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
}
