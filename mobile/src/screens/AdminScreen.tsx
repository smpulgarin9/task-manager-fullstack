import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {adminService, UserItem} from '../api/adminService';

const ROLES = ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'] as const;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  PROJECT_MANAGER: 'Project Manager',
  MEMBER: 'Miembro',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#DC2626',
  PROJECT_MANAGER: '#2563EB',
  MEMBER: '#16A34A',
};

const AdminScreen: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changingUserId, setChangingUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudieron cargar los usuarios');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setChangingUserId(userId);
    try {
      const updated = await adminService.changeUserRole(userId, newRole);
      setUsers(prev =>
        prev.map(u => (u.id === userId ? {...u, role: updated.role} : u)),
      );
      Alert.alert('Éxito', `Rol actualizado a ${ROLE_LABELS[newRole]}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo cambiar el rol');
    } finally {
      setChangingUserId(null);
    }
  };

  const renderUser = ({item}: {item: UserItem}) => {
    const roleColor = ROLE_COLORS[item.role] || '#6B7280';
    const isChanging = changingUserId === item.id;

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {item.fullName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.fullName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <View style={[styles.roleBadge, {backgroundColor: roleColor + '20'}]}>
              <Text style={[styles.roleBadgeText, {color: roleColor}]}>
                {ROLE_LABELS[item.role] || item.role}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          {isChanging ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Picker
              selectedValue={item.role}
              onValueChange={value => {
                if (value !== item.role) {
                  handleRoleChange(item.id, value);
                }
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}>
              {ROLES.map(role => (
                <Picker.Item
                  key={role}
                  label={ROLE_LABELS[role]}
                  value={role}
                />
              ))}
            </Picker>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Gestión de Usuarios</Text>
      <Text style={styles.subtitle}>
        {users.length} usuario{users.length !== 1 ? 's' : ''} registrado
        {users.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay usuarios registrados</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 20,
    paddingBottom: 12,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    minHeight: 44,
    justifyContent: 'center',
  },
  picker: {
    height: 44,
  },
  pickerItem: {
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default AdminScreen;
