import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../api/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const icons = {
  back: require('../../../assets/NewVersion/GoBack.png'),
  camera: require('../../../assets/settingIcons/camera.png'),
  check: require('../../../assets/NewVersion/Check.png'),
  eye: require('../../../assets/NewVersion/Eye.png'),
};

const EditProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.displayName || '');
          setDob(data.birthday || '');
          setCountry(data.city || '');
          setPassword(''); // Do not prefill password
          await AsyncStorage.setItem('@user_data', JSON.stringify(data));
        } else {
          Alert.alert('Error', 'No profile data found.');
        }
      }
      setLoading(false);
    };
    loadProfileData();
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const saveProfileData = async () => {
    setLoading(true);
    try {
      // Update password if field is not empty
      if (password && auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, password);
        } catch (err) {
          if (err.code === 'auth/requires-recent-login') {
            Alert.alert('Security Notice', 'Please log out and log in again to change your password.');
            setLoading(false);
            return;
          } else {
            Alert.alert('Error', 'Failed to update password: ' + err.message);
            setLoading(false);
            return;
          }
        }
      }
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const newData = {
        displayName: name,
        birthday: dob,
        city: country,
      };
      await setDoc(userDocRef, newData, { merge: true });
      await AsyncStorage.setItem('@user_data', JSON.stringify(newData));
      await AsyncStorage.setItem('bannerMessage', 'Profile updated successfully!');
      await AsyncStorage.setItem('bannerType', 'success');
      await AsyncStorage.setItem('resetFirstLoad', 'true');
      navigation.navigate('Main', { screen: 'Account' });
    } catch (error) {
      console.error('Error updating profile data:', error);
      await AsyncStorage.setItem('bannerMessage', 'Failed to update profile.');
      await AsyncStorage.setItem('bannerType', 'error');    
      Alert.alert('Error', 'Failed to update profile.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#884EFE" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header with curve */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={icons.back} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Image source={icons.camera} style={styles.headerCamera} />
        </View>
        {/* Profile Image */}
        <View style={styles.profileImageWrapper}>
          <Image
            source={require('../../../assets/profile-pic.png')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.profileCameraButton}>
            <Image source={icons.camera} style={styles.profileCameraIcon} />
          </TouchableOpacity>
        </View>
        {/* Form Card */}
        <View style={styles.formCard}>
        <Text style={styles.emailAddress}>User Name</Text>
          <View style={styles.inputContainer}>
        <TextInput
              placeholder="Name"
              placeholderTextColor="#aaaaaa"
              value={name}
              onChangeText={setName}
          style={styles.input}
        />
          </View>
          <Text style={styles.password}>Password</Text>
          <View style={styles.inputContainer}>
        <TextInput
              placeholder="Password"
              placeholderTextColor="#aaaaaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={passwordVisibility}
          style={styles.input}
        />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
              <Image source={icons.eye} style={[styles.icon, { tintColor: passwordVisibility ? '#aaaaaa' : '#884efe' }]} />
        </TouchableOpacity>
          </View>
          <Text style={styles.password}>Date of Birth</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Date of Birth"
              placeholderTextColor="#aaaaaa"
              value={dob}
              onChangeText={setDob}
              style={styles.input}
          />
          </View>
          <Text style={styles.password}>Country</Text>
          <View style={styles.inputContainer}>
        <TextInput
              placeholder="Country"
              placeholderTextColor="#aaaaaa"
              value={country}
              onChangeText={setCountry}
          style={styles.input}
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveProfileData}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#884EFE',
    height: 160,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    top: 45,
  },
  headerCamera: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    opacity: 0.15,
    tintColor: '#fff',
  },
  profileImageWrapper: {
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  profileCameraButton: {
    position: 'absolute',
    bottom: 10,
    right: '35%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  profileCameraIcon: {
    width: 24,
    height: 24,
    tintColor: '#884EFE',
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
    marginTop: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#d1d1d1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fdfdfd',
    height: 56,
  },
  input: {
    marginLeft: 10,
    fontSize: 16,
    color: "#1b1b1b",
    flex: 1,
  },
  iconContainer: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  icon: {
    marginHorizontal: 5,
  },
  checkIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  emailAddress: {
    fontSize: 16,
    letterSpacing: 0.8,
    lineHeight: 26,
    color: "#000",
    textAlign: "left",
    marginBottom: 10,
  },
  password: {
    fontSize: 16,
    letterSpacing: 0.8,
    lineHeight: 26,
    color: "#000",
    textAlign: "left",
    marginBottom: 10,
    marginTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  inputIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: '#884EFE',
  },
  inputCheckIcon: {
    width: 22,
    height: 22,
    marginLeft: 8,
    tintColor: '#4CD964',
  },
  inputEyeIcon: {
    width: 22,
    height: 22,
    marginLeft: 8,
    tintColor: '#888',
  },
  saveButton: {
    backgroundColor: "#884efe",
    justifyContent: 'center',
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '400',
  },
});

export default EditProfileScreen;