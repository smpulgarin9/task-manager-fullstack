import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Board} from '../types';
import {useProjectStore} from '../store/projectStore';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const PRIORITIES = [
  {value: 'LOW', label: 'Baja', color: '#36B37E'},
  {value: 'MEDIUM', label: 'Media', color: '#FFAB00'},
  {value: 'HIGH', label: 'Alta', color: '#FF5630'},
  {value: 'URGENT', label: 'Urgente', color: '#DE350B'},
];

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  boards: Board[];
  preselectedBoardId?: number;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  boards,
  preselectedBoardId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [boardId, setBoardId] = useState<number>(
    preselectedBoardId || boards[0]?.id || 0,
  );
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {createTask} = useProjectStore();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setBoardId(preselectedBoardId || boards[0]?.id || 0);
    setDueDate('');
    setError('');
    setTitleError('');
    setIsLoading(false);
  };

  const handleCreate = async () => {
    setError('');
    setTitleError('');

    if (!title.trim()) {
      setTitleError('El título es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        boardId,
        dueDate: dueDate.trim() || null,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al crear la tarea';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}>
            <View style={styles.container}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>Nueva Tarea</Text>

                {error ? (
                  <Text style={styles.errorBanner}>{error}</Text>
                ) : null}

                <CustomInput
                  label="Título"
                  value={title}
                  onChangeText={text => {
                    setTitle(text);
                    if (titleError) {
                      setTitleError('');
                    }
                  }}
                  placeholder="Nombre de la tarea"
                  error={titleError}
                />

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Descripción</Text>
                  <TextInput
                    style={styles.textArea}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe la tarea..."
                    placeholderTextColor="#A0A0A0"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Prioridad</Text>
                  <View style={styles.priorityRow}>
                    {PRIORITIES.map(p => (
                      <TouchableOpacity
                        key={p.value}
                        style={[
                          styles.priorityChip,
                          {borderColor: p.color},
                          priority === p.value && {backgroundColor: p.color},
                        ]}
                        onPress={() => setPriority(p.value)}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.priorityChipText,
                            {color: priority === p.value ? '#FFF' : p.color},
                          ]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Columna</Text>
                  <View style={styles.boardRow}>
                    {boards.map(b => (
                      <TouchableOpacity
                        key={b.id}
                        style={[
                          styles.boardChip,
                          boardId === b.id && styles.boardChipActive,
                        ]}
                        onPress={() => setBoardId(b.id)}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.boardChipText,
                            boardId === b.id && styles.boardChipTextActive,
                          ]}
                          numberOfLines={1}>
                          {b.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <CustomInput
                  label="Fecha de vencimiento (opcional)"
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                />

                <View style={styles.buttons}>
                  <View style={styles.buttonWrapper}>
                    <CustomButton
                      title="Cancelar"
                      onPress={handleCancel}
                      variant="secondary"
                      disabled={isLoading}
                    />
                  </View>
                  <View style={styles.buttonWrapper}>
                    <CustomButton
                      title="Crear"
                      onPress={handleCreate}
                      isLoading={isLoading}
                      disabled={isLoading}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '92%',
    maxWidth: 420,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
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
  fieldContainer: {
    marginBottom: 16,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FAFAFA',
    minHeight: 80,
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
  boardRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  boardChip: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  boardChipActive: {
    borderColor: '#007AFF',
    backgroundColor: '#EBF5FF',
  },
  boardChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  boardChipTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default CreateTaskModal;
