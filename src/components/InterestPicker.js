import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../assets/colors/colors';

const InterestsOptions = [
    { name: 'Sports', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Animals', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Nature', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Teaching', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Peer', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Youth', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Seniors', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Services', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Religion', image: require('../../assets/NewVersion/Mail.png') },
    { name: 'Fundraising', image: require('../../assets/NewVersion/Mail.png') },
];

const InterestsPicker = () => {
    const [selectedInterests, setSelectedInterests] = useState([]);

    useEffect(() => {
        const loadSelectedInterests = async () => {
            const interests = await AsyncStorage.getItem('@selectedInterests');
            if (interests) {
                setSelectedInterests(JSON.parse(interests));
            }
        };
        loadSelectedInterests();
    }, []);

    const handleSave = async () => {
        try {
            await AsyncStorage.setItem('@selectedInterests', JSON.stringify(selectedInterests));
            Alert.alert("Success", "Interests Updated Successfully");
        } catch (error) {
            console.error("Error updating interests:", error);
            Alert.alert("Error", "Failed to update interests");
        }
    };

    const handleToggleInterest = (interest) => {
        setSelectedInterests(prev =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        );
    };

    const handleReset = async () => {
        setSelectedInterests([]);
        await AsyncStorage.removeItem('@selectedInterests');
      };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Interests</Text>
                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                    <Ionicons name={'reload-outline'} size={25} color={'#000000'} />
                </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Get matched with volunteer roles you’ll love.</Text>
            <View style={styles.line} />
            
            <View style={styles.interestsContainer}>
                {InterestsOptions.map(({ name, image }) => (  // Change 'icon' to 'image'
                    <View style={styles.bubble} key={name}>
                        <TouchableOpacity
                            style={[
                                styles.interest,
                                selectedInterests.includes(name) && styles.interestSelected
                            ]}
                            onPress={() => handleToggleInterest(name)}
                        >
                            <Image source={image} style={[
                                styles.icon,
                                selectedInterests.includes(name) && styles.iconSelected
                            ]} />
                        </TouchableOpacity>
                        <Text
                            style={[
                                styles.interestText,
                                selectedInterests.includes(name) && styles.interestTextSelected
                            ]}
                        >
                            {name}
                        </Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        marginBottom: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 14,
        color: '#696969',
        marginBottom: 15,
    },
    line: {
        borderBottomWidth: 0.7,
        borderBottomColor: '#D9D9D9',
        marginBottom: 25,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    bubble: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '20%',
        marginBottom: 20,
    },
    interest: {
        width: '75%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        borderRadius: 50,
        backgroundColor: '#D9D9D9',
    },
    interestSelected: {
        backgroundColor: '#9967FE',
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#696969',
    },
    iconSelected:{
        tintColor: 'white',
    },
    interestText: {
        fontSize: 12,
        color: '#696969',
    },
    interestTextSelected: {
        color: '#9967FE',
    },
    button: {
        padding: 15,
        backgroundColor: '#884EFE',
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
});

export default InterestsPicker;
