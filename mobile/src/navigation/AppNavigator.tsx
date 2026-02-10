import React, {useEffect} from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {useAuthStore} from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const AppNavigator: React.FC = () => {
  const {isAuthenticated, isLoading, loadToken} = useAuthStore();

  // Al montar, verifica si hay sesión guardada en AsyncStorage
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Splash/loading mientras verifica el token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Si no está autenticado muestra auth, si sí muestra la app principal
  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;
