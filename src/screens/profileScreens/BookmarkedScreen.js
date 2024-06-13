
import React, { useState, useEffect, useCallback } from 'react';
import {
    StatusBar,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../../../assets/colors/colors';
import ResultsList from '../../components/ResultsList';
import { useFocusEffect } from '@react-navigation/native';

const BookmarkedScreen = ({ navigation }) => {
    const [bookmarkedItems, setBookmarkedItems] = useState([]);

    const fetchBookmarks = async () => {
        const bookmarks = await AsyncStorage.getItem('@bookmarks');
        if (bookmarks) {
            const parsedBookmarks = JSON.parse(bookmarks);
            setBookmarkedItems(parsedBookmarks);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookmarks();
        }, [])
    );

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <ResultsList
                    results={bookmarkedItems}
                    navigation={navigation}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultItem: {
        // 样式应与 ResultsList 中的 resultItem 样式匹配
        height: 80, // 或根据 ResultsList 的实际高度调整
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 15,
        width: '90%', // 或根据 ResultsList 的实际宽度调整
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    backgroundImage: {
        flex: 1,
        justifyContent: '100%',
        alignItems: 'center',
    },
    textContainer: {
        // 样式应与 ResultsList 中的 textContainer 样式匹配
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },  
    hours: {
        // 样式应与 ResultsList 中的 hours 样式匹配
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'white',
        fontSize: 12,
    },
    name: {
        // 样式应与 ResultsList 中的 name 样式匹配
        fontSize: 16,
        color: 'white',
    },
    city: {
        // 样式应与 ResultsList 中的 city 样式匹配
        position: 'absolute',
        bottom: 10,
        left: 10,
        color: 'white',
        fontSize: 12,
    },

    scrollView: {
        flex: 1, // Ensure ScrollView fills the screen
    },

    icon: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },

    header: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold',
        fontSize: 30,
        marginVertical: 15,
        marginLeft: 15,
        textAlign: 'left',
        fontWeight: 'bold',
    },
    container: {
        paddingTop: 10,
        paddingHorizontal: 15,
    },
    searchBarStyle: {
        width: '90%',
        alignSelf: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.primary,
    },
});

export default BookmarkedScreen;