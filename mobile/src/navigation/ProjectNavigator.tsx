import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProjectStackParamList} from './types';
import ProjectsListScreen from '../screens/ProjectsListScreen';
import KanbanBoardScreen from '../screens/KanbanBoardScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';

const Stack = createNativeStackNavigator<ProjectStackParamList>();

const ProjectNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#FFFFFF'},
        headerTintColor: '#333333',
        headerTitleStyle: {fontWeight: '600'},
      }}>
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsListScreen}
        options={{title: 'Mis Proyectos'}}
      />
      <Stack.Screen
        name="KanbanBoard"
        component={KanbanBoardScreen}
        options={({route}) => ({
          title: route.params.projectName,
        })}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{title: 'Detalle de Tarea'}}
      />
    </Stack.Navigator>
  );
};

export default ProjectNavigator;
