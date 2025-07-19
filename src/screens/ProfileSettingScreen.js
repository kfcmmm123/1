import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import colors from '../../assets/colors/colors';
import GoBack from '../../assets/NewVersion/GoBack.png';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../api/firebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const icons = {
  editProfile: require('../../assets/settingIcons/user.png'),
  security: require('../../assets/settingIcons/verified.png'),
  notifications: require('../../assets/settingIcons/notification.png'),
  privacy: require('../../assets/settingIcons/privacy.png'),
  subscription: require('../../assets/settingIcons/subscription.png'),
  help: require('../../assets/settingIcons/help.png'),
  terms: require('../../assets/settingIcons/terms.png'),
  report: require('../../assets/settingIcons/report.png'),
  addAccount: require('../../assets/settingIcons/addAccount.png'),
  logout: require('../../assets/settingIcons/logOut.png'),
};

const ProfileSettingScreen = ({ navigation }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@user_data');
      await AsyncStorage.setItem('resetProfileScreen', 'true');
      await AsyncStorage.setItem('bannerMessage', 'You have signed out!');
      await AsyncStorage.setItem('bannerType', 'success');
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignInUpScreen' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      await AsyncStorage.setItem('bannerMessage', 'Failed to sign out.');
      await AsyncStorage.setItem('bannerType', 'error');
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.root}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={GoBack} style={styles.goback} />
          </TouchableOpacity>
          <Text style={styles.title}>Setting</Text>
        </View>
        <View style={styles.scrollContent}>
          {/* Account Section */}
          <Text style={styles.sectionHeader}>Account</Text>
          <View style={styles.card}>
            <SettingItem icon={icons.editProfile} label="Edit profile" onPress={() => navigation.navigate('EditProfileScreen')} />
            <SettingItem icon={icons.security} label="Security" onPress={() => { }} />
            <SettingItem icon={icons.notifications} label="Notifications" onPress={() => { }} />
            <SettingItem icon={icons.privacy} label="Privacy" onPress={() => { }} />
          </View>
          {/* Support & About Section */}
          <Text style={styles.sectionHeader}>Support & About</Text>
          <View style={styles.card}>
            <SettingItem icon={icons.subscription} label="My Subscription" onPress={() => { }} />
            <SettingItem icon={icons.help} label="Help & Support" onPress={() => { }} />
            <SettingItem icon={icons.terms} label="Terms and Policies" onPress={() => { }} />
          </View>
          {/* Actions Section */}
          <Text style={styles.sectionHeader}>Actions</Text>
          <View style={styles.card}>
            <SettingItem icon={icons.report} label="Report a problem" onPress={() => { }} />
            <SettingItem icon={icons.addAccount} label="Add account" onPress={() => { }} />
            <SettingItem icon={icons.logout} label="Log out" onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <Image source={icon} style={styles.settingIcon} />
    <Text style={styles.settingLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F1FF', // light purple
  },
  topBar: {
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 24,
    marginBottom: 10,
    color: '#111',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    resizeMode: 'contain',
  },
  settingLabel: {
    fontSize: 16,
    color: '#222',
  },
});

export default ProfileSettingScreen;
