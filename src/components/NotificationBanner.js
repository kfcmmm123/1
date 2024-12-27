import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import colors from '../../assets/colors/colors';

const NotificationBanner = ({ message, type }) => {
  const [visible, setVisible] = useState(true);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => setVisible(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, type === 'error' ? styles.error : styles.success, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  success: {
    backgroundColor: colors.primary,
  },
  error: {
    backgroundColor: 'red',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  }
});

export default NotificationBanner;