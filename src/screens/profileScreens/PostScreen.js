import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';
import colors from '../../../assets/colors/colors';

const PostScreen = () => {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsArray);
    });

    return () => unsubscribe(); // Clean up on unmount
  }, []);

  const handlePost = async () => {
    if (postText.trim() === '') return;

    try {
      await addDoc(collection(db, "posts"), {
        text: postText,
        timestamp: new Date(),
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
              <Text style={styles.postText}>{item.text}</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.centered}>
          <Image source={require("../../../assets/icons/camera.png")} style={{height: 50, width: 60, tintColor: 'grey', margin: 10}}></Image>
          <Text style={{color: 'grey', fontSize: 20}}>
            Start sharing posts
          </Text>
          <Text style={{color: 'grey', marginTop: 5, fontSize: 16, width: "80%", textAlign: "center"}}>
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
        <View style={styles.fullScreenModalView}>
          <Text style={styles.modalTitle}>Create a New Post</Text>
          <TextInput
            style={styles.inputModal}
            placeholder="What's on your mind?"
            placeholderTextColor="#888"
            value={postText}
            onChangeText={setPostText}
            multiline
            autoFocus
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.postButton} onPress={handlePost}>
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  post: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  postText: {
    fontSize: 18,
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
    top: '50%',                // Aligns the top edge of the modal with the top of the screen
    left: 0,               // Aligns the left edge of the modal with the left of the screen
    right: 0,              // Aligns the right edge of the modal with the right of the screen
    bottom: 0,             // Aligns the bottom edge of the modal with the bottom of the screen
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    justifyContent: 'center',  // Centers the content vertically
    alignItems: 'center',      // Centers the content horizontally
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  inputModal: {
    width: '100%',
    minHeight: 50,
    height: '75%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    fontSize: 16,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: '#03A9F4',
    flex: 1,
    marginRight: 10,
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  postButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    flex: 1,
    marginLeft: 10,
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: colors.text, // Ensure colors.text is defined or replace with a specific color
  },
});

export default PostScreen;
