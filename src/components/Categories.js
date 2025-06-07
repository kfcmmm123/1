import React from 'react';
import { ScrollView, Text, StyleSheet, View, ImageBackground } from 'react-native';

const categories = [
  { id: '1', title: 'Community Life', description: 'Culture, Support, Assistance', background: require('../../assets/media1.jpg') },
  { id: '2', title: 'Personal Growth', description: 'Learning, Leadership, Development', background: require('../../assets/media2.jpg') },
  { id: '3', title: 'Culture, Support', description: 'Diversity, Mutual Assistance', background: require('../../assets/media3.jpg') },
  { id: '4', title: 'Health, Wellness', description: 'Physical, Mental Well-being', background: require('../../assets/media1.jpg') },
];

const Categories = () => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {categories.map((category) => (
        <ImageBackground
          key={category.id}
          source={category.background}
          style={styles.categoryItem}
          imageStyle={styles.backgroundImage}
        >
          {/* Overlay for the cover image */}
          <ImageBackground
            source={require('../../assets/NewVersion/Cover.png')}
            style={styles.coverImage}
            imageStyle={styles.coverImageStyle}
          >
            <View style={styles.textContainer}>
              <Text style={styles.title}>{category.title}</Text>
              <Text style={styles.description}>{category.description}</Text>
            </View>
          </ImageBackground>
        </ImageBackground>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  categoryItem: {
    marginHorizontal: 5,
    borderRadius: 6,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 165, // Adjust the width as needed
    height: 165, // Adjust the height as needed
    overflow: 'hidden', // Ensure the image doesn't overflow the rounded corners
  },
  backgroundImage: {
    borderRadius: 6,
    opacity: 0.9,
  },
  coverImage: {
    width: 165,
    height: 165,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  coverImageStyle: {
    borderRadius: 6, // Match the borderRadius of the categoryItem
  },
  textContainer: {
    marginBottom: 5,
    height: '50%',
    width: '100%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: '#fff', // Change text color to white for better visibility
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Add shadow for better readability
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: '#fff',
  },
});

export default Categories;