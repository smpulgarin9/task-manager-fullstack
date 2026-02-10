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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({navigation}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const {register, isLoading} = useAuthStore();

  const validate = (): boolean => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      errors.fullName = 'El nombre es obligatorio';
    }

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

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!validate()) {
      return;
    }

    try {
      await register(email.trim(), password, fullName.trim());
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al crear la cuenta. Intenta de nuevo.';
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
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para comenzar</Text>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <CustomInput
            label="Nombre completo"
            value={fullName}
            onChangeText={text => {
              setFullName(text);
              clearFieldError('fullName');
            }}
            placeholder="Tu nombre completo"
            error={fieldErrors.fullName}
          />

          <CustomInput
            label="Correo electrónico"
            value={email}
            onChangeText={text => {
              setEmail(text);
              clearFieldError('email');
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
              clearFieldError('password');
            }}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            error={fieldErrors.password}
          />

          <CustomInput
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              clearFieldError('confirmPassword');
            }}
            placeholder="Repite tu contraseña"
            secureTextEntry
            error={fieldErrors.confirmPassword}
          />

          <CustomButton
            title="Crear Cuenta"
            onPress={handleRegister}
            isLoading={isLoading}
            disabled={isLoading}
          />

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{' '}
              <Text style={styles.linkHighlight}>Inicia sesión</Text>
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

export default RegisterScreen;
