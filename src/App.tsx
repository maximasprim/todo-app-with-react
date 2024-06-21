import React, { useReducer, useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import './App.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type ActionType =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: number }
  | { type: 'DELETE_TODO'; id: number }
  | { type: 'UPDATE_TODO'; id: number; text: string }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'LOAD_TODOS'; todos: Todo[] };

const initialState: Todo[] = [];

const reducer = (state: Todo[], action: ActionType): Todo[] => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, { id: state.length + 1, text: action.text, completed: false }];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case 'DELETE_TODO':
      return state.filter(todo => todo.id !== action.id);
    case 'UPDATE_TODO':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, text: action.text } : todo
      );
    case 'CLEAR_COMPLETED':
      return state.filter(todo => !todo.completed);
    case 'LOAD_TODOS':
      return action.todos;
    default:
      return state;
  }
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedTodos) {
      dispatch({ type: 'LOAD_TODOS', todos: JSON.parse(storedTodos) });
    }
    if (storedDarkMode) {
      setIsDarkMode(JSON.parse(storedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(state));
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [state, isDarkMode]);

  const handleAddTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTodo.trim()) {
      dispatch({ type: 'ADD_TODO', text: newTodo });
      setNewTodo('');
    }
  };

  const handleUpdateTodo = (id: number, text: string) => {
    dispatch({ type: 'UPDATE_TODO', id, text });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleClearCompleted = () => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  };

  const filteredTodos = state.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const itemsLeft = state.filter(todo => !todo.completed).length;

  return (
    <div className={`container ${isDarkMode ? 'dark' : ''}`}>
      <h1>Todo App</h1>
      <button onClick={toggleDarkMode} className="dark-mode-toggle">
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
        />
        <button type="submit">Add Todo</button>
      </form>
      <TodoList
        todos={filteredTodos}
        toggleTodo={(id) => dispatch({ type: 'TOGGLE_TODO', id })}
        deleteTodo={(id) => dispatch({ type: 'DELETE_TODO', id })}
        updateTodo={handleUpdateTodo}
      />
      <div className="footer">
        <span>{itemsLeft} items left</span>
        <div className="filters">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
            All
          </button>
          <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>
            Active
          </button>
          <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>
            Completed
          </button>
        </div>
        <button onClick={handleClearCompleted}>Clear Completed</button>
      </div>
    </div>
  );
};

export default App;
