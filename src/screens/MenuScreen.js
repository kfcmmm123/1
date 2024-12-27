
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import ResultsList from '../components/ResultsList';
import SearchBar from '../components/SearchBar';
import useResults from '../hooks/useResults';

const MenuScreen = ({ route }) => {
  console.log(navigation);
  const navigation = useNavigation(); // Use the useNavigation hook
  let searchTerm = route.params;
  const [shouldSearch, setShouldSearch] = useState(true);
  const [term, setTerm] = useState(searchTerm);
  const [searchApi, results, errorMessage] = useResults();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setShouldSearch(true);
      setTerm(searchTerm);
    });


    return unsubscribe;
  }, [navigation, searchTerm]);

  if (searchTerm && shouldSearch) {
    searchApi(searchTerm);
    setShouldSearch(false);
  }

  return (
    <>
      <SearchBar
        term={term}
        onTermChange={setTerm}
        onTermSubmit={() => searchApi(term)}
      />
      {errorMessage ? <Text>{errorMessage}</Text> : null}
      <Text></Text>
      <ScrollView>
        <ResultsList
          results={filterResultsByRating(5)}
          title="Excellent opportunities! - 5 stars"
        />
        <Text></Text>
        <ResultsList
          results={filterResultsByRating(4)}
          title="Great opportunities! - 4 stars"
        />
        <Text></Text>
        <ResultsList
          results={filterResultsByRating(3)}
          title="Good opportunities! - 3 stars"
        />
      </ScrollView>
    </>
  );
};


// const styles = StyleSheet.create({});


// export default withNavigation(MenuScreen);
