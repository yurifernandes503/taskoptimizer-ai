'use client'

import { useState } from 'react'
import { useStore, useSchedules } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScheduleTimeline } from './schedule-timeline'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ScheduleList() {
  const schedules = useSchedules()
  const deleteSchedule = useStore((state) => state.deleteSchedule)
  const [expandedSchedules, setExpandedSchedules] = useState<Set<string>>(new Set())

  const toggleExpanded = (scheduleId: string) => {
    setExpandedSchedules((prev) => {
      const next = new Set(prev)
      if (next.has(scheduleId)) {
        next.delete(scheduleId)
      } else {
        next.add(scheduleId)
      }
      return next
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta programação?')) {
      deleteSchedule(id)
    }
  }

  if (schedules.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma programação criada ainda. Crie sua primeira programação acima.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {schedules
        .slice()
        .reverse()
        .map((schedule) => {
          const isExpanded = expandedSchedules.has(schedule.id)
          return (
            <div key={schedule.id} className="space-y-2">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{schedule.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {schedule.algorithm} • {schedule.tasks.length} tarefas •{' '}
                      {format(new Date(schedule.createdAt), "d 'de' MMM yyyy, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpanded(schedule.id)}
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(schedule.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {isExpanded && <ScheduleTimeline schedule={schedule} />}
            </div>
          )
        })}
    </div>
  )
}
