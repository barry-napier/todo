'use client';

import { AddTodo } from '@/components/todo/AddTodo';
import { AnimatedTodoList } from '@/components/todo/AnimatedTodoList';
import { useTodos } from '@/lib/hooks/useTodos';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';

export default function Home() {
  const { todos, isLoading, error, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodos();
  const { toasts, showToast, dismissToast } = useToast();

  if (error) {
    return (
      <main className="max-w-2xl mx-auto" role="main">
        <div className="text-center py-12 text-red-500" role="alert">
          <p>Failed to load todos. Please refresh the page.</p>
        </div>
      </main>
    );
  }

  const handleAddTodo = async (text: string) => {
    try {
      await addTodo(text);
      showToast('Todo added successfully!', 'success');
    } catch {
      showToast('Failed to add todo. Please try again.', 'error');
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo(id);
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        showToast(todo.completed ? 'Todo marked as incomplete' : 'Todo completed!', 'success');
      }
    } catch {
      showToast('Failed to update todo. Please try again.', 'error');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      showToast('Todo deleted', 'info');
    } catch {
      showToast('Failed to delete todo. Please try again.', 'error');
    }
  };

  const handleUpdateTodo = async (id: string, updates: Parameters<typeof updateTodo>[1]) => {
    try {
      await updateTodo(id, updates);
      showToast('Todo updated', 'success');
    } catch {
      showToast('Failed to update todo. Please try again.', 'error');
    }
  };

  return (
    <>
      <main id="main-content" className="max-w-2xl mx-auto space-y-6" role="main">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">My Todos</h1>
          <p className="text-muted-foreground">Keep track of your tasks</p>
        </header>

        <section aria-label="Add new todo">
          <AddTodo onAdd={handleAddTodo} />
        </section>

        <AnimatedTodoList
          todos={todos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
          onUpdate={handleUpdateTodo}
          isLoading={isLoading}
        />
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}