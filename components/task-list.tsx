'use client'

import { useState } from 'react'
import { useStore, useTasks, useDependencies } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskForm } from './task-form'
import { format } from 'date-fns'
import type { Task } from '@/lib/types'
import { Pencil, Trash2, Clock, Calendar, Link2 } from 'lucide-react'

export function TaskList() {
  const tasks = useTasks()
  const deleteTask = useStore((state) => state.deleteTask)
  const dependencies = useDependencies()

  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [showForm, setShowForm] = useState(false)

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Excluir esta tarefa? As dependências também serão removidas.')) {
      deleteTask(id)
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-slate-500 hover:bg-slate-600'
      case 2:
        return 'bg-blue-500 hover:bg-blue-600'
      case 3:
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 4:
        return 'bg-orange-500 hover:bg-orange-600'
      case 5:
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-slate-500 hover:bg-slate-600'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Baixa'
      case 2: return 'Média-Baixa'
      case 3: return 'Média'
      case 4: return 'Alta'
      case 5: return 'Crítica'
      default: return 'Média'
    }
  }

  const getTaskDependencies = (taskId: string) => {
    return dependencies.filter((dep) => dep.taskId === taskId).length
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card className="p-12 text-center gradient-card border-2 border-dashed">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa ainda</h3>
                <p className="text-muted-foreground">
                  Adicione sua primeira tarefa para começar a otimizar seu tempo
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task, index) => (
              <Card 
                key={task.id} 
                className="p-5 space-y-4 gradient-card card-hover border shadow-sm animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-pretty leading-tight flex-1">
                    {task.title}
                  </h3>
                  <Badge className={`${getPriorityColor(task.priority)} text-white shrink-0`}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="font-medium">{task.duration} minutos</span>
                  </div>

                  {task.deadline && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="font-medium">
                        {format(new Date(task.deadline), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                  )}

                  {getTaskDependencies(task.id) > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Link2 className="h-4 w-4 text-orange-500" />
                      </div>
                      <span className="font-medium">
                        {getTaskDependencies(task.id)} {getTaskDependencies(task.id) === 1 ? 'dependência' : 'dependências'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(task)}
                    className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(task.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TaskForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingTask(undefined)
        }}
        task={editingTask}
      />
    </>
  )
}
