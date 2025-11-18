'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { SAMPLE_CATEGORIES } from '@/lib/sample-tasks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Clock, Calendar, Code, GraduationCap, PartyPopper, ArrowLeft } from 'lucide-react'

interface SampleTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CategoryKey = keyof typeof SAMPLE_CATEGORIES

export function SampleTasksDialog({ open, onOpenChange }: SampleTasksDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null)
  const addTask = useStore((state) => state.addTask)
  const addDependency = useStore((state) => state.addDependency)
  const user = useStore((state) => state.user)

  const handleImport = () => {
    if (!selectedCategory || !user) return
    
    setIsLoading(true)
    
    const category = SAMPLE_CATEGORIES[selectedCategory]
    
    const taskMap = new Map<string, string>()
    category.tasks.forEach((task) => {
      const taskId = crypto.randomUUID()
      taskMap.set(task.title, taskId)
      addTask({
        ...task,
        userId: user.id,
      })
    })

    setTimeout(() => {
      category.dependencies.forEach(({ task, dependsOn }) => {
        const taskId = taskMap.get(task)
        const dependsOnId = taskMap.get(dependsOn)
        if (taskId && dependsOnId) {
          addDependency(taskId, dependsOnId)
        }
      })
      
      setIsLoading(false)
      setSelectedCategory(null)
      onOpenChange(false)
    }, 500)
  }

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: 'bg-green-500/10 text-green-700 border-green-200',
      2: 'bg-blue-500/10 text-blue-700 border-blue-200',
      3: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      4: 'bg-orange-500/10 text-orange-700 border-orange-200',
      5: 'bg-red-500/10 text-red-700 border-red-200',
    }
    return colors[priority as keyof typeof colors] || colors[3]
  }

  const getPriorityLabel = (priority: number) => {
    const labels = {
      1: '🟢 Baixa',
      2: '🟡 Normal',
      3: '🟠 Média',
      4: '🔴 Alta',
      5: '🔥 Urgente',
    }
    return labels[priority as keyof typeof labels] || 'Média'
  }

  const categoryIcons = {
    development: Code,
    academic: GraduationCap,
    event: PartyPopper,
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setSelectedCategory(null)
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {selectedCategory ? '📋 Tarefas de Exemplo' : '🎯 Escolha um Projeto'}
          </DialogTitle>
          <DialogDescription>
            {selectedCategory 
              ? SAMPLE_CATEGORIES[selectedCategory].description
              : 'Selecione uma categoria de projeto para carregar tarefas de exemplo'}
          </DialogDescription>
        </DialogHeader>

        {!selectedCategory ? (
          <div className="grid md:grid-cols-3 gap-4 py-4">
            {Object.entries(SAMPLE_CATEGORIES).map(([key, category]) => {
              const Icon = categoryIcons[key as CategoryKey]
              return (
                <Card
                  key={key}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 gradient-card border-2 hover:border-primary"
                  onClick={() => setSelectedCategory(key as CategoryKey)}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Badge variant="secondary">
                          {category.tasks.length} tarefas
                        </Badge>
                        <Badge variant="secondary">
                          {category.dependencies.length} dependências
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-3">
                {SAMPLE_CATEGORIES[selectedCategory].tasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 rounded-lg bg-gradient-to-r from-card to-muted/20 hover:shadow-md transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-bold text-base text-pretty">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 text-pretty leading-relaxed">
                      {task.description}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-700">{task.duration} min</span>
                      </span>
                      <span className="flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="text-purple-700">
                          {Math.ceil((task.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory(null)}
                className="sm:mr-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {SAMPLE_CATEGORIES[selectedCategory].tasks.length} tarefas • {' '}
                  {SAMPLE_CATEGORIES[selectedCategory].dependencies.length} dependências
                </span>
              </div>
              <Button onClick={handleImport} disabled={isLoading} className="shadow-lg">
                {isLoading ? 'Importando...' : '✓ Adicionar Tarefas'}
              </Button>
            </DialogFooter>
          </>
        )}

        {!selectedCategory && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
