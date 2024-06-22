import React, { useReducer, useState, useEffect } from 'react';
import TodoList from './components/TodoList';
import './App.css';
// import darkmode from './assets/icon-moon.svg';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
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
      return [...state, { id: state.length + 1, text: action.text, completed: false, createdAt: new Date() }];
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
  const [sortCriteria, setSortCriteria] = useState<'creation-date' | 'completion-status'>('creation-date');
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

  const sortedTodos = [...state].sort((a, b) => {
    if (sortCriteria === 'completion-status') {
      return a.completed === b.completed ? 0 : a.completed ? -1 : 1;
    } else if (sortCriteria === 'creation-date') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });

  const filteredTodos = sortedTodos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const itemsLeft = state.filter(todo => !todo.completed).length;

  return (
    <div className={`container ${isDarkMode ? 'dark' : ''}`}>
      <div className="todo1">
        <h1>Todo </h1>
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {isDarkMode ? 'Switch to Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
        />
        <button type="submit">Add Todo</button>
      </form>

      <div className="sort-options">
        <label>Sort by: </label>
        <select value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value as 'creation-date' | 'completion-status')}>
          <option value="creation-date">Creation Date</option>
          <option value="completion-status">Completion Status</option>
        </select>
      </div>

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
