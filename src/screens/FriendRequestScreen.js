import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { 
  sendFriendRequest, 
  getFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest
} from '../services/chatService';

const FriendRequestScreen = () => {
  const [email, setEmail] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Listen for friend requests
    const unsubscribe = getFriendRequests((requests) => {
      setPendingRequests(requests);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSendFriendRequest = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setSendingRequest(true);
    try {
      await sendFriendRequest(email.trim());
      Alert.alert('Success', 'Friend request sent successfully!');
      setEmail('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setLoading(true);
    try {
      await acceptFriendRequest(requestId);
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await rejectFriendRequest(requestId);
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPendingRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{item.fromUserName}</Text>
        <Text style={styles.requestEmail}>{item.fromUserEmail}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
          disabled={loading}
        >
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(item.id)}
          disabled={loading}
        >
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friend Requests</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Send Friend Request Section */}
        <View style={styles.sendRequestSection}>
          <Text style={styles.sectionTitle}>Send Friend Request</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter friend's email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.sendButton, sendingRequest && styles.sendButtonDisabled]}
              onPress={handleSendFriendRequest}
              disabled={sendingRequest}
            >
              {sendingRequest ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Requests Section */}
        <View style={styles.pendingSection}>
          <Text style={styles.sectionTitle}>
            Pending Requests ({pendingRequests.length})
          </Text>
          
          {pendingRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No pending friend requests</Text>
            </View>
          ) : (
            <FlatList
              data={pendingRequests}
              renderItem={renderPendingRequest}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sendRequestSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#884EFE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  pendingSection: {
    flex: 1,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  requestEmail: {
    fontSize: 14,
    color: '#666',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
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
  },
});

export default FriendRequestScreen; 