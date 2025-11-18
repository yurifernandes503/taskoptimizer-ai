'use client'

import { useState } from 'react'
import { useTasks, useDependencies } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { scheduleTasksWithAlgorithm } from '@/lib/algorithms'
import { algorithmInfo } from '@/lib/algorithm-descriptions'
import type { AlgorithmType, ScheduleMetrics } from '@/lib/types'
import { Zap, Clock, Target, TrendingUp, CheckCircle, Award, AlertCircle, BarChart3, Activity, Info } from 'lucide-react'

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  percentage 
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: any
  color: string
  percentage?: number
}) {
  return (
    <div className={`p-4 rounded-xl border-2 bg-gradient-to-br ${color} transition-all hover:scale-105`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-xs font-medium opacity-80 mb-1">{title}</p>
          <p className="text-2xl font-bold leading-none">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-70 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {percentage !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/80 rounded-full transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function AlgorithmComparisonCard({
  algorithm,
  metrics,
  rank,
  maxMetrics
}: {
  algorithm: AlgorithmType
  metrics: ScheduleMetrics
  rank: number
  maxMetrics: { maxSpeed: number; maxSuccess: number; maxTasks: number }
}) {
  const info = algorithmInfo[algorithm]
  const successRate = metrics.tasksScheduled > 0 
    ? Math.round((metrics.deadlinesMet / metrics.tasksScheduled) * 100)
    : 0

  const speedScore = maxMetrics.maxSpeed > 0 
    ? Math.round((1 - metrics.executionTimeMs / maxMetrics.maxSpeed) * 100) 
    : 100
  const overallScore = Math.round((successRate * 0.6) + (speedScore * 0.4))

  const rankColors = [
    'from-yellow-500 to-orange-500 shadow-yellow-200',
    'from-blue-500 to-cyan-500 shadow-blue-200', 
    'from-purple-500 to-pink-500 shadow-purple-200',
    'from-green-500 to-emerald-500 shadow-green-200'
  ]

  return (
    <Card className={`p-6 relative overflow-hidden border-2 ${rank === 0 ? 'border-yellow-400' : ''}`}>
      {rank === 0 && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            <Award className="h-3 w-3" />
            Melhor
          </div>
        </div>
      )}

      {/* Header do algoritmo */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${rankColors[rank]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
          #{rank + 1}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{info.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{info.description}</p>
        </div>
      </div>

      <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Pontuação Geral</span>
          <span className="text-2xl font-bold text-primary">{overallScore}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000"
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>

      {/* Métricas em grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          title="Velocidade"
          value={`${metrics.executionTimeMs.toFixed(1)}ms`}
          icon={Zap}
          color="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
          percentage={speedScore}
        />
        <MetricCard
          title="Duração Total"
          value={`${metrics.totalDuration}min`}
          icon={Clock}
          color="from-purple-50 to-purple-100 border-purple-200 text-purple-900"
        />
        <MetricCard
          title="Tarefas"
          value={metrics.tasksScheduled}
          subtitle={`${metrics.deadlinesMet} no prazo`}
          icon={Target}
          color="from-orange-50 to-orange-100 border-orange-200 text-orange-900"
        />
        <MetricCard
          title="Taxa de Sucesso"
          value={`${successRate}%`}
          subtitle={`${metrics.deadlinesMissed} atrasadas`}
          icon={CheckCircle}
          color="from-green-50 to-green-100 border-green-200 text-green-900"
          percentage={successRate}
        />
      </div>

      {/* Complexidade */}
      <div className="flex gap-2 pt-3 border-t">
        <Badge variant="outline" className="text-xs font-mono">
          Tempo: {info.timeComplexity}
        </Badge>
        <Badge variant="outline" className="text-xs font-mono">
          Espaço: {info.spaceComplexity}
        </Badge>
      </div>
    </Card>
  )
}

export function AlgorithmComparison() {
  const tasks = useTasks()
  const dependencies = useDependencies()

  const [isComparing, setIsComparing] = useState(false)
  const [comparisonResults, setComparisonResults] = useState<
    Record<AlgorithmType, ScheduleMetrics> | null
  >(null)

  const handleCompare = () => {
    if (tasks.length === 0) return

    setIsComparing(true)

    setTimeout(() => {
      const startTime = new Date()
      const results: Record<AlgorithmType, ScheduleMetrics> = {} as any

      const algorithms: AlgorithmType[] = ['topological', 'dp', 'greedy', 'heap']
      
      algorithms.forEach((algorithm) => {
        const { metrics } = scheduleTasksWithAlgorithm(
          algorithm,
          tasks,
          dependencies,
          startTime
        )
        results[algorithm] = metrics
      })

      setComparisonResults(results)
      setIsComparing(false)
    }, 800)
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center gradient-card border-2 border-dashed">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Adicione tarefas para começar
            </h3>
            <p className="text-muted-foreground">
              Crie algumas tarefas para comparar o desempenho dos algoritmos
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const executionData = comparisonResults
    ? Object.entries(comparisonResults).map(([algorithm, metrics]) => ({
        algoritmo: algorithmInfo[algorithm as AlgorithmType].name,
        'Tempo (ms)': Number(metrics.executionTimeMs.toFixed(2)),
      }))
    : []

  const performanceData = comparisonResults
    ? Object.entries(comparisonResults).map(([algorithm, metrics]) => ({
        algoritmo: algorithmInfo[algorithm as AlgorithmType].name,
        'Cumpridas': metrics.deadlinesMet,
        'Atrasadas': metrics.deadlinesMissed,
      }))
    : []

  const radarData = comparisonResults
    ? (() => {
        const entries = Object.entries(comparisonResults)
        const maxSpeed = Math.max(...entries.map(([, m]) => m.executionTimeMs))
        const maxDuration = Math.max(...entries.map(([, m]) => m.totalDuration))
        
        return entries.map(([algorithm, metrics]) => ({
          algoritmo: algorithmInfo[algorithm as AlgorithmType].name,
          'Taxa de Sucesso': metrics.tasksScheduled > 0 
            ? Math.round((metrics.deadlinesMet / metrics.tasksScheduled) * 100)
            : 0,
          'Velocidade': Math.round((1 - metrics.executionTimeMs / maxSpeed) * 100),
          'Eficiência': metrics.totalDuration > 0
            ? Math.round((1 - metrics.totalDuration / maxDuration) * 100)
            : 0,
          'Tarefas Completas': Math.round((metrics.tasksScheduled / tasks.length) * 100),
        }))
      })()
    : []

  const rankedAlgorithms = comparisonResults
    ? Object.entries(comparisonResults)
        .map(([algorithm, metrics]) => {
          const successRate = metrics.tasksScheduled > 0 
            ? (metrics.deadlinesMet / metrics.tasksScheduled) * 100
            : 0
          const speedScore = Math.max(0, 100 - metrics.executionTimeMs)
          const score = successRate * 0.6 + speedScore * 0.4
          
          return { algorithm: algorithm as AlgorithmType, metrics, score }
        })
        .sort((a, b) => b.score - a.score)
    : []

  const maxMetrics = comparisonResults
    ? {
        maxSpeed: Math.max(...Object.values(comparisonResults).map(m => m.executionTimeMs)),
        maxSuccess: Math.max(...Object.values(comparisonResults).map(m => m.deadlinesMet)),
        maxTasks: Math.max(...Object.values(comparisonResults).map(m => m.tasksScheduled)),
      }
    : { maxSpeed: 0, maxSuccess: 0, maxTasks: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 gradient-card shadow-lg border-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Comparação de Algoritmos</h2>
              <p className="text-sm text-muted-foreground">
                Análise detalhada de desempenho e eficiência
              </p>
            </div>
          </div>
          <Button
            onClick={handleCompare}
            disabled={isComparing}
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            {isComparing ? 'Analisando...' : 'Comparar Algoritmos'}
          </Button>
        </div>
      </Card>

      {!comparisonResults && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Pronto para comparar</p>
              <p>
                Você tem <strong>{tasks.length} tarefas</strong> e{' '}
                <strong>{dependencies.length} dependências</strong> configuradas.
                Clique em "Comparar Algoritmos" para ver qual algoritmo é mais eficiente para o seu caso.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Algoritmos antes da comparação */}
      {!comparisonResults && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(algorithmInfo).map(([key, info]) => (
            <Card key={key} className="p-5 space-y-3 gradient-card card-hover border-2">
              <div className="flex items-center gap-2">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  key === 'topological' ? 'bg-blue-500/10' :
                  key === 'dp' ? 'bg-green-500/10' :
                  key === 'greedy' ? 'bg-yellow-500/10' :
                  'bg-red-500/10'
                }`}>
                  <Activity className={`h-5 w-5 ${
                    key === 'topological' ? 'text-blue-500' :
                    key === 'dp' ? 'text-green-500' :
                    key === 'greedy' ? 'text-yellow-500' :
                    'text-red-500'
                  }`} />
                </div>
                <h3 className="font-semibold text-base">{info.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed min-h-[60px]">
                {info.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {info.timeComplexity}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono">
                  {info.spaceComplexity}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {comparisonResults && (
        <Tabs defaultValue="ranking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ranking">
              <Award className="h-4 w-4 mr-2" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="graficos">
              <BarChart3 className="h-4 w-4 mr-2" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="metricas">
              <Activity className="h-4 w-4 mr-2" />
              Métricas
            </TabsTrigger>
          </TabsList>

          {/* Tab: Ranking */}
          <TabsContent value="ranking" className="space-y-4">
            {rankedAlgorithms.map((item, index) => (
              <AlgorithmComparisonCard
                key={item.algorithm}
                algorithm={item.algorithm}
                metrics={item.metrics}
                rank={index}
                maxMetrics={maxMetrics}
              />
            ))}
          </TabsContent>

          {/* Tab: Gráficos */}
          <TabsContent value="graficos" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Gráfico de velocidade */}
              <Card className="p-6 gradient-card border-2 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-bold">Velocidade de Execução</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={executionData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="algoritmo" 
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      height={80}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      label={{ 
                        value: 'Tempo (ms)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 12, fontWeight: 600 }
                      }}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #3b82f6',
                        borderRadius: '12px',
                        padding: '12px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any) => [`${value}ms`, 'Tempo de Execução']}
                    />
                    <Bar 
                      dataKey="Tempo (ms)" 
                      fill="url(#colorBlue)"
                      radius={[8, 8, 0, 0]}
                      label={{ position: 'top', fontSize: 12, fontWeight: 600 }}
                    />
                    <defs>
                      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Menor valor é melhor • Medido em milissegundos
                </p>
              </Card>

              {/* Gráfico de performance */}
              <Card className="p-6 gradient-card border-2 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-bold">Cumprimento de Prazos</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="algoritmo" 
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      height={80}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #10b981',
                        borderRadius: '12px',
                        padding: '12px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                      iconType="circle"
                    />
                    <Bar dataKey="Cumpridas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Atrasadas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Verde: cumpridas • Vermelho: atrasadas
                </p>
              </Card>

              {/* Radar Chart */}
              <Card className="p-6 gradient-card border-2 shadow-lg lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-bold">Análise Multidimensional</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis 
                      dataKey="algoritmo" 
                      tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                    />
                    <Radar
                      name="Taxa de Sucesso"
                      dataKey="Taxa de Sucesso"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Velocidade"
                      dataKey="Velocidade"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Eficiência"
                      dataKey="Eficiência"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                      iconType="circle"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #a855f7',
                        borderRadius: '12px',
                        padding: '12px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: any) => [`${value}%`, '']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Valores normalizados de 0 a 100 • Maior área = melhor desempenho geral
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Métricas detalhadas */}
          <TabsContent value="metricas" className="space-y-4">
            <Card className="p-6 gradient-card border-2">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Resumo Geral da Comparação
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Total de Tarefas</p>
                  <p className="text-3xl font-bold text-blue-700">{tasks.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                  <p className="text-sm font-medium text-purple-900 mb-1">Dependências</p>
                  <p className="text-3xl font-bold text-purple-700">{dependencies.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-1">Algoritmos Testados</p>
                  <p className="text-3xl font-bold text-green-700">4</p>
                </div>
              </div>
            </Card>

            {/* Tabela de métricas detalhadas */}
            <Card className="p-6 gradient-card border-2 overflow-x-auto">
              <h3 className="text-lg font-bold mb-4">Tabela Comparativa Detalhada</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-3 font-bold">Algoritmo</th>
                    <th className="text-right p-3 font-bold">Tempo (ms)</th>
                    <th className="text-right p-3 font-bold">Duração (min)</th>
                    <th className="text-right p-3 font-bold">Tarefas</th>
                    <th className="text-right p-3 font-bold">No Prazo</th>
                    <th className="text-right p-3 font-bold">Atrasadas</th>
                    <th className="text-right p-3 font-bold">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedAlgorithms.map(({ algorithm, metrics }, index) => {
                    const successRate = metrics.tasksScheduled > 0 
                      ? Math.round((metrics.deadlinesMet / metrics.tasksScheduled) * 100)
                      : 0
                    
                    return (
                      <tr key={algorithm} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                            <span className="font-semibold">
                              {algorithmInfo[algorithm].name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right p-3 font-mono">{metrics.executionTimeMs.toFixed(2)}</td>
                        <td className="text-right p-3 font-mono">{metrics.totalDuration}</td>
                        <td className="text-right p-3 font-mono">{metrics.tasksScheduled}</td>
                        <td className="text-right p-3 font-mono text-green-600 font-semibold">
                          {metrics.deadlinesMet}
                        </td>
                        <td className="text-right p-3 font-mono text-red-600 font-semibold">
                          {metrics.deadlinesMissed}
                        </td>
                        <td className="text-right p-3">
                          <Badge 
                            variant={successRate >= 80 ? 'default' : successRate >= 50 ? 'secondary' : 'destructive'}
                            className="font-mono"
                          >
                            {successRate}%
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
