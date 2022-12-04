import React, {useState} from 'react';
import { KeyboardAvoidingView, StyleSheet, View, TextInput, TouchableOpacity, } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const TaskInputField = (props) => {
    const [task, setTask] = useState();

    const handleAddTask = (value) => {
        props.addTask(value);
        setTask(null);
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TextInput style={styles.inputField} value={task} onChangeText={text => setTask(text)} placeholder={' Write a task'} placeholderTextColor={"gray"}/>
            <TouchableOpacity onPress={() => handleAddTask(task)}>
                <View style={styles.button}>
                    <MaterialIcons name="keyboard-arrow-up" size={24} color="black" />
                </View>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderColor: '#DCDCDC',
        backgroundColor: '#DCDCDC',
        borderWidth: 1,
        marginHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        position: 'absolute',
        bottom: 20,
    },
    inputField: {
        backgroundColor: '#DCDCDC',
        height: 50,
        flex: 1,
        marginLeft: 0
    },
    button: {
        height: 30,
        width: 30,
        borderRadius: 5,
        backgroundColor: '#DCDCDC',
        alignItems: 'center',
        justifyContent: 'center'
    },
});

export default TaskInputField;