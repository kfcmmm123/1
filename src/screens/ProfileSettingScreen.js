import React, { useState, useCallback } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity, ScrollView } from 'react-native';

const Stack = createStackNavigator();

// 以下是一个独立的 sub screen: profile settings -> account settings
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

// 以下是又一个独立的 sub screen: profile settings -> personal data settings
const PersonalDataSettingScreen = () => {

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthday: '',
  });

  return (
    <View style={styles.container}>
      <Text>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder='First Name'
        value={profileData.firstName}
      />
      <Text>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder='Last Name'
        value={profileData.lastName}
      />
      <Text>Email</Text>
      <TextInput
        style={styles.input}
        placeholder='Email'
        value={profileData.email}
      />
      <Text>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder='Phone Number'
        value={profileData.phoneNumber}
      />
      <Text>Birthday</Text>
      <TextInput
        style={styles.input}
        placeholder='Birthday'
        value={profileData.birthday}
      />
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

// 以下是又一个独立的 sub screen: profile settings -> skill settings

const SkillButton = ({ skill, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: selected ? '#9999ee' : '#ddd',
        padding: 10,
        margin: 10,
        borderRadius: 15,
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      <Text>{skill}</Text>
    </TouchableOpacity>
  );
};

const skills = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Dart'];

const SkillSettingScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Select your skill so that we can get better jobs for you.</Text>

      <ScrollView>
        <View style={{flexDirection: 'row' , flexWrap: 'wrap', justifyContent: 'center' }}>
        {skills.map((skill) => (
          <SkillButton key={skill} skill={skill} selected={false} onPress={() => {}} />
        ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

// 以下是一个 stack navigator，包含了上面的三个 sub screens
const ProfileSettingsScreen = ({ navigation }) => {

  function ProfileHomeScreen() {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.tabs} onPress={() => navigation.navigate('AccountSettingScreen')}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabs} onPress={() => navigation.navigate('PersonalDataSettingScreen')}>
          <Text style={styles.sectionTitle}>Personal Data Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabs} onPress={() => navigation.navigate('SkillSettingScreen')}>
          <Text style={styles.sectionTitle}>Skill Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <Stack.Navigator initialRouteName="ProfileHomeScreen">
      <Stack.Screen name="ProfileHomeScreen" component={ProfileHomeScreen}
      options={{
        title: 'Profile Settings',
      }}
      />
      <Stack.Screen name="AccountSettingScreen" component={AccountSettingScreen} 
      options={{
        title: 'Account Settings',
      }}
      />
      <Stack.Screen name="PersonalDataSettingScreen" component={PersonalDataSettingScreen}
      options={{
        title: 'Personal Data',
        headerTitleAlign: 'center',
      }}
      />
      <Stack.Screen name="SkillSettingScreen" component={SkillSettingScreen}
      options={{
        title: 'Select a Skill',
        headerTitleAlign: 'center',
      }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#fff',
  },
  tabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20 ,
    fontWeight: 'normal',
    color: '#000', // 颜色调整，确保能在背景上看清楚
    alignSelf: 'flex-start',
    marginBottom: 3,
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

export default ProfileSettingsScreen;
export { AccountSettingScreen, PersonalDataSettingScreen, SkillSettingScreen };
