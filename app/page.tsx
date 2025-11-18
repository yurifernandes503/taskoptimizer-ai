'use client'

import { useEffect, useState } from 'react'
import { useStore, useTasks } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthDialog } from '@/components/auth-dialog'
import { UserMenu } from '@/components/user-menu'
import { TaskForm } from '@/components/task-form'
import { TaskList } from '@/components/task-list'
import { DependencyManager } from '@/components/dependency-manager'
import { DependencyGraph } from '@/components/dependency-graph'
import { ScheduleGenerator } from '@/components/schedule-generator'
import { ScheduleList } from '@/components/schedule-list'
import { AlgorithmComparison } from '@/components/algorithm-comparison'
import { SampleTasksDialog } from '@/components/sample-tasks-dialog'
import { DebugPanel } from '@/components/debug-panel'
import { Plus, Network, Calendar, BarChart3, Sparkles, Download } from 'lucide-react'

export default function Home() {
  const user = useStore((state) => state.user)
  const tasks = useTasks()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showSampleTasks, setShowSampleTasks] = useState(false)

  useEffect(() => {
    if (!user) {
      setShowAuthDialog(true)
    }
  }, [user])

  if (!user) {
    return <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg shadow-lg">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  TaskOptimizer AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Otimização inteligente com algoritmos avançados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {tasks.length === 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowSampleTasks(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Tarefas de Exemplo
                </Button>
              )}
              <Button onClick={() => setShowTaskForm(true)} className="shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        {tasks.length === 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 rounded-xl">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Bem-vindo, {user.name}!
            </h2>
            <p className="text-muted-foreground mb-4">
              Comece adicionando suas tarefas ou importe um projeto de exemplo para testar os algoritmos de otimização.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Tarefa
              </Button>
              <Button variant="outline" onClick={() => setShowSampleTasks(true)}>
                <Download className="h-4 w-4 mr-2" />
                Carregar Projeto de Exemplo
              </Button>
            </div>
          </div>
        )}

        <DebugPanel />

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="tasks" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Plus className="h-4 w-4" />
              <span>Tarefas</span>
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Network className="h-4 w-4" />
              <span>Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <Calendar className="h-4 w-4" />
              <span>Cronogramas</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex flex-col sm:flex-row items-center gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span>Comparar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Minhas Tarefas</h2>
              <TaskList />
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Dependências entre Tarefas</h2>
              <DependencyManager />
            </div>
          </TabsContent>

          <TabsContent value="graph" className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <DependencyGraph />
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <ScheduleGenerator />
            </div>
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Cronogramas Gerados</h2>
              <ScheduleList />
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <AlgorithmComparison />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <TaskForm open={showTaskForm} onOpenChange={setShowTaskForm} />
      <SampleTasksDialog open={showSampleTasks} onOpenChange={setShowSampleTasks} />
    </div>
  )
}
