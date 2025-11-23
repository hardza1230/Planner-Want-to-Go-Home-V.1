export interface WindowConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TaskType = 'link' | 'delay' | 'keys';

export interface Task {
  name: string;
  type?: TaskType; // Defaults to 'link' if undefined
  link?: string;   // Used for 'link' type
  value?: string;  // Used for 'delay' (ms) or 'keys' (keystroke string)
  windowConfig?: WindowConfig;
}

export interface Workflow {
  id: number;
  title: string;
  tasks: Task[];
}

export interface Shortcut {
  id: number;
  name: string;
  link: string;
  icon: string;
}

export interface Tool {
  id: number;
  name: string; // Used for tooltip
  link: string;
  icon: string;
}

export interface WatchedFolder {
  id: number;
  name: string;
  path: string;
}

export interface FileAlert {
  id: string;
  folderId: number;
  fileName: string;
  path: string;
  timestamp: Date;
}

// Map of task ID (composed of workflowId-taskIndex) to boolean
export interface DailyProgress {
  [key: string]: boolean; 
}

export interface NotificationState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}