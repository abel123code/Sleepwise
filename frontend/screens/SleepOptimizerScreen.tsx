import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { settingsService, UserSettings } from '../services/settingsService';
import { calendarService, CalendarEvent, CalendarResponse } from '../services/calendarService';
import { launchSetAlarm, setAlarmForTomorrow } from '../utils/setAlarm';

// Using existing CalendarEvent interface from calendarService

interface SleepCalculation {
  earliestEventStart: Date | null;
  latestEventStart: Date | null;
  wakeUpTime: Date | null;
  bedtimeGoal: Date | null;
  totalBufferMinutes: number;
  sleepDurationHours: number;
}

export default function SleepOptimizerScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [settings, setSettings] = useState<UserSettings>({});
  const [calculation, setCalculation] = useState<SleepCalculation>({
    earliestEventStart: null,
    latestEventStart: null,
    wakeUpTime: null,
    bedtimeGoal: null,
    totalBufferMinutes: 0,
    sleepDurationHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Load settings from AsyncStorage
  const loadSettings = useCallback(async () => {
    try {
      const userSettings = await settingsService.getSettings();
      setSettings(userSettings);
      return userSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }, []);

  // Fetch events from backend using existing calendarService
  const fetchEvents = useCallback(async (date: string) => {
    try {
      console.log('🔄 Fetching events for date:', date);
      const response: CalendarResponse = await calendarService.getDayEvents(date);
      console.log('📅 API Response:', response);
      console.log('📋 Events found:', response.items?.length || 0);
      return response.items || [];
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      throw error;
    }
  }, []);

  // Calculate sleep optimization - HARDCODED VALUES
  const calculateSleepOptimization = useCallback((events: CalendarEvent[], userSettings: UserSettings) => {
    // Hardcoded values for testing
    const wakeUpTime = new Date();
    wakeUpTime.setHours(6, 15, 0, 0); // 6:15 AM
    
    const bedtimeGoal = new Date();
    bedtimeGoal.setHours(22, 15, 0, 0); // 10:15 PM (8 hours before 6:15 AM)
    
    console.log('🎯 Hardcoded calculation results:');
    console.log('  Wake-up time:', wakeUpTime.toISOString());
    console.log('  Bedtime goal:', bedtimeGoal.toISOString());

    return {
      earliestEventStart: null,
      latestEventStart: null,
      wakeUpTime,
      bedtimeGoal,
      totalBufferMinutes: 90, // 60 + 30
      sleepDurationHours: 8,
    };
  }, []);

  // Set alarm function using expo-intent-launcher
  const handleSetAlarm = useCallback(async () => {
    const wakeUpTime = new Date();
    wakeUpTime.setHours(6, 15, 0, 0); // 6:15 AM
    
    const timeString = wakeUpTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Check if running on Android
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Android Only Feature',
        'The Set Alarm feature is only available on Android devices.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Use the new setAlarmForTomorrow helper function
      await setAlarmForTomorrow(
        wakeUpTime.getHours(),
        wakeUpTime.getMinutes(),
        'Sleep Optimizer Wake Up!'
      );
      
      Alert.alert(
        '⏰ Alarm Set Successfully!',
        `Your alarm has been set for ${timeString}. The system clock app will open for you to confirm and save the alarm.`,
        [{ text: 'Great!' }]
      );
    } catch (error) {
      console.error('Failed to set alarm:', error);
      Alert.alert(
        'Failed to Set Alarm',
        'Could not open the alarm settings. Please make sure you have a clock app installed and try again.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Load data and calculate sleep optimization
  const loadData = useCallback(async (showLoading = true) => {
    try {
      setError(null);
      if (showLoading) {
        setLoading(true);
      }

      const today = getTodayDate();
      setSelectedDate(today);

      // Load settings and events in parallel
      const [userSettings, eventsData] = await Promise.all([
        loadSettings(),
        fetchEvents(today)
      ]);

      setEvents(eventsData);
      setSettings(userSettings);

      // Calculate sleep optimization
      const sleepCalc = calculateSleepOptimization(eventsData, userSettings);
      setCalculation(sleepCalc);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading sleep optimizer data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadSettings, fetchEvents, calculateSleepOptimization]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format time for display
  const formatTime = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-6">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-gray-800 mt-4 text-center text-lg">
            Loading sleep optimization...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-6">
          <View className="bg-red-50 border border-red-200 rounded-2xl p-6 w-full">
            <Text className="text-red-600 font-bold text-center mb-4 text-xl">
              ⚠️ Error Loading Data
            </Text>
            <Text className="text-red-500 text-center text-sm mb-6">
              {error}
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              className="bg-red-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                🔄 Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Header */}
          <View className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-gray-800 text-2xl font-bold mb-2">
                  😴 Sleep Optimizer
                </Text>
                <Text className="text-gray-600 text-sm">
                  Optimize your sleep schedule for tomorrow
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleRefresh}
                className="bg-indigo-600 px-4 py-2 rounded-xl"
                disabled={loading || refreshing}
              >
                <Text className="text-white text-sm font-semibold">
                  {loading || refreshing ? 'Refreshing...' : '🔄 Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-gray-500 text-sm">
              Date: {formatDate(new Date(selectedDate))}
            </Text>
          </View>

          {/* Main Sleep Schedule Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-indigo-200 shadow-sm">
            <Text className="text-gray-800 text-xl font-bold mb-6 text-center">
              🎯 Your Optimal Sleep Schedule
            </Text>
            
            <View className="space-y-6">
              {/* Bedtime Goal (Today) */}
              <View className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <Text className="text-purple-600 text-sm font-medium mb-2">
                  🌙 Bedtime Goal (Today)
                </Text>
                <Text className="text-purple-600 text-3xl font-bold">
                  {formatTime(calculation.bedtimeGoal)}
                </Text>
                <Text className="text-purple-500 text-xs mt-1">
                  {formatDate(calculation.bedtimeGoal)}
                </Text>
              </View>

              {/* Wake Up Time (Tomorrow) */}
              <View className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <Text className="text-indigo-600 text-sm font-medium mb-2">
                  ⏰ Wake Up Time (Tomorrow)
                </Text>
                <Text className="text-indigo-600 text-3xl font-bold">
                  {formatTime(calculation.wakeUpTime)}
                </Text>
                <Text className="text-indigo-500 text-xs mt-1">
                  {formatDate(calculation.wakeUpTime)}
                </Text>
              </View>
            </View>

            {/* Set Alarm Button */}
            <TouchableOpacity
              onPress={handleSetAlarm}
              className="bg-indigo-600 px-4 py-3 rounded-2xl items-center mt-4 shadow-lg"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-2xl mr-3">⏰</Text>
                <Text className="text-black font-bold text-lg">
                  Set Alarm
                </Text>
              </View>
            </TouchableOpacity>

            {/* Android Only Note */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-3">
              <Text className="text-yellow-800 text-sm text-center">
                📱 This feature works only on Android
              </Text>
            </View>
          </View>


          {/* Settings Info */}
          <View className="bg-gray-50 rounded-2xl p-6 mt-6 border border-gray-200">
            <Text className="text-gray-800 text-xl font-bold mb-4">
              ⚙️ Current Settings
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Sleep Hours:</Text>
                <Text className="text-gray-800 font-semibold">
                  {settings.sleepHours || 7.5} hours
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Get Ready Time:</Text>
                <Text className="text-gray-800 font-semibold">
                  {settings.getReadyMinutes || 60} minutes
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Commute Time:</Text>
                <Text className="text-gray-800 font-semibold">
                  {settings.commuteMinutes || 30} minutes
                </Text>
              </View>
            </View>
            <Text className="text-gray-500 text-xs mt-4 text-center">
              💡 Update these settings in the main app to customize your sleep optimization
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
