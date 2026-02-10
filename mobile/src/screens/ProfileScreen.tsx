import React from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {useAuthStore} from '../store/authStore';
import CustomButton from '../components/CustomButton';

const ProfileScreen: React.FC = () => {
  const {user, logout} = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás segura de que quieres salir?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : 'Miembro';

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>

        <Text style={styles.name}>{user?.fullName || 'Usuario'}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.logoutContainer}>
        <CustomButton
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="danger"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoSection: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  logoutContainer: {
    marginTop: 32,
  },
});

export default ProfileScreen;
