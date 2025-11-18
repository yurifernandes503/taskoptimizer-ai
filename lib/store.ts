'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskDependency, Schedule, User } from './types'

interface RegisteredUser {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: Date
}

interface UserData {
  tasks: Task[]
  dependencies: TaskDependency[]
  schedules: Schedule[]
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void

  registeredUsers: RegisteredUser[]
  registerUser: (user: RegisteredUser) => void
  getUserByEmail: (email: string) => RegisteredUser | undefined

  usersData: Record<string, UserData>

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void

  addDependency: (taskId: string, dependsOnTaskId: string) => void
  removeDependency: (id: string) => void

  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt'>) => void
  deleteSchedule: (id: string) => void

  clearAll: () => void
}

// ---- Arrays estáticos para evitar loops ----
const EMPTY_TASKS: Task[] = []
const EMPTY_DEPS: TaskDependency[] = []
const EMPTY_SCHEDULES: Schedule[] = []

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => {
        if (user) {
          set((state) => {
            const usersData = { ...state.usersData }
            if (!usersData[user.id]) {
              usersData[user.id] = {
                tasks: [],
                dependencies: [],
                schedules: []
              }
            }
            return { user, usersData }
          })
        } else {
          set({ user: null })
        }
      },

      registeredUsers: [],
      registerUser: (user) => {
        set((state) => {
          const exists = state.registeredUsers.some(
            (u) => u.email === user.email || u.id === user.id
          )
          if (exists) return state

          const newUsers = [...state.registeredUsers, user]
          const newUsersData = { ...state.usersData }

          if (!newUsersData[user.id]) {
            newUsersData[user.id] = {
              tasks: [],
              dependencies: [],
              schedules: []
            }
          }

          return {
            registeredUsers: newUsers,
            usersData: newUsersData
          }
        })
      },

      getUserByEmail: (email) => {
        return get().registeredUsers.find(u => u.email === email)
      },

      usersData: {},

      addTask: (taskData) =>
        set((state) => {
          const userId = state.user?.id
          if (!userId) return state

          const newTask: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const userData = state.usersData[userId] ?? {
            tasks: [],
            dependencies: [],
            schedules: []
          }

          return {
            usersData: {
              ...state.usersData,
              [userId]: {
                ...userData,
                tasks: [...userData.tasks, newTask]
              }
            }
          }
        }),

      updateTask: (id, taskData) =>
        set((state) => {
          const userId = state.user?.id
          if (!userId) return state

          const userData = state.usersData[userId] ?? {
            tasks: [],
            dependencies: [],
            schedules: []
          }

          return {
            usersData: {
              ...state.usersData,
              [userId]: {
                ...userData,
                tasks: userData.tasks.map(task =>
                  task.id === id
                    ? { ...task, ...taskData, updatedAt: new Date() }
                    : task
                )
              }
            }
          }
        }),

      deleteTask: (id) =>
        set((state) => {
          const userId = state.user?.id
          if (!userId) return state

          const userData = state.usersData[userId] ?? {
            tasks: [],
            dependencies: [],
            schedules: []
          }

          return {
            usersData: {
              ...state.usersData,
              [userId]: {
                ...userData,
                tasks: userData.tasks.filter(task => task.id !== id),
                dependencies: userData.dependencies.filter(
                  dep => dep.taskId !== id && dep.dependsOnTaskId !== id
                )
              }
            }
          }
        }),

      addDependency: (taskId, dependsOnTaskId) =>
        set((state) => {
          const userId = state.user?.id
          if (!userId) return state

          const userData = state.usersData[userId] ?? {
            tasks: [],
            dependencies: [],
            schedules: []
          }

          return {
            usersData: {
              ...state.usersData,
              [userId]: {
                ...userData,
                dependencies: [
                  ...userData.dependencies,
                  {
                    id: crypto.randomUUID(),
                    taskId,
                    dependsOnTaskId,
                    createdAt: new Date(),
                  }
                ]
              }
            }
          }
        }),

      removeDependency: (id) =>
        set((state) => {
          const userId = state.user?.id
          if (!userId) return state

          const userData = state.usersData[userId] ?? {
            tasks: [],
            dependencies: [],
            schedules: []
          }

          return {
            usersData: {
              ...state.usersData,
              [userId]: {
                ...userData,
                dependencies: userData.dependencies.filter(dep => dep.id !== id)
              }
            }
          }
        }),

      addSchedule: (scheduleData) =>
        set((state) => {
          const userId = state.user?.id
          if (!userId) return state

          const newSchedule: Schedule = {
            ...scheduleData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          }

          const userData = state.usersData[userId] ?? {
            tasks: [],
            dependencies: [],
            schedules: []
          }

          return {
            usersData: {
              ...state.usersData,
              [userId]: {
                ...userData,
                schedules: [...userData.schedules, newSchedule]
              }
            }
          }
        }),

      deleteSchedule: (id) =>
        set((state) => {
          const userId = state.user?.id
          if (!userId) return state

          const userData = state.usersData[userId] ?? {
            tasks: [],
            dependencies: [],
            schedules: []
          }

          return {
            usersData: {
              ...state.usersData,
              [userId]: {
                ...userData,
                schedules: userData.schedules.filter(sch => sch.id !== id)
              }
            }
          }
        }),

      clearAll: () =>
        set((state) => {
          const userId = state.user?.id
          if (!userId) return state

          return {
            usersData: {
              ...state.usersData,
              [userId]: {
                tasks: [],
                dependencies: [],
                schedules: []
              }
            }
          }
        }),
    }),
    {
      name: 'taskoptimizer-storage',
      partialize: (state) => ({
        user: state.user,
        registeredUsers: state.registeredUsers,
        usersData: state.usersData,
      }),
    }
  )
)

// ---- HOOKS ESTÁVEIS E CORRIGIDOS ----

export const useUserId = () =>
  useStore((state) => state.user?.id)

export const useTasks = () => {
  const userId = useUserId()

  return useStore((state) => {
    if (!userId) return EMPTY_TASKS
    return state.usersData[userId]?.tasks ?? EMPTY_TASKS
  })
}

export const useDependencies = () => {
  const userId = useUserId()

  return useStore((state) => {
    if (!userId) return EMPTY_DEPS
    return state.usersData[userId]?.dependencies ?? EMPTY_DEPS
  })
}

export const useSchedules = () => {
  const userId = useUserId()

  return useStore((state) => {
    if (!userId) return EMPTY_SCHEDULES
    return state.usersData[userId]?.schedules ?? EMPTY_SCHEDULES
  })
}
