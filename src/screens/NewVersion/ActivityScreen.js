import React, { useState, useEffect, useCallback } from 'react';
import { Button, Image, StyleSheet, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActivityResultsList from '../../components/ActivityResultsList';
import colors from '../../../assets/colors/colors';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const ActivityScreen = ({navigation}) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [totalCompleted, setTotalCompleted] = useState(49);
  const [totalHours, setTotalHours] = useState(100);

  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#ED6E33';
    if (percentage < 50) return '#FBBC05';
    return '#00DA0B';
  };

  const calculateFillPercentage = () => {
    return totalHours === 0 ? 0 : Math.round((totalCompleted / totalHours) * 100);
  };

  const fetchTasks = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys.filter(key => key.startsWith('@task_status_')));
      const fetchedTasks = result.map(([key, value]) => JSON.parse(value));
      setTasks(fetchedTasks);
      handleFilterChange('all', fetchedTasks); // Apply initial filter right after fetching

      const completedTasksCount = fetchedTasks.filter(task => task.status === 'Completed').length;
      // Store completed tasks count in AsyncStorage
      await AsyncStorage.setItem('@completed_tasks_count', JSON.stringify(completedTasksCount));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks(); // handleFilterChange is called within fetchTasks
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchDataAndUpdateState = async () => {
        await fetchTasks(); // Fetch tasks from AsyncStorage
        handleFilterChange('all'); // Always reset to 'All' filter upon focusing
      };

      fetchDataAndUpdateState();
    }, []) // Dependencies array is empty to indicate this effect doesn't depend on any state or props
  );

  const handleFilterChange = (newFilter, allTasks = tasks) => {
    setActiveFilter(newFilter);
    let filtered = allTasks;

    if (newFilter === 'all') {
      filtered = filtered.filter(task => task.status === 'Ongoing' || task.status === 'Completed');
    } else if (newFilter === 'ongoing') {
      filtered = filtered.filter(task => task.status === 'Ongoing');
    } else if (newFilter === 'completed') {
      filtered = filtered.filter(task => task.status === 'Completed');
    }
    // Filter by search term if it's not empty
    // if (searchTerm) {
    //   filtered = filtered.filter(task =>
    //     task.name.toLowerCase().includes(searchTerm.toLowerCase())
    //   );
    // }
    setFilteredTasks(filtered);
  };

  useEffect(() => {
    handleFilterChange(activeFilter);
  }, [activeFilter]);

  const FilterButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity style={styles.filterButton} onPress={onPress}>
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonActiveText]}>{title}</Text>
      {isActive && <View style={styles.activeFilterLine} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
          <Text style={{ fontSize: 20, fontWeight: '500', marginRight: 5 }}>VolunTrack</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
          <TouchableOpacity>
            <Ionicons name={'search-outline'} size={30} color={'#000000'} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 5 }}>
            <Ionicons name={'options-outline'} size={30} color={'#000000'} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.text}>Stay motivated and monitor your progress across all goals in one place!</Text>

      <View style={styles.progress}>
        <AnimatedCircularProgress
          size={240}
          width={20}
          fill={calculateFillPercentage()}
          lineCap="round"
          rotation={270}
          arcSweepAngle={180}
          tintColor={getProgressColor(calculateFillPercentage())}
          backgroundColor="#D9D9D9"
        >
          {(fill) => (
            <View style={styles.progressTextContainer}>
              <Text
                style={[
                  styles.progressText,
                  { color: getProgressColor(fill) }
                ]}
              >
                {Math.round(fill)}%
              </Text>
              <Text style={styles.progressSubText}>Total {totalHours} hrs</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      <View style={styles.separator} />

      <View style={styles.filterOptions}>
        <FilterButton title="All" isActive={activeFilter === 'all'} onPress={() => handleFilterChange('all')} />
        <FilterButton title="Ongoing" isActive={activeFilter === 'ongoing'} onPress={() => handleFilterChange('ongoing')} />
        <FilterButton title="Completed" isActive={activeFilter === 'completed'} onPress={() => handleFilterChange('completed')} />
      </View>
      {
        filteredTasks.length > 0 ? (
          <ActivityResultsList
            results={filteredTasks}
            navigation={navigation}
          />
        ) : (
          <Text style={styles.noResultsText}>
            {activeFilter === 'ongoing' && "You don't have any ongoing volunteering now."}
            {activeFilter === 'completed' && "You don't have any completed volunteering now."}
            {activeFilter === 'all' && "You don't have any ongoing/completed volunteering yet. Go apply one!"}
          </Text>
        )
      }
    </ScrollView>

  )
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 5,
  },
  text: {
    fontSize: 16,
    marginHorizontal: 15,
    marginTop: 10,
    color: '#000000',
    fontWeight: '300',
    lineHeight: 20,
  },
  separator: {
    height: 2,             // Thin line
    backgroundColor: '#D9D9D9', // Light grey for subtle separation
    marginVertical: 10,    // Spacing above and below the line
    width: '90%',         // Full width
    alignSelf: 'center'    // Ensures proper alignment
  },
  progress: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
    height: 150, // Half the size of the full circle
    overflow: 'hidden', // Hides the invisible bottom part
  },
  progressTextContainer: {
    position: 'absolute',
    top: '25%',
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  progressSubText: {
    fontSize: 16,
    color: 'gray',
  },

  filterOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 5,

  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10, // Adjust as needed for padding around the text
  },
  filterButtonText: {
    textAlign: 'center',
    fontWeight: 'normal',
    fontSize: 18,
    color: '#9967FE',
  },
  filterButtonActiveText: {
    fontWeight: 'bold',
  },
  activeFilterLine: {
    height: 2.5,
    bottom: 0,
    position: 'absolute',
    width: '90%', // Line will fill the width of the button
    backgroundColor: '#9967FE',
    marginTop: 5, // Space between text and line
    borderRadius: 10,
  },
  noResultsText: {
    width: '80%',
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 15,
    fontSize: 16,
    color: 'gray',
  },
})

export default ActivityScreen;