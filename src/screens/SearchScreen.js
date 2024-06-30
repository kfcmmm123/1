import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar, Image, StyleSheet, ScrollView, Text, RefreshControl, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import colors from '../../assets/colors/colors';
import SearchSearchBar from '../components/SearchSearchBar';
import ResultsList from '../components/ResultsList';
import useSearchApi from '../hooks/useResults';
import { auth, db } from '../api/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchScreen = ({ navigation }) => {
    const [term, setTerm] = useState('');
    const [cities, setCities] = useState([]);
    const [autocompleteData, setAutocompleteData] = useState([]);
    const [showCityList, setShowCityList] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');
    const [searchApi, results, errorMessage] = useSearchApi();
    const [filteredResults, setFilteredResults] = useState([]);
    const [userHobbies, setUserHobbies] = useState([]);
    const [filterByHobbies, setFilterByHobbies] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const initialLoadRef = useRef(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const refreshResults = useCallback(() => {
        setRefreshing(true);
        searchApi(term, selectedCity).then(() => {
            setRefreshing(false);
        });
    }, [term, selectedCity, searchApi]);

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                const storedUserData = await AsyncStorage.getItem('@user_data');
                if (storedUserData) {
                    const userData = JSON.parse(storedUserData);
                    setCurrentUser(userData);
                    setUserHobbies(userData.hobbies || []);
                }
            };
            fetchUserData();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            if (initialLoadRef.current) {
                const performSearch = async () => {
                    setIsLoading(true);
                    await searchApi('volunteer', selectedCity);
                    setIsLoading(false);
                };

                performSearch();
                initialLoadRef.current = false;
            }
        }, [selectedCity])
    );

    const toggleCityList = () => {
        setShowCityList(!showCityList);
    };

    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries')
            .then((response) => response.json())
            .then((data) => {
                const canada = data.data.find((country) => country.country === 'Canada');
                if (canada && canada.cities) {
                    const cityItems = canada.cities.map((city) => ({
                        label: city,
                        value: city,
                    }));
                    setCities(cityItems);
                } else {
                    setCities([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching cities:', error);
                setCities([]);
            });
    }, []);

    const normalizeString = (inputString) => {
        return inputString.toLowerCase();
    };

    const getCategoriesText = (categories) => {
        if (typeof categories === 'string') {
            return categories;
        } else if (Array.isArray(categories)) {
            return categories.map(cat => cat.title).join(', ');
        }
        return '';
    };

    useEffect(() => {
        let cityResults = results || [];

        if (selectedCity) {
            cityResults = cityResults.filter(
                result => (result.location && result.location.city === selectedCity) || (result.city === selectedCity)
            );
        }

        if (term) {
            const lowerCaseTerm = normalizeString(term);
            cityResults = cityResults.filter(
                result => {
                    const name = result.name ? normalizeString(result.name) : '';
                    const location = result.location && result.location.city ? normalizeString(result.location.city) : '';
                    const city = result.city ? normalizeString(result.city) : '';
                    return name.includes(lowerCaseTerm) || location.includes(lowerCaseTerm) || city.includes(lowerCaseTerm);
                }
            );
        }

        if (userHobbies && userHobbies.length > 0 && filterByHobbies) {
            cityResults = cityResults.filter(result => {
                const categoriesText = result.categories ? getCategoriesText(result.categories) : '';
                const normalizedCategories = normalizeString(categoriesText);
                return userHobbies.some(hobby => normalizedCategories.includes(normalizeString(hobby)));
            });
        }

        setFilteredResults(cityResults);
    }, [selectedCity, term, results, userHobbies, filterByHobbies]);

    const handleCitySearch = (query) => {
        setSelectedCity(query);
        if (query === '') {
            setAutocompleteData([]);
        } else {
            const filtered = cities.filter((city) =>
                city.label.toLowerCase().includes(query.toLowerCase())
            );
            setAutocompleteData(filtered);
        }
    };

    const handleSearchSubmit = async () => {
        await searchApi(term, selectedCity);
    };

    const dynamicStyles = StyleSheet.create({
        input: {
            padding: 10,
            height: 40,
        },
        container: {
            width: '90%',
            alignSelf: 'center',
            backgroundColor: 'transparent',
        },
        listStyle: {
            margin: '10',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 10,
            width: '90%',
            alignSelf: 'center',
            marginBottom: 10,
        },
        searchInput: {
            flex: 1,
            padding: 10,
        },
        toggleIcon: {
            width: 20,
            height: 20,
            marginRight: 10,
        },
        toggleContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            paddingVertical: 10,
        },
        toggleButton: {
            backgroundColor: colors.lightGray,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
        },
        toggleButtonActive: {
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
        },
        toggleButtonText: {
            color: 'black',
            fontWeight: 'bold',
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: 10,
            padding: 10,
            backgroundColor: 'white',
        },
        checkbox: {
            width: 24,
            height: 24,
            marginRight: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 4,
        },
        checkboxActive: {
            backgroundColor: colors.primary,
        },
        checkboxLabel: {
            fontSize: 16,
            color: '#000',
        },
    });

    return (
        <ScrollView
            style={staticStyles.scrollView}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refreshResults}
                />
            }
        >
            <View style={staticStyles.container}>
                <View style={staticStyles.topBar}>
                    <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')}>
                        <Image source={require('../../assets/adaptive-icon-cropped.png')} style={staticStyles.icon} />
                    </TouchableOpacity>
                </View>

                <Text style={staticStyles.header}>Volunteer Opportunities</Text>

                <View style={dynamicStyles.inputContainer}>
                    <SearchSearchBar
                        term={term}
                        onTermChange={setTerm}
                        onTermSubmit={handleSearchSubmit}
                        style={dynamicStyles.searchInput}
                    />
                    <TouchableOpacity onPress={toggleCityList}>
                        <Image
                            source={require('../../assets/icons/More.png')}
                            style={dynamicStyles.toggleIcon}
                        />
                    </TouchableOpacity>
                </View>
                {showCityList && (
                    <>
                        <Autocomplete
                            data={autocompleteData.length ? autocompleteData : []}
                            defaultValue={selectedCity}
                            onChangeText={handleCitySearch}
                            placeholder="City/Location"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style={dynamicStyles.input}
                            containerStyle={dynamicStyles.container}
                            listStyle={dynamicStyles.listStyle}
                            flatListProps={{
                                keyExtractor: (item, index) => `item-${index}`,
                                renderItem: ({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedCity(item.value);
                                            setAutocompleteData([]);
                                        }}
                                    >
                                        <Text style={dynamicStyles.itemText}>{item.label}</Text>
                                    </TouchableOpacity>
                                ),
                            }}
                        />
                        <View style={dynamicStyles.checkboxContainer}>
                            <TouchableOpacity
                                style={[dynamicStyles.checkbox, filterByHobbies ? dynamicStyles.checkboxActive : null]}
                                onPress={() => setFilterByHobbies(!filterByHobbies)}
                            >
                                {filterByHobbies && <Text style={{ color: 'white' }}>✓</Text>}
                            </TouchableOpacity>
                            <Text style={dynamicStyles.checkboxLabel}>
                                {filterByHobbies ? 'Hobby Filter Enabled' : 'Enable Hobby Filter'}
                            </Text>
                        </View>
                    </>
                )}

                {isLoading ? (
                    <ActivityIndicator style={{ margin: 30 }} size="large" color={colors.primary} />
                ) : (
                    <ResultsList results={filteredResults.length ? filteredResults : []} navigation={navigation} />
                )}
                {!isLoading && filteredResults.length === 0 && (selectedCity || term) && (
                    <Text style={staticStyles.noResultsMessage}>
                        {selectedCity && !term ? 'No results found for the selected city.' : null}
                        {term && !selectedCity ? 'No results found for the search term.' : null}
                        {term && selectedCity ? 'No results found for the selected city and search term.' : null}
                    </Text>
                )}

                {errorMessage ? (
                    <Text style={staticStyles.errorMessage}>{errorMessage}</Text>
                ) : null}
                <StatusBar style="auto" />
            </View>
        </ScrollView>
    );
};

const staticStyles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        paddingTop: 60,
        paddingHorizontal: 15,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    itemText: {
        margin: 10,
    },
    errorMessage: {
        color: 'red',
        textAlign: 'center',
    },
    noResultsMessage: {
        textAlign: 'center',
        color: colors.text,
        fontSize: 16,
        marginTop: 20,
    },
});

export default SearchScreen;
