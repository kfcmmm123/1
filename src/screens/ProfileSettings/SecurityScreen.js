import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const icons = {
  back: require('../../../assets/NewVersion/GoBack.png'),
  eye: require('../../../assets/NewVersion/Eye.png'),
};

const SecurityScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={icons.back} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security</Text>
        </View>
        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Change Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#aaaaaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={passwordVisibility}
              style={styles.input}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
              <Image source={icons.eye} style={[styles.icon, { tintColor: passwordVisibility ? '#aaaaaa' : '#884efe' }]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Two-Factor Authentication</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable 2FA</Text>
            <Switch
              value={twoFactorEnabled}
              onValueChange={toggleTwoFactor}
              trackColor={{ false: '#ccc', true: '#884efe' }}
              thumbColor={twoFactorEnabled ? '#fff' : '#fff'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#884EFE',
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    top: 45,
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    marginTop: 32,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  label: {
    fontSize: 16,
    color: '#222',
    marginBottom: 10,
    fontWeight: 'bold',
    marginTop: 10,
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
    marginBottom: 20,
  },
  input: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1b1b1b',
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#222',
  },
});

export default SecurityScreen;
