import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {MainTabParamList} from './types';
import ProjectNavigator from './ProjectNavigator';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Projects"
        component={ProjectNavigator}
        options={{
          tabBarLabel: 'Proyectos',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>{'📋'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          headerShown: true,
          headerTitle: 'Mi Perfil',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>{'👤'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
