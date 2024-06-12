import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../api/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import colors from '../../../assets/colors/colors';

const skills = [
  'Event Planning', 'Fundraising', 'Tutoring', 'Environmental Conservation',
  'First Aid/CPR', 'Public Speaking', 'Social Media and Marketing',
  'Graphic Design', 'Counseling', 'Legal Compliance', 'Project Management',
  'Translation and Languages', 'Cooking and Nutrition', 'IT/Technical Support',
  'Construction and Carpentry', 'Art and Craft', 'Childcare',
  'Elder Care', 'Animal Care', 'Data Entry and Administration'
];

const SkillSettingScreen = ({ navigation }) => {
    const [selectedSkills, setSelectedSkills] = useState([]);

    useEffect(() => {
        const loadSkills = async () => {
            const savedSkills = await AsyncStorage.getItem('selectedSkills');
            if (savedSkills) {
                setSelectedSkills(JSON.parse(savedSkills));
            }
        };

        loadSkills();
    }, []);

    const handleToggleSkill = (skill) => {
        setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    };

    const saveSkills = async () => {
        if (!auth.currentUser) {
            Alert.alert("Error", "No user is currently logged in.");
            return;
        }

        try {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userDocRef, { skills: selectedSkills }, { merge: true });
            await AsyncStorage.setItem('selectedSkills', JSON.stringify(selectedSkills));
            await AsyncStorage.setItem('bannerMessage', 'Skills updated successfully!');
            await AsyncStorage.setItem('bannerType', 'success');
            await AsyncStorage.setItem('resetFirstLoad', 'true');
            navigation.navigate('Profile');
        } catch (error) {
            console.error('Error updating skills:', error);
            Alert.alert("Error", "Failed to update skills.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Select Your Skills</Text>
            <Text style={styles.instructions}>Tap to select the skills that you are proud of. This helps us to get to know you more.</Text>

            <View style={styles.skillsContainer}>
                {skills.map((skill) => (
                    <TouchableOpacity
                        key={skill}
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
            <TouchableOpacity style={styles.button} onPress={saveSkills}>
                <Text style={styles.buttonText}>Save Skills</Text>
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
    padding: 10,
    margin: 5,
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
  }
});

export default SkillSettingScreen;
