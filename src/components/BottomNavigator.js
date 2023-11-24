import React from 'react'
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import HomeScreen from '../screens/HomeScreen';
// import MenuScreen from '../screens/MenuScreen';
import MailScreen from '../screens/MailScreen';
import UserScreen from '../screens/UserScreen';
import PostScreen from '../screens/PostScreen';
import TodoList from '../screens/TodoList';
import NotificationsScreen from '../screens/NotificationsScreen';

const BottomTab = createBottomTabNavigator();

const CustomTabBarButton = ({children, onPress}) => (
    <TouchableOpacity
       style = {{
        top: -10,
        justifyConent: 'center',
        alignItems: 'center',
       }}
       onPress = {onPress}
    >
        <View style = {{
            width: 50,
            height: 50,
            borderRadius: 35,
        }}>
            {children}
        </View>
    </TouchableOpacity>
);

const BottomNavigator = () => {
    return(
        <BottomTab.Navigator
          screenOptions = {
              {
                  "tabBarShowLabel": false,
                  "tabBarStyle": [
                      {
                          "display": "flex"
                      },
                      null
                  ]
              }

          }
        >
            <BottomTab.Screen name = "VolunTrack" component= {HomeScreen} options ={{
                tabBarIcon: ({focused}) => (
                    <View style = {{alignItems: 'center', justifyContent: 'center', top: 10}}>
                        <Image
                            source = {require('../../assets/home.png')}
                            resizeMode = 'contain'
                            style = {{
                                width: 30,
                                height: 30,
                                tintColor: focused ? '#2F4F4F' : '#748c94'
                            }}
                        />
                    </View>
                )
            }}/>
            <BottomTab.Screen name = "Menu" component= {MenuScreen} options ={{
                tabBarIcon: ({focused}) => (
                    <View style = {{alignItems: 'center', justifyContent: 'center', top: 10}}>
                        <Image
                            source = {require('../../assets/menu.png')}
                            resizeMode = 'contain'
                            style = {{
                                width: 30,
                                height: 30,
                                tintColor: focused ? '#2F4F4F' : '#748c94'
                            }}
                        />
                    </View>
                )
            }}/>
            <BottomTab.Screen name = "Post" component= {PostScreen} options = {{
                tabBarIcon: ({focused}) => (
                    <Image
                       source = {require('../../assets/plus.png')}
                       resizeMode = "contain"
                       style = {{
                        width: 40, 
                        height: 40,
                        tintColor: '#2F4F4F'
                       }}
                       />
                ),
                tabBarButton: (props) => (
                    <CustomTabBarButton {...props} />
                )
            }}/>
            <BottomTab.Screen name = "Mail" component= {NotificationsScreen} options ={{
                tabBarIcon: ({focused}) => (
                    <View style = {{alignItems: 'center', justifyContent: 'center', top: 10}}>
                        <Image
                            source = {require('../../assets/mail.png')}
                            resizeMode = 'contain'
                            style = {{
                                width: 30,
                                height: 30,
                                tintColor: focused ? '#2F4F4F' : '#748c94'
                            }}
                        />
                    </View>
                )
            }}/>
            <BottomTab.Screen name = "User" component= {UserScreen} options ={{
                tabBarIcon: ({focused}) => (
                    <View style = {{alignItems: 'center', justifyContent: 'center', top: 10}}>
                        <Image
                            source = {require('../../assets/user.png')}
                            resizeMode = 'contain'
                            style = {{
                                width: 30,
                                height: 30,
                                tintColor: focused ? '#2F4F4F' : '#748c94'
                            }}
                        />
                    </View>
                )
            }}/>
        </BottomTab.Navigator>
    );
}

export default BottomNavigator
