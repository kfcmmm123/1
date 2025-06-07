import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ResultsList = ({ title, results, navigation }) => {
  if (!results.length) {
    return null;
  }

  const getImageSource = (imageUrl) => {
    if (imageUrl && (imageUrl.endsWith('.png') || imageUrl.endsWith('.jpg'))) {
      return { uri: imageUrl };
    } else {
      return require('../../assets/icons/volunteer.png');
    }
  };

  const BookmarkButton = ({ item }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    const bookmarkKey = `@bookmark_${item.id}`;

    const handleBookmark = async () => {
      const newBookmarkStatus = !isBookmarked;
      setIsBookmarked(newBookmarkStatus);
      try {
        const bookmarkArray = JSON.parse(await AsyncStorage.getItem('@bookmarks')) || [];
        if (newBookmarkStatus) {
          const updatedBookmarkArray = [...bookmarkArray, item];
          await AsyncStorage.setItem('@bookmarks', JSON.stringify(updatedBookmarkArray));
        } else {
          const updatedBookmarkArray = bookmarkArray.filter(bookmark => bookmark.id !== item.id);
          await AsyncStorage.setItem('@bookmarks', JSON.stringify(updatedBookmarkArray));
        }
      } catch (e) {
        console.error('Failed to update bookmark', e);
      }
    };

    useEffect(() => {
      const initializeBookmarkStatus = async () => {
        try {
          const bookmarks = JSON.parse(await AsyncStorage.getItem('@bookmarks')) || [];
          setIsBookmarked(bookmarks.some(bookmark => bookmark.id === item.id));
        } catch (e) {
          console.error('Failed to initialize bookmark status', e);
        }
      };

      initializeBookmarkStatus();
    }, [item.id]);

    return (
      <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
        <View style={styles.bookmarkIcon}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={'#884EFE'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={results.slice(0, 10)}
        keyExtractor={(result) => result.id.toString()}
        renderItem={({ item }) => {
          const city = item.city || (item.location && item.location.city) || 'Unknown City';
          const organization = item.organization ? item.organization : item.name;
          const imageSrc = getImageSource(item.image_url);

          return (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => navigation.navigate('VolunteeringScreen', { itemData: item })}
            >
              {/* Top Part: Image with hours and bookmark */}
              <ImageBackground
                source={imageSrc}
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
                    <BookmarkButton item={item} />
                  </View>
                </ImageBackground>
              </ImageBackground>

              {/* Bottom Part: Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.cityContainer}>
                  <Image source={require('../../assets/NewVersion/Location.png')} style={styles.locationIcon} />
                  <Text style={styles.city}>{city}</Text>
                </View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.organization}>{organization}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  backgroundImage: {
    height: 100,
  },
  coverImage: {
    height: 100,
  },
  coverImageStyle: {
    opacity: 0.6,// Match the borderRadius of the categoryItem
  },
  topContainer: {
    justifyContent: 'space-between', // Ensures space between hours and bookmark
    flexDirection: 'row',
    alignItems: 'flex-start', // Aligns both at the top
    padding: 10, // Adds padding inside the background
  },
  hoursContainer: {
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    height: 30,
    justifyContent: 'center', // Centers text vertically
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
  bookmarkIcon: {
    width: "100%",
    height: '100%',
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
