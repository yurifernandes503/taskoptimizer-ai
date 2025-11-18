'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Task } from '@/lib/types'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
}

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const user = useStore((state) => state.user)
  const addTask = useStore((state) => state.addTask)
  const updateTask = useStore((state) => state.updateTask)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('60')
  const [priority, setPriority] = useState('3')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    if (task && open) {
      setTitle(task.title)
      setDescription(task.description)
      setDuration(task.duration.toString())
      setPriority(task.priority.toString())
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '')
    } else if (!open) {
      // Limpa o formulário quando fecha sem task
      resetForm()
    }
  }, [task, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const taskData = {
      userId: user.id,
      title,
      description,
      duration: parseInt(duration),
      priority: parseInt(priority),
      deadline: deadline ? new Date(deadline) : undefined,
    }

    if (task) {
      updateTask(task.id, taskData)
    } else {
      addTask(taskData)
    }

    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDuration('60')
    setPriority('3')
    setDeadline('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {task ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Atualize os detalhes da tarefa abaixo' : 'Preencha os dados para criar uma nova tarefa'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">Nome da Tarefa *</Label>
            <Input
              id="title"
              placeholder="Ex: Completar relatório do projeto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Detalhes adicionais sobre a tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-base resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="font-semibold">Duração (min) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="10080"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="font-semibold">Prioridade *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">🟢 1 - Baixa</SelectItem>
                  <SelectItem value="2">🟡 2 - Média-Baixa</SelectItem>
                  <SelectItem value="3">🟠 3 - Média</SelectItem>
                  <SelectItem value="4">🔴 4 - Alta</SelectItem>
                  <SelectItem value="5">🔥 5 - Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="font-semibold">Prazo (opcional)</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                resetForm()
              }}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button type="submit" className="min-w-[100px] shadow-lg">
              {task ? '✓ Atualizar' : '+ Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
