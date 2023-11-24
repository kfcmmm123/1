import React, { useState, useEffect } from 'react';
import { StatusBar, Image, StyleSheet, Text, TouchableOpacity, View, FlatList, } from 'react-native';
import colors from '../../assets/colors/colors';
import SearchSearchBar from '../components/SearchSearchBar';
import useSearchApi from '../hooks/useResults'; // Adjust the path as necessary

const SearchScreen = ({ navigation }) => {
    const [term, setTerm] = useState('');
    const [searchApi, results, errorMessage] = useSearchApi();
    useEffect(() => {
        console.log('Current search results:', results);
    }, [results]);
    
    const renderResultItem = ({ item }) => {
        return (
            <View style={styles.resultItem}>
                <Text style={styles.resultText}>{item.name}</Text>
                {/* Add more details as needed */}
            </View>
        );
    };

    return (
        console.log('Data passed to FlatList:', results),
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('AboutUs')}>
                <Image
                    source={require('../../assets/adaptive-icon-cropped.png')}
                    style={styles.logo}
                />
            </TouchableOpacity>
            <Text style={styles.header}>Search</Text>
            <SearchSearchBar
                term={term}
                onTermChange={setTerm}
                onTermSubmit={() => searchApi(term)}
            />
            
            <FlatList
                data={results}
                renderItem={renderResultItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text>No results found.</Text>}
            />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Style for your container
    },
    header: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold',
        fontSize: 36,
        marginVertical: 15,
        marginLeft: 35,
        textAlign: 'left',
    },
    resultItem: {
        // Styles for each search result item
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    resultText: {
        // Styles for text in each search result item
    },
    logo: {
        width: 60,
        height: 60,
        marginTop: 60,
        marginLeft: 15,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        margin: 10,
    },
    // ... any other styles you need
});

export default SearchScreen;

