import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, Text, TouchableOpacity, StyleSheet, Linking, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../api/firebaseConfig';
import Eye from '../../assets/NewVersion/Eye.png';
import Check from '../../assets/NewVersion/Check.png';
import Mail from '../../assets/NewVersion/Mail.png';
import Google from '../../assets/NewVersion/Google.png';
import Facebook from '../../assets/NewVersion/Facebook.png';
import GoBack from '../../assets/NewVersion/GoBack.png';
import Close from '../../assets/NewVersion/Close.png'

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

const emailValidator = (email) => {
    // This is a simple regex for basic email validation
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
};

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [passwordVisibility, setPasswordVisibility] = useState(true); // Password initially hidden
    const [rePasswordVisibility, setRePasswordVisibility] = useState(true);
    const [isEmailValid, setIsEmailValid] = useState(null); // null, true, or false
    const [verificationEmailSent, setVerificationEmailSent] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
    const [showTermsModal, setShowTermsModal] = useState(false); // Modal visibility state

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email and password are required.');
            return;
        }

        if (!agreeToTerms) {
            setShowTermsModal(true); // Open modal if terms are not agreed
            return;
        }
    
        createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredentials) => {
            // Create a document in Firestore after account creation
            const userDocRef = doc(db, 'users', userCredentials.user.uid);
            await setDoc(userDocRef, {
            email: email,
            createdAt: new Date() // Add other initial fields as needed
            });

            await AsyncStorage.setItem('isNewUser', 'true'); // Set isNewUser to true on successful sign-up
            sendEmailVerification(userCredentials.user)
            .then(() => {
                Alert.alert('Success', 'Verification email sent! Please check your email to verify your account.');
                navigation.replace('SignInScreen');
            })
            .catch((error) => {
                console.error('Error sending email verification', error);
                Alert.alert('Error', 'Error sending email verification');
            });
        })
        .catch((error) => {
            switch (error.code) {
            case 'auth/email-already-in-use':
                Alert.alert('Error', 'An account with this email already exists.');
                break;
            case 'auth/invalid-email':
                Alert.alert('Error', 'The email address is not valid.');
                break;
            case 'auth/weak-password':
                Alert.alert('Error', 'The password is too weak. Password must be at least 6 characters.');
                break;
            default:
                Alert.alert('Error', 'Error signing up: ' + error.message);
            }
        });
    };

    const togglePasswordVisibility = () => {
        setPasswordVisibility(!passwordVisibility);
    };

    const toggleRePasswordVisibility = () => {
        setRePasswordVisibility(!rePasswordVisibility);
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        setIsEmailValid(emailValidator(text));
    };

    const openURL = (url) => {
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Image source={GoBack} style={styles.goback} />
            </TouchableOpacity>
            <Image source={require('../../assets/adaptive-icon-cropped.png')} style={styles.logo} />
            <View style={styles.text}>
                <Text style={styles.header}>Sign Up</Text>
            </View>

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

            <Text style={styles.password}>Enter Password</Text>

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

            <Text style={styles.password}>Re-enter Password</Text>

            <View style={styles.inputContainer}>
                <TextInput
                placeholder="Re-enter Password"
                placeholderTextColor="#aaaaaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={rePasswordVisibility}
                style={styles.input}
                />
                <TouchableOpacity onPress={toggleRePasswordVisibility} style={styles.iconContainer}>
                    <Image source={Eye} style={[styles.icon, { tintColor: rePasswordVisibility ? '#aaaaaa' : '#884efe' }]} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
                <Text style={styles.loginButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.frame}>
                <View style={styles.frameChild} />
                <Text style={styles.orSignIn}>   Or register with   </Text>
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
                <Text style={styles.signUp}>Read our </Text>
                <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                    <Text style={styles.signUpText}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.signUp}> to accept </Text>
                <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                    <Text style={styles.signUpText}>Privacy Policy</Text>
                </TouchableOpacity>
            </View>

            {loading && (
            <Modal transparent animationType="fade">
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6200ee" />
                </View>
            </Modal>
            )}

            <Modal
                visible={showTermsModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowTermsModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeIconContainer}
                            onPress={() => setShowTermsModal(false)}
                        >
                            <Image source={Close} style={styles.closeIcon} />
                        </TouchableOpacity>
                        <Text style={styles.modalHeader}>VolunTrack</Text>
                        <Text style={styles.modalSubHeader}>Terms and Conditions</Text>
                        <Text style={styles.modalLastUpdated}>Last Updated: 11/20/2024</Text>
                        <ScrollView style={styles.modalScrollView}>
                            <Text style={styles.modalText}>
                                Welcome to VolunTrack! By downloading, accessing, or using this app, you agree to the
                                following Terms and Conditions. Please read them carefully.
                            </Text>
                            <Text style={styles.modalText}>
                                1. Acceptance of Terms{'\n'}
                                By using VolunTrack, you agree to comply with and be bound by these terms. If you do not agree,
                                please do not use this app.
                            </Text>
                            <Text style={styles.modalText}>
                                2. Eligibility You must be at least 12 years old to use this app. By using the app, you confirm that you meet the eligibility requirements.
                            </Text>
                            <Text style={styles.modalText}>
                                3. User Responsibilities You agree to use the app for lawful purposes only. You will not upload or share harmful, offensive, or illegal content. You are responsible for keeping your account credentials secure.
                            </Text>
                            <Text style={styles.modalText}>
                                4. Intellectual Property All content, trademarks, and features on this app are the property of VolunTrack. You may not copy, modify, or distribute any materials without prior permission.
                            </Text>
                            <Text style={styles.modalText}>
                                5. Limitation of Liability VolunTrack is not liable for any damages resulting from your use of the app. This includes, but is not limited to, data loss, service interruptions, or unauthorized access to your account.
                            </Text>
                            <Text style={styles.modalText}>
                                6. Privacy Your personal information will be handled according to our [Privacy Policy]. By using the app, you consent to the collection and use of your data as described.                            
                                </Text>
                            <Text style={styles.modalText}>
                                7. Updates to Terms We reserve the right to update these Terms and Conditions at any time. Changes will be effective upon posting. Continued use of the app constitutes your acceptance of the new terms.                            
                            </Text>
                            <Text style={styles.modalText}>
                                8. Termination We may suspend or terminate your access to the app for violating these terms or for other reasons at our discretion.                            
                            </Text>
                            <Text style={styles.modalText}>
                                9. Contact Us If you have any questions about these Terms and Conditions, please contact us at info@voluntracks.com. By clicking "Agree" or continuing to use the app, you confirm your acceptance of these terms.
                            </Text>
                        </ScrollView>
                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity
                                onPress={() => setAgreeToTerms(!agreeToTerms)}
                                style={[
                                    styles.checkbox,
                                    agreeToTerms && styles.checkboxChecked,
                                ]}
                            >
                                {agreeToTerms && <Text style={styles.checkboxTick}>✓</Text>}
                            </TouchableOpacity>
                            <Text style={styles.checkboxLabel}>
                                I have read and agree to VolunTrack's terms
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                !agreeToTerms && styles.continueButtonDisabled,
                            ]}
                            onPress={() => {
                                if (agreeToTerms) {
                                    setShowTermsModal(false);
                                }
                            }}
                            disabled={!agreeToTerms}
                        >
                            <Text style={styles.continueButtonText}>Continue</Text>
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
        marginRight: 10,
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
        marginTop: 25,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '400',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
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
    agreementContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
      },
      checkbox: {
        marginRight: 10,
      },
      checkboxUnselected: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 5,
      },
      checkboxSelected: {
        width: 20,
        height: 20,
        backgroundColor: '#6200ee',
        borderRadius: 5,
      },
      agreementText: {
        fontSize: 14,
        color: '#333',
      },
      link: {
        color: '#6200ee',
        textDecorationLine: 'underline',
      },
      modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    closeIconContainer: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    closeIcon: {
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeader: {
        fontSize: 16,
        fontWeight: '400',
        color: '#696969',
        marginTop: 40,
        letterSpacing: 0.8,
    },
    modalSubHeader: {
        fontSize: 27,
        fontWeight: '600',
        marginTop: 5,
        marginBottom: 5,
    },
    modalLastUpdated: {
        fontSize: 14,
        color: '#000000',
        marginVertical: 10,
    },
    modalScrollView: {
        maxHeight: 275,
        marginVertical: 10,
        marginHorizontal: 20,
    },
    modalText: {
        fontSize: 16,
        letterSpacing: 0.5,
        lineHeight: 28,
        color: "#000",
        textAlign: "left",
        marginBottom: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        width: '85%',
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 30,
        marginLeft: 20,
    },
    checkboxChecked: {
        backgroundColor: '#884efe',
        borderColor: '#884efe',
    },
    checkboxTick: {
        fontSize: 14,
        color: 'white',
    },
    checkboxLabel: {
        fontSize: 16,
        letterSpacing: 0.8,
        lineHeight: 19,
        fontWeight: "600",
    },
    continueButton: {
        width: '100%',
        backgroundColor: '#884efe',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: '#ccc',
    },
    continueButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },

});

export default SignUpScreen;
