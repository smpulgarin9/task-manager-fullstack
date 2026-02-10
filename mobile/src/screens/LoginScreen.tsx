import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../navigation/types';
import {useAuthStore} from '../store/authStore';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const {login, isLoading} = useAuthStore();

  const validate = (): boolean => {
    const errors: {email?: string; password?: string} = {};

    if (!email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Ingresa un email válido';
    }

    if (!password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      errors.password = 'Mínimo 6 caracteres';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setError('');
    if (!validate()) {
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al iniciar sesión. Verifica tus credenciales.';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Task Manager</Text>
          <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <CustomInput
            label="Correo electrónico"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (fieldErrors.email) {
                setFieldErrors(prev => ({...prev, email: undefined}));
              }
            }}
            placeholder="tu@email.com"
            keyboardType="email-address"
            error={fieldErrors.email}
          />

          <CustomInput
            label="Contraseña"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (fieldErrors.password) {
                setFieldErrors(prev => ({...prev, password: undefined}));
              }
            }}
            placeholder="Tu contraseña"
            secureTextEntry
            error={fieldErrors.password}
          />

          <CustomButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={isLoading}
          />

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.linkHighlight}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    fontSize: 14,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
    overflow: 'hidden',
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkHighlight: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default LoginScreen;
