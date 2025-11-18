export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  duration: number // in minutes
  priority: number // 1-5 scale
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

export interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  createdAt: Date
}

export interface ScheduledTask extends Task {
  startTime: Date
  endTime: Date
}

export type AlgorithmType = 'topological' | 'dp' | 'greedy' | 'heap'

export interface Schedule {
  id: string
  userId: string
  name: string
  algorithm: AlgorithmType
  startTime: Date
  tasks: ScheduledTask[]
  metrics?: ScheduleMetrics
  createdAt: Date
}

export interface ScheduleMetrics {
  executionTimeMs: number
  totalDuration: number // in minutes
  tasksScheduled: number
  averageIdleTime: number
  deadlinesMet: number
  deadlinesMissed: number
}

export interface TaskWithDependencies extends Task {
  dependencies: string[] // array of task IDs this task depends on
  dependents: string[] // array of task IDs that depend on this task
}

export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
}

export interface GraphEdge {
  from: string
  to: string
}
