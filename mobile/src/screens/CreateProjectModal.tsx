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
} from 'react-native';
import {useProjectStore} from '../store/projectStore';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {createProject} = useProjectStore();

  const resetForm = () => {
    setName('');
    setDescription('');
    setError('');
    setNameError('');
    setIsLoading(false);
  };

  const handleCreate = async () => {
    setError('');
    setNameError('');

    if (!name.trim()) {
      setNameError('El nombre del proyecto es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      await createProject(name.trim(), description.trim());
      resetForm();
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Error al crear el proyecto';
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
              <Text style={styles.title}>Nuevo Proyecto</Text>

              {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

              <CustomInput
                label="Nombre del proyecto"
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (nameError) {
                    setNameError('');
                  }
                }}
                placeholder="Ej: Mi proyecto"
                error={nameError}
              />

              <CustomInput
                label="Descripción (opcional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Describe tu proyecto"
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
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
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
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default CreateProjectModal;
