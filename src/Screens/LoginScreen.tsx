// src/Screens/LoginScreen.tsx
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
import {useNavigation} from '@react-navigation/native';

// Make sure these match the names you registered in App.tsx
const MainScreenName = 'MainScreen';
const RegisterScreenName = 'RegisterScreen';

export default function LoginScreen(): React.ReactElement {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    try {
      await auth().signInWithEmailAndPassword(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Login failed', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ios: 'padding', android: undefined})}
      style={styles.container}>
      <AppHeader title="Login" />

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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(RegisterScreenName as never)}>
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: orangeBackgroundColor,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
