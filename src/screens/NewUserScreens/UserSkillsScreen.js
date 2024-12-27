import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../../api/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../../assets/colors/colors';

const skills = [
    'Event Planning', 'Fundraising', 'Tutoring', 'Environmental Conservation',
    'First Aid/CPR', 'Public Speaking', 'Social Media and Marketing',
    'Graphic Design', 'Counseling', 'Legal Compliance', 'Project Management',
    'Translation and Languages', 'Cooking and Nutrition', 'IT/Technical Support',
    'Construction and Carpentry', 'Art and Craft', 'Childcare',
    'Elder Care', 'Animal Care', 'Data Entry and Administration'
];

const SkillSettingScreen = ({ navigation, route }) => {
    const [selectedSkills, setSelectedSkills] = useState([]);
    const { userInfo } = route.params; // Assuming userInfo is being passed as a route parameter

    const handleToggleSkill = (skill) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const updateUserStatus = async () => {
        await AsyncStorage.setItem('isNewUser', 'false');
    };

    const handleSkip = async () => {
        await updateUserStatus();
        navigation.navigate('UserInterestsScreen', { userInfo });
    };

    const saveSkillsAndProceed = async () => {
        if (!auth.currentUser) {
            Alert.alert("Error", "No user is currently logged in.");
            return;
        }

        const { uid } = auth.currentUser;
        const userRef = doc(db, 'users', uid);

        try {
            await setDoc(userRef, { ...userInfo, skills: selectedSkills }, { merge: true });
            await AsyncStorage.setItem('selectedSkills', JSON.stringify(selectedSkills));
            navigation.navigate('UserInterestsScreen', { userInfo }); // Proceed to interests screen
        } catch (error) {
            console.error("Error updating skills:", error);
            Alert.alert("Error", "Failed to update skills.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Select Your Skills</Text>
            <Text style={styles.instructions}>Tap to select the skills that you are proud of. This helps us to get to know you better.</Text>

            <View style={styles.skillsContainer}>
                {skills.map((skill, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.skill,
                            selectedSkills.includes(skill) ? styles.skillSelected : {}
                        ]}
                        onPress={() => handleToggleSkill(skill)}
                    >
                        <Text style={[
                            styles.skillText,
                            selectedSkills.includes(skill) ? styles.skillTextSelected : {}
                        ]}>{skill}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={saveSkillsAndProceed}>
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
        color: colors.primary
    },
    instructions: {
        fontSize: 16,
        color: 'grey',
        marginBottom: 15,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 10
    },
    skill: {
        padding: 8,
        margin: 4,
        borderWidth: 1,
        borderColor: '#007bff',
        backgroundColor: colors.background,
        borderRadius: 20,
        minWidth: 90,
        textAlign: 'center',
    },
    skillSelected: {
        backgroundColor: '#007bff',
    },
    skillText: {
        textAlign: 'center',
        fontSize: 15,
        color: 'black'
    },
    skillTextSelected: {
        color: 'white'
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
});

export default SkillSettingScreen;
