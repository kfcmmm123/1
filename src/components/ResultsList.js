import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity } from 'react-native';

const ResultsList = ({ title, results, navigation }) => {
  if (!results.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={results}
        keyExtractor={(result) => result.id.toString()}
        renderItem={({ item }) => {
          const city = item.location ? item.location.city : 'Unknown City';
          const hoursDisplay = item.hours ? `${item.hours} hours` : 'Unlimited';


          return (
            <TouchableOpacity 
              style={styles.resultItem}
              onPress={() => navigation.navigate('VolunteeringScreen', { itemData: item })}
            >
            <ImageBackground 
              source={{ uri: item.image_url }}
              style={styles.backgroundImage}
            >
              {/* Semi-transparent background covering the entire image */}
              <View style={styles.textContainer}>
                {/* Positioned at the top left */}
                <Text style={styles.hours}>{hoursDisplay} hours</Text>

                {/* Centered text */}
                <Text style={styles.name}>{item.name}</Text>

                {/* Positioned at the bottom left */}
                <Text style={styles.city}>{city}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ... other styles ...
  resultItem: {
    height: 80, // Reduced height
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 15,
    width: '90%',
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1, // Increase shadow opacity for a darker shadow
    shadowRadius: 5, // Increase shadow radius for a fuller shadow
    elevation: 5,
  },
  backgroundImage: {
    flex: 1, // Take up entire space of the container
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  name: {
    fontSize: 16,
    color: 'white',
  },
  hours: {
    position: 'absolute',
    top: 10,
    left: 10,
    color: 'white',
    fontSize: 12,
    // Additional styling for hours
  },
  city: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: 'white',
    fontSize: 12,
    // Additional styling for location
  },
  // Other styles as needed
});

export default ResultsList;
