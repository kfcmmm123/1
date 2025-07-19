import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../assets/colors/colors';
import DatePicker from '../components/DatePicker';
import LocationPicer from '../components/LocationPicker';
import InterestsPicker from '../components/InterestPicker';
import GoBack from '../../assets/NewVersion/GoBack.png';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomepageSettingsScreen = ({ navigation }) => {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Header with Back Button and Title */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={GoBack} style={styles.goback} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter Events</Text>
        </View>
        {/* Date Picker */}
        <DatePicker />
        <LocationPicer />
        <InterestsPicker />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F1FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  goback: {
    width: 30,
    height: 30,
  },
  title: {
    flex: 1, // Takes up remaining space
    textAlign: 'center', // Centers the text
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black', // Use your primary color
    marginLeft: -30, // Adjust to center the title properly
  },
  applyButton: {
    marginTop: 20,
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomepageSettingsScreen;