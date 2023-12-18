import React, { useState, useEffect } from 'react';
import { StatusBar, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import colors from '../../assets/colors/colors';
import SearchSearchBar from '../components/SearchSearchBar';
import ResultsList from '../components/ResultsList';
import useSearchApi from '../hooks/useResults'; // Ensure this is the correct path

const SearchScreen = ({ navigation }) => {
    const [term, setTerm] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchApi, results, errorMessage] = useSearchApi();
    const [filteredResults, setFilteredResults] = useState([]);

    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries')
            .then(response => response.json())
            .then(data => {
                const canada = data.data.find(country => country.country === 'Canada');
                if (canada && canada.cities) {
                    const cityItems = canada.cities.map(city => ({ label: city, value: city }));
                    setCities(cityItems);
                }
            })
            .catch(error => console.error('Error fetching cities:', error));
    }, []);

    useEffect(() => {
        if (selectedCity) {
            const cityResults = results.filter(result => result.city === selectedCity);
            setFilteredResults(cityResults);
        } else {
            setFilteredResults(results);
        }
    }, [selectedCity, results]);

    const handleSearchSubmit = () => {
        searchApi(term);
    };

    return(
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')}>
                    <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.header}>Volunteer Opportunities</Text>
                <SearchSearchBar term={term} onTermChange={setTerm} onTermSubmit={handleSearchSubmit} />
                <View style={styles.pickerContainer}>
                    <RNPickerSelect
                        onValueChange={value => setSelectedCity(value)}
                        items={cities}
                        placeholder={{ label: "City/Location", value: null }}
                    />
                </View>
                <ResultsList 
                    results={filteredResults}
                    navigation={navigation}
                />
                {errorMessage ? <Text>{errorMessage}</Text> : null}
                <StatusBar style="auto" />
            </View>
        </ScrollView>
    );
};
const styles = StyleSheet.create ({
    pickerContainer: {
        width: '90%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 10,
        marginTop: 5,
        backgroundColor: '#FFF', 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1, // Increase shadow opacity for a darker shadow
        shadowRadius: 5, // Increase shadow radius for a fuller shadow
        elevation: 5,
    },
    scrollView: {
        flex: 1, // Ensure ScrollView fills the screen
        backgroundColor: colors.background,
    },
    container: {
        paddingTop: 60,
        paddingHorizontal: 15,
        marginTop: -60,
    },
    icon: {
        width: 60,
        height: 60,
        marginBottom: 15,
    },
    header: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold', 
        fontSize: 28, 
        marginVertical: 15,
        marginLeft: 15,
        textAlign: 'left', 
        fontWeight: 'bold',                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
    }, 
})

export default SearchScreen;
