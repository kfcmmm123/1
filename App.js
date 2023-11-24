import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Import your screen components
import AboutUsScreen from './src/screens/AboutUsScreen';
import BookmarkedScreen from './src/screens/BookmarkedScreen';
import HomepageScreen from './src/screens/HomepageScreen';
import IndividualMailScreen from './src/screens/IndividualMailScreen';
import MailScreen from './src/screens/MailScreen'; 
import SearchScreen from './src/screens/SearchScreen'; 
import VolunteeringScreen from './src/screens/VolunteeringScreen'; 

// Import colors and vector icons
import colors from './assets/colors/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Define a Stack Navigator for the Mail tab
const MailStack = createNativeStackNavigator();

const MailStackScreen = () => {
  return (
    <MailStack.Navigator>
      <MailStack.Screen name="Mail" component={MailScreen} />
      <MailStack.Screen name="IndividualMail" component={IndividualMailScreen} />
      {/* Add other screens in the Mail stack here */}
    </MailStack.Navigator>
  );
};

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
            case 'Bookmarked':
              icon = focused ? require('./assets/icons/bookmark.png') : require('./assets/icons/bookmark.png');
              break;
            // Add other cases here for additional tabs
          }
          return <Image source={icon} style={{ width: size, height: size, tintColor: color }} />;
        },
      })}
    >
      <Tab.Screen name='Homepage' component={HomepageScreen} />
      <Tab.Screen name='Search' component={SearchScreen} />
      <Tab.Screen name="Mail" component={MailStackScreen} /*options={{ tabBarBadge: 4 }*/ />
      <Tab.Screen name='Bookmarked' component={BookmarkedScreen} />
      {/* Add other Tab.Screen components here */}
    </Tab.Navigator>
  );
};


export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
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
