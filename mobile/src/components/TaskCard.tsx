import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Task} from '../types';
import PriorityBadge from './PriorityBadge';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onLongPress: () => void;
  drag: () => void;
  isActive: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onLongPress,
  drag,
  isActive,
}) => {
  const handleLongPress = () => {
    drag();
    onLongPress();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={200}
      activeOpacity={0.8}
      style={[
        styles.card,
        isActive && styles.cardActive,
      ]}>
      <View style={styles.priorityContainer}>
        <PriorityBadge priority={task.priority} />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>

      {task.labels.length > 0 && (
        <View style={styles.labelsRow}>
          {task.labels.map(label => (
            <View
              key={label.id}
              style={[styles.labelChip, {backgroundColor: label.color + '20'}]}>
              <View
                style={[styles.labelDot, {backgroundColor: label.color}]}
              />
              <Text
                style={[styles.labelText, {color: label.color}]}
                numberOfLines={1}>
                {label.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        {task.assignee && (
          <View style={styles.assigneeContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {task.assignee.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.assigneeName} numberOfLines={1}>
              {task.assignee.fullName}
            </Text>
          </View>
        )}
        {task.dueDate && (
          <Text style={styles.dueDate}>{task.dueDate}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActive: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    transform: [{scale: 1.03}],
  },
  priorityContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 20,
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  assigneeName: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  dueDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default TaskCard;
