import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../api/firebaseConfig';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import colors from '../../../assets/colors/colors';

const AccountSettingScreen = ({ route, navigation }) => {
  const { userInfo } = route.params;
  const [displayName, setDisplayName] = useState(userInfo.displayName || '');
  const [bio, setBio] = useState(userInfo.bio || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const saveAccountData = async () => {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { displayName, bio }, { merge: true });
      await AsyncStorage.setItem('@user_data', JSON.stringify({ ...userInfo, displayName, bio }));
      await AsyncStorage.setItem('bannerMessage', 'Profile updated successfully!');
      await AsyncStorage.setItem('bannerType', 'success');
      await AsyncStorage.setItem('resetFirstLoad', 'true');
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Error saving account settings:', error);
    }
  };

  const deleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const user = auth.currentUser;

              // Delete user data from Firestore
              const userDocRef = doc(db, 'users', user.uid);
              await deleteDoc(userDocRef);

              // Delete user account from Firebase Authentication
              await deleteUser(user);

              // Clear AsyncStorage
              await AsyncStorage.clear();

              navigation.navigate('Profile');
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={styles.input}
        placeholder="Bio"
        multiline
        numberOfLines={4}
        value={bio}
        onChangeText={setBio}
      />
      <TouchableOpacity style={styles.button} onPress={saveAccountData}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text>Have problems with your account? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('ContactSupport')}>Contact Support</Text>
        <Text> or</Text>
      </View>
      <TouchableOpacity onPress={deleteAccount} disabled={isDeleting} style={styles.delete}>
        {isDeleting ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.link}>Delete Account</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    color: colors.text,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: "5%"
  },
  deleteText: {
    color: 'red',
  },
  link: {
    color: '#0000ff',
  },
  delete: {
    alignItems: 'center',
    marginTop: 10,
  },
});

export default AccountSettingScreen;
