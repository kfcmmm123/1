import React, { useState } from 'react';
import { View, Button, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { db, auth } from '../../api/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../../assets/colors/colors';

const hobbiesOptions = [
    'Sports', 'Animals', 'Environment', 'Teaching', 'Peer Support', 'Youth', 'Seniors',
    'Social Services', 'Religion', 'Fundraising', 'Communication', 'Food',
    'Event Assistence', 'Arts', 'Culture', 'Accessibility' , 'Finance', 'Leadership', 'Education',
    'Literacy', 'IT Support', 'Settlement and Newcomers', 'Recreation', 'Trades', 'Maintenance'
];

const UserInterestsScreen = ({ route, navigation }) => {
    const { userInfo } = route.params;
    const [selectedHobbies, setSelectedHobbies] = useState([]);

    const updateUserStatus = async () => {
        await AsyncStorage.setItem('isNewUser', 'false');
    };

    const handleSave = async () => {
        if (!auth.currentUser) {
            Alert.alert("Error", "No user is currently logged in.");
            return; // Stop execution if no user is logged in
        }
    
        const { uid } = auth.currentUser;
        const userRef = doc(db, 'users', uid);
    
        try {
            await setDoc(userRef, { ...userInfo, hobbies: selectedHobbies }, { merge: true });
            await AsyncStorage.setItem('isNewUser', 'false');
            Alert.alert("Success", "Profile Updated Successfully");
            navigation.navigate('Homepage');
        } catch (error) {
            console.error("Error updating user info:", error);
            Alert.alert("Error", "Failed to update profile");
        }
    };

    const handleSkip = async () => {
        await updateUserStatus();
        navigation.navigate('Homepage');
    };

    const handleToggleHobby = (hobby) => {
        setSelectedHobbies(prev =>
            prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Select Your Interests</Text>
            <Text style={styles.instructions}>Tap to select the hobbies that interest you. This helps us tailor a personalized experience for you.</Text>

            <View style={styles.hobbiesContainer}>
                {hobbiesOptions.map(hobby => (
                    <TouchableOpacity
                        key={hobby}
                        style={[
                            styles.hobby,
                            selectedHobbies.includes(hobby) ? styles.hobbySelected : {}
                        ]}
                        onPress={() => handleToggleHobby(hobby)}
                    >
                        <Text style={[
                            styles.hobbyText,
                            selectedHobbies.includes(hobby) ? styles.hobbyTextSelected : {}
                        ]}>{hobby}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save your profile</Text>
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
        flex:1,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 15,
        color: colors.primary
    },
    instructions: {
        fontSize: 16,
        color: 'grey',
        marginBottom: 15,
    },
    hobbiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 10
    },
    hobby: {
        padding: 8,
        margin: 4,
        borderWidth: 1,
        borderColor: '#007bff',
        backgroundColor: colors.background,
        borderRadius: 20,
        minWidth: 90,
        textAlign: 'center',
    },
    hobbySelected: {
        backgroundColor: '#007bff',
    },
    hobbyText: {
        textAlign: 'center',
        fontSize: 15,
        color: 'black' // Default color
    },
    hobbyTextSelected: {
        color: 'white' // Color when selected
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginVertical: 10,
        marginTop: 30,
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
});

export default UserInterestsScreen;