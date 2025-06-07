import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../api/firebaseConfig';
import Eye from '../../assets/NewVersion/Eye.png';
import Check from '../../assets/NewVersion/Check.png';
import Mail from '../../assets/NewVersion/Mail.png';
import Google from '../../assets/NewVersion/Google.png';
import Facebook from '../../assets/NewVersion/Facebook.png';
import GoBack from '../../assets/NewVersion/GoBack.png';

const ForgetPassword = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const handleForgotPassword = async () => {
        if (email) {
          try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Reset Email Sent', 'Password reset link sent! Check your email.');
          } catch (error) {
            console.error('Reset password error:', error);
            Alert.alert('Error', error.message);
          }
        } else {
          Alert.alert('Error', 'Please enter your email address.');
        }
      };

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={GoBack} style={styles.goback} />
        </TouchableOpacity>
        <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.logo} />
        <View style={styles.text}>
            <Text style={styles.header}>Forgot Password?</Text>
        </View>

        <Text style={styles.emailAddress}>Don't worry, enter your email to reset it in just a few steps!</Text>

        <Text style={styles.emailAddress}>Enter Email Address</Text>

        <View style={styles.inputContainer}>
            <Image source={Mail} style={styles.icon} />
            <TextInput
                placeholder="Email Address"
                placeholderTextColor="#aaaaaa"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            {email && <Image source={Check} style={styles.checkIcon} />}
        </View>


        <TouchableOpacity style={styles.loginButton} onPress={handleForgotPassword}>
            <Text style={styles.loginButtonText}>Get Reset Link</Text>
        </TouchableOpacity>

    

        {loading && (
        <Modal transparent animationType="fade">
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        </Modal>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        backgroundColor: '#ffffff',
    },
    backButton: {
        marginTop: 20,
        marginBottom: 10,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 24,
        color: '#6200ee',
    },
    goback: {
        alignSelf: 'center',
        width: 30,
        height: 30,
        marginBottom: 20,
        marginTop: 100,
        marginLeft: 10,
    },
    logo: {
        alignSelf: 'center',
        width: 100,
        height: 100,
    },
    text: {
        fontSize: 30,
        letterSpacing: 0.9,
        lineHeight: 28,
        fontWeight: "600",
        color: "#000",
        alignItems: 'flex-start'
    },
    emailAddress: {
        fontSize: 16,
        letterSpacing: 0.8,
        lineHeight: 26,
        color: "#000",
        textAlign: "left",
        marginTop: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        color: '#000000',
        marginBottom: 20,
        paddingVertical: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.2,
        borderColor: '#d1d1d1',
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#fdfdfd',
        height: 56,
        marginTop: 20,
    },
    input: {
        marginLeft: 10,
        fontSize: 16,
        color: "#1b1b1b",
        flex: 1,
    },
    iconContainer: {
        width: 20,
        height: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    icon: {
        marginRight: 10,
    },
    checkIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    loginButton: {
        backgroundColor: "#884efe",
        justifyContent: 'center',
        height: 56,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '400',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    signUp: {
        color: "#696969",
        fontSize: 16,
    },
    signUpText: {
        fontWeight: "500",
        fontSize: 16,
        color: "#884efe",
        textDecorationLine: 'underline',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    frameChild: {
        borderStyle: "solid",
        borderColor: "#d1d1d1",
        borderTopWidth: 1,
        height: 1,
        flex: 1
    },
    orSignIn: {
        fontSize: 14,
        letterSpacing: 0.1,
        color: "#696969",
        textAlign: "center",
        lineHeight: 14,
    },
    frame: {
        alignSelf: "stretch",
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    socialContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 10,
        height: 56,

        paddingHorizontal: 30,
        marginBottom: 12,
        width: '100%',
    },
    socialIconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    socialIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    buttonText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

export default ForgetPassword;
