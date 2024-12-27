import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const IndividualMailScreen = () => {
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [newMessage, setNewMessage] = useState('');
  const sendMessage = () => {
    if (newMessage) {
      setMessages([...messages, { text: newMessage, sender: 'user' }]);
      setNewMessage(''); // Clear the input field
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={item.sender === 'user' ? styles.userMessage : styles.botMessage}>
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Text style={styles.sendButton}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 80,
    marginBottom: 20
  },
  userMessage: {
    backgroundColor: 'lightblue',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  botMessage: {
    backgroundColor: 'lightgray',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 16,
    padding: 18,
  },
  sendButton: {
    color: 'white',
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 255, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontWeight: 'bold',
  },
});

export default IndividualMailScreen;
