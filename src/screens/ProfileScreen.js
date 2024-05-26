import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { auth, db } from '../api/firebaseConfig';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../../assets/colors/colors';

const ProfileScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useFocusEffect(
    useCallback(() => {
        const fetchUserData = async () => {
            const storedUserData = await AsyncStorage.getItem('@user_data');
            if (storedUserData) {
                const userData = JSON.parse(storedUserData);
                setCurrentUser(userData);
            } else {
                // Optionally fetch from Firestore if needed or handle user not found
            }
        };
        fetchUserData();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
        const checkUser = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('@user_data');
                const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
                if (userData) {
                    setCurrentUser(userData);
                } else {
                    setCurrentUser(null);
                }
            } catch (e) {
                console.error('Failed to load user data:', e);
                Alert.alert('Error', 'Failed to load data');
            }
        };

        checkUser();
    }, [])
  );

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@user_data');
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (e) {
        console.error('Failed to load user data', e);
        return null;
      }
    };

    const checkUserAuthentication = async () => {
      const storedUserData = await loadUserData();
      if (storedUserData) {
        setCurrentUser(storedUserData);
        setLoading(false);
      } else {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user && user.emailVerified) {
            // Fetch and set user data here
            setLoading(false);
          } else {
            setCurrentUser(null);
            setLoading(false);
          }
        });
        return () => {
          unsubscribe();
          isMounted.current = false;
        };
      }
    };

    checkUserAuthentication();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@user_data'); // Clear stored user data
      setCurrentUser(null);
      navigation.replace('SignInScreen'); // Replace the current screen with the sign-in screen
    } catch (error) {
      console.error('Error signing out: ', error);
      alert('Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };
  

  const getUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && isMounted.current) {
        const userData = userDoc.data();
        setCurrentUser(userData);
        await saveUserData(userData);
      }
    }
    if (isMounted.current) {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const timeout = setTimeout(() => {
        setLoading(false);
        console.error('Timeout: Failed to get user profile');
      }, 5000);
      getUserProfile()
        .then(() => clearTimeout(timeout))
        .catch((error) => {
          clearTimeout(timeout);
          console.error(error);
        });
    }, [])
  );

  const saveUserData = async (userData) => {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem('@user_data', jsonValue);
    } catch (e) {
      console.error('Failed to save user data', e);
    }
  };

  const loadUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@user_data');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to load user data', e);
      return null;
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 1 });

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorMessage) {
      console.log('ImagePicker Error: ', result.errorMessage);
    } else if (result.assets && result.assets.length > 0) {
      const source = { uri: result.assets[0].uri };
      uploadImage(source.uri);
    }
  };

  const uploadImage = async (uri) => {
    const uploadUri = uri.startsWith('file://') ? uri : `file://${uri}`;
    const filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
    const storageRef = storage().ref(`profile_pictures/${filename}`);

    try {
      await storageRef.putFile(uploadUri);
      const downloadURL = await storageRef.getDownloadURL();

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
        console.log('Photo URL updated!');

        // Update Firestore user document
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { photoURL: downloadURL }, { merge: true });

        // Update local state and AsyncStorage
        const updatedUserData = { ...currentUser, photoURL: downloadURL };
        setCurrentUser(updatedUserData);
        await saveUserData(updatedUserData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/profileImage.png')}
          style={styles.illustration}
        />
        <Text style={styles.title}>LOG YOUR GROWTH</Text>
        <Text style={styles.subtitle}>Navigate Your Volunteer Journey with Ease</Text>
        <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={() => navigation.navigate('SignUpScreen')}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.signInButton]} onPress={() => navigation.navigate('SignInScreen')}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Tab = createMaterialTopTabNavigator();

  function PostScreen() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'grey', fontSize: 20}}>
          Start sharing posts
        </Text>
        <Text style={{color: 'grey', fontSize: 20}}>
          Once you do, the posts will show up here.
        </Text>
      </View>
    );
  }

  function BookmarkScreen() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>
          Bookmark Screen
        </Text>
      </View>
    );
  }

  function ConnectionScreen() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>
          Component Screen
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.about_us_profile_setting}>
        <TouchableOpacity style={styles.aboutUs} onPress={() => navigation.navigate('AboutUsScreen')}>
          <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
        </TouchableOpacity>
        
        <View style={styles.profileContainer}>
          <Image
            source={require('../../assets/icons/defaultUserImage.png') }  
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{currentUser.displayName || 'Someone Awesome'}</Text>

          <Text style={styles.bio}>{currentUser.bio || 'This person is lazy, left no description..'}</Text>
        </View>

        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate('ProfileSettingScreen')}>
          <Image source={require('../../assets/icons/SettingIcon.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUser.volunteered || 0}</Text>
          <Text style={styles.statLabel}>Volunteer</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUser.facilitated || 0}</Text>
          <Text style={styles.statLabel}>Facilitated</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUser.events || 0}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUser.group || 0}</Text>
          <Text style={styles.statLabel}>Group</Text>
        </View>
      </View>
      
      <View style={styles.utilityContainer}>
        <Tab.Navigator style={styles.tab} tabBarPosition='top'>
          <Tab.Screen name="Posts" component={PostScreen} options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/icons/profile_posts.png')}
                style={[styles.tabIcon, { tintColor: focused ? colors.primary : 'black' }]}
              />
            )
          }} 
          />
          <Tab.Screen name="Bookmarks" component={BookmarkScreen} options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/icons/profile_bookmark.png')}
                style={[styles.tabIcon, { tintColor: focused ? colors.primary : 'black' }]}
              />
            )
          }}
            />
          <Tab.Screen name="Connections" component={ConnectionScreen} options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../../assets/icons/profile_connections.png')}
                style={[styles.tabIcon, { tintColor: focused ? colors.primary : 'black' }]}
              />
            )
          
          }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  about_us_profile_setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: 30,
  },
  title:{
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  button: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: colors.primary,
  },
  signInButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  about_us_profile_setting: {
    marginTop: 60,
    width: '100%',
  },
  aboutUs: {
    position: 'absolute',
    top: 0,
    left: 20,
  },
  setting: {
    position: 'absolute',
    top: 0,
    right: 20,
  },
  profileContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 0,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: 'blue',
    borderWidth: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
    textAlign: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bio:{
    fontSize: 16,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
  },
  utilityContainer: {
    flex: 1,
    width: '100%',    
  },
  tab: {
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  tabIcon: {
    width: 25,
    height: 25,
  }
});

export default ProfileScreen;