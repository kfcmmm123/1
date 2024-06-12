import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { auth, db } from '../api/firebaseConfig';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../../assets/colors/colors';

import NotificationBanner from '../components/NotificationBanner'; // Adjust the path as necessary
import PostScreen from './profileScreens/PostScreen';
import BookmarkedScreen from './profileScreens/BookmarkedScreen';

import { TouchableHighlight } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AccountSettingScreen } from './ProfileSettingScreen';

const ProfileScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const firstLoad = useRef(true);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState('success');

  const fetchUserData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setCurrentUser(docSnap.data());
        await AsyncStorage.setItem('@user_data', JSON.stringify(docSnap.data()));
      } else {
        console.log("No user data available");
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  };

  const refreshUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setCurrentUser(docSnap.data());
        await AsyncStorage.setItem('@user_data', JSON.stringify(docSnap.data()));
      } else {
        console.log("No user data available");
      }
    } else {
      setCurrentUser(null);
    }
  };

  const checkForUpdates = async () => {
    const forceUpdate = await AsyncStorage.getItem('resetFirstLoad');
    if (forceUpdate === 'true') {
      await AsyncStorage.removeItem('resetFirstLoad');
      return true;
    }
    return false;
  };

  useFocusEffect(
    useCallback(() => {
      const initiateDataFetch = async () => {
        // Trigger fetch data only on the first load or if explicitly asked via AsyncStorage flag
        const shouldReset = await AsyncStorage.getItem('resetFirstLoad');
        if (firstLoad.current || shouldReset === 'true') {
          await fetchUserData();
          firstLoad.current = false;
          if (shouldReset === 'true') {
            await AsyncStorage.removeItem('resetFirstLoad');
          }
        }

        // Manage the banner
        const bannerToShow = await AsyncStorage.getItem('bannerMessage');
        const bannerTypeToShow = await AsyncStorage.getItem('bannerType');
        if (bannerToShow && bannerTypeToShow) {
          setBannerMessage(bannerToShow);
          setBannerType(bannerTypeToShow);
          await AsyncStorage.removeItem('bannerMessage');
          await AsyncStorage.removeItem('bannerType');
          setTimeout(() => {
            setBannerMessage(''); // Clear banner after showing
          }, 3000); // Duration after which the banner should disappear
        }
      };

      initiateDataFetch();
    }, [])
  );


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshUserData().finally(() => setRefreshing(false));
  }, []);

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
        {bannerMessage && <NotificationBanner message={bannerMessage} type={bannerType} />}

      </View>
    );
  }

  const Tab = createMaterialTopTabNavigator();

  // function BookmarkScreen() {
  //   return (
  //     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
  //       <Text>
  //         Bookmark Screen
  //       </Text>
  //     </View>
  //   );
  // }

  function ConnectionScreen() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>
          Component Screen
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ flexGrow: 1 }}  // Ensures the ScrollView content fills the space
    >
      {bannerMessage && <NotificationBanner message={bannerMessage} type={bannerType} />}

      <View style={styles.about_us_profile_setting}>
        <TouchableOpacity style={styles.aboutUs} onPress={() => navigation.navigate('AboutUsScreen')}>
          <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <GestureHandlerRootView>
            <TouchableHighlight underlayColor="#ddd" onPress={() => navigation.navigate('ProfileSettingScreen')}>
              <Image
                source={require('../../assets/profile-pic.png')}
                style={styles.profileImage}
              />
            </TouchableHighlight>
          </GestureHandlerRootView>

          <Text style={styles.profileName}>{currentUser.displayName || 'Someone Awesome'}</Text>

          <Text style={styles.bio}>{currentUser.bio || 'This person is lazy, left no description..'}</Text>
        </View>


        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate('ProfileSettingScreen')}>
          <Image source={require('../../assets/icons/SettingIcon.png')} style={styles.SettingIcon} />
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
        <Tab.Navigator
          style={styles.tab}
          tabBarPosition='top'
          screenOptions={{
            tabBarLabelStyle: { fontSize: 12 },  // Optional: Adjust tab label styles
            tabBarStyle: { backgroundColor: 'white' },
            tabBarIndicatorStyle: { backgroundColor: colors.primary }
          }}
        >
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
          <Tab.Screen name="Bookmarks" component={BookmarkedScreen} options={{
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  title: {
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
    paddingHorizontal: 30,
    marginBottom: 20,
    marginTop: 5,
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
    left: 15,
  },
  setting: {
    position: 'absolute',
    top: 0,
    right: 15,
  },
  profileContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
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
  bio: {
    fontSize: 16,
    marginBottom: 20,
    marginTop: 10,
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
  SettingIcon: {
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