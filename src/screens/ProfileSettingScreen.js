import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { auth, db } from '../api/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import colors from '../../assets/colors/colors';
import DateTimePicker from '@react-native-community/datetimepicker';


const   ProfileSettingScreen = () => {
  const navigation = useNavigation();

  const Section = ({ title, items }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContainer}>         
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.row}
          onPress={item.onPress || (() => {})}
        >
          <Image source={item.icon} style={styles.icon} />
          <Text style={styles.rowText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Setting</Text>

      <Section
        title="Account"
        items={[
          { label: 'Edit profile', icon: require('../../assets/ProfileSetting/edit-profile.png') },
          { label: 'Security', icon: require('../../assets/ProfileSetting/security.png') },
          { label: 'Notifications', icon: require('../../assets/ProfileSetting/notifications.png') },
          { label: 'Privacy', icon: require('../../assets/ProfileSetting/privacy.png') },
        ]}
      />

      <Section
        title="Support & About"
        items={[
          { label: 'My Subscription', icon: require('../../assets/ProfileSetting/subscription.png') },
          { label: 'Help & Support', icon: require('../../assets/ProfileSetting/help.png') },
          { label: 'Terms and Policies', icon: require('../../assets/ProfileSetting/terms.png') },
        ]}
      />

      <Section
        title="Actions"
        items={[
          { label: 'Report a problem', icon: require('../../assets/ProfileSetting/report.png') },
          { label: 'Add account', icon: require('../../assets/ProfileSetting/add-account.png') },
          { label: 'Log out', icon: require('../../assets/ProfileSetting/logout.png'), onPress: () => console.log('Logout pressed') },
        ]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5eeff',
  },
  backButton: {
    padding: 16,
  },
  backArrow: {
    fontSize: 24,
    color: colors.primary,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 10,
    color: colors.text,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    marginVertical: 8,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    paddingLeft: 40,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 30,
    resizeMode: 'contain',
  },
  rowText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#111',
  },
});

export default ProfileSettingScreen;
