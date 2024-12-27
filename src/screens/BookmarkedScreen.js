
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

import colors from '../../assets/colors/colors';
import SearchSearchBar from '../components/SearchSearchBar';
import ResultsList from '../components/ResultsList';
import { useFocusEffect } from '@react-navigation/native';


const BookmarkedItem = ({ item, onPress, navigation }) => {
    // 解构 item 对象中的属性
    const cityName = item.location && item.location.city ? item.location.city : 'Unknown City';
    const hours = item.hours ? `${item.hours} hours` : 'Unknown hours';

    // 点击跳转到 AboutUsScreen 的处理函数
    const handlePressAboutUs = () => {
        navigation.navigate('AboutUsScreen');
    };

    return (
        <TouchableOpacity style={styles.resultItem} onPress={onPress}>
        <ImageBackground 
            source={{ uri: item.image_url }} // 使用正确的图片URI
            resizeMode="cover" // 确保图片适当地填充背景
            style={styles.backgroundImage}
        >
        {/* 将 TouchableOpacity 替换为 View，并添加触摸事件 */}
        <View style={{ position: '90%', top: 60, left: 15, zIndex: 1 }}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')}>
                    <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SettingScreen')}>
                    <Image source={require('../../assets/icons/SettingIcon.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.textContainer}>
            {/* 使用文本样式显示名称、时长和城市 */}
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.hours}>{hours}</Text>
            <Text style={styles.city}>{cityName}</Text>
        </View>
        </ImageBackground>
        </TouchableOpacity>
    );
};



const BookmarkedScreen = ({ navigation }) => {
    const [bookmarkedItems, setBookmarkedItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBookmarks = async () => {
        const bookmarks = await AsyncStorage.getItem('@bookmarks');
        if (bookmarks) {
            const parsedBookmarks = JSON.parse(bookmarks);
            setBookmarkedItems(parsedBookmarks);
            setFilteredItems(parsedBookmarks); // Initialize filtered items with all bookmarks
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookmarks();
        }, [])
    );

    const handleSearchSubmit = () => {
        // Filtering logic
        const filtered = bookmarkedItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.location && item.location.city.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredItems(filtered);
    };

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <StatusBar style="auto" />
                <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')}>
                    <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SettingScreen')}>
                    <Image source={require('../../assets/icons/SettingIcon.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
                <Text style={styles.header}>Bookmarked</Text>
                <View style={styles.searchBarStyle}>
                    <SearchSearchBar 
                    term={searchTerm} 
                    onTermChange={setSearchTerm} 
                    onTermSubmit={handleSearchSubmit} 
                    style={styles.searchBarStyle}  
                    />
                </View>
                <ResultsList
                    results={filteredItems}
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
        backgroundColor: colors.background,
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
        paddingTop: 60,
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