import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFriends, getUserChats } from '../services/chatService';
import { auth } from '../api/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

// Default avatar for users
const defaultAvatar = require('../../assets/profile-pic.png');

const MailScreen = () => {
  const [activeTab, setActiveTab] = useState('Chat');
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    // Listen for friends
    const friendsUnsubscribe = getFriends((friendsList) => {
      setFriends(friendsList);
    });

    // Listen for chats
    const chatsUnsubscribe = getUserChats((chatsList) => {
      setChats(chatsList);
    });

    return () => {
      if (friendsUnsubscribe) friendsUnsubscribe();
      if (chatsUnsubscribe) chatsUnsubscribe();
    };
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFilteredData = () => {
    const data = activeTab === 'Chat' ? chats : friends;
    if (!searchQuery.trim()) return data;

    return data.filter(item => {
      const name = activeTab === 'Chat' ? item.friendName : item.friendName;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const handleChatPress = (item) => {
    if (activeTab === 'Chat') {
      // Navigate to existing chat
      navigation.navigate('ChatScreen', {
        chatUser: {
          friendId: item.participants.find(id => id !== auth.currentUser?.uid),
          friendName: item.friendName || 'Friend',
          orgName: 'Chat'
        },
        chatId: item.id
      });
    } else {
      // Start new chat with friend
      navigation.navigate('ChatScreen', {
        chatUser: {
          friendId: item.friendId,
          friendName: item.friendName,
          orgName: 'Friend'
        }
      });
    }
  };

  const renderChatItem = ({ item }) => {
    const isChat = activeTab === 'Chat';
    const displayName = isChat ? (item.friendName || 'Friend') : item.friendName;
    const displayEmail = isChat ? (item.friendEmail || '') : item.friendEmail;
    const lastMessage = isChat ? (item.lastMessage || 'Start a conversation') : 'Tap to start chatting';
    const time = isChat ? formatTime(item.lastMessageTime) : '';

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <Image source={defaultAvatar} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.onlineDot} />
            <Text style={styles.name}>{displayName}</Text>
          </View>
          {displayEmail && (
            <Text style={styles.email}>{displayEmail}</Text>
          )}
          <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
        </View>
        {isChat && <Text style={styles.time}>{time}</Text>}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === 'Chat' ? 'chatbubbles-outline' : 'people-outline'}
        size={48}
        color="#ccc"
      />
      <Text style={styles.emptyText}>
        {activeTab === 'Chat'
          ? 'No chats yet. Start a conversation with a friend!'
          : 'No friends yet. Add friends to start chatting!'
        }
      </Text>
      {activeTab === 'Friends' && ( 
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={() => navigation.navigate('FriendRequestScreen')}
        >
          <Text style={styles.addFriendButtonText}>Add Friends</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate('AboutUsScreen')} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.icon} />
            <Text style={{ fontSize: 20, fontWeight: '500', marginRight: 5 }}>VolunTrack</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
            <TouchableOpacity
              style={{ marginLeft: 5 }}
              onPress={() => navigation.navigate('FriendRequestScreen')}
            >
              <Ionicons name={'person-add-outline'} size={30} color={'#000000'} />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 5 }} >
              <Ionicons name={'settings-outline'} size={30} color={'#000000'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setActiveTab('Friends')} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === 'Friends' && styles.tabTextActive]}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('Chat')} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === 'Chat' && styles.tabTextActive]}>Chat</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabIndicatorContainer}>
          <View style={[styles.tabIndicator, activeTab === 'Friends' ? { left: '12%' } : { left: '62%' }]} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder={`Search ${activeTab}`}
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Chat/Friends List */}
        <FlatList
          data={getFilteredData()}
          keyExtractor={item => item.id}
          renderItem={renderChatItem}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 22,
    color: '#B9B3C6',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#884EFE',
  },
  tabIndicatorContainer: {
    height: 3,
    width: '100%',
    position: 'relative',
    marginBottom: 10,
  },
  tabIndicator: {
    position: 'absolute',
    width: '25%',
    height: 3,
    backgroundColor: '#884EFE',
    borderRadius: 2,
    bottom: 0,
  },
  searchBarContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#884EFE',
    marginRight: 12,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#884EFE',
    marginRight: 6,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  lastMessage: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  time: {
    color: '#888',
    fontSize: 13,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  addFriendButton: {
    backgroundColor: '#884EFE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addFriendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MailScreen;