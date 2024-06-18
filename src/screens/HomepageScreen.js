import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, Image, StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import colors from '../../assets/colors/colors';
import HomepageSearchBar from '../components/HomepageSearchBar';
import ResultsList from '../components/ResultsList';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../api/firebaseConfig';

const HomepageScreen = ({ route, navigation }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const [totalCompleted, setTotalCompleted] = useState(0);
    const [totalHours, setTotalHours] = useState(100);

    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [, setFilter] = useState('all'); // 默认显示所有任务
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchTasks = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const result = await AsyncStorage.multiGet(keys.filter(key => key.startsWith('@task_status_')));
            const fetchedTasks = result.map(([key, value]) => JSON.parse(value));
            setTasks(fetchedTasks);
            handleFilterChange('all', fetchedTasks); // Apply initial filter right after fetching

            const completedTasksCount = fetchedTasks.filter(task => task.status === 'Completed').length;            
            // Store completed tasks count in Firebase
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, { volunteered: completedTasksCount }, { merge: true });
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // useFocusEffect(
    //     useCallback(() => {
    //         const fetchDataAndUpdateState = async () => {
    //             await fetchTasks(); // Fetch tasks from AsyncStorage
    //             handleFilterChange('all'); // Always reset to 'All' filter upon focusing
    //         };

    //         fetchDataAndUpdateState();
    //     }, []) // Dependencies array is empty to indicate this effect doesn't depend on any state or props
    // );

    useFocusEffect(
        useCallback(() => {
            fetchTasks(); // handleFilterChange is called within fetchTasks
        }, [])
    );

    const handleFilterChange = (newFilter, allTasks = tasks) => {
        setActiveFilter(newFilter);
        let filtered = allTasks;

        if (newFilter === 'all') {
            filtered = filtered.filter(task => task.status === 'Ongoing' || task.status === 'Completed');
        } else if (newFilter === 'ongoing') {
            filtered = filtered.filter(task => task.status === 'Ongoing');
        } else if (newFilter === 'completed') {
            filtered = filtered.filter(task => task.status === 'Completed');
        }
        // Filter by search term if it's not empty
        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredTasks(filtered);
    };

    useEffect(() => {
        handleFilterChange(activeFilter);
    }, [searchTerm, activeFilter]);

    const FilterButton = ({ title, isActive, onPress }) => (
        <TouchableOpacity style={styles.filterButton} onPress={onPress}>
            <Text style={[styles.filterButtonText, isActive && styles.filterButtonActiveText]}>{title}</Text>
            {isActive && <View style={styles.activeFilterLine} />}
        </TouchableOpacity>
    );

    useEffect(() => {
        const loadInitialTotalCompleted = async () => {
            try {
                const initialTotalCompleted = await AsyncStorage.getItem('totalCompleted');
                if (initialTotalCompleted !== null) {
                    setTotalCompleted(parseInt(initialTotalCompleted, 10));
                }
            } catch (e) {
                console.error('Error loading totalCompleted:', e);
            }
        };

        loadInitialTotalCompleted();
    }, []);

    // Completed Hours As Sum Of User Inputs
    useFocusEffect(
        React.useCallback(() => {
            const loadCompletedHours = async () => {
                try {
                    const keys = await AsyncStorage.getAllKeys();
                    const completedHoursArray = await AsyncStorage.multiGet(keys.filter(key => key.startsWith('@completed_hours_')));
                    const totalCompletedHours = completedHoursArray.reduce((total, [, value]) => {
                        return total + parseInt(value, 10);
                    }, 0);

                    setTotalCompleted(totalCompletedHours);
                } catch (e) {
                    console.error('Error loading total completed hours:', e);
                }
            };

            loadCompletedHours();
        }, [])
    );
    // Completed Hours As Sum Of User Inputs

    useFocusEffect(
        React.useCallback(() => {
            const getHours = async () => {
                try {
                    const hours = await AsyncStorage.getItem('userHours');
                    if (hours !== null) {
                        setTotalHours(parseInt(hours, 10));
                    }
                } catch (e) {
                }
            };
            getHours();
        }, [])
    );

    const progress = (totalCompleted / totalHours) * 100;

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')}>
                    <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('HomepageSettingScreen')}>
                    <Image source={require('../../assets/icons/SettingIcon.png')} style={styles.SettingIcon} />
                </TouchableOpacity>
            </View>
            <Text style={styles.header}>VolunTrack</Text>
            <Text style={styles.text}>Track your volunteering hours and explore new volunteering opportunities!</Text>
            <HomepageSearchBar
                term={searchTerm}
                onTermChange={setSearchTerm}
                onTermSubmit={() => handleFilterChange(activeFilter)}
            />

            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <Text style={styles.hourText}> {totalCompleted}/{totalHours} Hours Completed</Text>

            <View style={styles.filterOptions}>
                <FilterButton title="ALL" isActive={activeFilter === 'all'} onPress={() => handleFilterChange('all')} />
                <FilterButton title="ONGOING" isActive={activeFilter === 'ongoing'} onPress={() => handleFilterChange('ongoing')} />
                <FilterButton title="COMPLETED" isActive={activeFilter === 'completed'} onPress={() => handleFilterChange('completed')} />
            </View>

            {filteredTasks.length > 0 ? (
                <ResultsList
                    results={filteredTasks}
                    navigation={navigation}
                />
            ) : (
                <Text style={styles.noResultsText}>
                    {activeFilter === 'ongoing' && "You don't have any ongoing volunteering now."}
                    {activeFilter === 'completed' && "You don't have any completed volunteering now."}
                    {activeFilter === 'all' && "You don't have any ongoing/completed volunteering yet. Go apply one!"}
                </Text>
            )}

            <StatusBar style="auto" />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: colors.background,
    },
    progressBarContainer: {
        height: 20,
        width: '75%', // 进度条宽度占屏幕宽度的比例
        backgroundColor: '#fafafa', // 进度条未填充部分的颜色
        borderRadius: 20, // 使用较大的半径以获得圆角
        marginVertical: 20, // 进度条与其他组件的垂直间距
        alignSelf: 'center', // 居中显示
        borderWidth: 1, // 边框宽度
        borderColor: colors.primary, // 边框颜色，应与填充的进度条颜色相同
        shadowColor: "#000", // 阴影颜色
        shadowOffset: {
            width: 0, // 水平偏移量
            height: 2, // 垂直偏移量
        },
        shadowOpacity: 0.25, // 阴影不透明度
        shadowRadius: 3.84, // 阴影半径
        elevation: 5, // 仅在 Android 上的阴影高度
        overflow: 'hidden', // 确保子视图不会超出边界
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 10, // 进度条的圆角
    },
    header: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold',
        fontSize: 36,
        marginVertical: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subHeader: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold',
        fontSize: 28,
        marginVertical: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    text: {
        color: colors.textDark,
        fontFamily: 'PingFangSC-Regular',
        fontSize: 16,
        marginHorizontal: 60,
        marginBottom: 40,
        textAlign: 'center'
    },
    hourText: {
        color: colors.textDark,
        fontFamily: 'PingFangSC-Regular',
        fontSize: 15,
        marginHorizontal: 60,
        marginBottom: 20,
        marginTop: -15,
        textAlign: 'center'
    },
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    icon: {
        width: 60,
        height: 60,
        marginTop: 60,
        marginLeft: 15,
    },
    SettingIcon: {
        width: 50,
        height: 50,
        marginTop: 60,
        marginRight: 15,
    },
    filterOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 5,

    },
    filterButton: {
        flex: 1,
        alignItems: 'center',
        padding: 10, // Adjust as needed for padding around the text
    },
    filterButtonText: {
        textAlign: 'center',
        fontWeight: 'normal',
        color: colors.primary,
    },
    filterButtonActiveText: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    activeFilterLine: {
        height: 2,
        width: '80%', // Line will fill the width of the button
        backgroundColor: colors.primary,
        marginTop: 5, // Space between text and line
        borderRadius: 5,
    },
    noResultsText: {
        width: '80%',
        textAlign: 'center',
        alignSelf: 'center',
        marginTop: 15,
        fontSize: 16,
    },
})

export default HomepageScreen;