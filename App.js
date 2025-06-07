//App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Image, StyleSheet, View, Text } from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screen components
import AboutUsScreen from './src/screens/AboutUsScreen';
import HomepageScreen from './src/screens/HomepageScreen';
import IndividualMailScreen from './src/screens/IndividualMailScreen';
import MailScreen from './src/screens/MailScreen';
import VolunteeringScreen from './src/screens/VolunteeringScreen';
import ProfileSettingScreen from './src/screens/ProfileSettingScreen';
import HomepageSettingScreen from './src/screens/HomepageSettingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SignInUpScreen from './src/screens/SignInUpScreen';
import ForgetPassword from './src/screens/ForgetPassword';
import UserInfoScreen from './src/screens/UserInfoScreen';
import UserInterestsScreen from './src/screens/UserInterestsScreen';
import EditInterestScreen from './src/screens/EditInterestScreen';
import EditCityScreen from './src/screens/EditCityScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from './src/api/firebaseConfig'; // Your configured auth

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
        tabBarActiveTintColor: '#884EFE',
        tabBarInactiveTintColor: '#884EFE',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500', marginBottom: 3 },
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          switch (route.name) {
            case 'Home':
              icon = 'home';
              break;
            case 'Activity':
              icon = 'checklist';
              break;
            case 'Contact':
              icon = 'mail';
              break;
            case 'Account':
              icon = 'person';
              break;
          }
          return <Octicons name={icon} size={25} color={focused ? '#884EFE' : '#B0A7F1'} />;
        },
      })}
    >
      <Tab.Screen name='Home' component={HomepageScreen} />
      <Tab.Screen name='Activity' component={ActivityScreen} />
      <Tab.Screen name="Contact" component={MailStackScreen} />
      <Tab.Screen name='Account' component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  enableScreens();

  useEffect(() => {
    const initialize = async () => {
      try {
        const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(completed === 'true');
      } catch (e) {
        console.error('Failed to get onboarding status:', e);
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsAuthenticated(!!user);
        setIsLoading(false); // Wait for both onboarding and auth
      });

      return unsubscribe;
    };

    initialize();
  }, []);

  if (isLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>; // Or a loading spinner
  }

  let initialScreen = null;

  if (!hasCompletedOnboarding) {
    initialScreen = 'OnboardingScreen';
  } else if (!isAuthenticated) {
    initialScreen = 'SignInUpScreen';
  } else {
    initialScreen = 'Main';
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName={initialScreen}>
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
            headerShown: false,
            title: 'Volunteering Details'
          }}
        />
        <RootStack.Screen
          name="HomepageSettingScreen"
          component={HomepageSettingScreen}
          options={{
            headerShown: false,
            title: 'HomepageSetting'
          }}
        />
        <RootStack.Screen
          name="ProfileSettingScreen"
          component={ProfileSettingScreen}
          options={{
            headerShown: true,
            title: 'ProfileSetting'
          }}
        />
        <RootStack.Screen
          name="SignInScreen"
          component={SignInScreen}
          options={{
            headerShown: false,
            title: 'Sign In'
          }}
        />
        <RootStack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{
            headerShown: false,
            title: 'Sign Up'
          }}
        />
        <RootStack.Screen
          name="ForgetPassword"
          component={ForgetPassword}
          options={{
            headerShown: false,
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
        <RootStack.Screen
          name="EditInterestScreen"
          component={EditInterestScreen}
          options={{
            headerShown: true,
            title: 'Edit your interests'
          }}
        />
        <RootStack.Screen
          name="EditCityScreen"
          component={EditCityScreen}
          options={{
            headerShown: true,
            title: 'Edit your location'
          }}
        />
        <RootStack.Screen
          name="OnboardingScreen"
          component={OnboardingScreen}
          options={{
            headerShown: false,
            title: 'Onboarding'
          }}
        />
        <RootStack.Screen
          name="SignInUpScreen"
          component={SignInUpScreen}
          options={{
            headerShown: false,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 5,
    height: 60,
    paddingTop: 5
  }
});
