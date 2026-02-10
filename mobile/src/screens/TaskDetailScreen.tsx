import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ProjectStackParamList} from '../navigation/types';
import {useProjectStore} from '../store/projectStore';
import {taskService, TaskRequest} from '../api/taskService';
import {Task} from '../types';
import CustomButton from '../components/CustomButton';

const PRIORITY_CONFIG: Record<
  Task['priority'],
  {label: string; color: string}
> = {
  LOW: {label: 'Baja', color: '#36B37E'},
  MEDIUM: {label: 'Media', color: '#FFAB00'},
  HIGH: {label: 'Alta', color: '#FF5630'},
  URGENT: {label: 'Urgente', color: '#DE350B'},
};

const PRIORITIES: Task['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

type Props = NativeStackScreenProps<ProjectStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const {taskId} = route.params;
  const {currentProject, deleteTask, fetchProjectDetail} = useProjectStore();

  const task = useMemo(() => {
    if (!currentProject) {
      return null;
    }
    for (const board of currentProject.boards) {
      const found = board.tasks.find(t => t.id === taskId);
      if (found) {
        return found;
      }
    }
    return null;
  }, [currentProject, taskId]);

  const boardName = useMemo(() => {
    if (!currentProject) {
      return '';
    }
    for (const board of currentProject.boards) {
      if (board.tasks.some(t => t.id === taskId)) {
        return board.name;
      }
    }
    return '';
  }, [currentProject, taskId]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
    }
  }, [task]);

  const handleSave = async () => {
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!task) {
      return;
    }

    setIsSaving(true);
    try {
      const data: TaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        boardId: task.boardId,
        dueDate: dueDate.trim() || null,
      };
      await taskService.updateTask(task.id, data);
      if (currentProject) {
        await fetchProjectDetail(currentProject.id);
      }
      navigation.goBack();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al guardar los cambios';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!task) {
      return;
    }

    Alert.alert(
      'Eliminar tarea',
      `¿Estás segura de eliminar "${task.title}"? Esta acción no se puede deshacer.`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id, task.boardId);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la tarea');
            }
          },
        },
      ],
    );
  };

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Título de la tarea"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe la tarea..."
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => {
              const config = PRIORITY_CONFIG[p];
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityChip,
                    {borderColor: config.color},
                    priority === p && {backgroundColor: config.color},
                  ]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.priorityChipText,
                      {color: priority === p ? '#FFF' : config.color},
                    ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Estado actual</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>{boardName}</Text>
            </View>
          </View>
        </View>

        {task.assignee && (
          <View style={styles.section}>
            <Text style={styles.label}>Asignado</Text>
            <View style={styles.assigneeRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {task.assignee.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.assigneeName}>{task.assignee.fullName}</Text>
            </View>
          </View>
        )}

        {task.labels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Etiquetas</Text>
            <View style={styles.labelsRow}>
              {task.labels.map(lbl => (
                <View
                  key={lbl.id}
                  style={[
                    styles.labelChip,
                    {backgroundColor: lbl.color + '20'},
                  ]}>
                  <View
                    style={[styles.labelDot, {backgroundColor: lbl.color}]}
                  />
                  <Text style={[styles.labelText, {color: lbl.color}]}>
                    {lbl.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Fecha de vencimiento</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.buttonsContainer}>
          <CustomButton
            title="Guardar cambios"
            onPress={handleSave}
            isLoading={isSaving}
            disabled={isSaving}
          />
          <View style={styles.buttonSpacer} />
          <CustomButton
            title="Eliminar tarea"
            onPress={handleDelete}
            variant="danger"
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 100,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  infoBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  assigneeName: {
    fontSize: 16,
    color: '#333333',
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonsContainer: {
    marginTop: 12,
  },
  buttonSpacer: {
    height: 12,
  },
});

export default TaskDetailScreen;
