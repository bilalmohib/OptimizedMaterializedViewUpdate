'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Transition } from '@headlessui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

type Todo = {
  id: number
  title: string
  completed: boolean
  updated_at: string
}

const ITEMS_PER_PAGE = 1000

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Load todos from the combined view with pagination
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // First get total count
        const { count } = await supabase
          .from('combined_todos')
          .select('*', { count: 'exact', head: true })

        setTotalCount(count || 0)

        // Then get paginated data
        const { data, error } = await supabase
          .from('combined_todos')
          .select('*')
          .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
          .order('id', { ascending: true })

        if (error) throw error
        setTodos(data as Todo[] || [])
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentPage])

  // Toggle completed status for one todo
  async function toggleComplete(todo: Todo) {
    const { error } = await supabase
      .from('todos')
      .update({
        completed: !todo.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todo.id)

    if (error) {
      console.error('Update error:', error)
    } else {
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
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-200 animate-pulse"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
              <div className="flex gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total:</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">{totalCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Completed:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">{completedCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Remaining:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{totalCount - completedCount}</span>
                </div>
              </div>
            </div>

            <Transition
              show={!loading}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <ul className="space-y-3">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <span className={`flex-1 text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {todo.title}
                    </span>
                    <button
                      onClick={() => toggleComplete(todo)}
                      className={`ml-4 px-4 py-2 rounded-lg transition-all duration-200 ${
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
            </Transition>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
