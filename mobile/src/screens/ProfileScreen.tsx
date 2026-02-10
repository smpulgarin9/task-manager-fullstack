import React from 'react';
import {View, Text, StyleSheet, Alert, ScrollView} from 'react-native';
import {useAuthStore} from '../store/authStore';
import {usePermissions} from '../hooks/usePermissions';
import CustomButton from '../components/CustomButton';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  PROJECT_MANAGER: 'Project Manager',
  MEMBER: 'Miembro',
};

const ROLE_COLORS: Record<string, {bg: string; text: string}> = {
  ADMIN: {bg: '#FEE2E2', text: '#DC2626'},
  PROJECT_MANAGER: {bg: '#DBEAFE', text: '#2563EB'},
  MEMBER: {bg: '#DCFCE7', text: '#16A34A'},
};

const ProfileScreen: React.FC = () => {
  const {user, logout} = useAuthStore();
  const permissions = usePermissions();

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

  const roleKey = user?.role || 'MEMBER';
  const roleLabel = ROLE_LABELS[roleKey] || roleKey;
  const roleColor = ROLE_COLORS[roleKey] || ROLE_COLORS.MEMBER;

  const permissionsList = [
    {label: 'Crear proyectos', allowed: permissions.canCreateProject()},
    {label: 'Editar proyectos', allowed: permissions.canEditProject()},
    {label: 'Eliminar proyectos', allowed: permissions.canDeleteProject()},
    {label: 'Gestionar miembros', allowed: permissions.canManageMembers()},
    {label: 'Gestionar tableros', allowed: permissions.canManageBoards()},
    {label: 'Eliminar tareas', allowed: permissions.canDeleteTask()},
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>

        <Text style={styles.name}>{user?.fullName || 'Usuario'}</Text>

        <View style={[styles.roleBadge, {backgroundColor: roleColor.bg}]}>
          <Text style={[styles.roleText, {color: roleColor.text}]}>
            {roleLabel}
          </Text>
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

      <View style={styles.permissionsCard}>
        <Text style={styles.permissionsTitle}>Mis Permisos</Text>
        {permissionsList.map((perm, index) => (
          <View key={index} style={styles.permissionRow}>
            <Text style={styles.permissionIcon}>
              {perm.allowed ? '\u2705' : '\u274C'}
            </Text>
            <Text
              style={[
                styles.permissionLabel,
                !perm.allowed && styles.permissionDisabled,
              ]}>
              {perm.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <CustomButton
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="danger"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
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
  permissionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  permissionIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  permissionLabel: {
    fontSize: 14,
    color: '#374151',
  },
  permissionDisabled: {
    color: '#9CA3AF',
  },
  logoutContainer: {
    marginTop: 32,
  },
});

export default ProfileScreen;
