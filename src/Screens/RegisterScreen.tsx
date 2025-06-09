// src/Screens/RegisterScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AppHeader from '../Components/AppHeader';
import {
  screensBackgroundColor,
  greyBorderColor,
  orangeBackgroundColor,
  modalBorderRadius,
} from '../Utils/Styiling';
import {genericStyles} from '../Utils/Styiling';
import auth from '@react-native-firebase/auth';

export default function RegisterScreen(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    try {
      await auth().createUserWithEmailAndPassword(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Registration failed', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ios: 'padding', android: undefined})}
      style={styles.container}>
      <AppHeader title="Register" />

      <View style={styles.form}>
        <Text style={genericStyles.nameBold}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={genericStyles.nameBold}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: screensBackgroundColor,
  },
  form: {
    padding: 16,
    marginTop: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: greyBorderColor,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: orangeBackgroundColor,
    paddingVertical: 12,
    borderRadius: modalBorderRadius,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
