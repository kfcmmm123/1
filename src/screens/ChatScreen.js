import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  createChat,
  sendMessage,
  getChatMessages
} from '../services/chatService';
import { auth } from '../api/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

const contactAvatar = require('../../assets/profile-pic.png'); // Replace with your avatar

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();
  const navigation = useNavigation();
  const route = useRoute();
  const { chatUser } = route.params || {};

  // Default values if no chatUser is passed
  const orgName = chatUser?.orgName || 'Organization';
  const contactName = chatUser?.friendName || 'Friend';

  useEffect(() => {
    if (chatUser) {
      initializeChat();
    }
  }, [chatUser]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      // Create or get existing chat
      const newChatId = await createChat(chatUser.friendId);
      setChatId(newChatId);

      // Listen for messages
      const unsubscribe = getChatMessages(newChatId, (chatMessages) => {
        setMessages(chatMessages);
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize chat');
      console.error('Chat initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !chatId) return;

    setSending(true);
    try {
      await sendMessage(chatId, input.trim());
      setInput('');
      // Auto-scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message) => {
    return message.senderId === auth.currentUser?.uid;
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageRow,
      isMyMessage(item) ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }
    ]}>
      {!isMyMessage(item) && (
        <Image source={contactAvatar} style={styles.bubbleAvatar} />
      )}
      <View style={[
        styles.bubble,
        isMyMessage(item) ? styles.bubbleMe : styles.bubbleOther
      ]}>
        <Text style={[
          styles.bubbleText,
          isMyMessage(item) ? { color: '#fff' } : { color: '#222' }
        ]}>{item.text}</Text>
        <Text style={[
          styles.timeText,
          isMyMessage(item) ? { color: 'rgba(255,255,255,0.7)' } : { color: '#999' }
        ]}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <Ionicons name="arrow-back" size={28} color="#884EFE" />
          </TouchableOpacity>
          <Image source={contactAvatar} style={styles.headerAvatar} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.orgName}>{orgName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.onlineDot} />
              <Text style={styles.contactName}>{contactName}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#222" style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={24} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Chat */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading chat...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating contact avatar button */}
        <TouchableOpacity style={styles.floatingAvatar}>
          <Image source={contactAvatar} style={styles.floatingAvatarImg} />
        </TouchableOpacity>

        {/* Message input bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          style={styles.inputBarContainer}
        >
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Write your message"
              value={input}
              onChangeText={setInput}
              multiline
              editable={!sending}
            />
            <TouchableOpacity>
              <Ionicons name="mic-outline" size={24} color="#B9B3C6" style={{ marginHorizontal: 8 }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={sending || !input.trim()}
            >
              <Ionicons
                name="send"
                size={24}
                color={sending || !input.trim() ? "#B9B3C6" : "#884EFE"}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerBack: {
    marginRight: 10,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#884EFE',
  },
  orgName: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  contactName: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
    marginRight: 4,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bubbleMe: {
    backgroundColor: '#884EFE',
    borderTopRightRadius: 0,
    marginLeft: 40,
  },
  bubbleOther: {
    backgroundColor: '#EDEDED',
    borderTopLeftRadius: 0,
    marginRight: 40,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#884EFE',
    marginRight: 8,
    marginBottom: 4,
  },
  floatingAvatar: {
    position: 'absolute',
    left: 16,
    bottom: 90,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  floatingAvatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#884EFE',
  },
  inputBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 8,
    paddingTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 36,
    maxHeight: 80,
    color: '#222',
    paddingVertical: 8,
  },
});

export default ChatScreen;