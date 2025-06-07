import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ResultsList = ({ title, results, navigation }) => {
  const [bookmarks, setBookmarks] = useState(new Set());

  // 初始化书签数据
  useEffect(() => {
    const initializeBookmarks = async () => {
      try {
        const stored = await AsyncStorage.getItem('@bookmarks');
        const parsed = stored ? JSON.parse(stored) : [];
        setBookmarks(new Set(parsed.map(b => b.id)));
      } catch (e) {
        console.error('Bookmark initialization failed:', e);
      }
    };
    initializeBookmarks();
  }, []);

  // 书签切换逻辑
  const handleBookmarkToggle = useCallback(async (item) => {
    const newBookmarks = new Set(bookmarks);
    const isExisting = newBookmarks.has(item.id);

    isExisting ? newBookmarks.delete(item.id) : newBookmarks.add(item.id);

    try {
      await AsyncStorage.setItem('@bookmarks',
        JSON.stringify([...newBookmarks].map(id => ({ id })))
      );
      setBookmarks(new Set(newBookmarks));
    } catch (e) {
      console.error('Bookmark update failed:', e);
    }
  }, [bookmarks]);

  // 图片加载优化
  const resolveImageSource = useCallback((uri) => {
    const isValid = uri && /\.(jpe?g|png)$/i.test(uri);
    return isValid ? { uri } : require('../../assets/icons/volunteer.png');
  }, []);

  // 渲染单个项目
  const renderResultItem = useCallback((item) => {
    const imageSource = resolveImageSource(item.image_url);
    const isBookmarked = bookmarks.has(item.id);
    const city = item.city || item.location?.city || 'Unknown City';

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.resultItem}
        onPress={() => navigation.navigate('VolunteeringScreen', { itemData: item })}
      >
        {/* Top Part: Image with hours and bookmark */}
        <ImageBackground
          source={imageSource}
          style={styles.backgroundImage}
        >
          <ImageBackground
            source={require('../../assets/NewVersion/listCover.png')}
            style={styles.coverImage}
            imageStyle={styles.coverImageStyle}
          >
            <View style={styles.topContainer}>
              <View style={styles.hoursContainer}>
                <Text style={styles.hours}>{item.hours || 'Unlimited'} hours</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleBookmarkToggle(item)}
                style={styles.bookmarkButton}
              >
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={'#884EFE'}
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </ImageBackground>

        {/* Bottom Part: Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.cityContainer}>
            <Image
              source={require('../../assets/NewVersion/Location.png')}
              style={styles.locationIcon}
            />
            <Text style={styles.city}>{city}</Text>
          </View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.organization}>{item.organization}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [bookmarks, handleBookmarkToggle]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {results.slice(0, 10).map(renderResultItem)}
    </ScrollView>
  );
};

// 样式表保持不变...

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  resultItem: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  backgroundImage: { height: 100 },
  coverImage: { height: 100 },
  coverImageStyle: { opacity: 0.6 },
  topContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
  },
  hoursContainer: {
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    height: 30,
    justifyContent: 'center',
  },
  hours: {
    color: '#884efe',
    fontSize: 13,
    fontWeight: '500',
  },
  bookmarkButton: {
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 10,
    paddingHorizontal: 15,
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
  },
  city: {
    fontSize: 12,
    color: 'gray',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: "stretch",
  },
  organization: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ResultsList;
