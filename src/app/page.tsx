'use client';

import { AddTodo } from '@/components/todo/AddTodo';
import { TodoList } from '@/components/todo/TodoList';
import { useTodos } from '@/lib/hooks/useTodos';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { todos, isLoading, error, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodos();

  if (error) {
    return (
      <main className="max-w-2xl mx-auto" role="main">
        <div className="text-center py-12 text-red-500" role="alert">
          <p>Failed to load todos. Please refresh the page.</p>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-2xl mx-auto space-y-6" role="main">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">My Todos</h1>
        <p className="text-muted-foreground">Keep track of your tasks</p>
      </header>

      <section aria-label="Add new todo">
        <AddTodo onAdd={addTodo} />
      </section>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading todos">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} onUpdate={updateTodo} />
      )}
    </main>
  );
}
