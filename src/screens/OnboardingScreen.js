import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity set to 0

  const pages = [
    {
      background: require('../../assets/NewVersion/onboarding1.png'),
      title: 'Welcome to VolunTrack',
      subtitle: 'VolunTrack makes it easy to find and manage volunteer opportunities. Track your hours and connect with causes.',
    },
    {
      background: require('../../assets/NewVersion/onboarding2.png'),
      title: 'All you need in one app',
      subtitle: 'Manage your volunteer schedule and opportunities effortlessly with our intuitive app.',
    },
    {
      background: require('../../assets/NewVersion/onboarding3.png'),
      title: 'Start to find your dream job',
      subtitle: 'Find and apply for your ideal job with our smart recommendations and resources.',
    },
  ];

  // Handle page transition and animation
  const handleNext = async () => {
    if (currentPage === pages.length - 1) {
      try {
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        navigation.replace('SignInUpScreen');
      } catch (e) {
        console.error('Error saving onboarding state:', e);
      }
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      navigation.replace('SignInUpScreen');


    } catch (e) {
      console.error('Error saving onboarding state:', e);
    }
  };

  // Trigger animation when the page changes
  useEffect(() => {
    // Reset animation value and trigger fade-in effect
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // Adjust duration for the fade-in effect
      useNativeDriver: true,
    }).start();
  }, [currentPage]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={pages[currentPage].background}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      {/* Animated Text Container */}
      <Animated.View
        style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}
      >
        <Text style={styles.title}>{pages[currentPage].title}</Text>
        <Text style={styles.subtitle}>{pages[currentPage].subtitle}</Text>
      </Animated.View>

      <View style={styles.navigation}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPage === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.next}>
          <Image source={require('../../assets/NewVersion/arrows logo.png')} style={styles.arrow} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Adjust opacity here (0.3)
  },
  textContainer: {
    position: 'absolute',
    top: height * 0.5, // 60% of the screen height
    paddingHorizontal: 25,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 45,
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: -1,
    lineHeight: 50,
    fontWeight: "600",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 17,
    color: 'white',
    letterSpacing: 0,
    lineHeight: 24,
  },
  navigation: {
    position: 'absolute',
    bottom: 30, // Position the bar slightly above the bottom edge
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically
    paddingHorizontal: 50,
    top: height * 0.80,
  },
  skipText: {
    fontSize: 17,
    color: 'white',
  },
  next: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#884efe',
    justifyContent: 'center',
    alignItems: 'center', // Center the arrow inside the button
  },
  arrow: {
    width: 15, // Adjust size for better visibility
    height: 15,
    tintColor: 'white', // Ensure the arrow matches the design
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Outline color for inactive dots
  },
  activeDot: {
    backgroundColor: '#884efe', // Active dot color
    width: 8,
    height: 8,
  },
});

export default OnboardingScreen;
