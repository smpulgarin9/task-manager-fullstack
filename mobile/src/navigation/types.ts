export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Projects: undefined;
  Admin: undefined;
  Profile: undefined;
};

export type ProjectStackParamList = {
  ProjectsList: undefined;
  KanbanBoard: {projectId: number; projectName: string};
  TaskDetail: {taskId: number};
};
