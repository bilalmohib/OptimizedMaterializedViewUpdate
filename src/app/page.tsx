'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

type Todo = {
  id: number
  title: string
  completed: boolean
  updated_at: string
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  // Load all todos from the combined view
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('combined_todos')
        .select('*')
        .limit(200000)
      if (error) {
        console.error('Fetch error:', error)
      } else {
        setTodos(data as Todo[] || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  // Toggle completed status for one todo
  async function toggleComplete(todo: Todo) {
    const { error } = await supabase
      .from('todos')               // update the base table
      .update({
        completed: !todo.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todo.id)           // filter by primary key
    if (error) {
      console.error('Update error:', error)
    } else {
      // Optimistically update UI
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id
            ? { ...t, completed: !t.completed, updated_at: new Date().toISOString() }
            : t
        )
      )
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Todo List</h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <p>Total Items: <span className="font-semibold">{totalCount}</span></p>
            <p>Completed: <span className="font-semibold">{completedCount}</span></p>
            <p>Remaining: <span className="font-semibold">{totalCount - completedCount}</span></p>
          </div>
        </div>
        
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li 
              key={todo.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {todo.title}
              </span>
              <button
                onClick={() => toggleComplete(todo)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  todo.completed 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {todo.completed ? '✅ Done' : '⬜️ Mark Done'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
