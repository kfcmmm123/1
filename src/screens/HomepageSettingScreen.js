import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../assets/colors/colors';

const HomepageSettingsScreen = ({navigation}) => {
  const [hours, setHours] = useState('');

  const saveHours = async () => {
    try {
      await AsyncStorage.setItem('userHours', hours);
      alert('Hours updated successfully!');
      navigation.navigate('Homepage');
    } catch (e) {
      alert('Failed to save hours.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Volunteer Hours Goal</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter Total Hours"
        value={hours}
        onChangeText={setHours}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={saveHours}>
          <Text style={styles.buttonText}>Save hours</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.primary,
    alignSelf: 'flex-start',
    marginVertical: 15,
  },
  input: {
    width: '100%',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default HomepageSettingsScreen;
