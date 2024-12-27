import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, TextInput, View, Image, ScrollView, Modal, Linking, Button, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker'
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clipboard } from 'react-native';
import { db } from '../api/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

import colors from '../../assets/colors/colors';

const DetailItem = ({ icon, text }) => (
    <View style={styles.detailItem}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.detailText}>{text}</Text> 
    </View>
);


const isValidUrl = (urlString) => {
    const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    return regex.test(urlString);
};

const StatusTracker = ({ currentStatus, isLocked, advanceStatus, regressStatus }) => {
    const statusStyles = (index) => {
        const isActive = currentStatus === index + 1; // Determine if this is the active status
        return {
            flex: 1, // Ensure equal width for each label
            textAlign: 'center', // Center text
            fontSize: isActive ? 18 : 14, // Larger font size for active status
            fontWeight: isActive ? 'bold' : 'normal', // Bold for active status
            color: isActive ? '#1dc470' : 'black', // Highlight color for active status
        };
    };
    return (
        <View style={styles.statusTrackerContainer}>
            <View style={styles.bubblesContainer}>
                {['NotCompleted', 'Ongoing', 'Completed'].map((status, index) => {
                    const statusIndex = index + 1;
                    const isCompleted = isLocked || statusIndex < currentStatus;
                    const isActive = statusIndex === currentStatus;
                    return (
                        <React.Fragment key={status}>
                            {index !== 0 && (
                                <View
                                    style={[
                                        styles.line,
                                        (isCompleted || isActive) ? styles.lineCompleted : styles.lineDefault,
                                    ]}
                                />
                            )}
                            <View
                                style={[
                                    styles.bubble,
                                    isCompleted ? styles.bubbleCompleted : styles.bubbleDefault,
                                    isActive && styles.bubbleActive, // Apply the active style if the status is active
                                ]}
                            >
                                {isCompleted ? (
                                    <Ionicons name="checkmark" size={18} color="white" />
                                ) : (
                                    <Text style={[
                                        styles.bubbleText,
                                        isActive && { color: 'white' } // Change text color to white if the status is active
                                    ]}>
                                        {statusIndex}
                                    </Text>
                                )}
                            </View>
                        </React.Fragment>
                    );
                })}
            </View>
            <View style={styles.statusLabelsContainer}>
                {['STEP 1', 'STEP 2', 'STEP 3'].map((label, index) => (
                    <Text key={label} style={styles.stepText}>
                        {label}
                    </Text>
                ))}
            </View>
            <View style={styles.statusLabelsContainer}>
                {['Get Started', 'Ongoing', 'Completed'].map((label, index) => (
                    <Text key={label} style={statusStyles(index)}>
                        {label}
                    </Text>
                ))}
            </View>
            {!isLocked && (
                <View style={styles.buttonsContainer}>
                    {currentStatus === 1 && (
                        <TouchableOpacity
                            style={styles.getStartedGoBackButton} // Apply the specific style here
                            onPress={() => advanceStatus()}
                        >
                            <Text style={styles.buttonText}>Get Started !</Text>
                        </TouchableOpacity>
                    )}
                    {currentStatus > 1 && currentStatus < 3 && (
                        <>
                            <TouchableOpacity
                                style={[styles.statusButton, styles.buttonActive]}
                                onPress={regressStatus}
                            >
                                <Text style={styles.buttonText}>Go Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.statusButton, styles.buttonActive]}
                                onPress={advanceStatus}
                            >
                                <Text style={styles.buttonText}>Completed !</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {currentStatus === 3 && (
                        <TouchableOpacity
                            style={styles.getStartedGoBackButton} // Apply the specific style here
                            onPress={regressStatus}
                        >
                            <Text style={styles.buttonText}>Go Back</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const VolunteeringScreen = ({ route, navigation }) => {
 // 状态定义
    const itemData = route.params?.itemData; // 从路由参数获取志愿活动数据
    const [applyModalVisible, setApplyModalVisible] = useState(false); // For "Apply Now" modal
    const [hoursRecorded, setHoursRecorded] = useState(false); // Tracks if hours are recorded

    const [isBookmarked, setIsBookmarked] = useState(false); // 控制书签状态
    const bookmarkKey = `@bookmark_${itemData?.id}`; // 基于活动ID生成一个唯一的键

    const advanceStatus = () => {
        if (statusValue < 3) {
            setStatusValue(statusValue + 1);
        }
    };

    const regressStatus = () => {
        if (statusValue > 1) {
            setStatusValue(statusValue - 1);
        }
    };

    const [statusValue, setStatusValue] = useState(1); // Status Determines 'Task Status' 
    const [completedHours, setCompletedHours] = useState(''); // User Enters Hours / Task
    const [isStatusLocked, setIsStatusLocked] = useState(false);
    
    const resetStatusAndHours = async () => {
        try {
            const key = `@completed_hours_${itemData.id}`;
            await AsyncStorage.removeItem(key); // Remove the stored hours
            setStatusValue(1); // Reset status to "Not Completed"
            setCompletedHours(''); // Clear recorded hours state
            setHoursRecorded(false); // Reset hours recorded status
            setIsStatusLocked(false);
            await AsyncStorage.removeItem(`@status_locked_${itemData.id}`);
        } catch (error) {
            console.error('Error resetting status and hours:', error);
        }
    };

    const storeStatus = async () => {
        try {
            const status = statusValue === 1 ? 'Not Completed' : (statusValue === 2 ? 'Ongoing' : 'Completed');
            const updatedItemData = { ...itemData, status: status }; // Add 'status' to your task object
            await AsyncStorage.setItem(`@task_status_${itemData.id}`, JSON.stringify(updatedItemData)); // Store the entire task with the status
        } catch (error) {
            console.error('Error storing task status:', error);
        }
    };
    
    // Call storeStatus() when statusValue changes
    useEffect(() => {
        storeStatus();
    }, [statusValue]);

    const [report, setReport] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [problemType, setProblemType] = useState('');
    const [showReport, setShowReport] = useState(false);

    const handleReport = async () => {
        // Check if any field is empty
        if (!name || !email || !problemType || !report) {
            Alert.alert(
                'Incomplete Form',
                'Please fill out all fields before submitting.',
                [{ text: 'OK' }]
            );
            return; // Exit the function to prevent submission
        }
    
        try {
            // Add the report to a new Firestore collection called "Reports"
            await addDoc(collection(db, 'Reports'), {
                name,
                email,
                problemType,
                report,
                itemId: itemData.id, 
                itemName: itemData.name,
                timestamp: new Date() 
            });
    
            Alert.alert('Success', 'Your report has been submitted.', [{ text: 'OK' }]);
    
            // Reset fields after submission
            setName('');
            setEmail('');
            setProblemType('');
            setReport('');
            setShowReport(false);
        } catch (error) {
            console.error('Error adding document: ', error);
            Alert.alert('Error', 'There was an issue submitting your report. Please try again.', [{ text: 'OK' }]);
        }
    };
    
    const handleBookmark = async () => {
        const newBookmarkStatus = !isBookmarked;
        setIsBookmarked(newBookmarkStatus);
        try {
            const bookmarkArray = JSON.parse(await AsyncStorage.getItem('@bookmarks')) || [];
            if (newBookmarkStatus) {
                // 添加书签
                const updatedBookmarkArray = [...bookmarkArray, itemData];
                await AsyncStorage.setItem('@bookmarks', JSON.stringify(updatedBookmarkArray));
            } else {
                // 移除书签
                const updatedBookmarkArray = bookmarkArray.filter(bookmark => bookmark.id !== itemData.id);
                await AsyncStorage.setItem('@bookmarks', JSON.stringify(updatedBookmarkArray));
            }
        } catch (e) {
            console.error('更新书签失败', e);
        }
    };
    
    useEffect(() => {
        const initializeBookmarkStatus = async () => {
            try {
                // 检查是否有书签数组
                const bookmarks = JSON.parse(await AsyncStorage.getItem('@bookmarks')) || [];
                // 根据当前活动的ID设置书签状态
                setIsBookmarked(bookmarks.some(bookmark => bookmark.id === itemData?.id));
            } catch (e) {
                console.error('初始化书签状态失败', e);
            }
        };
    
        initializeBookmarkStatus();
    }, []);

    // 设置导航栏右侧的书签图标
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setShowReport(true)}>
                        <Ionicons 
                            name="alert-circle-outline" // Replace this with the desired icon name
                            size={25} 
                            color={colors.primary} // Replace with the desired color
                            style={{marginRight: 15}}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleBookmark} style={{ marginRight: 10 }}>
                        <Ionicons 
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                            size={25} 
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [isBookmarked, navigation]);

    // 如果没有活动数据，显示错误信息
    if (!itemData) {
        return <View style={styles.container}><Text>No data available</Text></View>;
    }

    const locationExists = itemData.location && typeof itemData.location === 'object';
    const address = locationExists ? itemData.location.address1 || '' : '';
    const city = locationExists ? itemData.location.city || '' : '';
    const state = locationExists ? itemData.location.state || '' : '';
    const zipCode = locationExists ? itemData.location.zip_code || '' : '';
    const country = locationExists ? itemData.location.country || '' : '';

    let categoriesText = '';

    if (typeof itemData.categories === 'string') {
        categoriesText = itemData.categories;
    } else if (Array.isArray(itemData.categories)) {
        categoriesText = itemData.categories.map(cat => cat.title).join(', ');
    }

    let fullAddress = '';

    if (typeof itemData.location === 'string') {
        fullAddress = itemData.location;
    } else if (typeof itemData.location === 'object') {
        const address1 = itemData.location.address1 || '';
        const city = itemData.location.city || '';
        const state = itemData.location.state || '';
        const zipCode = itemData.location.zip_code || '';
        const country = itemData.location.country || '';

        fullAddress = [address1, city, state, zipCode, country].filter(Boolean).join(', ');
    }

    const getValidCoordinate = (coord) => {
        const num = parseFloat(coord);
        return !isNaN(num) ? num : null;
    };
    
    const formattedLatitude = getValidCoordinate(itemData.coordinates?.latitude || itemData.latitude);
    const formattedLongitude = getValidCoordinate(itemData.coordinates?.longitude || itemData.longitude);
    
    const isValidCoordinates = () => {
        return formattedLatitude !== null && formattedLongitude !== null &&
               formattedLatitude >= -90 && formattedLatitude <= 90 &&
               formattedLongitude >= -180 && formattedLongitude <= 180;
    };
    
    const dateText = itemData.date ? itemData.date : 'Date Not Provided';

    const handleOpenLink = () => {
        if (itemData && itemData.url) {
            console.log('URL:', itemData.url);
            Linking.openURL(itemData.url);
        }
    };

    let contactInfo = 'Contact Info Not Available';
    if (itemData.email) {
        contactInfo = itemData.email;
    } else if (itemData.phone) {
        contactInfo = itemData.phone;
    }

    useEffect(() => {
        const checkBookmarkStatus = async () => {
            try {
                const savedBookmarkStatus = await AsyncStorage.getItem('@bookmark_key');
                if (savedBookmarkStatus !== null) {
                    setIsBookmarked(JSON.parse(savedBookmarkStatus));
                }
            } catch (e) {
                console.error('读取书签状态失败', e);
            }
        };
    
        checkBookmarkStatus();
    }, []);
    
    useEffect(() => {
        retrieveStatusValue(); // Save Status Value Individual To Task
        retrieveCompletedHours(); // Save Hours Value Individual To Task
    }, []);
    
      // Status Functionality For Setting Task As Not Complete, Ongoing, Complete

    useEffect(() => {
        storeStatusValue();
    }, [statusValue]);
    
    const storeStatusValue = async () => {
        try {
          if (itemData?.id) {
            const key = `@status_value_${itemData.id}`;
            await AsyncStorage.setItem(key, String(statusValue));
          }
        } catch (error) {
          console.error('Error storing status value:', error);
        }
      };
    
    const retrieveStatusValue = async () => {
        try {
          if (itemData?.id) {
            const key = `@status_value_${itemData.id}`;
            const savedStatusValue = await AsyncStorage.getItem(key);
            if (savedStatusValue !== null) {
              setStatusValue(parseInt(savedStatusValue, 10));
            }
          }
        } catch (error) {
          console.error('Error retrieving status value:', error);
        }
    };
        
    // Status Functionality For Setting Task As Not Complete, Ongoing, Complete
    const handleRecordHours = async () => {
        try {
            // Trim input to remove leading/trailing whitespace
            const hoursToRecord = completedHours.trim();
    
            // Check if the input is blank or "0"
            if (hoursToRecord === '' || hoursToRecord === '0') {
                Alert.alert(
                    "Invalid Input",
                    "Please enter a number of hours greater than 0.",
                    [{ text: "OK" }]
                );
                return; // Stop execution if invalid
            }

            setIsStatusLocked(true);
            await AsyncStorage.setItem(`@status_locked_${itemData.id}`, 'true');
        
            // Key for AsyncStorage based on item ID
            const key = `@completed_hours_${itemData.id}`;
            // Proceed with storing the non-empty, non-zero hours
             await AsyncStorage.setItem(key, hoursToRecord);
             setHoursRecorded(true); // Indicate that hours have been recorded
        
            // Success message
            Alert.alert(
                "Recorded",
                "Your hours have been successfully recorded!",
                [{ text: "OK" }]
            );
        } catch (error) {
            console.error('Error storing completed hours:', error);
           // Optionally, show an error alert
            Alert.alert(
                "Error",
                "There was an error recording your hours. Please try again.",
                [{ text: "OK" }]
            );
        }
    };
    useEffect(() => {
        const fetchLockStatus = async () => {
            try {
                const statusLockStatus = await AsyncStorage.getItem(`@status_locked_${itemData.id}`);
                if (statusLockStatus === 'true') {
                    setIsStatusLocked(true);
                } else {
                    setIsStatusLocked(false);
                }
            } catch (error) {
                console.error('Error retrieving status lock status:', error);
            }
        };
    
        fetchLockStatus();
    }, []);
    
    useEffect(() => {
        const initializeState = async () => {
            try {
                const statusLockStatus = await AsyncStorage.getItem(`@status_locked_${itemData.id}`);
                setIsStatusLocked(statusLockStatus === 'true');
    
                const recordedHours = await AsyncStorage.getItem(`@completed_hours_${itemData.id}`);
                // Consider hours recorded if there's a non-null and non-empty string stored
                setHoursRecorded(!!recordedHours && recordedHours.trim().length > 0);
    
            } catch (error) {
                console.error('Error initializing state:', error);
            }
        };
    
        initializeState();
    }, []);
    
        
    // User Input Functionality For Saving Completed Hours
    const retrieveCompletedHours = async () => {
        try {
            if (itemData?.id) {
                const key = `@completed_hours_${itemData.id}`;
                const savedCompletedHours = await AsyncStorage.getItem(key);
                if (savedCompletedHours !== null) {
                    setCompletedHours(savedCompletedHours);
                }
            }
        } catch (error) {
            console.error('Error retrieving completed hours:', error);
        }
    };
    // User Input Functionality For Saving Completed Hours
        

    // 如果没有活动数据，显示错误信息
    if (!itemData) {
        return <View style={styles.container}><Text>No data available</Text></View>;
    }
    
    const handleButtonPress = () => {
        if (isValidUrl(itemData.url)) {
          Linking.openURL(itemData.url);
        } else {
          // Copy the text to the clipboard
          Clipboard.setString(itemData.url);
          alert('Text copied to clipboard');
        }
    };

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={{ paddingBottom: 50 }}
        >
            <Text style={styles.name}>{itemData.name}</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setApplyModalVisible(true)}> 
                <Text style={styles.buttonText}>Apply Now!</Text>
            </TouchableOpacity>
            
            <Modal
                animationType="slide"
                transparent={true}
                visible={applyModalVisible} // Controlled by applyModalVisible
                onRequestClose={() => setApplyModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Apply at:</Text>
                        <Text style={styles.urlText}>{itemData.url}</Text>
                        <View style={{ marginBottom: 8 }}>
                        <Button
                            title={isValidUrl(itemData.url) ? "Open Link" : "Copy Text"}
                            onPress={handleButtonPress}
                        />
                        </View>
                        <Button title="Close" onPress={() => setApplyModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showReport} // Controlled by applyModalVisible
                onRequestClose={() => setShowReport(false)}
            >
                <KeyboardAvoidingView behavior="padding" style={styles.fullScreenModalView}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setShowReport(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Report a Problem</Text>
                        <TouchableOpacity onPress={handleReport}>
                            <Text style={styles.sendText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.problem}>Problem Details</Text>
                    <Text style={styles.problemDetail}>Type of Problem</Text>
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={problemType}
                            onValueChange={(itemValue) => setProblemType(itemValue)}
                        >
                            {problemType === '' && <Picker.Item label="Problem Type" value="" />}
                            <Picker.Item label="Bug" value="Bug" />
                            <Picker.Item label="Feedback" value="Feedback" />
                            <Picker.Item label="Feature Request" value="Feature Request" />
                            <Picker.Item label="Copyrights" value="Copyrights" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    </View>
                    <Text style={styles.problemDetail}>Problem Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What's the problem..."
                        multiline
                        value={report}
                        onChangeText={setReport}
                    />

                    <Text style={styles.problem}>Contact Info</Text>
                    <Text style={styles.problemDetail}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                    />
                    <Text style={styles.problemDetail}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                </KeyboardAvoidingView>
            </Modal>
            
            <View style={styles.row}>

                <View style={styles.detailsContainer}>
                    <DetailItem icon={require('../../assets/location.png')} text={fullAddress} />
                    <DetailItem 
                        icon={require('../../assets/category.png')} 
                        text={categoriesText} 
                    />                    
                    <DetailItem 
                        icon={require('../../assets/name.png')} 
                        text={itemData.organization ? itemData.organization : itemData.name} 
                    />
                    <DetailItem icon={require('../../assets/date.png')} text={dateText} />
                    <DetailItem icon={require('../../assets/email.png')} text={contactInfo} />
                    <Text style={styles.hours}>
                        {itemData.hours ? `${itemData.hours} Volunteering Hours Offered` : 'Volunteering Hours See The Web'}
                    </Text>
                </View>

                {isValidCoordinates() ? (
                    <MapView
                        style={styles.map}
                        region={{
                            latitude: formattedLatitude,
                            longitude: formattedLongitude,
                            latitudeDelta: 0.1122,
                            longitudeDelta: 0.0921,
                        }}
                    >
                        <Marker coordinate={{ latitude: formattedLatitude, longitude: formattedLongitude }} title={itemData.name} description={fullAddress} />
                    </MapView>
                ) : (
                    <Text style={styles.noCoordinatesText}>Map not available</Text>
                )}
            </View>
            
            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}> 
                    {itemData.name}
                </Text>
                <Text style={styles.description}> 
                    {itemData.description ? itemData.description.replaceAll("\\n", "\n") : 'No description provided'}
                </Text>
            </View>

            <View style={{ alignItems: 'center', marginTop: 20 }}> 
                <StatusTracker
                    currentStatus={statusValue}
                    isLocked={isStatusLocked || hoursRecorded}
                    advanceStatus={advanceStatus}
                    regressStatus={regressStatus}
                />
            </View>

            { (statusValue === 3) && (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                        <Text style={{ color: colors.primary, fontFamily: 'PingFangSC-Semibold', fontSize: 20 }}> 
                            Record Your Hours
                        </Text>
                    </View>
                    <TextInput
                        style={[styles.input, {
                            height: 40, // Adjust to match the height of your buttons
                            borderColor: colors.primary,
                            borderWidth: 1,
                            width: '95%', // Maintain the width as per your design
                            marginTop: 10,
                            borderRadius: 5,
                            paddingLeft: 15,   
                        }]}
                        keyboardType="numeric"
                        value={completedHours}
                        onChangeText={(text) => setCompletedHours(text)}
                        placeholder="Hours" // Placeholder text
                    />
                    <TouchableOpacity
                        style={styles.recordButton}
                        onPress={handleRecordHours}>
                        <Text style={styles.buttonText}>Record Hours!</Text>
                    </TouchableOpacity>
                </View>
            )}

            {hoursRecorded && (
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                        // Show confirmation dialog
                        Alert.alert(
                            "Reset Status",
                            "Are you sure you want to reset the status and recorded hours?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Yes", onPress: () => resetStatusAndHours() },
                            ],
                            { cancelable: true }
                        );
                    }}>
                    <Text style={styles.buttonText}>Reset Status</Text>
                </TouchableOpacity>
            )}

            {hoursRecorded && (
                <Text style={styles.completedHours}>
                    {`${completedHours} Hours Recorded!`}
                </Text>
            )}
            
            <StatusBar style="auto" />

        </ScrollView>
    );
}

const storeData = async (value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem('@bookmark_key', jsonValue)
    } catch (e) {
        // saving error
    }
}

const getData = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('@bookmark_key')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
        // error reading value
    }
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    name: {
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 10,
        marginBottom: 20, 
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    detailsContainer: {
        flex: 1, // Take up remaining space
        marginBottom: 15,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '80%',
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    detailText: { 
        fontSize: 12, 
        color: colors.textDark, 
    },
    hours: {
        fontSize: 12, // Already defined, adjust this as well if needed
        marginBottom: 10,
        fontWeight: 'bold',
    },
    completedHours: {
        color: colors.primary,
        fontFamily: 'PingFangSC-Semibold', 
        fontSize: 25, 
        marginVertical: 15,
        textAlign: 'center', 
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: colors.primary, // Use your theme color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center', 
        marginBottom: 20,
        width: '75%',
        shadowColor: "#000", // 阴影颜色
        shadowOffset: {
            width: 0, // 水平偏移量
            height: 5, // 垂直偏移量
        },
        shadowOpacity: 0.5, // 阴影不透明度
        shadowRadius: 3.84, // 阴影半径
        elevation: 5, // 仅在 Android 上的阴影高度
        overflow: 'hidden', // 确保子视图不会超出边界
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        alignSelf: 'center',
        fontWeight: 'bold',
    },
    recordButton: {
        backgroundColor: colors.primary, // Use your theme color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center', 
        marginTop: 20,
        width: '95%',
        shadowColor: "#000", // 阴影颜色
        shadowOffset: {
            width: 0, // 水平偏移量
            height: 5, // 垂直偏移量
        },
        shadowOpacity: 0.5, // 阴影不透明度
        shadowRadius: 3.84, // 阴影半径
        elevation: 5, // 仅在 Android 上的阴影高度
        overflow: 'hidden', // 确保子视图不会超出边界
    },
    map: {
        width: 170,
        height: '90%',
        borderRadius: 1,
        borderColor: colors.primary,
    },
    
    descriptionTitle: {
        fontSize: 18, // Set the font size as per your design
        color: colors.primary, // Adjust the color if needed
        alignSelf: 'center',
        marginTop: 15, // Space above the text
        marginBottom: 15, // Space below the text
    },
    description: {
        fontSize: 13, // Set the font size as per your design
        color: colors.textDark, // Adjust the color if needed
        width: '90%',
        alignSelf: 'center',
        marginBottom: 15, // Space below the text
    },
    descriptionContainer: {
        borderWidth: 1, 
        borderColor: colors.primary, 
        borderRadius: 8,
        paddingBottom: 15,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    urlText: {
        color: 'blue',
        marginBottom: 15,
    },
    noCoordinatesText: {
        fontSize: 14,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
        width: '40%',
    },
    resetButton: {
        backgroundColor: 'red', // Use a different color to distinguish
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center', 
        marginTop: 20,
        width: '95%',
        shadowColor: "#000", // 阴影颜色
        shadowOffset: {
            width: 0, // 水平偏移量
            height: 5, // 垂直偏移量
        },
        shadowOpacity: 0.5, // 阴影不透明度
        shadowRadius: 3.84, // 阴影半径
        elevation: 5, // 仅在 Android 上的阴影高度
        overflow: 'hidden', // 确保子视图不会超出边界
    }, 
    statusTrackerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubblesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Center the buttons horizontally
        alignItems: 'center', // Center the buttons vertically if necessary
        width: '100%', // Ensure the container takes full width
        marginTop: 20, // Adjust as needed for spacing
    },
    line: {
        width: 70, // Adjust the width as needed
        height: 2,
        backgroundColor: '#ccc',
        marginHorizontal: 5,
        borderRadius: 4,
    },
    lineCompleted: {
        backgroundColor: '#1dc470', // Or your theme's completed color
    },
    lineDefault: {
        backgroundColor: '#ccc', // Or your theme's default color
    },
    bubble: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white', // Default background color
    },
    bubbleActive: {
        backgroundColor: '#1dc470', // Or your theme's active color
    },
    bubbleCompleted: {
        backgroundColor: '#1dc470', // Or your theme's completed color
    },
    bubbleDefault: {
        backgroundColor: 'white', // Or your theme's default color
    },
    bubbleText: {
        color: 'black', // Or your theme's text color
        fontWeight: 'bold',
    },
    statusButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary, // Or your theme's button color
        marginHorizontal: 10, // Ensure some space between buttons
        width: '45%', // Adjust as needed
        shadowColor: "#000", // 阴影颜色
        shadowOffset: {
            width: 0, // 水平偏移量
            height: 5, // 垂直偏移量
        },
        shadowOpacity: 0.5, // 阴影不透明度
        shadowRadius: 3.84, // 阴影半径
        elevation: 5, // 仅在 Android 上的阴影高度
        overflow: 'hidden', // 确保子视图不会超出边界
    },
    buttonActive: {
        opacity: 1,
    },
    getStartedGoBackButton: {
        backgroundColor: colors.primary, // Use a different color to distinguish
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center',
        width: '95%', // Adjust the width as needed
        shadowColor: "#000", // 阴影颜色
        shadowOffset: {
            width: 0, // 水平偏移量
            height: 5, // 垂直偏移量
        },
        shadowOpacity: 0.5, // 阴影不透明度
        shadowRadius: 3.84, // 阴影半径
        elevation: 5, // 仅在 Android 上的阴影高度
        overflow: 'hidden', // 确保子视图不会超出边界
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        alignSelf: 'center',
        fontWeight: 'bold',
    },
    statusTrackerContainer: {
        // Ensure this container fills the width and aligns children in the center
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubblesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // This ensures the bubbles are spread out evenly
        alignItems: 'center',
        paddingHorizontal: 30, // Adjust this value as needed
    },
    statusLabelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 5,
    },
    stepText:{
        color: 'gray',
        marginTop: 5,
        fontSize: 12,
    },

    //report a problem page
    fullScreenModalView: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    cancelText: {
        color: 'red',
        fontSize: 16
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    sendText: {
        color: 'green',
        fontSize: 16
    },
    problem: {
        fontSize: 20,
        marginVertical: 10,
    },
    problemDetail: {
        fontSize: 16,
        marginBottom: 10,
    },
    picker: {
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        fontSize: 16
    },
    textArea: {
        height: 200,
        textAlignVertical: 'top'
    }
})

export default VolunteeringScreen;