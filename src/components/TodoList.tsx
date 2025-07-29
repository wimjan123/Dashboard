import React, { useState, useEffect } from 'react'
import { Plus, Check, X, Edit3, CheckSquare } from 'lucide-react'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    const savedTodos = localStorage.getItem('dashboard-todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    } else {
      // Default todos
      const defaultTodos: Todo[] = [
        { id: '1', text: 'Review project proposals', completed: false, createdAt: new Date().toISOString() },
        { id: '2', text: 'Update dashboard components', completed: true, createdAt: new Date().toISOString() },
        { id: '3', text: 'Schedule team meeting', completed: false, createdAt: new Date().toISOString() },
      ]
      setTodos(defaultTodos)
      localStorage.setItem('dashboard-todos', JSON.stringify(defaultTodos))
    }
  }, [])

  const saveTodos = (updatedTodos: Todo[]) => {
    setTodos(updatedTodos)
    localStorage.setItem('dashboard-todos', JSON.stringify(updatedTodos))
  }

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      }
      saveTodos([todo, ...todos])
      setNewTodo('')
    }
  }

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
    saveTodos(updatedTodos)
  }

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter(todo => todo.id !== id))
  }

  const startEdit = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = () => {
    if (editText.trim() && editingId) {
      const updatedTodos = todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      )
      saveTodos(updatedTodos)
      setEditingId(null)
      setEditText('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      if (action === 'add') {
        addTodo()
      } else {
        saveEdit()
      }
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length

  return (
    <div className="h-full flex flex-col">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-text-secondary">
            {completedCount} of {todos.length} completed
          </span>
          <span className="text-sm text-green-400 font-medium">
            {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-dark-card rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Add Todo */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'add')}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 bg-dark-card border border-dark-border rounded-l-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:border-green-400 transition-colors duration-200"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-r-lg transition-colors duration-200 group"
        >
          <Plus className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {todos.map((todo, index) => (
          <div
            key={todo.id}
            className={`p-3 rounded-lg bg-dark-card border border-dark-border hover:border-green-400/30 transition-all duration-300 animate-fade-in ${
              todo.completed ? 'opacity-60' : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  todo.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-dark-text-secondary hover:border-green-400'
                }`}
              >
                {todo.completed && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>

              {editingId === todo.id ? (
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'edit')}
                    className="flex-1 px-2 py-1 bg-dark-bg border border-dark-border rounded text-dark-text focus:outline-none focus:border-green-400"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="p-1 text-green-400 hover:text-green-300"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm transition-all duration-200 ${
                      todo.completed
                        ? 'line-through text-dark-text-secondary'
                        : 'text-dark-text'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => startEdit(todo.id, todo.text)}
                      className="p-1 text-dark-text-secondary hover:text-blue-400 transition-colors duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 text-dark-text-secondary hover:text-red-400 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {todos.length === 0 && (
          <div className="text-center py-8 text-dark-text-secondary">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks yet. Add one above!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TodoList