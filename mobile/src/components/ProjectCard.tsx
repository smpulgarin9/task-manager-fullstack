import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {ProjectResponse} from '../api/projectService';

interface ProjectCardProps {
  project: ProjectResponse;
  onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({project, onPress}) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={styles.name} numberOfLines={1}>
        {project.name}
      </Text>
      {project.description ? (
        <Text style={styles.description} numberOfLines={1}>
          {project.description}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.members}>
          {project.memberCount}{' '}
          {project.memberCount === 1 ? 'miembro' : 'miembros'}
        </Text>
        <Text style={styles.date}>{formatDate(project.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  members: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default ProjectCard;
