import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import colors from '../../assets/colors/colors';
import { EvilIcons } from '@expo/vector-icons';


const HomepageSearchBar = ({term, onTermChange, onTermSubmit}) => {
    return (
        <View style = {styles.backgroundStyle}>
            <EvilIcons name = "search" style = {styles.iconStyle} />
            <TextInput
               autoCapitalize = "none"
               autoCorrect = {false}
               style = {styles.inputStyle}
               placeholder = "Search old/current oppurtunities" placeholderTextColor = 'gray'
               value = {term}
               onChangeText = {onTermChange}
               onEndEditing = {onTermSubmit}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    backgroundStyle: {
        backgroundColor: colors.background,
        height: 40,
        borderRadius: 40,
        marginHorizontal: 30,
        flexDirection: 'row',
        marginBottom: 10,
        borderWidth: 1, // 设置边框宽度
        borderColor: colors.primary, // 假设 colors.primary 是您想要的蓝色
        borderRadius: 10,
        
    },

    inputStyle: {
        flex: 1,
        fontSize: 16,
    },
    
    iconStyle: {
        fontSize: 25,
        alignSelf: 'center',
        color: colors.primary,
        marginHorizontal: 10, 
    }
});

export default HomepageSearchBar;