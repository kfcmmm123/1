import React from 'react';
import { View, Text } from 'react-native';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#fff',
    },
    input: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 10,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
});

export default PersonalDataSettingScreen;