import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../api/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import colors from '../../../assets/colors/colors';

const AccountSettingScreen = ({ route, navigation }) => {
  const { userInfo } = route.params;
  const [displayName, setDisplayName] = useState(userInfo.displayName || '');
  const [bio, setBio] = useState(userInfo.bio || '');

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

  // const pickImage = async () => {
  //   const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });

  //   if (result.didCancel) {
  //     console.log('User cancelled image picker');
  //   } else if (result.errorMessage) {
  //     console.log('ImagePicker Error: ', result.errorMessage);
  //   } else if (result.assets && result.assets.length > 0) {
  //     const source = { uri: result.assets[0].uri };
  //     uploadImage(source.uri);
  //   }
  // };

  // const uploadImage = async (uri) => {
  //   const uploadUri = uri.startsWith('file://') ? uri : `file://${uri}`;
  //   const filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
  //   const storageRef = storage().ref(`profile_pictures/${filename}`);

  //   try {
  //     await storageRef.putFile(uploadUri);
  //     const downloadURL = await storageRef.getDownloadURL();

  //     if (auth.currentUser) {
  //       await updateProfile(auth.currentUser, { photoURL: downloadURL });
  //       console.log('Photo URL updated!');

  //       // Update Firestore user document
  //       const userDocRef = doc(db, 'users', auth.currentUser.uid);
  //       await setDoc(userDocRef, { photoURL: downloadURL }, { merge: true });

  //       // Update local state and AsyncStorage
  //       const updatedUserData = { ...currentUser, photoURL: downloadURL };
  //       setCurrentUser(updatedUserData);
  //       await saveUserData(updatedUserData);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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
});

export default AccountSettingScreen;
