// SearchSearchBar.js
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { EvilIcons } from '@expo/vector-icons';
import colors from '../../assets/colors/colors';

const SearchSearchBar = ({ term, onTermChange, onTermSubmit }) => {
    return (
        <View style={styles.backgroundStyle}>
            <EvilIcons name="search" style={styles.iconStyle} />
            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.inputStyle}
                placeholder="Discover new opportunities"
                placeholderTextColor='gray'
                value={term}
                onChangeText={onTermChange}
                onEndEditing={() => onTermSubmit(term)} // Trigger search on submission
            />
        </View>
    );
};

// ... styles remain the same

const styles = StyleSheet.create({
    backgroundStyle: {
        backgroundColor: '#DCDCDC',
        height: 50,
        borderRadius: 20,
        marginVertical: 60,
        marginHorizontal: 40,
        flexDirection: 'row',
        marginBottom: 10
    },

    inputStyle: {
        flex: 1,
        fontSize: 16,
        marginHorizontal: 15
    },
    iconStyle: {
        fontSize: 25,
        alignSelf: 'center',
        marginHorizontal: 10
    }
});

export default SearchBar;
