import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView } from 'react-native';
import { auth, db } from '../../api/firebaseConfig';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../../assets/colors/colors';
import Icon from 'react-native-vector-icons/FontAwesome';

const PostScreen = () => {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userPostsRef = collection(db, "users", user.uid, "posts");
      const q = query(userPostsRef);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsArray = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            timestamp: data.timestamp.toDate().toLocaleString(),
          };
        });
        setPosts(postsArray);
      });
  
      return () => unsubscribe(); // Clean up on unmount
    } else {
      setPosts([]); // Clear posts if no user is signed in
    }
  }, [auth.currentUser]); // Dependency on the current user
  
  const handlePost = async () => {
    if (postText.trim() === '') {
      Alert.alert("Please enter some text to post.");
      return;
    }
  
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("No user signed in");
        return;
      }
      const userPostsRef = collection(db, "users", user.uid, "posts");
      await addDoc(userPostsRef, {
        text: postText,
        timestamp: new Date(), // Stores the current time
      });
      setPostText('');
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };  

  return (
    <View style={styles.container}>
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.post}>
              {/* <Image source={{ uri: item.profilePicUrl || '../../../assets/profile-pic.png' }} style={styles.profilePic} /> */}
              <View style={styles.postContent}>
                <Text style={styles.postText}>{item.text}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.centered}>
          <Image source={require("../../../assets/icons/camera.png")} style={{ height: 50, width: 60, tintColor: 'grey', margin: 10 }}></Image>
          <Text style={{ color: 'grey', fontSize: 20 }}>
            Start sharing posts
          </Text>
          <Text style={{ color: 'grey', marginTop: 5, fontSize: 16, width: "80%", textAlign: "center" }}>
            Once you do, the posts will show up here.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.fullScreenModalView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post</Text>
            <TouchableOpacity onPress={handlePost}>
              <Text style={styles.postText}>Post</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            multiline
            value={postText}
            onChangeText={setPostText}
          />

          {/* <TouchableOpacity style={styles.optionButton}>
            <Icon name="hashtag" size={20} color="#888" style={styles.iconStyle} />
            <Text style={styles.optionText}>Add a topic</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Icon name="map-marker" size={20} color="#888" style={styles.iconStyle} />
            <Text style={styles.optionText}>Location</Text>
          </TouchableOpacity> */}
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#03A9F4',
    borderRadius: 28,
    elevation: 8
  },
  fabIcon: {
    fontSize: 24,
    color: 'white'
  },
  fullScreenModalView: {
    position: 'absolute',  // Ensures it covers the entire screen
    top: '40%',                // Aligns the top edge of the modal with the top of the screen
    left: 0,               // Aligns the left edge of the modal with the left of the screen
    right: 0,              // Aligns the right edge of the modal with the right of the screen
    bottom: 0,             // Aligns the bottom edge of the modal with the bottom of the screen
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelText: {
    color: 'blue',
    fontSize: 18,
  },
  post: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postContent: {
    flex: 1,
    paddingLeft: 10,
  },
  postText: {
    fontSize: 18,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
  },
  input: {
    fontSize: 18,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 10,
    padding: 10,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  iconStyle: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#888',
  },
});

export default PostScreen;
