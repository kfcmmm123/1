import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ActivityResultsList = ({ title, results, navigation }) => {
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

  const createColumns = () => {
    const columnData = [[], []]; // 左右两列
    results.forEach((item, index) => {
      columnData[index % 2].push(item);
    });
    return columnData;
  };

  const renderItem = (item) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.resultItem}
        onPress={() => navigation.navigate('VolunteeringScreen', { itemData: item })}
      >
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>30 Days</Text>
          </View>
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={30} color="green" />
          </View>
        </View>

        <Image
          source={require('../../assets/adaptive-icon-cropped.png')}
          style={styles.icon}
        />

        <Text
          style={styles.city}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {item.city || 'York Region...'}
        </Text>

        <Text
          style={styles.name}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {item.name || '2024 Summer...'}
        </Text>

        <Text style={styles.date}>02/01/2025</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.columnsWrapper}>
        {createColumns().map((column, colIndex) => (
          <View key={`column-${colIndex}`} style={styles.column}>
            {column.map(renderItem)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 5,
  },
  columnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  column: {
    width: '48%',
  },
  resultItem: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15, // Rounded corners
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    position: 'absolute',
  },
  badge: {
    position: 'absolute', // Ensures the badge floats
    top: 5,
    left: 5,
    backgroundColor: '#884EFE',
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 8, // Add some padding for text comfort
    paddingVertical: 2,   // Minimal padding to avoid height extension
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkmarkContainer: {
    top: 10,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    marginTop: 10,
    marginBottom: 5,
  },
  city: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 5,
    maxWidth: '95%'
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default ActivityResultsList;
