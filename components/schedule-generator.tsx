'use client'

import { useState } from 'react'
import { useStore, useTasks, useDependencies } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { scheduleTasksWithAlgorithm } from '@/lib/algorithms'
import { algorithmInfo } from '@/lib/algorithm-descriptions'
import type { AlgorithmType } from '@/lib/types'
import { Calendar, Clock, Zap, Sparkles, TrendingUp } from 'lucide-react'

export function ScheduleGenerator() {
  const tasks = useTasks()
  const dependencies = useDependencies()
  const addSchedule = useStore((state) => state.addSchedule)
  const user = useStore((state) => state.user)

  const [algorithm, setAlgorithm] = useState<AlgorithmType>('topological')
  const [scheduleName, setScheduleName] = useState('')
  const [startTime, setStartTime] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (!user || tasks.length === 0 || !scheduleName) return

    setIsGenerating(true)

    // Simulate async processing
    setTimeout(() => {
      const start = new Date(startTime)
      const { scheduled, metrics } = scheduleTasksWithAlgorithm(
        algorithm,
        tasks,
        dependencies,
        start
      )

      addSchedule({
        userId: user.id,
        name: scheduleName,
        algorithm,
        startTime: start,
        tasks: scheduled,
        metrics,
      })

      setIsGenerating(false)
      setScheduleName('')
    }, 500)
  }

  const info = algorithmInfo[algorithm]

  return (
    <Card className="p-6 space-y-6 gradient-card border shadow-lg">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">Gerar Cronograma</h2>
          <p className="text-sm text-muted-foreground">
            Escolha um algoritmo e gere um cronograma otimizado
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schedule-name" className="text-base font-semibold">
            Nome do Cronograma
          </Label>
          <Input
            id="schedule-name"
            placeholder="Ex: Projeto Final - Sprint 1"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="algorithm" className="text-base font-semibold">
            Algoritmo de Otimização
          </Label>
          <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as AlgorithmType)}>
            <SelectTrigger id="algorithm" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="topological">
                {algorithmInfo.topological.name}
              </SelectItem>
              <SelectItem value="dp">
                {algorithmInfo.dp.name}
              </SelectItem>
              <SelectItem value="greedy">
                {algorithmInfo.greedy.name}
              </SelectItem>
              <SelectItem value="heap">
                {algorithmInfo.heap.name}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-time" className="text-base font-semibold">
            Horário de Início
          </Label>
          <Input
            id="start-time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      {info && (
        <Card className="p-5 bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{info.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {info.description}
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-background/50">
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                Complexidade de Tempo
              </span>
              <code className="text-sm font-bold text-primary">
                {info.timeComplexity}
              </code>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                Complexidade de Espaço
              </span>
              <code className="text-sm font-bold text-primary">
                {info.spaceComplexity}
              </code>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-background/50">
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              Ideal Para
            </span>
            <span className="text-sm font-medium">{info.bestFor}</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
          <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{tasks.length}</p>
            <p className="text-xs text-muted-foreground">Tarefas</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10">
          <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{dependencies.length}</p>
            <p className="text-xs text-muted-foreground">Dependências</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
          <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {tasks.reduce((sum, t) => sum + t.duration, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Min Total</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={tasks.length === 0 || !scheduleName || isGenerating}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all"
        size="lg"
      >
        <Sparkles className="h-5 w-5 mr-2" />
        {isGenerating ? 'Gerando Cronograma...' : 'Gerar Cronograma Otimizado'}
      </Button>
    </Card>
  )
}
