import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ProjectStackParamList} from '../navigation/types';
import {useProjectStore} from '../store/projectStore';
import {ProjectResponse} from '../api/projectService';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';
import CreateProjectModal from './CreateProjectModal';

type Props = NativeStackScreenProps<ProjectStackParamList, 'ProjectsList'>;

const ProjectsListScreen: React.FC<Props> = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {projects, isLoading, fetchProjects} = useProjectStore();

  useEffect(() => {
    fetchProjects().catch(() => {});
  }, [fetchProjects]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProjects();
    } catch {
      // Error silencioso en pull-to-refresh
    } finally {
      setRefreshing(false);
    }
  }, [fetchProjects]);

  const handleProjectPress = (project: ProjectResponse) => {
    navigation.navigate('KanbanBoard', {
      projectId: project.id,
      projectName: project.name,
    });
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="📋"
      title="No tienes proyectos aún"
      message="Crea tu primer proyecto para comenzar a organizar tus tareas"
      actionLabel="Crear proyecto"
      onAction={() => setModalVisible(true)}
    />
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={projects}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <ProjectCard
            project={item}
            onPress={() => handleProjectPress(item)}
          />
        )}
        contentContainerStyle={
          projects.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CreateProjectModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 30,
  },
});

export default ProjectsListScreen;
