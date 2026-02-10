import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ProjectStackParamList} from '../navigation/types';
import {useProjectStore} from '../store/projectStore';
import {usePermissions} from '../hooks/usePermissions';
import {Task} from '../types';
import BoardColumn from '../components/BoardColumn';
import CreateTaskModal from './CreateTaskModal';

type Props = NativeStackScreenProps<ProjectStackParamList, 'KanbanBoard'>;

const KanbanBoardScreen: React.FC<Props> = ({route, navigation}) => {
  const {projectId} = route.params;
  const {currentProject, isLoading, fetchProjectDetail, moveTask} =
    useProjectStore();
  const {canManageMembers} = usePermissions();
  const [taskModalVisible, setTaskModalVisible] = useState(false);

  useEffect(() => {
    fetchProjectDetail(projectId).catch(() => {});
  }, [projectId, fetchProjectDetail]);

  const showProjectInfo = useCallback(() => {
    if (!currentProject) {
      return;
    }
    const members = currentProject.members
      .map(m => m.fullName)
      .join(', ');
    Alert.alert(
      currentProject.name,
      `Propietario: ${currentProject.owner.fullName}\nMiembros: ${members || 'Ninguno'}\nColumnas: ${currentProject.boards.length}`,
    );
  }, [currentProject]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          {canManageMembers() && (
            <TouchableOpacity
              onPress={showProjectInfo}
              style={styles.headerInfoButton}>
              <Text style={styles.headerInfoText}>i</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setTaskModalVisible(true)}
            style={styles.headerButton}>
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, showProjectInfo, canManageMembers]);

  const handleTaskPress = useCallback(
    (task: Task) => {
      navigation.navigate('TaskDetail', {taskId: task.id});
    },
    [navigation],
  );

  const handleMoveTask = useCallback(
    async (
      taskId: number,
      sourceBoardId: number,
      targetBoardId: number,
      newPosition: number,
    ) => {
      try {
        await moveTask(taskId, sourceBoardId, targetBoardId, newPosition);
      } catch {
        // El store revierte el optimistic update si falla
      }
    },
    [moveTask],
  );

  const handleReorderTasks = useCallback(
    async (taskId: number, boardId: number, newPosition: number) => {
      try {
        await moveTask(taskId, boardId, boardId, newPosition);
      } catch {
        // El store revierte el optimistic update si falla
      }
    },
    [moveTask],
  );

  if (isLoading && !currentProject) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!currentProject) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No se pudo cargar el proyecto</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardContainer}
        decelerationRate="fast"
        snapToInterval={312}>
        {currentProject.boards.map(board => (
          <BoardColumn
            key={board.id}
            board={board}
            allBoards={currentProject.boards}
            onTaskPress={handleTaskPress}
            onMoveTask={handleMoveTask}
            onReorderTasks={handleReorderTasks}
          />
        ))}
      </ScrollView>

      {currentProject.boards.length > 0 && (
        <CreateTaskModal
          visible={taskModalVisible}
          onClose={() => setTaskModalVisible(false)}
          boards={currentProject.boards}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  boardContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerInfoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfoText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 22,
  },
});

export default KanbanBoardScreen;
