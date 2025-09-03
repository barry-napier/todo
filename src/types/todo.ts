export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TodoStatus = 'pending' | 'completed' | 'archived';
export type TodoId = string;
