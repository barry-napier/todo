export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoCreateInput {
  text: string;
}

export interface TodoUpdateInput {
  text?: string;
  completed?: boolean;
}

export interface TodoFilters {
  status?: TodoStatus;
  searchText?: string;
}

export interface StorageState {
  todos: Todo[];
  version: string;
  lastSync?: string;
}

export type TodoStatus = 'pending' | 'completed' | 'archived';
export type TodoId = string;
