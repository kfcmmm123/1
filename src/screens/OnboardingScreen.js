import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../assets/colors/colors';

const OnboardingScreen = ({ onFinished, navigation }) => {
  const [hours, setHours] = useState('');

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('userHours', hours);
      onFinished(); // Notify that onboarding is finished
    } catch (e) {
      // Handle saving error
    }
  };

  return (
    <Onboarding
      onDone={handleFinishOnboarding}
      showSkip={false}
      pages={[
        {
            backgroundColor: '#061136',
            image: (
              <View style={styles.container}>
                <Image source={require('../../assets/adaptive-icon-cropped.png')} style={{ width: 300, height: 300 }} />
                <Text style={[styles.title1]}>
                  Welcome to VolunTrack
                </Text>
                <Text style={styles.subtitle1}>
                  Track and manage your volunteering hours with ease
                </Text>
              </View>
            ),       
            title: '',
            subtitle: '',
        },
        {
            backgroundColor: '#145DA0',
            image: (
              <View style={styles.container}>
                <Image source={require('../../assets/images/onboarding-img1.png')} style={{ width: 300, height: 300 }} />
                <Text style={[styles.title1]}>
                Explore Opportunities
                </Text>
                <Text style={styles.subtitle1}>
                  Discover a world of volunteering                
                </Text>
              </View>
            ),
            title: '',
            subtitle: '',
        },
        {
            backgroundColor: '#fdeb93',
            image: (
              <View style={styles.container}>
                <Image source={require('../../assets/images/onboarding-img2.png')} style={{ marginBottom: 20, width: 300, height: 300 }} />
                <Text style={[styles.title]}>
                  Log Your Hours
                </Text>
                <Text style={styles.subtitle}>
                  Easily track your volunteering hours               
                </Text>
              </View>
            ),
            title: '',
            subtitle: '',
        },
        {
            backgroundColor: '#a6e4d0',
            image: (
              <View style={styles.container}>
                <Image source={require('../../assets/images/onboarding-img3.png')} style={{ marginBottom: 20, width: 300, height: 300 }} />
                <Text style={[styles.title]}>
                  Set Your Goal
                </Text>
                <Text style={styles.subtitle}>Enter Your Volunteering Hours Goal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter hours"
                  keyboardType="numeric"
                  value={hours}
                  onChangeText={setHours}
                />
              </View>
            ),
            title: '',
            subtitle: '',
        }
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 35,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: '90%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.primary,
  },
  title1: {
    color: 'white',
    fontSize: 35,
    marginBottom: 10,
  },
  subtitle1: {
    color: 'white',
    fontSize: 15,
  }
});

export default OnboardingScreen;
