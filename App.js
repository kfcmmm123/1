//App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { Image, StyleSheet, View, Button, Text  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screen components
import AboutUsScreen from './src/screens/AboutUsScreen';
import BookmarkedScreen from './src/screens/BookmarkedScreen';
import HomepageScreen from './src/screens/HomepageScreen';
import IndividualMailScreen from './src/screens/IndividualMailScreen';
import MailScreen from './src/screens/MailScreen'; 
import SearchScreen from './src/screens/SearchScreen'; 
import VolunteeringScreen from './src/screens/VolunteeringScreen'; 
import ProfileSettingScreen from './src/screens/ProfileSettingScreen'; 
import HomepageSettingScreen from './src/screens/HomepageSettingScreen'; 
import ProfileScreen from './src/screens/ProfileScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import UserInfoScreen from './src/screens/UserInfoScreen';
import UserInterestsScreen from './src/screens/UserInterestsScreen';

import colors from './assets/colors/colors';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Define a Stack Navigator for the Mail tab
const MailStack = createNativeStackNavigator();

const MailStackScreen = () => {
  return (
    <MailStack.Navigator>
     <MailStack.Screen 
        name="Mail" 
        component={MailScreen} 
        options={{ headerShown: false }} // Hides the header for the Mail screen
      />
      <MailStack.Screen name="IndividualMail" component={IndividualMailScreen} />
    </MailStack.Navigator>
  );
};

const RootStack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          switch (route.name) {
            case 'Homepage':
              icon = focused ? require('./assets/icons/home.png') : require('./assets/icons/home.png');
              break;
            case 'Search':
              icon = focused ? require('./assets/icons/loupe.png') : require('./assets/icons/loupe.png');
              break;
            case 'Mail':
              icon = focused ? require('./assets/icons/email.png') : require('./assets/icons/email.png');
              break;
            case 'Profile':
              icon = focused ? require('./assets/icons/profile.png') : require('./assets/icons/profile.png');
              break;
          }
          return <Image source={icon} style={{ width: size, height: size, tintColor: color }} />;
        },
      })}
    >
      <Tab.Screen name='Homepage' component={HomepageScreen} />
      <Tab.Screen name='Search' component={SearchScreen} />
      <Tab.Screen name="Mail" component={MailStackScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const checkOnboarding = async () => {
      let hasCompleted = 'false';
      try {
        hasCompleted = await AsyncStorage.getItem('hasCompletedOnboarding') || 'false';
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
      setHasCompletedOnboarding(hasCompleted === 'true');
      setIsLoading(false); // Set loading to false after retrieval
    };

    checkOnboarding();
  }, []);

  const handleFinishedOnboarding = async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
  };

  if (isLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>; // Or a loading spinner
  }

  return (
    <NavigationContainer>
        {hasCompletedOnboarding ? (
          <RootStack.Navigator>
            <RootStack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="AboutUsScreen"
              component={AboutUsScreen}
              options={{ 
                headerShown: true,
                title: 'About Us'
              }}
            />
            <RootStack.Screen
              name="VolunteeringScreen"
              component={VolunteeringScreen}
              options={{
                headerShown: true,
                title: 'Volunteering Details'
              }}
            />
            <RootStack.Screen
              name="HomepageSettingScreen"
              component={HomepageSettingScreen}
              options={{
                headerShown: true,
                title: 'HomepageSetting'
              }}
            />
            <RootStack.Screen
              name="ProfileSettingScreen"
              component={ProfileSettingScreen}
              options={{
                headerShown: false,
                title: 'ProfileSetting'
              }}
            />
            <RootStack.Screen
              name="SignInScreen"
              component={SignInScreen}
              options={{
                headerShown: true,
                title: 'Sign In'
              }}
            />
            <RootStack.Screen
              name="SignUpScreen"
              component={SignUpScreen}
              options={{
                headerShown: true,
                title: 'Sign Up'
              }}
            />
            <RootStack.Screen
              name="UserInfoScreen"
              component={UserInfoScreen}
              options={{
                headerShown: true,
                title: 'Set up your profile'
              }}
            />
            <RootStack.Screen
              name="UserInterestsScreen"
              component={UserInterestsScreen}
              options={{
                headerShown: true,
                title: 'Interests'
              }}
            />
          </RootStack.Navigator>
        ) : (
          <OnboardingScreen onFinished={handleFinishedOnboarding} />
        )}
      </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFF',
    paddingBottom: 5,
  }
});