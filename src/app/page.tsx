'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Dialog, Transition } from '@headlessui/react'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast, { Toaster } from 'react-hot-toast'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTodoTitle, setNewTodoTitle] = useState('')

  // Load todos from the combined view with pagination, sorted by latest updated_at on top (descending)
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // First get total count
        const { count } = await supabase
          .from('combined_todos')
          .select('*', { count: 'exact', head: true })

        setTotalCount(count || 0)

        // Then get paginated data, sorted by updated_at DESC (latest first)
        const { data, error } = await supabase
          .from('combined_todos')
          .select('*')
          .order('updated_at', { ascending: false })
          .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)

        if (error) throw error
        setTodos(data as Todo[] || [])
      } catch (error) {
        console.error('Fetch error:', error)
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentPage])

  // Create new todo
  async function createTodo() {
    if (!newTodoTitle.trim()) {
      toast.error('Please enter a task title')
      return
    }

    const createPromise = supabase
      .from('todos')
      .insert([
        {
          title: newTodoTitle.trim(),
          completed: false,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    toast.promise(createPromise, {
      loading: 'Creating task...',
      success: (response) => {
        if (response.error) throw response.error
        setTodos((prev) => [...prev, response.data[0]])
        setNewTodoTitle('')
        setIsModalOpen(false)
        return 'Task created successfully!'
      },
      error: 'Failed to create task'
    })
  }

  // Toggle completed status for one todo
  async function toggleComplete(todo: Todo) {
    const updatePromise = supabase
      .from('todos')
      .update({
        completed: !todo.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', todo.id)

    toast.promise(updatePromise, {
      loading: 'Updating task...',
      success: (response) => {
        if (response.error) throw response.error
        setTodos((prev) =>
          prev.map((t) =>
            t.id === todo.id
              ? { ...t, completed: !t.completed, updated_at: new Date().toISOString() }
              : t
          )
        )
        return todo.completed ? 'Task marked as incomplete' : 'Task completed!'
      },
      error: 'Failed to update task'
    })
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TaskMaster</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your tasks efficiently</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-8">
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
                        className={`ml-4 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 ${todo.completed
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
                    className="relative cursor-pointer inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative cursor-pointer inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Created with ❤️ by{' '}
              <a
                href="https://github.com/bilalmohib"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                @bilalmohib
              </a>
            </p>
            <p className="text-sm text-gray-500">
              TaskMaster v1.0.0
            </p>
          </div>
        </div>
      </footer>

      {/* Create Todo Modal */}
      <Transition appear show={isModalOpen} as="div">
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as="div"
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="div"
                    className="flex items-center justify-between mb-4"
                  >
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Create New Task
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-md cursor-pointer text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>

                  <div className="mt-2">
                    <input
                      type="text"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      placeholder="Enter task title..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && createTodo()}
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={createTodo}
                    >
                      Create Task
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
