import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { CalendarEvent, Subtask, BreakdownResponse } from '@/services/calendarService';
import { calendarService } from '@/services/calendarService';

interface EventBreakdownModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: (eventId: string, selectedSubtasks: Subtask[]) => void;
}

export default function EventBreakdownModal({ 
  visible, 
  event, 
  onClose, 
  onSave 
}: EventBreakdownModalProps) {
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<BreakdownResponse | null>(null);
  const [selectedSubtasks, setSelectedSubtasks] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && event) {
      generateBreakdown();
    }
  }, [visible, event]);

  const generateBreakdown = async () => {
    if (!event) return;

    setLoading(true);
    setError(null);
    setSelectedSubtasks(new Set());

    try {
      const response = await calendarService.breakDownEvent(event);
      setBreakdown(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate breakdown');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubtask = (subtaskId: string) => {
    const newSelected = new Set(selectedSubtasks);
    if (newSelected.has(subtaskId)) {
      newSelected.delete(subtaskId);
    } else {
      newSelected.add(subtaskId);
    }
    setSelectedSubtasks(newSelected);
  };

  const handleSave = () => {
    if (!breakdown || selectedSubtasks.size === 0) {
      Alert.alert('No Selection', 'Please select at least one subtask to save.');
      return;
    }

    const selectedSubtaskObjects = breakdown.subtasks.filter(subtask => 
      selectedSubtasks.has(subtask.id)
    );

    // Use the actual calendar event ID instead of the generated breakdown eventId
    onSave(event!.id, selectedSubtaskObjects);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  if (!event) return null;

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
              Break Down Event
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
          {/* Event Info */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {event.summary}
            </Text>
            <Text className="text-gray-600">
              {calendarService.formatDate(event.start.dateTime || event.start.date || '')}
            </Text>
          </View>

          {/* Loading State */}
          {loading && (
            <View className="bg-white rounded-lg p-8 mb-4 shadow-sm">
              <View className="items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-600 mt-4 text-center">
                  Generating subtasks...
                </Text>
                <Text className="text-gray-500 text-sm mt-2 text-center">
                  This may take a few moments
                </Text>
              </View>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-800 font-semibold mb-2">
                ⚠️ Error Generating Breakdown
              </Text>
              <Text className="text-red-600 text-sm mb-4">
                {error}
              </Text>
              <TouchableOpacity
                onPress={generateBreakdown}
                className="bg-red-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Subtasks List */}
          {breakdown && !loading && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Generated Subtasks
                </Text>
                <Text className="text-sm text-gray-500">
                  {selectedSubtasks.size} of {breakdown.subtasks.length} selected
                </Text>
              </View>

              <View className="space-y-3">
                {breakdown.subtasks.map((subtask) => (
                  <TouchableOpacity
                    key={subtask.id}
                    onPress={() => toggleSubtask(subtask.id)}
                    className={`border-2 rounded-lg p-3 ${
                      selectedSubtasks.has(subtask.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-start">
                      <View className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 ${
                        selectedSubtasks.has(subtask.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedSubtasks.has(subtask.id) && (
                          <Text className="text-white text-xs text-center leading-4">✓</Text>
                        )}
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium mb-1">
                          {subtask.text}
                        </Text>
                        
                        <View className="flex-row items-center space-x-3">
                          <View className={`px-2 py-1 rounded ${getPriorityColor(subtask.priority)}`}>
                            <Text className={`text-xs font-medium ${getPriorityTextColor(subtask.priority)}`}>
                              {subtask.priority.toUpperCase()}
                            </Text>
                          </View>
                          
                          <Text className="text-gray-500 text-sm">
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

          {/* Save Button */}
          {breakdown && !loading && (
            <View className="bg-white rounded-lg p-4 shadow-sm">
              <TouchableOpacity
                onPress={handleSave}
                disabled={selectedSubtasks.size === 0}
                className={`py-4 px-6 rounded-lg ${
                  selectedSubtasks.size === 0
                    ? 'bg-gray-300'
                    : 'bg-blue-500'
                }`}
              >
                <Text className={`text-center text-lg font-semibold ${
                  selectedSubtasks.size === 0
                    ? 'text-gray-500'
                    : 'text-white'
                }`}>
                  Save Selected Tasks ({selectedSubtasks.size})
                </Text>
              </TouchableOpacity>
              
              {selectedSubtasks.size === 0 && (
                <Text className="text-gray-500 text-sm text-center mt-2">
                  Select at least one subtask to save
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
