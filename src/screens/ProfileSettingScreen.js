import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { auth, db } from '../api/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../assets/colors/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

const ProfileSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    hobbies: [],
    birthday: '',
    city: '',
  });
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          // Optionally update local storage if needed
          await AsyncStorage.setItem('@user_data', JSON.stringify(data));
        } else {
          Alert.alert('Error', 'No profile data found.');
        }
      }
      setLoading(false);
    };
    loadProfileData();
  }, []);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    const formattedDate = currentDate.toISOString().split('T')[0]; // Formats the date to YYYY-MM-DD
    setProfileData({ ...profileData, birthday: formattedDate });
  };

  const navigateToInterests = () => {
    navigation.navigate('EditInterestScreen', { userInfo: profileData, currentInterests: profileData.hobbies || [] });
  };

  const navigateToCity = () => {
    navigation.navigate('EditCityScreen', { userInfo: profileData});
  };

  const saveProfileData = async () => {
    const newData = { ...profileData };
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      // Update Firestore
      await setDoc(userDocRef, newData, { merge: true });
      // Update AsyncStorage with the same data to keep local sync with the cloud
      await AsyncStorage.setItem('@user_data', JSON.stringify(newData));
      await AsyncStorage.setItem('bannerMessage', 'Profile updated successfully!');
      await AsyncStorage.setItem('bannerType', 'success');
      await AsyncStorage.setItem('resetFirstLoad', 'true');
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Error updating profile data:', error);
      await AsyncStorage.setItem('bannerMessage', 'Failed to update profile.');
      await AsyncStorage.setItem('bannerType', 'error');    
    }
  };
  
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@user_data'); // Clear stored user data
      await AsyncStorage.setItem('resetProfileScreen', 'true'); // Set a flag when signing out
      await AsyncStorage.setItem('bannerMessage', 'You have signed out!');
      await AsyncStorage.setItem('bannerType', 'success');      
      navigation.navigate('SignInUpScreen'); // Navigate to SignInUpScreen
    } catch (error) {
      console.error('Error signing out:', error);
      await AsyncStorage.setItem('bannerMessage', 'Failed to sign out.');
      await AsyncStorage.setItem('bannerType', 'error');    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Profile Settings</Text>
        <Text style={styles.label}>User Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={profileData.displayName}
          onChangeText={(text) => setProfileData({ ...profileData, displayName: text })}
        />
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={styles.input}
          placeholder="Bio"
          multiline
          numberOfLines={2}
          value={profileData.bio}
          onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
        />
        <Text style={styles.label}>Birthday</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text style={styles.inputText}>{profileData.birthday || 'Tap to set date'}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {/* <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="City you live or work"
          multiline
          numberOfLines={2}
          value={profileData.city}
          onChangeText={(text) => setProfileData({ ...profileData, city: text })}
        /> */}
        <TouchableOpacity style={styles.button} onPress={navigateToCity}>
          <Text style={styles.buttonText}>Edit City</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={navigateToInterests}>
          <Text style={styles.buttonText}>Edit Interests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={saveProfileData}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.primary,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    marginBottom: 25,
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
  label: {
    fontSize: 18,
    marginBottom: 6,
    color: colors.text,
  },
});

export default ProfileSettingsScreen;
