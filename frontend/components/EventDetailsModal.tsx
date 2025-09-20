import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { CalendarEvent, Subtask } from '@/services/calendarService';
import { calendarService } from '@/services/calendarService';
import EventBreakdownModal from './EventBreakdownModal';

interface EventDetailsModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
}

export default function EventDetailsModal({ 
  visible, 
  event, 
  onClose
}: EventDetailsModalProps) {
  const [breakdownModalVisible, setBreakdownModalVisible] = useState(false);
  const [existingSubtasks, setExistingSubtasks] = useState<Subtask[]>([]);
  const [hasExistingSubtasks, setHasExistingSubtasks] = useState(false);

  // Load existing subtasks when modal opens
  React.useEffect(() => {
    if (visible && event) {
      loadExistingSubtasks();
    }
  }, [visible, event]);

  const loadExistingSubtasks = async () => {
    try {
      const breakdown = await calendarService.getEventBreakdown(event!.id);
      
      if (breakdown && breakdown.subtasks) {
        setExistingSubtasks(breakdown.subtasks);
        setHasExistingSubtasks(true);
      } else {
        setExistingSubtasks([]);
        setHasExistingSubtasks(false);
      }
    } catch (error) {
      console.error('Error loading existing subtasks:', error);
      setExistingSubtasks([]);
      setHasExistingSubtasks(false);
    }
  };

  if (!event) return null;

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = () => {
    if (!event.start.dateTime || !event.end.dateTime) return '';
    
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end.dateTime);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
    
    if (durationHours < 1) {
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      return `${durationMinutes} minutes`;
    } else if (durationHours === 1) {
      return '1 hour';
    } else {
      return `${durationHours} hours`;
    }
  };

  const openCalendarApp = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Try to open the default calendar app on iOS
        const canOpen = await Linking.canOpenURL('calshow:');
        if (canOpen) {
          await Linking.openURL('calshow:');
        } else {
          // Fallback to opening the event URL in browser
          if (event.htmlLink) {
            await Linking.openURL(event.htmlLink);
          } else {
            Alert.alert('Error', 'Unable to open calendar app');
          }
        }
      } else if (Platform.OS === 'android') {
        // Try to open the default calendar app on Android
        const canOpen = await Linking.canOpenURL('content://com.android.calendar/time/');
        if (canOpen) {
          await Linking.openURL('content://com.android.calendar/time/');
        } else {
          // Fallback to opening the event URL in browser
          if (event.htmlLink) {
            await Linking.openURL(event.htmlLink);
          } else {
            Alert.alert('Error', 'Unable to open calendar app');
          }
        }
      }
    } catch (error) {
      // Fallback to opening the event URL in browser
      if (event.htmlLink) {
        try {
          await Linking.openURL(event.htmlLink);
        } catch (linkError) {
          Alert.alert('Error', 'Unable to open calendar or event link');
        }
      } else {
        Alert.alert('Error', 'Unable to open calendar app');
      }
    }
  };

  const openEventInBrowser = async () => {
    if (event.htmlLink) {
      try {
        await Linking.openURL(event.htmlLink);
      } catch (error) {
        Alert.alert('Error', 'Unable to open event link');
      }
    } else {
      Alert.alert('Error', 'No event link available');
    }
  };

  const handleBreakDown = () => {
    setBreakdownModalVisible(true);
  };

  const handleBreakdownSave = async (eventId: string, selectedSubtasks: Subtask[]) => {
    try {
      await calendarService.saveEventBreakdown(eventId, selectedSubtasks);
      // Refresh existing subtasks after saving
      await loadExistingSubtasks();
      Alert.alert(
        'Success!', 
        `Saved ${selectedSubtasks.length} subtasks to your local storage.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error', 
        'Failed to save subtasks. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBreakdownClose = () => {
    setBreakdownModalVisible(false);
  };

  const toggleSubtaskCompletion = async (subtaskId: string) => {
    const updatedSubtasks = existingSubtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );
    
    setExistingSubtasks(updatedSubtasks);
    
    // Save to storage
    try {
      await calendarService.updateSubtasksCompletion(event!.id, updatedSubtasks);
    } catch (error) {
      console.error('Error updating subtask completion:', error);
    }
  };


  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">
              Event Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 px-3 py-2 rounded-lg"
            >
              <Text className="text-gray-700 font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Event Title */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {event.summary}
            </Text>
            {event.status && event.status !== 'confirmed' && (
              <View className="mb-2">
                <Text className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded inline-block">
                  {event.status}
                </Text>
              </View>
            )}
          </View>

          {/* Time Information */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              🕐 Time & Date
            </Text>
            
            {event.start.dateTime && event.end.dateTime ? (
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Text className="text-gray-600 w-20">Start:</Text>
                  <Text className="text-gray-900 font-medium">
                    {formatTime(event.start.dateTime)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 w-20">End:</Text>
                  <Text className="text-gray-900 font-medium">
                    {formatTime(event.end.dateTime)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 w-20">Date:</Text>
                  <Text className="text-gray-900 font-medium">
                    {formatDate(event.start.dateTime)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-600 w-20">Duration:</Text>
                  <Text className="text-gray-900 font-medium">
                    {getDuration()}
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="text-gray-600">All Day Event</Text>
            )}
          </View>

          {/* Location */}
          {event.location && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                📍 Location
              </Text>
              <Text className="text-gray-700">{event.location}</Text>
            </View>
          )}

          {/* Description */}
          {event.description && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                📝 Description
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                {event.description}
              </Text>
            </View>
          )}

          {/* Organizer */}
          {event.organizer && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                👤 Organizer
              </Text>
              <Text className="text-gray-700">
                {event.organizer.displayName || event.organizer.email}
              </Text>
            </View>
          )}

          {/* Creator */}
          {event.creator && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                ✨ Created by
              </Text>
              <Text className="text-gray-700">{event.creator.email}</Text>
            </View>
          )}

          {/* Existing Subtasks */}
          {hasExistingSubtasks && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-900">
                  📋 Generated Subtasks
                </Text>
                <Text className="text-sm text-gray-500">
                  {existingSubtasks.filter(s => s.completed).length} / {existingSubtasks.length} completed
                </Text>
              </View>
              <View className="space-y-2">
                {existingSubtasks.map((subtask, index) => (
                  <TouchableOpacity
                    key={subtask.id || index}
                    onPress={() => toggleSubtaskCompletion(subtask.id)}
                    className={`rounded-lg p-3 ${
                      subtask.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <View className="flex-row items-start">
                      <View className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 ${
                        subtask.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 bg-white'
                      }`}>
                        {subtask.completed && (
                          <Text className="text-white text-xs text-center leading-4">✓</Text>
                        )}
                      </View>
                      
                      <View className="flex-1">
                        <Text className={`font-medium mb-1 ${
                          subtask.completed ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}>
                          {subtask.text}
                        </Text>
                        
                        <View className="flex-row items-center space-x-3">
                          <View className={`px-2 py-1 rounded ${
                            subtask.priority === 'high' ? 'bg-red-100 border-red-300' :
                            subtask.priority === 'medium' ? 'bg-yellow-100 border-yellow-300' :
                            'bg-green-100 border-green-300'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              subtask.priority === 'high' ? 'text-red-700' :
                              subtask.priority === 'medium' ? 'text-yellow-700' :
                              'text-green-700'
                            }`}>
                              {subtask.priority.toUpperCase()}
                            </Text>
                          </View>
                          
                          <Text className={`text-sm ${
                            subtask.completed ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            ⏱️ {subtask.estimatedTime}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <TouchableOpacity
              onPress={handleBreakDown}
              disabled={hasExistingSubtasks}
              className={`py-4 px-6 rounded-lg mb-3 ${
                hasExistingSubtasks 
                  ? 'bg-gray-300' 
                  : 'bg-gray-500'
              }`}
            >
              <Text className={`text-center text-lg font-semibold ${
                hasExistingSubtasks 
                  ? 'text-gray-500' 
                  : 'text-white'
              }`}>
                {hasExistingSubtasks ? '✅ Already Broken Down' : '🔧 Break Event Down'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={openCalendarApp}
              className="bg-green-500 py-3 px-6 rounded-lg mb-3"
            >
              <Text className="text-white text-center font-medium">
                📱 Open Calendar App
              </Text>
            </TouchableOpacity>
            
            {event.htmlLink && (
              <TouchableOpacity
                onPress={openEventInBrowser}
                className="bg-gray-500 py-3 px-6 rounded-lg"
              >
                <Text className="text-white text-center font-medium">
                  🌐 Open Event in Browser
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Event Breakdown Modal */}
        <EventBreakdownModal
          visible={breakdownModalVisible}
          event={event}
          onClose={handleBreakdownClose}
          onSave={handleBreakdownSave}
        />
      </SafeAreaView>
    </Modal>
  );
}
