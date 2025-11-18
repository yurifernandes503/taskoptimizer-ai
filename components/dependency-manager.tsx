'use client'

import { useState } from 'react'
import { useStore, useTasks, useDependencies } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Trash2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DependencyManager() {
  const tasks = useTasks()
  const dependencies = useDependencies()
  const addDependency = useStore((state) => state.addDependency)
  const removeDependency = useStore((state) => state.removeDependency)

  const [taskId, setTaskId] = useState('')
  const [dependsOnTaskId, setDependsOnTaskId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const wouldCreateCycle = (fromId: string, toId: string): boolean => {
    const visited = new Set<string>()
    const stack = [toId]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (current === fromId) return true
      if (visited.has(current)) continue
      visited.add(current)

      const deps = dependencies.filter(d => d.taskId === current)
      for (const dep of deps) {
        stack.push(dep.dependsOnTaskId)
      }
    }
    return false
  }

  const handleAddDependency = () => {
    setError('')
    setSuccess(false)

    if (!taskId || !dependsOnTaskId) {
      setError('Por favor, selecione ambas as tarefas')
      return
    }

    if (taskId === dependsOnTaskId) {
      setError('Uma tarefa não pode depender dela mesma')
      return
    }

    const exists = dependencies.some(
      (dep) => dep.taskId === taskId && dep.dependsOnTaskId === dependsOnTaskId
    )
    if (exists) {
      setError('Esta dependência já existe')
      return
    }

    if (wouldCreateCycle(taskId, dependsOnTaskId)) {
      setError('Esta dependência criaria um ciclo! Uma tarefa não pode depender indiretamente dela mesma.')
      return
    }

    addDependency(taskId, dependsOnTaskId)
    setSuccess(true)
    setTaskId('')
    setDependsOnTaskId('')
    
    setTimeout(() => setSuccess(false), 3000)
  }

  const getTaskTitle = (id: string) => {
    return tasks.find((t) => t.id === id)?.title || 'Tarefa Desconhecida'
  }

  const getPriorityColor = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return 'bg-gray-500'
    
    const colors = {
      1: 'bg-green-500',
      2: 'bg-yellow-500',
      3: 'bg-orange-500',
      4: 'bg-red-500',
      5: 'bg-rose-600'
    }
    return colors[task.priority as keyof typeof colors] || 'bg-gray-500'
  }

  if (tasks.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você precisa adicionar tarefas antes de criar dependências entre elas.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form para adicionar dependências */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-2">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Adicionar Nova Dependência
        </h3>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Dependência adicionada com sucesso!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-base">Tarefa Principal</Label>
              <Select value={taskId} onValueChange={(value) => {
                setTaskId(value)
                setError('')
              }}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Selecione a tarefa..." />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.id)}`} />
                        <span>{task.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Esta tarefa só pode iniciar depois que...
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-base">Depende De</Label>
              <Select 
                value={dependsOnTaskId} 
                onValueChange={(value) => {
                  setDependsOnTaskId(value)
                  setError('')
                }}
                disabled={!taskId}
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Selecione a dependência..." />
                </SelectTrigger>
                <SelectContent>
                  {tasks
                    .filter((task) => task.id !== taskId)
                    .map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.id)}`} />
                          <span>{task.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                ...esta tarefa for concluída primeiro
              </p>
            </div>
          </div>

          <Button 
            onClick={handleAddDependency} 
            className="w-full shadow-lg text-base h-11" 
            disabled={!taskId || !dependsOnTaskId}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Adicionar Dependência
          </Button>
        </div>
      </Card>

      {/* Lista de dependências */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Dependências Configuradas ({dependencies.length})</h3>
        {dependencies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma dependência definida ainda</p>
            <p className="text-sm mt-1">
              Dependências definem a ordem em que as tarefas devem ser executadas
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dependencies.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center gap-3 p-4 rounded-lg border-2 bg-gradient-to-r from-card to-muted/20 hover:shadow-md transition-all"
              >
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(dep.taskId)} flex-shrink-0`} />
                <div className="flex-1 flex items-center gap-2 text-sm flex-wrap">
                  <span className="font-bold text-base">{getTaskTitle(dep.taskId)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground font-medium">depende de</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-bold text-base">{getTaskTitle(dep.dependsOnTaskId)}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeDependency(dep.id)}
                  className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
