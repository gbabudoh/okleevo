// Task model types
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Task['priority'];
  assignedTo?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignedTo?: string;
  dueDate?: Date;
  tags?: string[];
}

export function isTaskOverdue(task: Task): boolean {
  return task.status !== 'done' && task.dueDate ? new Date() > new Date(task.dueDate) : false;
}

export function getTasksByStatus(tasks: Task[], status: Task['status']): Task[] {
  return tasks.filter(task => task.status === status);
}

export function getHighPriorityTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.priority === 'high' || task.priority === 'urgent');
}
