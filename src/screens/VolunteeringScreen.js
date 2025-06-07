import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, Animated, View, Image, ScrollView, Modal, Linking, Button, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clipboard } from 'react-native';
import GoBack from '../../assets/NewVersion/GoBack.png';

import colors from '../../assets/colors/colors';

const DetailItem = ({ icon, text }) => {
  if (!text) return null; // Avoid rendering if text is empty/null
  return (
    <View style={styles.detailItem}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
};

const TimeAndLocation = ({
  name,
  address,
  categories,
  organization,
  date,
  contactInfo,
  hours,
  isValidCoordinates,
  formattedLatitude,
  formattedLongitude,
  fullAddress
}) => {
  return (
    <View style={styles.timeLocation}>
      <Text style={styles.title}>
        Time & Location
      </Text>
      <DetailItem icon={require('../../assets/NewVersion/DateDetail.png')} text={date} />
      <DetailItem icon={require('../../assets/NewVersion/TimeDetail.png')}
        text={hours ? `${hours} Volunteering Hours Offered` : 'Volunteering Hours See The Web'}>
      </DetailItem>
      <DetailItem icon={require('../../assets/NewVersion/LocationDetail.png')} text={address} />
      {/*
            <DetailItem icon={require('../../assets/category.png')} text={categories} />
            <DetailItem icon={require('../../assets/name.png')} text={organization || name} />

            <DetailItem icon={require('../../assets/email.png')} text={contactInfo} />
            */}

      {isValidCoordinates && (
        <MapView
          style={styles.map}
          region={{
            latitude: formattedLatitude,
            longitude: formattedLongitude,
            latitudeDelta: 0.1122,
            longitudeDelta: 0.0921,
          }}
        >
          <Marker
            coordinate={{ latitude: formattedLatitude, longitude: formattedLongitude }}
            title={name}
            description={fullAddress}
          />
        </MapView>
      )}
    </View>
  );
};


const getImageSource = (imageUrl) => {
  if (imageUrl && (imageUrl.endsWith('.png') || imageUrl.endsWith('.jpg'))) {
    return { uri: imageUrl };
  }
  return null;
};

const isValidUrl = (urlString) => {
  const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
  return regex.test(urlString);
};

const VolunteeringScreen = ({ route, navigation }) => {
  // 状态定义
  const itemData = route.params?.itemData; // 从路由参数获取志愿活动数据
  const [applyModalVisible, setApplyModalVisible] = useState(false); // For "Apply Now" modal

  const [isBookmarked, setIsBookmarked] = useState(false); // 控制书签状态

  const [isScrolling, setIsScrolling] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timeoutId = useRef(null);

  const animateButton = (toValue) => {
    Animated.timing(fadeAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // 滚动开始处理
  const handleScrollStart = () => {
    setIsScrolling(true);
    animateButton(0.5);

    // 清除之前的定时器
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  };

  // 滚动停止处理
  const handleScrollEnd = () => {
    timeoutId.current = setTimeout(() => {
      setIsScrolling(false);
      animateButton(1);
    }, 200); // 200ms无滚动视为停止
  };

  useEffect(() => {
    return () => {
      // 组件卸载时清除定时器
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

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
  // Status Functionality For Setting Task As Not Complete, Ongoing, Complete


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

  const storeOngoingStatus = async () => {
    try {
      const status = 'Ongoing';
      const updatedItemData = { ...itemData, status: status }; // Add 'status' to your task object
      await AsyncStorage.setItem(`@task_status_${itemData.id}`, JSON.stringify(updatedItemData)); // Store the entire task with the status
    } catch (error) {
      console.error('Error storing task status:', error);
    }
  };

  const storeCompletedStatus = async () => {
    try {
      const status = 'Completed';
      const updatedItemData = { ...itemData, status: status }; // Add 'status' to your task object
      await AsyncStorage.setItem(`@task_status_${itemData.id}`, JSON.stringify(updatedItemData)); // Store the entire task with the status
    } catch (error) {
      console.error('Error storing task status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={handleScrollStart}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollBegin={handleScrollStart}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={GoBack} style={styles.goback} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBookmark}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={25}
              color={'#9967FE'}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={storeOngoingStatus}>
          <Text>Set Ongoing Status</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={storeCompletedStatus}>
          <Text>Set Completed Status</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{itemData.name}</Text>
        <View style={styles.organization}>
          <Image source={require('../../assets/name.png')} style={styles.organizationIcon} />
          <Text style={styles.organizationText}>{itemData.organization ? itemData.organization : itemData.name}</Text>
        </View>
        {getImageSource(itemData.image_url) && (
          <Image
            source={getImageSource(itemData.image_url)}
            style={styles.coverImage}
          />
        )}

        <View style={styles.timeLocation}>
          <TimeAndLocation
            name={itemData.name}
            address={fullAddress}
            categories={categoriesText}
            organization={itemData.organization}
            date={dateText}
            contactInfo={contactInfo}
            hours={itemData.hours}
            isValidCoordinates={isValidCoordinates()}
            formattedLatitude={formattedLatitude}
            formattedLongitude={formattedLongitude}
            fullAddress={fullAddress}
          />
        </View>

        <Text style={styles.title}>
          About
        </Text>
        <Text style={styles.description}>
          {itemData.description ? itemData.description.replaceAll("\\n", "\n") : 'No description provided'}
        </Text>

        <Text style={styles.title}>
          Contact
        </Text>
        <View style={styles.contactContainer}>
          <TouchableOpacity
            style={[styles.button, !itemData.phone && styles.disabledButton]}
            onPress={() => itemData.phone && Linking.openURL(`tel:${itemData.phone}`)}
            disabled={!itemData.phone}
          >
            <Ionicons
              name={'call-outline'}
              size={25}
              color={'#9967FE'}
            />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, !itemData.email && styles.disabledButton]}
            onPress={() => itemData.email && Linking.openURL(`mailto:${itemData.email}`)}
            disabled={!itemData.email}
          >
            <Ionicons
              name={'mail-outline'}
              size={25}
              color={'#9967FE'}
            />
            <Text style={styles.buttonText}>Email</Text>
          </TouchableOpacity>


          <TouchableOpacity style={styles.button} onPress={() => { }}>
            <Ionicons
              name={'chatbox-ellipses-outline'}
              size={25}
              color={'#9967FE'}
            />
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>
        </View>
        {/*
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => setApplyModalVisible(true)}>
                    <Text style={styles.applyButtonText}>Apply Now!</Text>
                </TouchableOpacity>
                */}

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

      </ScrollView>

      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => console.log("Apply Now Pressed")}
        >
          <Text style={styles.applyButtonText}>Apply Now!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 30,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  goback: {
    width: 30,
    height: 30,
  },
  name: {
    fontSize: 26,
    fontWeight: '600',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center'
  },
  organization: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignSelf: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  organizationIcon: {
    width: 25,
    height: 25,
  },
  organizationText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 28,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  timeLocation: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '400',
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
  applyButton: {
    backgroundColor: '#884EFE',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
    width: '100%',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 20,
    alignSelf: 'center',
    fontWeight: '400',
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
    width: '100%',
    height: 200,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    alignSelf: 'center',
    marginBottom: 20,
    color: '#696969',
    fontWeight: '400',
    lineHeight: 28,
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
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8A2BE2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#8A2BE2',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  disabledText: {
    color: '#aaa',
  },
})

export default VolunteeringScreen;