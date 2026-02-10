import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Task} from '../types';

const PRIORITY_CONFIG: Record<Task['priority'], {label: string; color: string}> =
  {
    LOW: {label: 'Baja', color: '#36B37E'},
    MEDIUM: {label: 'Media', color: '#FFAB00'},
    HIGH: {label: 'Alta', color: '#FF5630'},
    URGENT: {label: 'Urgente', color: '#DE350B'},
  };

interface PriorityBadgeProps {
  priority: Task['priority'];
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({priority}) => {
  const config = PRIORITY_CONFIG[priority];

  return (
    <View style={[styles.badge, {backgroundColor: config.color}]}>
      <Text style={styles.text}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

export default PriorityBadge;
