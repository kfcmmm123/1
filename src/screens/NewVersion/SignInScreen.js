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
import { auth, db } from '../../api/firebaseConfig';
import Eye from '../../../assets/NewVersion/Eye.png';
import Check from '../../../assets/NewVersion/Check.png';
import Mail from '../../../assets/NewVersion/Mail.png';
import Google from '../../../assets/NewVersion/Google.png';
import Facebook from '../../../assets/NewVersion/Facebook.png';
import GoBack from '../../../assets/NewVersion/GoBack.png';

const SocialButton = ({ title, iconSource, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <View style={styles.iconContainer}>
                <Image source={iconSource} style={styles.icon} />
            </View>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const SignInScreen = ({ navigation, route }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState(true); // Password initially hidden
    const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);
  
    useEffect(() => {
      if (route.params?.needVerification) {
        setEmailVerificationNeeded(true);
      }
    }, [route.params?.needVerification]);
  
    const handleSignIn = async () => {
      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user && userCredential.user.emailVerified) {
          // Fetch additional user data from Firestore
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Add email and password for storage
            const storedData = {
              ...userData,
              email: email,  // Storing the email in the user data object
              password: password  // Storing the password in the user data object (use with caution)
            };
            // Store the enhanced user data in AsyncStorage
            await AsyncStorage.setItem('@user_data', JSON.stringify(storedData));
            await AsyncStorage.setItem('bannerMessage', 'Signed in successfully!');
            await AsyncStorage.setItem('bannerType', 'success');
            await AsyncStorage.setItem('resetFirstLoad', 'true');
            const isNewUser = await AsyncStorage.getItem('isNewUser');
            const targetScreen = isNewUser === 'true' ? 'UserInfoScreen' : 'Profile';
            await AsyncStorage.removeItem('isNewUser');
            setLoading(false);
            navigation.navigate(targetScreen);
          } else {
            console.error("No such user!");
            Alert.alert('Error', 'No user data available.');
            setLoading(false);
          }
        } else {
          await AsyncStorage.setItem('bannerMessage', 'Failed to sign in.');
          await AsyncStorage.setItem('bannerType', 'error');
          setLoading(false);
        }
      } catch (error) {
        // Error handling based on error.code
        switch (error.code) {
          case 'auth/invalid-email':
            alert('The email address is not valid.');
            break;
          case 'auth/user-disabled':
            alert('The user account has been disabled by an administrator.');
            break;
          case 'auth/user-not-found':
            alert('There is no user corresponding to the email address. Go Sign Up!');
            break;
          case 'auth/wrong-password':
            alert('The password is wrong for the given email.');
            break;
          default:
            alert('Error signing in: ' + error.message);
        }
        setLoading(false);
      }
    };
  
  
    const togglePasswordVisibility = () => {
      setPasswordVisibility(!passwordVisibility);
    };

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={GoBack} style={styles.goback} />
        </TouchableOpacity>
        <Image source={require('../../../assets/adaptive-icon-cropped.png')} style={styles.logo} />
        <View style={styles.text}>
            <Text style={styles.header}>Sign In</Text>
        </View>

        <Text style={styles.emailAddress}>Email Address</Text>

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

        <Text style={styles.password}>Password</Text>


        <View style={styles.inputContainer}>
            <TextInput
                placeholder="Password"
                placeholderTextColor="#aaaaaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={passwordVisibility}
                style={styles.input}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                <Image source={Eye} style={[styles.icon, { tintColor: passwordVisibility ? '#aaaaaa' : '#884efe' }]} />
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgetPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
            <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.frame}>
            <View style={styles.frameChild} />
            <Text style={styles.orSignIn}>   Or sign in with   </Text>
            <View style={styles.frameChild} />
        </View>

        <View style={styles.socialContainer}>
            <SocialButton
                title="Continue with Google"
                iconSource={Google} // Update with your Google icon path
                onPress={() => console.log('Google pressed')}
            />
            <SocialButton
                title="Continue with Facebook"
                iconSource={Facebook} // Update with your Facebook icon path
                onPress={() => console.log('Facebook pressed')}
            />
        </View>

        <View style={styles.footer}>
            <Text style={styles.signUp}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={styles.signUpText}>Sign up now</Text>
            </TouchableOpacity>
        </View>

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
        marginBottom: 10, 
    },
    password: {
        fontSize: 16,
        letterSpacing: 0.8,
        lineHeight: 26,
        color: "#000",
        textAlign: "left",
        marginBottom: 10, 
        marginTop: 10,
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
        marginHorizontal: 5,
    },
    checkIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    forgotPasswordText: {
        fontSize: 16,
        letterSpacing: 0.8,
        lineHeight: 26,
        color: "#884efe",
        textAlign: "left",
        marginTop: 10,
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: "#884efe",
        justifyContent: 'center',
        height: 56,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
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
        marginBottom: 25,
        marginTop: 5,
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

export default SignInScreen;
