import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../../assets/colors/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

const UserDetailsScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState({
        displayName: '',
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        city: '',
        bio: '',
        birthday: new Date(), 
        hobbies: [],
        skills: [],
    });
    
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [countries, setCountries] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(userInfo.country || '');
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(userInfo.city || '');
    const [countryModalVisible, setCountryModalVisible] = useState(false);
    const [cityModalVisible, setCityModalVisible] = useState(false);
    const [searchCountry, setSearchCountry] = useState('');
    const [searchCity, setSearchCity] = useState('');

    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries')
          .then(response => response.json())
          .then(data => {
            setCountries(data.data);
            setFilteredCountries(data.data);
            if (selectedCountry) {
              const initialCountry = data.data.find(country => country.country === selectedCountry);
              if (initialCountry) {
                setCities(initialCountry.cities);
                setFilteredCities(initialCountry.cities);
              }
            }
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
    }, []);
    
    const handleSelectCountry = (country) => {
        setSelectedCountry(country.country);
        setCities(country.cities || []);
        setFilteredCities(country.cities || []);
        setCountryModalVisible(false);
    };
    
    const handleSelectCity = (city) => {
        setSelectedCity(city);
        setCityModalVisible(false);
    };
    
    const filterCountries = (text) => {
        setSearchCountry(text);
        const filtered = countries.filter(item => item.country.toLowerCase().includes(text.toLowerCase()));
        setFilteredCountries(filtered);
    };
    
    const filterCities = (text) => {
        setSearchCity(text);
        const filtered = cities.filter(city => city.toLowerCase().includes(text.toLowerCase()));
        setFilteredCities(filtered);
    };

    const updateUserStatus = async () => {
        await AsyncStorage.setItem('isNewUser', 'false');
    };

    const handleNext = () => {
        const updatedUserInfo = {
            ...userInfo,
            birthday: userInfo.birthday.toISOString()
        };
        navigation.navigate('UserSkillsScreen', { userInfo: updatedUserInfo });
    };

    const handleSkip = async () => {
        await updateUserStatus();
        const updatedUserInfo = {
            ...userInfo,
            birthday: userInfo.birthday.toISOString()
        };
        navigation.navigate('UserSkillsScreen', { userInfo: updatedUserInfo });
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || new Date(userInfo.birthday);
        setShowDatePicker(false);
        setUserInfo({ ...userInfo, birthday: currentDate });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Welcome, new user!</Text>
            <Text style={styles.instructions}>Quick steps for people to get to know you...</Text>

            <Text style={styles.inputHeader}>First Name</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='Your first name'
                    style={styles.input}
                    value={userInfo.firstName}
                    onChangeText={text => setUserInfo({ ...userInfo, firstName: text })}
                />
            </View>

            <Text style={styles.inputHeader}>Last Name</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='Your last name'
                    style={styles.input}
                    value={userInfo.lastName}
                    onChangeText={text => setUserInfo({ ...userInfo, lastName: text })}
                />
            </View>

            <Text style={styles.inputHeader}>Display Name</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='How people can call you'
                    style={styles.input}
                    value={userInfo.displayName}
                    onChangeText={text => setUserInfo({ ...userInfo, displayName: text })}
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

            <Text style={styles.inputHeader}>Birthday</Text>
            <TouchableOpacity style={styles.date} onPress={() => setShowDatePicker(true)}>
                <Text>{new Date(userInfo.birthday).toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={new Date(userInfo.birthday)}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            <Text style={styles.inputHeader}>Contact</Text>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='How people can contact you'
                    style={styles.input}
                    value={userInfo.email}
                    onChangeText={text => setUserInfo({ ...userInfo, contact: text })}
                />
            </View>

            <Text style={styles.inputHeader}>Location</Text>
            <Text style={styles.city}>Country: </Text>
            <TouchableOpacity onPress={() => setCountryModalVisible(true)} style={styles.date}>
                <Text>{selectedCountry || 'Select Country'}</Text>
            </TouchableOpacity>
            <Modal visible={countryModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalView}>
                <TextInput
                    style={styles.searchBox}
                    placeholder="Search country"
                    value={searchCountry}
                    onChangeText={filterCountries}
                />
                <FlatList
                    data={filteredCountries}
                    keyExtractor={item => item.iso3}
                    renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item} onPress={() => handleSelectCountry(item)}>
                        <Text style={styles.itemText}>{item.country}</Text>
                    </TouchableOpacity>
                    )}
                />
                <Button title="Close" onPress={() => setCountryModalVisible(false)} />
                </View>
            </Modal>

            <Text style={styles.city}>City: </Text>
            <TouchableOpacity
                onPress={() => {
                if (selectedCountry) {
                    setCityModalVisible(true);
                }
                }}
                style={[styles.date, !selectedCountry && { backgroundColor: '#f0f0f0' }]}
                disabled={!selectedCountry}
            >
                <Text>{selectedCity || 'Select City (select your country first!)'}</Text>
            </TouchableOpacity>

            <Modal visible={cityModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalView}>
                <TextInput
                    style={styles.searchBox}
                    placeholder="Search city"
                    value={searchCity}
                    onChangeText={filterCities}
                />
                <FlatList
                    data={filteredCities}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item} onPress={() => handleSelectCity(item)}>
                        <Text style={styles.itemText}>{item}</Text>
                    </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.itemText}>No cities available</Text>}
                />
                <Button title="Close" onPress={() => setCityModalVisible(false)} />
                </View>
            </Modal>

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
    date: {
        width: '100%',
        marginBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        padding: 10,
    },
    city: {
        color: '#555',
        marginTop: 5,
    },
    modalView: {
        flex: 1,
        marginTop: 100,
        backgroundColor: 'white',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    itemText: {
        fontSize: 16
    },
    searchBox: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        margin: 10,
        borderRadius: 5,
        backgroundColor: 'white'
    },
});

export default UserDetailsScreen;
