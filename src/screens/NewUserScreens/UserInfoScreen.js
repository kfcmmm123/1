import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../../assets/colors/colors';

const UserDetailsScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState({
        displayName: '',
        email: '',
        city: '',
        bio: '',
        birthday: '',
    });

    const updateUserStatus = async () => {
        await AsyncStorage.setItem('isNewUser', 'false');
    };

    const handleNext = () => {
        navigation.navigate('UserInterestsScreen', { userInfo });
    };

    const handleSkip = async () => {
        await updateUserStatus();
        navigation.navigate('UserInterestsScreen', { userInfo });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Welcome, new user!</Text>
            <Text style={styles.instructions}>Quick steps for people to get to know you...</Text>

            <Text style={styles.inputHeader}>User Name</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='How people can call you'
                    style={styles.input}
                    value={userInfo.displayName}
                    onChangeText={text => setUserInfo({ ...userInfo, displayName: text })}
                />
            </View>

            <Text style={styles.inputHeader}>Birthday</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='What is your birthday'
                    style={styles.input}
                    value={userInfo.email}
                    onChangeText={text => setUserInfo({ ...userInfo, birthday: text })}
                />
            </View>

            <Text style={styles.inputHeader}>Contact</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='How people can contact you'
                    style={styles.input}
                    value={userInfo.email}
                    onChangeText={text => setUserInfo({ ...userInfo, email: text })}
                />
            </View>

            <Text style={styles.inputHeader}>City</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='Where do you live or work'
                    style={styles.input}
                    value={userInfo.city}
                    onChangeText={text => setUserInfo({ ...userInfo, city: text })}
                />
            </View>

            <Text style={styles.inputHeader}>Bio</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='Describe yourself...'
                    style={styles.input}
                    value={userInfo.bio}
                    onChangeText={text => setUserInfo({ ...userInfo, bio: text })}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 30,
        backgroundColor: colors.background,
        flex: 1,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 15,
        color: colors.primary,
    },
    instructions: {
        fontSize: 16,
        color: 'grey',
        marginBottom: 25,
    },
    label: {
        fontSize: 18,
        marginBottom: 6,
        color: colors.text,
    },
    input: {
        width: '100%',
        height: 40,
        marginBottom: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        borderColor: colors.primary,
        backgroundColor: '#ffffff', // Set background color to white for visibility
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
    },
    skipButton:{
        backgroundColor: '#A9A9A9',
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginVertical: 10,
    },
    skipButtonText: {
        color: '#ffffff',
        fontSize: 18,
    },
    inputHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        color: colors.text,
        marginBottom: 5,
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        paddingBottom: 8,
        marginBottom: 25,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
});

export default UserDetailsScreen;
