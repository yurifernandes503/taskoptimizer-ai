import type { Task, TaskDependency, ScheduledTask, AlgorithmType, ScheduleMetrics } from './types'

// Helper to build adjacency list and dependency graph
function buildGraph(tasks: Task[], dependencies: TaskDependency[]) {
  const graph = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  // Initialize
  tasks.forEach((task) => {
    graph.set(task.id, [])
    inDegree.set(task.id, 0)
  })

  // Build edges
  dependencies.forEach((dep) => {
    const edges = graph.get(dep.dependsOnTaskId) || []
    edges.push(dep.taskId)
    graph.set(dep.dependsOnTaskId, edges)
    inDegree.set(dep.taskId, (inDegree.get(dep.taskId) || 0) + 1)
  })

  return { graph, inDegree }
}

// 1. Topological Sort with Kahn's Algorithm
export function topologicalSort(
  tasks: Task[],
  dependencies: TaskDependency[],
  startTime: Date
): { scheduled: ScheduledTask[]; metrics: ScheduleMetrics } {
  const start = performance.now()
  const { graph, inDegree } = buildGraph(tasks, dependencies)
  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const scheduled: ScheduledTask[] = []

  // Queue for tasks with no dependencies
  const queue: string[] = []
  inDegree.forEach((degree, taskId) => {
    if (degree === 0) queue.push(taskId)
  })

  let currentTime = new Date(startTime)

  while (queue.length > 0) {
    const taskId = queue.shift()!
    const task = taskMap.get(taskId)!

    const endTime = new Date(currentTime.getTime() + task.duration * 60000)
    scheduled.push({
      ...task,
      startTime: new Date(currentTime),
      endTime,
    })

    currentTime = endTime

    // Process dependent tasks
    const neighbors = graph.get(taskId) || []
    neighbors.forEach((neighborId) => {
      const newDegree = (inDegree.get(neighborId) || 0) - 1
      inDegree.set(neighborId, newDegree)
      if (newDegree === 0) {
        queue.push(neighborId)
      }
    })
  }

  const executionTime = performance.now() - start
  const metrics = calculateMetrics(scheduled, executionTime)

  return { scheduled, metrics }
}

// 2. Dynamic Programming - Weighted Interval Scheduling
export function dpScheduling(
  tasks: Task[],
  dependencies: TaskDependency[],
  startTime: Date
): { scheduled: ScheduledTask[]; metrics: ScheduleMetrics } {
  const start = performance.now()

  // First do topological sort to respect dependencies
  const { scheduled: topoScheduled } = topologicalSort(tasks, dependencies, startTime)

  // Sort by priority (weight) for DP optimization
  const sortedTasks = [...topoScheduled].sort((a, b) => b.priority - a.priority)

  // DP array: dp[i] = maximum priority sum for first i tasks
  const n = sortedTasks.length
  const dp: number[] = new Array(n + 1).fill(0)
  const selected: boolean[] = new Array(n).fill(false)

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    const task = sortedTasks[i - 1]
    // Option 1: Don't include this task
    dp[i] = dp[i - 1]

    // Option 2: Include this task
    const includeValue = task.priority + dp[i - 1]
    if (includeValue > dp[i]) {
      dp[i] = includeValue
      selected[i - 1] = true
    }
  }

  // Reconstruct schedule with selected tasks
  const scheduled: ScheduledTask[] = []
  let currentTime = new Date(startTime)

  sortedTasks.forEach((task, i) => {
    if (selected[i]) {
      const endTime = new Date(currentTime.getTime() + task.duration * 60000)
      scheduled.push({
        ...task,
        startTime: new Date(currentTime),
        endTime,
      })
      currentTime = endTime
    }
  })

  const executionTime = performance.now() - start
  const metrics = calculateMetrics(scheduled, executionTime)

  return { scheduled, metrics }
}

// 3. Greedy Algorithm - Priority First
export function greedyScheduling(
  tasks: Task[],
  dependencies: TaskDependency[],
  startTime: Date
): { scheduled: ScheduledTask[]; metrics: ScheduleMetrics } {
  const start = performance.now()

  // Get tasks in topological order first
  const { scheduled: topoScheduled } = topologicalSort(tasks, dependencies, startTime)

  // Sort by priority (greedy choice)
  const sortedTasks = [...topoScheduled].sort((a, b) => {
    // Higher priority first, then earlier deadline
    if (b.priority !== a.priority) return b.priority - a.priority
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }
    return 0
  })

  const scheduled: ScheduledTask[] = []
  let currentTime = new Date(startTime)

  sortedTasks.forEach((task) => {
    const endTime = new Date(currentTime.getTime() + task.duration * 60000)
    scheduled.push({
      ...task,
      startTime: new Date(currentTime),
      endTime,
    })
    currentTime = endTime
  })

  const executionTime = performance.now() - start
  const metrics = calculateMetrics(scheduled, executionTime)

  return { scheduled, metrics }
}

// 4. Heap-Based Scheduling - Min-Heap by Duration
export function heapScheduling(
  tasks: Task[],
  dependencies: TaskDependency[],
  startTime: Date
): { scheduled: ScheduledTask[]; metrics: ScheduleMetrics } {
  const start = performance.now()

  // Get tasks in topological order
  const { scheduled: topoScheduled } = topologicalSort(tasks, dependencies, startTime)

  // Min-heap implementation (sort by duration - shortest job first)
  const heap = [...topoScheduled].sort((a, b) => a.duration - b.duration)

  const scheduled: ScheduledTask[] = []
  let currentTime = new Date(startTime)

  heap.forEach((task) => {
    const endTime = new Date(currentTime.getTime() + task.duration * 60000)
    scheduled.push({
      ...task,
      startTime: new Date(currentTime),
      endTime,
    })
    currentTime = endTime
  })

  const executionTime = performance.now() - start
  const metrics = calculateMetrics(scheduled, executionTime)

  return { scheduled, metrics }
}

// Calculate metrics for a schedule
function calculateMetrics(scheduled: ScheduledTask[], executionTimeMs: number): ScheduleMetrics {
  if (scheduled.length === 0) {
    return {
      executionTimeMs,
      totalDuration: 0,
      tasksScheduled: 0,
      averageIdleTime: 0,
      deadlinesMet: 0,
      deadlinesMissed: 0,
    }
  }

  const totalDuration = scheduled.reduce((sum, task) => sum + task.duration, 0)

  // Calculate deadlines met/missed
  let deadlinesMet = 0
  let deadlinesMissed = 0

  scheduled.forEach((task) => {
    if (task.deadline) {
      if (task.endTime <= new Date(task.deadline)) {
        deadlinesMet++
      } else {
        deadlinesMissed++
      }
    }
  })

  // Calculate average idle time between tasks (should be 0 for sequential scheduling)
  const averageIdleTime = 0

  return {
    executionTimeMs,
    totalDuration,
    tasksScheduled: scheduled.length,
    averageIdleTime,
    deadlinesMet,
    deadlinesMissed,
  }
}

// Main scheduler function
export function scheduleTasksWithAlgorithm(
  algorithm: AlgorithmType,
  tasks: Task[],
  dependencies: TaskDependency[],
  startTime: Date
): { scheduled: ScheduledTask[]; metrics: ScheduleMetrics } {
  switch (algorithm) {
    case 'topological':
      return topologicalSort(tasks, dependencies, startTime)
    case 'dp':
      return dpScheduling(tasks, dependencies, startTime)
    case 'greedy':
      return greedyScheduling(tasks, dependencies, startTime)
    case 'heap':
      return heapScheduling(tasks, dependencies, startTime)
    default:
      return topologicalSort(tasks, dependencies, startTime)
  }
}
