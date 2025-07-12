import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { auth, db } from '../api/firebaseConfig';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../../assets/colors/colors';

import NotificationBanner from '../components/NotificationBanner'; // Adjust the path as necessary
import PostScreen from './PostScreen';
import BookmarkedScreen from './BookmarkedScreen';

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
  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  const fetchUserData = async () => {
    setLoading(true);
    await fetchCompletedTasksCount();
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
    await fetchCompletedTasksCount();
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

  const fetchCompletedTasksCount = async () => {
    const count = await AsyncStorage.getItem('@completed_tasks_count');
    setCompletedTasksCount(count ? JSON.parse(count) : 0);
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

  const HeaderControls = () => (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => console.log('Add pressed')}
      >
        <Image
          source={require('../../assets/icons/SettingIcon.png')}
          style={styles.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('ProfileSettingScreen')}
      >
        <Image
          source={require('../../assets/icons/SettingIcon.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </>
  );

  // 统计数字组件
  const StatsOverlay = () => (
    <View style={styles.statsOverlay}>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedTasksCount || 0}</Text>
          <Text style={styles.statLabel}>Volunteer</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUser?.facilitated || 0}</Text>
          <Text style={styles.statLabel}>Facilitated</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUser?.events || 0}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUser?.group || 0}</Text>
          <Text style={styles.statLabel}>Group</Text>
        </View>
      </View>
    </View>
  );

  const Tab = createMaterialTopTabNavigator();

  function ConnectionScreen() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.noConnectionText}>
          No connection available
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1 }}
    >
      {bannerMessage && <NotificationBanner message={bannerMessage} type={bannerType} />}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ flexGrow: 1 }}  // Ensures the ScrollView content fills the space
      >
        <View style={styles.bannerContainer}>
          {/* 顶部背景部分 - 根据用户设置动态显示 */}
          {currentUser?.backgroundImage ? (
            <ImageBackground
              source={{ uri: currentUser.backgroundImage }}
              style={styles.headerBackground}
            >
              <HeaderControls />
              <StatsOverlay />
            </ImageBackground>
          ) : (
            <View style={[styles.headerBackground, styles.defaultBackground]}>
              <HeaderControls />
              <StatsOverlay />
            </View>
          )}

          {/* 用户信息部分 */}
          <View style={styles.profileSection}>
            <GestureHandlerRootView>
              <TouchableHighlight
                style={styles.profileImageWrapper}
                underlayColor="#ddd"
                onPress={() => navigation.navigate('ProfileSettingScreen')}
              >
                <Image
                  source={require('../../assets/profile-pic.png')}
                  style={styles.profileImage}
                />
              </TouchableHighlight>
            </GestureHandlerRootView>

            <Text style={styles.profileName}>
              {currentUser?.displayName || 'Someone Awesome'}
            </Text>
            <Text style={styles.bio}>
              {currentUser?.bio || 'This person is lazy, left no description..'}
            </Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  bannerContainer: {
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  headerBackground: {
    height: 200,
    width: '100%',
    position: 'relative',
    overflow: 'hidden', // 防止内容溢出
  },
  defaultBackground: {
    backgroundColor: '#884EFE',
  },
  addButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -75,
    zIndex: 3, // 确保头像在最上层
  },
  profileImageWrapper: {
    borderRadius: 75,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'white', // 添加背景色防止透明
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20, // 稍微加大字号
    fontWeight: '800',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  SettingIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
    marginTop: 5,
  },
  tab: {
    width: '100%',
    height: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { height: 1 },
  },
  tabIcon: {
    width: 25,
    height: 25,
  },
  noConnectionText: {
    fontSize: 18,
    color: 'gray',
  },
  utilityContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 20,
  },
});

export default ProfileScreen;