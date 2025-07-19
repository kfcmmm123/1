import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBar, Button, ScrollView, Text, TouchableOpacity, View, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import useSearchApi from '../hooks/useResults';

import colors from '../../assets/colors/colors';
import HomepageSearchBar from '../components/HomepageSearchBar';
import Categories from '../components/Categories';
import ResultsList from '../components/ResultsList';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomepageScreen = ({ navigation }) => {
  const [term, setTerm] = useState('');
  const [searchApi, results, errorMessage] = useSearchApi();
  const [filteredResults, setFilteredResults] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const hasActiveFilters = term || selectedCity || selectedCategory || selectedStartDate || selectedEndDate || selectedCategories.length > 0;

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '';

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const resetFilter = async () => {
    // Clear all filter states
    setTerm('');
    setSelectedCity('');
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectedCategories([]);
    setSelectedCategory('');

    // Refresh data to reset the displayed results
    await searchApi('', ''); // Empty values to fetch unfiltered results
  };

  const filterText = () => {
    const filters = [];
    if (selectedCity) filters.push(`City: ${selectedCity}`);
    if (selectedStartDate && selectedEndDate) {
      filters.push(`Date: ${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`);
    }
    if (selectedCategory) {
      filters.push(`Categories: ${selectedCategory}`);
    }
    if (selectedCategories.length > 0) {
      filters.push(`Categories: ${selectedCategories.join(', ')}`);
    }
    return filters.join(' | ');
  };

  const refreshResults = useCallback(async () => {
    setRefreshing(true);
    try {
      await searchApi(term, selectedCity);
    } catch (error) {
      console.error('Failed to refresh results:', error);
    } finally {
      setRefreshing(false);  // Ensures refreshing state always resets
    }
  }, [term, selectedCity, searchApi]);


  useFocusEffect(
    useCallback(() => {
      const fetchInitialData = async () => {
        const [
          storedUserData,
          interestsFilter,
          startDateFilter,
          endDateFilter,
          cityFilter
        ] = await Promise.all([
          AsyncStorage.getItem('@user_data'),
          AsyncStorage.getItem('@selectedInterests'),
          AsyncStorage.getItem('@selectedStartDate'),
          AsyncStorage.getItem('@selectedEndDate'),
          AsyncStorage.getItem('@selectedCity')
        ]);

        if (storedUserData) setCurrentUser(JSON.parse(storedUserData));

        setSelectedCity(cityFilter || '');
        setSelectedStartDate(startDateFilter || null);
        setSelectedEndDate(endDateFilter || null);
        setSelectedCategories(interestsFilter ? JSON.parse(interestsFilter) : []);

        refreshResults();
      };

      fetchInitialData();
    }, [])
  );

  useEffect(() => {
    refreshResults();
  }, [selectedCity, selectedStartDate, selectedEndDate, selectedCategories, selectedCategory]);


  const normalizeString = (inputString) => inputString.toLowerCase();

  const getCategoriesText = (categories) => {
    if (typeof categories === 'string') return categories;  // Handle string case
    if (Array.isArray(categories)) {
      // Directly join the strings if no `.title` exists
      return categories.join(', ');
    }
    return '';
  };

  useEffect(() => {
    let updatedResults = results;

    if (selectedCity) {
      updatedResults = updatedResults.filter(
        result => (result.location?.city === selectedCity || result.city === selectedCity)
      );
    }

    if (term) {
      const lowerCaseTerm = normalizeString(term);
      updatedResults = updatedResults.filter(result => {
        const name = result.name ? normalizeString(result.name) : '';
        const location = result.location?.city ? normalizeString(result.location.city) : '';
        const city = result.city ? normalizeString(result.city) : '';
        return name.includes(lowerCaseTerm) || location.includes(lowerCaseTerm) || city.includes(lowerCaseTerm);
      });
    }

    if (selectedStartDate && selectedEndDate) {
      updatedResults = updatedResults.filter(result => {
        const eventDate = new Date(result.date);
        const start = new Date(selectedStartDate);
        const end = new Date(selectedEndDate);
        return eventDate >= start && eventDate <= end;
      });
    }

    if (selectedCategory) {
      updatedResults = updatedResults.filter(result => {
        const categoriesText = getCategoriesText(result.categories);
        return categoriesText.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    if (selectedCategories.length > 0) {
      updatedResults = updatedResults.filter(result => {
        const categoriesText = getCategoriesText(result.categories);
        return selectedCategories.some(cat => categoriesText.includes(cat));
      });
    }

    setFilteredResults(updatedResults);
  }, [selectedCity, term, results, selectedCategories, selectedStartDate, selectedEndDate]);

  const handleSearchSubmit = async () => {
    await searchApi(term, selectedCity);
  };

  const openSettings = () => {
    navigation.navigate('HomepageSettingScreen');
  };

  useEffect(() => {
    const checkNewUser = async () => {
      const isNewUser = await AsyncStorage.getItem('isNewUser');
      if (isNewUser === 'true') {
        await AsyncStorage.removeItem('isNewUser');
        navigation.navigate('UserInfoScreen'); 
      }
    };

    checkNewUser();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshResults}
          />
        }
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
            <Text style={{ fontSize: 20, fontWeight: '500', marginRight: 5 }}>VolunTrack</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
            <TouchableOpacity>
              <Ionicons name={'search-outline'} size={30} color={'#000000'} />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 5 }} onPress={openSettings}>
              <Ionicons name={'options-outline'} size={30} color={'#000000'} />
            </TouchableOpacity>
          </View>
        </View>
        <HomepageSearchBar
          term={term}
          onTermChange={setTerm}
          onTermSubmit={handleSearchSubmit}
        />
              <Button title={"Set"} onPress={() => AsyncStorage.setItem('hasCompletedOnboarding', 'false')}></Button>

        {!hasActiveFilters && <Categories onCategorySelect={handleCategorySelect} />}
        <Text style={styles.text}>{hasActiveFilters ? 'Filtered Results' : 'Recommended Jobs'}</Text>
        {hasActiveFilters && <TouchableOpacity onPress={resetFilter}><Text>Reset Filter</Text></TouchableOpacity>}
        {(hasActiveFilters && !term) && (
          <Text style={styles.filterSummary}>{filterText()}</Text>
        )}
        {filteredResults.length === 0 && (
          <Text style={styles.noResultsMessage}>No results found.</Text>
        )}
        <ResultsList results={filteredResults} navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 20,
    marginLeft: 15,
    marginTop: 10,
    color: '#000000',
    fontWeight: 'bold',
  },
  filterSummary: {
    marginLeft: 15,
    marginTop: 5,
    color: '#555',
    fontSize: 14,
    fontStyle: 'italic',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 5,
  },
  noResultsMessage: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
    marginTop: 20,
  },
});

export default HomepageScreen;