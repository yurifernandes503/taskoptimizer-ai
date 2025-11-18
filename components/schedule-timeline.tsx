'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Schedule } from '@/lib/types'
import { format } from 'date-fns'
import { Clock, Calendar, Zap, CheckCircle2, XCircle } from 'lucide-react'
import { ptBR } from 'date-fns/locale'

interface ScheduleTimelineProps {
  schedule: Schedule
}

export function ScheduleTimeline({ schedule }: ScheduleTimelineProps) {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-slate-500'
      case 2:
        return 'bg-blue-500'
      case 3:
        return 'bg-yellow-500'
      case 4:
        return 'bg-orange-500'
      case 5:
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const isDeadlineMet = (task: typeof schedule.tasks[0]) => {
    if (!task.deadline) return null
    return task.endTime <= new Date(task.deadline)
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold">{schedule.name}</h3>
          <p className="text-sm text-muted-foreground">
            Algoritmo: {schedule.algorithm}
          </p>
        </div>
        <Badge variant="outline">
          {schedule.tasks.length} tarefas
        </Badge>
      </div>

      {schedule.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tempo de Execução</p>
            <p className="text-lg font-semibold">
              {schedule.metrics.executionTimeMs.toFixed(2)}ms
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Duração Total</p>
            <p className="text-lg font-semibold">
              {schedule.metrics.totalDuration} min
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              No Prazo
            </p>
            <p className="text-lg font-semibold text-green-600">
              {schedule.metrics.deadlinesMet}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              Atrasadas
            </p>
            <p className="text-lg font-semibold text-red-600">
              {schedule.metrics.deadlinesMissed}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Linha do Tempo</h4>
        <div className="relative space-y-2">
          {schedule.tasks.map((task, index) => {
            const deadlineStatus = isDeadlineMet(task)
            return (
              <div
                key={task.id}
                className="relative flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  {index < schedule.tasks.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-pretty">{task.title}</h5>
                    <Badge className={getPriorityColor(task.priority)}>
                      P{task.priority}
                    </Badge>
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.startTime), "d 'de' MMM, HH:mm", { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {format(new Date(task.endTime), 'HH:mm', { locale: ptBR })}
                    </div>
                    {deadlineStatus !== null && (
                      <div
                        className={`flex items-center gap-1 ${
                          deadlineStatus ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {deadlineStatus ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {deadlineStatus ? 'No prazo' : 'Atrasado'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
