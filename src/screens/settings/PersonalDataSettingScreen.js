import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, ScrollView, TouchableOpacity, Button, FlatList, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../api/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import colors from '../../../assets/colors/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalDataSettingScreen = ({ route, navigation }) => {
  const { userInfo } = route.params;
  const [loading, setLoading] = useState(true);
  
  // Convert birthday to a Date object safely
  const initialBirthday = userInfo.birthday ? new Date(userInfo.birthday) : new Date();
  
  const [firstName, setFirstName] = useState(userInfo.firstName || '');
  const [lastName, setLastName] = useState(userInfo.lastName || '');
  const [email, setEmail] = useState(userInfo.email || '');
  const [phone, setPhone] = useState(userInfo.phone || '');
  const [birthday, setBirthday] = useState(initialBirthday);
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
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
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

  const savePersonalData = async () => {
    try {
      // Format the birthday to ISO string only if it's a valid date
      const formattedBirthday = birthday instanceof Date ? birthday.toISOString().split('T')[0] : birthday;
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { firstName, lastName, email, phone, birthday: formattedBirthday, city: selectedCity, country: selectedCountry }, { merge: true });
      await AsyncStorage.setItem('@user_data', JSON.stringify({ ...userInfo, firstName, lastName, email, phone, birthday: formattedBirthday }));
      await AsyncStorage.setItem('bannerMessage', 'Profile updated successfully!');
      await AsyncStorage.setItem('bannerType', 'success');
      await AsyncStorage.setItem('resetFirstLoad', 'true');
      navigation.navigate('Profile');
    } catch (error) {
      console.error('Error saving personal data:', error);
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(false);
    setBirthday(currentDate);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
      />
      <Text style={styles.label}>Birthday</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{birthday instanceof Date ? birthday.toDateString() : 'Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={birthday}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}

      <Text style={styles.label}>Location</Text>
      <Text style={styles.city}>Country: </Text>
      <TouchableOpacity onPress={() => setCountryModalVisible(true)} style={styles.input}>
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
      <TouchableOpacity onPress={() => setCityModalVisible(true)} style={styles.input}>
        <Text>{selectedCity || 'Select City'}</Text>
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
      
      <TouchableOpacity style={styles.button} onPress={savePersonalData}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 6,
    color: colors.text,
  },
  input: {
    width: '100%',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
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
  city:{
    color: 'grey',
    marginTop: 5,
  },
});

export default PersonalDataSettingScreen;
