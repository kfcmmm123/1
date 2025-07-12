import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../assets/colors/colors';
import AIRecommendationService from '../services/aiRecommendation';

const AIFilterSection = ({ onFiltersChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    interests: [],
    city: '',
    availability: false,
    maxDistance: 50,
    preferredCategories: [],
  });

  const availableInterests = [
    'Education', 'Healthcare', 'Environment', 'Animal Welfare',
    'Community Service', 'Arts & Culture', 'Sports', 'Technology',
    'Food & Hunger', 'Disaster Relief', 'Youth Development', 'Senior Care'
  ];

  const availableCategories = [
    'Teaching', 'Mentoring', 'Cleaning', 'Fundraising',
    'Event Planning', 'Administrative', 'Technical Support', 'Transportation',
    'Medical Support', 'Construction', 'Art & Design', 'Sports Coaching'
  ];

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setPreferences({
          interests: parsedData.interests || [],
          city: parsedData.city || '',
          availability: parsedData.availability || false,
          maxDistance: parsedData.maxDistance || 50,
          preferredCategories: parsedData.preferredCategories || [],
        });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AIRecommendationService.updateUserPreferences(preferences);
      onFiltersChange(preferences);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const toggleInterest = (interest) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleCategory = (category) => {
    setPreferences(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category]
    }));
  };

  const renderInterestTag = (interest) => {
    const isSelected = preferences.interests.includes(interest);
    return (
      <TouchableOpacity
        key={interest}
        style={[styles.tag, isSelected && styles.selectedTag]}
        onPress={() => toggleInterest(interest)}
      >
        <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
          {interest}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategoryTag = (category) => {
    const isSelected = preferences.preferredCategories.includes(category);
    return (
      <TouchableOpacity
        key={category}
        style={[styles.tag, isSelected && styles.selectedTag]}
        onPress={() => toggleCategory(category)}
      >
        <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
          {category}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="tune" size={20} color={colors.primary} />
        <Text style={styles.filterButtonText}>AI Preferences</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>AI Preferences</Text>
            <TouchableOpacity
              onPress={savePreferences}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Interests Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Interests</Text>
              <Text style={styles.sectionDescription}>
                Select topics that interest you for better recommendations
              </Text>
              <View style={styles.tagsContainer}>
                {availableInterests.map(renderInterestTag)}
              </View>
            </View>

            {/* Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferred Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your city"
                value={preferences.city}
                onChangeText={(text) => setPreferences(prev => ({ ...prev, city: text }))}
              />
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferred Categories</Text>
              <Text style={styles.sectionDescription}>
                Select volunteer categories you prefer
              </Text>
              <View style={styles.tagsContainer}>
                {availableCategories.map(renderCategoryTag)}
              </View>
            </View>

            {/* Availability Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Consider my availability for recommendations</Text>
                <Switch
                  value={preferences.availability}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, availability: value }))}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={preferences.availability ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Distance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Maximum Distance</Text>
              <Text style={styles.sectionDescription}>
                {preferences.maxDistance} miles from your location
              </Text>
              <View style={styles.sliderContainer}>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => setPreferences(prev => ({ ...prev, maxDistance: Math.max(10, prev.maxDistance - 10) }))}
                >
                  <Ionicons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.sliderTrack}>
                  <View 
                    style={[
                      styles.sliderFill, 
                      { width: `${(preferences.maxDistance / 100) * 100}%` }
                    ]} 
                  />
                </View>
                <TouchableOpacity
                  style={styles.sliderButton}
                  onPress={() => setPreferences(prev => ({ ...prev, maxDistance: Math.min(100, prev.maxDistance + 10) }))}
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    marginRight: 'auto',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTag: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
  selectedTagText: {
    color: 'white',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sliderButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginHorizontal: 15,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

export default AIFilterSection; 