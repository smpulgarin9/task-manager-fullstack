import React, {useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import {Board, Task} from '../types';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

interface BoardColumnProps {
  board: Board;
  allBoards: Board[];
  onTaskPress: (task: Task) => void;
  onMoveTask: (
    taskId: number,
    sourceBoardId: number,
    targetBoardId: number,
    newPosition: number,
  ) => void;
  onReorderTasks: (
    taskId: number,
    boardId: number,
    newPosition: number,
  ) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  board,
  allBoards,
  onTaskPress,
  onMoveTask,
  onReorderTasks,
}) => {
  const showMoveMenu = useCallback(
    (task: Task) => {
      const otherBoards = allBoards.filter(b => b.id !== board.id);
      if (otherBoards.length === 0) {
        return;
      }

      const buttons = otherBoards.map(targetBoard => ({
        text: `Mover a "${targetBoard.name}"`,
        onPress: () => {
          onMoveTask(task.id, board.id, targetBoard.id, targetBoard.tasks.length);
        },
      }));

      buttons.push({text: 'Cancelar', onPress: () => {}});

      Alert.alert('Mover tarea', `"${task.title}"`, buttons);
    },
    [allBoards, board.id, onMoveTask],
  );

  const handleDragEnd = useCallback(
    ({data}: {data: Task[]}) => {
      data.forEach((task, index) => {
        if (task.position !== index) {
          onReorderTasks(task.id, board.id, index);
        }
      });
    },
    [board.id, onReorderTasks],
  );

  const renderItem = useCallback(
    ({item, drag, isActive}: RenderItemParams<Task>) => (
      <TaskCard
        task={item}
        onPress={() => onTaskPress(item)}
        onLongPress={() => showMoveMenu(item)}
        drag={drag}
        isActive={isActive}
      />
    ),
    [onTaskPress, showMoveMenu],
  );

  const keyExtractor = useCallback((item: Task) => item.id.toString(), []);

  return (
    <View style={styles.column}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {board.name}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{board.tasks.length}</Text>
        </View>
      </View>

      <DraggableFlatList
        data={board.tasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        containerStyle={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="📝"
            title="Sin tareas"
            message="Agrega una tarea para comenzar"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    width: 300,
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    marginRight: 12,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
  },
});

export default BoardColumn;
