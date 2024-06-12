import React, { useState, useCallback, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity, ScrollView } from 'react-native';
import AccountSettingScreen from './settings/AccountSettingScreen';
import PersonalDataSettingScreen from './settings/PersonalDataSettingScreen';
import SkillSettingScreen from './settings/SkillSettingScreen';
import { signOut } from 'firebase/auth';
import { auth, db } from '../api/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../assets/colors/colors';
import EditInterestScreen from './settings/EditInterestScreen';

const Stack = createStackNavigator();

// 以下是一个 stack navigator，包含了上面的三个 sub screens
const ProfileSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    hobbies: [],
    birthday: '',
    city: '',
  });

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@user_data'); // Clear stored user data
      await AsyncStorage.setItem('resetFirstLoad', 'true');
      await AsyncStorage.setItem('bannerMessage', 'You have signed out!');
      await AsyncStorage.setItem('bannerType', 'success');
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Error signing out:', error);
      await AsyncStorage.setItem('bannerMessage', 'Failed to sign out.');
      await AsyncStorage.setItem('bannerType', 'error');
    }
  };

  function ProfileHomeScreen() {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.tabs} onPress={() => navigation.navigate('AccountSettingScreen', { userInfo: profileData })}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabs} onPress={() => navigation.navigate('PersonalDataSettingScreen', { userInfo: profileData })}>
          <Text style={styles.sectionTitle}>Personal Data Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabs} onPress={() => navigation.navigate('SkillSettingScreen', { userInfo: profileData })}>
          <Text style={styles.sectionTitle}>Skill Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabs} onPress={() => navigation.navigate('EditInterestScreen', { userInfo: profileData })}>
          <Text style={styles.sectionTitle}>Interests Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.SignOutbutton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <Stack.Navigator initialRouteName="ProfileHomeScreen">
      <Stack.Screen name="ProfileHomeScreen" component={ProfileHomeScreen}
        options={{
          title: 'Profile Settings',
        }}
      />
      <Stack.Screen name="AccountSettingScreen" component={AccountSettingScreen}
        options={{
          title: 'Account Settings',
        }}
      />
      <Stack.Screen name="PersonalDataSettingScreen" component={PersonalDataSettingScreen}
        options={{
          title: 'Personal Data',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen name="SkillSettingScreen" component={SkillSettingScreen}
        options={{
          title: 'Select a Skill',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen name="EditInterestScreen" component={EditInterestScreen}
        options={{
          title: 'Select your interests',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#fff',
  },
  tabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#000', // 颜色调整，确保能在背景上看清楚
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginTop: 5,
    marginLeft: -10,
  },
  input: {
    width: '100%',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
  },
  button: {
    backgroundColor: '#9999ee',
    padding: 10,
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  SignOutbutton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default ProfileSettingsScreen;
export { AccountSettingScreen, PersonalDataSettingScreen, SkillSettingScreen };