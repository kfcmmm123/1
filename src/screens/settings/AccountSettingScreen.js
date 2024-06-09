import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { StyleSheet } from 'react-native';

const AccountSettingScreen = ({navigation}) => {

    const [profileData, setProfileData] = useState({
      displayName: '',
      bio: '',
    });
  
    const saveProfileData = async () => {
      // 保存数据的逻辑
      console.log('Data saved:', profileData);
      navigation.navigate('Profile');
    };
  
    const handleSignOut = async () => {
      // 登出逻辑
      console.log('User signed out');
      navigation.navigate('Profile');
    };
  
    return (
      <View style={styles.container}>
        <Text>Profile Settings</Text>
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={profileData.displayName}
          onChangeText={(text) => setProfileData({ ...profileData, displayName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Bio"
          value={profileData.bio}
          onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
        />
        <TouchableOpacity style={styles.button} onPress={saveProfileData}>
          <Text>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#fff',
    },
    input: {
        width: '100%',
        marginBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 10,
    },
    button: {
        backgroundColor: '#9999ee',
        padding: 10,
        margin: 10,
        borderRadius: 15,
        alignItems: 'center',
    },
  });

export default AccountSettingScreen;