import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { calendarService, CalendarEvent } from '@/services/calendarService';
import { settingsService, UserSettings } from '@/services/settingsService';
import EventDetailsModal from './EventDetailsModal';
import SettingsModal from './SettingsModal';
import WelcomeMessage from './WelcomeMessage';

export default function CalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({});
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const loadEvents = useCallback(async (showLoading = true) => {
    try {
      setError(null);
      if (showLoading) {
        setLoading(true);
      }
      
      const tomorrowDate = calendarService.getTomorrowDate();
      setDate(tomorrowDate);
      
      const response = await calendarService.getDayEvents(tomorrowDate);
      
      setEvents(response.items || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents(false);
  }, [loadEvents]);

  const handleManualRefresh = useCallback(() => {
    loadEvents(true);
  }, [loadEvents]);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedEvent(null);
  }, []);

  const handleClearStorage = useCallback(async () => {
    try {
      await calendarService.clearAllBreakdowns();
      Alert.alert('Success!', 'All stored breakdowns have been cleared.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear storage.');
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const userSettings = await settingsService.getSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const handleSettingsSave = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsModalVisible(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsModalVisible(false);
  }, []);


  useEffect(() => {
    loadEvents();
    loadSettings();
  }, [loadEvents, loadSettings]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4 text-center">
          Loading tomorrow's events...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <View className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
          <Text className="text-red-800 font-semibold text-center mb-2">
            ⚠️ Error Loading Events
          </Text>
          <Text className="text-red-600 text-center text-sm">
            {error}
          </Text>
          <View className="mt-4">
            <TouchableOpacity
              onPress={handleManualRefresh}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">
                🔄 Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Welcome Message Component */}
        <WelcomeMessage 
          settings={settings} 
          onOpenSettings={handleOpenSettings} 
        />

        {/* Header */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-gray-900">
              📅 Tomorrow's Schedule
            </Text>
            <TouchableOpacity
              onPress={handleManualRefresh}
              className="bg-blue-500 px-3 py-2 rounded-lg"
              disabled={loading || refreshing}
            >
              <Text className="text-white text-sm font-semibold">
                {loading || refreshing ? 'Refreshing...' : '🔄 Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">
            {calendarService.formatDate(new Date(date).toISOString())}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} found
          </Text>
          {lastUpdated && (
            <Text className="text-xs text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </View>

        {/* Events List */}
        {events.length === 0 ? (
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-gray-500 text-center text-lg">
              🎉 No events scheduled for tomorrow!
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              Enjoy your free day
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onPress={handleEventPress}
              />
            ))}
          </View>
        )}

        {/* Clear Storage Button */}
        <View className="bg-white rounded-lg p-4 mt-4 shadow-sm">
          <TouchableOpacity
            onPress={handleClearStorage}
            className="bg-red-500 py-3 px-6 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              🗑️ Clear All Storage (Debug)
            </Text>
          </TouchableOpacity>
          <Text className="text-gray-500 text-xs text-center mt-2">
            This will clear all saved event breakdowns
          </Text>
        </View>
      </View>

      {/* Event Details Modal */}
      <EventDetailsModal
        visible={modalVisible}
        event={selectedEvent}
        onClose={handleCloseModal}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={handleCloseSettings}
        onSave={handleSettingsSave}
      />
    </ScrollView>
  );
}

interface EventCardProps {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
}

function EventCard({ event, onPress }: EventCardProps) {
  const startTime = event.start.dateTime || event.start.date;
  const endTime = event.end.dateTime || event.end.date;
  
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    // If it's a date (all-day event), return "All Day"
    if (timeString.includes('T') === false) {
      return 'All Day';
    }
    
    return calendarService.formatTime(timeString);
  };

  const getEventColor = (summary: string) => {
    // Simple color coding based on event title
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#8B5CF6', // purple
      '#F59E0B', // orange
      '#EC4899', // pink
      '#6366F1'  // indigo
    ];
    
    const hash = summary.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getDuration = () => {
    if (!startTime || !endTime || !startTime.includes('T') || !endTime.includes('T')) {
      return '';
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
    
    if (durationHours < 1) {
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      return `${durationMinutes}m`;
    } else if (durationHours === 1) {
      return '1h';
    } else {
      return `${durationHours}h`;
    }
  };

  return (
    <TouchableOpacity 
      onPress={() => onPress(event)}
      className="bg-white rounded-lg p-4 shadow-sm border-l-4 mb-3 active:bg-gray-50"
      style={{ borderLeftColor: getEventColor(event.summary) }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {event.summary}
          </Text>
          
          {startTime && (
            <View className="flex-row items-center mb-2">
              <Text className="text-sm text-gray-500 mr-2">🕐</Text>
              <Text className="text-sm text-gray-600 flex-1">
                {formatTime(startTime)}
                {endTime && startTime !== endTime && ` - ${formatTime(endTime)}`}
                {getDuration() && ` (${getDuration()})`}
              </Text>
            </View>
          )}
          
          {event.location && (
            <View className="flex-row items-center mb-2">
              <Text className="text-sm text-gray-500 mr-2">📍</Text>
              <Text className="text-sm text-gray-600 flex-1">
                {event.location}
              </Text>
            </View>
          )}
          
          {event.organizer?.displayName && (
            <View className="flex-row items-center mb-2">
              <Text className="text-sm text-gray-500 mr-2">👤</Text>
              <Text className="text-sm text-gray-600">
                {event.organizer.displayName}
              </Text>
            </View>
          )}
          
          {event.description && (
            <Text className="text-sm text-gray-600 mt-2" numberOfLines={2}>
              {event.description}
            </Text>
          )}
          
          {event.status && event.status !== 'confirmed' && (
            <View className="mt-2">
              <Text className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                {event.status}
              </Text>
            </View>
          )}
          
          {/* Tap indicator */}
          <View className="mt-2">
            <Text className="text-xs text-blue-500">Tap for details →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
