import React from "react";
import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native";

const SkillButton = ({ skill, selected, onPress }) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: selected ? '#9999ee' : '#ddd',
          padding: 10,
          margin: 5,
          borderRadius: 15,
          alignItems: 'center',
        }}
        onPress={onPress}
      >
        <Text style={{fontSize: 15}} >{skill}</Text>
      </TouchableOpacity>
    );
  };
  
  const skills = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Dart'];
  
  const SkillSettingScreen = () => {
    return (
      <View style={styles.container}>
        <Text>Select your skill so that we can get better jobs for you.</Text>
  
        <ScrollView>
          <View style={{flexDirection: 'row' , flexWrap: 'wrap', justifyContent: 'center' }}>
          {skills.map((skill) => (
            <SkillButton key={skill} skill={skill} selected={false} onPress={() => {}} />
          ))}
          </View>
        </ScrollView>
  
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text>Save Changes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#9999ee',
        padding: 10,
        margin: 10,
        borderRadius: 15,
        alignItems: 'center',
    },
  });

  export default SkillSettingScreen;