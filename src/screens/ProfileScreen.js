import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { auth, db } from '../api/firebaseConfig';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../../assets/colors/colors';

import NotificationBanner from '../components/NotificationBanner'; // Adjust the path as necessary
import PostScreen from './PostScreen';

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
  const [modalVisible, setModalVisible] = useState(false);

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



  return (
    <SafeAreaView style={{ flex: 1 }}>
      {bannerMessage && <NotificationBanner message={bannerMessage} type={bannerType} />}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ flexGrow: 1 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header Section with Purple Background and Stats */}
        <View style={[styles.headerContainer, bannerMessage && { paddingTop: 50 }]}>
          {/* Top Icons */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => console.log('Add pressed')}
          >
            <Image
              source={require('../../assets/icons/more.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
                onPress={() => navigation.navigate('ProfileSettingScreen')}
              >
            <Image
              source={require('../../assets/icons/setting.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          {/* Stats Row */}
          <View style={styles.statsRowContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedTasksCount || 0}</Text>
              <Text style={styles.statLabel}>Volunteer</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentUser?.friends || 0}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentUser?.likes || 0}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        </View>

        {/* Profile Image (overlapping header) */}
        <View style={styles.profileImageWrapperMain}>
                <Image
                  source={require('../../assets/profile-pic.png')}
            style={styles.profileImageMain}
                />
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileInfoSection}>
          <Text style={styles.profileNameMain}>{currentUser?.displayName || 'Volunteer Name'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email || 'volunteermail.com'}</Text>
          <View style={styles.profileLocationRow}>
            <Image source={require('../../assets/icons/location.png')} style={styles.locationIcon} />
            <Text style={styles.profileLocationText}>{currentUser?.location || 'Toronto, ON, Canada'}</Text>
          </View>
          <View style={styles.socialIconsRow}>
            <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
            <Image source={require('../../assets/icons/linkedin.png')} style={styles.socialIcon} />
            <Image source={require('../../assets/icons/tumblr.png')} style={styles.socialIcon} />
          </View>
        </View>

        {/* Posts Section */}
        <View style={styles.utilityContainer}>
          <PostScreen modalVisible={modalVisible} setModalVisible={setModalVisible} />
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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

  utilityContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 20,
  },
  headerContainer: {
    backgroundColor: '#884EFE',
    height: 160,
    width: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  statsContainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 30,
    marginBottom: 0,
  },
  statItemHeader: {
    alignItems: 'center',
  },
  statValueHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabelHeader: {
    fontSize: 12,
    color: 'white',
    marginTop: 2,
  },
  profileImageWrapperMain: {
    alignItems: 'center',
    marginTop: -40, // less negative so image starts lower
    zIndex: 2,
  },
  profileImageMain: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'white',
  },
  profileInfoSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  profileNameMain: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  profileLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    tintColor: '#888',
  },
  profileLocationText: {
    color: '#888',
    fontSize: 14,
  },
  socialIconsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  socialIcon: {
    width: 32,
    height: 32,
    marginHorizontal: 8,
  },
  statsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    marginTop: 10, // or negative margin to bring closer to image
    borderRadius: 20, // optional for pill look
    paddingVertical: 8,
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#03A9F4',
    borderRadius: 28,
    elevation: 8,
    zIndex: 1000,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
});

export default ProfileScreen;