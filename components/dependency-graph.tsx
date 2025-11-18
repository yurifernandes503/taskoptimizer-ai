'use client'

import { useEffect, useRef, useState } from 'react'
import { useTasks, useDependencies } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface NodePosition {
  x: number
  y: number
  level: number
  priority: number
}

interface ForceNode extends NodePosition {
  id: string
  vx: number
  vy: number
  title: string
}

export function DependencyGraph() {
  const tasks = useTasks()
  const dependencies = useDependencies()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(0.8)
  const [pan, setPan] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const calculateOptimizedLayout = (width: number, height: number) => {
    const nodePositions = new Map<string, ForceNode>()
    
    const inDegree = new Map<string, number>()
    const outEdges = new Map<string, string[]>()
    
    tasks.forEach(task => {
      inDegree.set(task.id, 0)
      outEdges.set(task.id, [])
    })
    
    dependencies.forEach(dep => {
      inDegree.set(dep.taskId, (inDegree.get(dep.taskId) || 0) + 1)
      const edges = outEdges.get(dep.dependsOnTaskId) || []
      edges.push(dep.taskId)
      outEdges.set(dep.dependsOnTaskId, edges)
    })
    
    const levels: string[][] = []
    const queue: string[] = []
    const taskLevel = new Map<string, number>()
    
    tasks.forEach(task => {
      if (inDegree.get(task.id) === 0) {
        queue.push(task.id)
        taskLevel.set(task.id, 0)
      }
    })
    
    while (queue.length > 0) {
      const currentLevelSize = queue.length
      const currentLevel: string[] = []
      
      for (let i = 0; i < currentLevelSize; i++) {
        const taskId = queue.shift()!
        currentLevel.push(taskId)
        
        const edges = outEdges.get(taskId) || []
        edges.forEach(nextTaskId => {
          const newDegree = inDegree.get(nextTaskId)! - 1
          inDegree.set(nextTaskId, newDegree)
          
          if (newDegree === 0) {
            queue.push(nextTaskId)
            const currentLevel = taskLevel.get(taskId) || 0
            taskLevel.set(nextTaskId, currentLevel + 1)
          }
        })
      }
      
      if (currentLevel.length > 0) {
        levels.push(currentLevel)
      }
    }
    
    tasks.forEach(task => {
      if (!taskLevel.has(task.id)) {
        if (levels.length === 0) {
          levels.push([])
        }
        levels[0].push(task.id)
        taskLevel.set(task.id, 0)
      }
    })
    
    const nodeRadius = 80
    const horizontalSpacing = 400
    const baseVerticalSpacing = 250
    const priorityMultiplier = 1.5
    
    levels.forEach((level, levelIndex) => {
      const byPriority = new Map<number, string[]>()
      level.forEach(taskId => {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          if (!byPriority.has(task.priority)) {
            byPriority.set(task.priority, [])
          }
          byPriority.get(task.priority)!.push(taskId)
        }
      })
      
      const priorities = Array.from(byPriority.keys()).sort((a, b) => b - a)
      
      let yOffset = 200
      priorities.forEach(priority => {
        const tasksInPriority = byPriority.get(priority)!
        const verticalSpacing = baseVerticalSpacing * priorityMultiplier
        
        const groupHeight = tasksInPriority.length * verticalSpacing
        let yStart = yOffset
        
        tasksInPriority.forEach((taskId, idx) => {
          const task = tasks.find(t => t.id === taskId)!
          const x = 200 + levelIndex * horizontalSpacing
          const y = yStart + idx * verticalSpacing
          
          nodePositions.set(taskId, {
            id: taskId,
            x,
            y,
            level: levelIndex,
            priority: task.priority,
            vx: 0,
            vy: 0,
            title: task.title
          })
        })
        
        yOffset += groupHeight + 150
      })
    })
    
    const iterations = 50
    const repulsionStrength = 8000
    const minDistance = nodeRadius * 3
    
    for (let iter = 0; iter < iterations; iter++) {
      const nodes = Array.from(nodePositions.values())
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i]
          const node2 = nodes[j]
          
          const dx = node2.x - node1.x
          const dy = node2.y - node1.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          
          if (distance < minDistance) {
            const force = repulsionStrength / (distance * distance)
            const fx = (dx / distance) * force
            const fy = (dy / distance) * force
            
            node1.vx -= fx
            node1.vy -= fy
            node2.vx += fx
            node2.vy += fy
          }
        }
      }
      
      nodes.forEach(node => {
        node.x += node.vx * 0.1
        node.y += node.vy * 0.1
        node.vx *= 0.8
        node.vy *= 0.8
        
        const targetX = 200 + node.level * horizontalSpacing
        node.x = node.x * 0.7 + targetX * 0.3
      })
    }
    
    return nodePositions
  }

  useEffect(() => {
    if (!canvasRef.current || tasks.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height

    const bgGradient = ctx.createLinearGradient(0, 0, width, height)
    bgGradient.addColorStop(0, '#fafafa')
    bgGradient.addColorStop(1, '#f0f4f8')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)
    
    ctx.strokeStyle = '#e8e8e8'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    for (let i = 0; i < width; i += 100) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 100) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }
    ctx.setLineDash([])

    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    const nodePositions = calculateOptimizedLayout(width / zoom, height / zoom)
    const nodeRadius = 80

    const levels = new Set(Array.from(nodePositions.values()).map(p => p.level))
    levels.forEach(level => {
      const x = 200 + level * 400
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 2
      ctx.setLineDash([15, 15])
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height / zoom)
      ctx.stroke()
      ctx.setLineDash([])
      
      ctx.fillStyle = '#6b7280'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      const levelLabel = level === 0 ? 'Início' : `Nível ${level + 1}`
      ctx.fillText(levelLabel, x, 50)
    })

    dependencies.forEach((dep) => {
      const from = nodePositions.get(dep.dependsOnTaskId)
      const to = nodePositions.get(dep.taskId)
      if (from && to) {
        const toTask = tasks.find(t => t.id === dep.taskId)
        
        const priorityColors = [
          { color: '#64748b', shadow: 'rgba(100, 116, 139, 0.3)' },
          { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.3)' },
          { color: '#eab308', shadow: 'rgba(234, 179, 8, 0.3)' },
          { color: '#f97316', shadow: 'rgba(249, 115, 22, 0.3)' },
          { color: '#ef4444', shadow: 'rgba(239, 68, 68, 0.3)' },
        ]
        
        const colorSet = toTask ? priorityColors[toTask.priority - 1] : priorityColors[0]
        
        const controlPointOffset = Math.abs(to.x - from.x) * 0.6
        const cp1x = from.x + controlPointOffset
        const cp1y = from.y
        const cp2x = to.x - controlPointOffset
        const cp2y = to.y
        
        ctx.shadowColor = colorSet.shadow
        ctx.shadowBlur = 12
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 4
        
        ctx.strokeStyle = colorSet.color
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(from.x + nodeRadius, from.y)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x - nodeRadius, to.y)
        ctx.stroke()

        ctx.shadowColor = 'transparent'

        const t = 0.92
        const arrowX = Math.pow(1-t, 3) * (from.x + nodeRadius) +
                      3 * Math.pow(1-t, 2) * t * cp1x +
                      3 * (1-t) * Math.pow(t, 2) * cp2x +
                      Math.pow(t, 3) * (to.x - nodeRadius)
        const arrowY = Math.pow(1-t, 3) * from.y +
                      3 * Math.pow(1-t, 2) * t * cp1y +
                      3 * (1-t) * Math.pow(t, 2) * cp2y +
                      Math.pow(t, 3) * to.y
        
        const tangentX = -3 * Math.pow(1-t, 2) * (from.x + nodeRadius) +
                        3 * (3 * Math.pow(t, 2) - 4 * t + 1) * cp1x +
                        3 * (2 - 3 * t) * t * cp2x +
                        3 * Math.pow(t, 2) * (to.x - nodeRadius)
        const tangentY = -3 * Math.pow(1-t, 2) * from.y +
                        3 * (3 * Math.pow(t, 2) - 4 * t + 1) * cp1y +
                        3 * (2 - 3 * t) * t * cp2y +
                        3 * Math.pow(t, 2) * to.y
        
        const angle = Math.atan2(tangentY, tangentX)
        const arrowSize = 24
        
        ctx.fillStyle = colorSet.color
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
        )
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }
    })

    tasks.forEach((task) => {
      const pos = nodePositions.get(task.id)
      if (!pos) return

      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 6

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 6
      ctx.stroke()
      
      const priorityStyles = [
        { start: '#94a3b8', end: '#64748b', border: '#475569', name: 'Baixa' },
        { start: '#60a5fa', end: '#2563eb', border: '#1e40af', name: 'Normal' },
        { start: '#facc15', end: '#eab308', border: '#ca8a04', name: 'Média' },
        { start: '#fb923c', end: '#ea580c', border: '#c2410c', name: 'Alta' },
        { start: '#f87171', end: '#dc2626', border: '#991b1b', name: 'Urgente' },
      ]
      
      const style = priorityStyles[task.priority - 1]
      const gradient = ctx.createRadialGradient(
        pos.x - nodeRadius * 0.3,
        pos.y - nodeRadius * 0.3,
        0,
        pos.x,
        pos.y,
        nodeRadius
      )
      gradient.addColorStop(0, style.start)
      gradient.addColorStop(1, style.end)
      
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeRadius - 3, 0, 2 * Math.PI)
      ctx.strokeStyle = style.border
      ctx.lineWidth = 4
      ctx.stroke()
      
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeRadius - 3, 0, 2 * Math.PI)
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.shadowColor = 'transparent'

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const maxWidth = nodeRadius * 1.7
      let text = task.title
      if (ctx.measureText(text).width > maxWidth) {
        while (ctx.measureText(text + '...').width > maxWidth && text.length > 0) {
          text = text.slice(0, -1)
        }
        text += '...'
      }
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      ctx.fillText(text, pos.x, pos.y - 20)
      
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText(`${task.duration} min`, pos.x, pos.y + 5)
      
      if (task.deadline) {
        ctx.font = '13px sans-serif'
        const deadline = new Date(task.deadline)
        ctx.fillText(
          deadline.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          pos.x,
          pos.y + 25
        )
      }
      
      ctx.shadowColor = 'transparent'

      const badgeRadius = 28
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = style.border
      ctx.lineWidth = 4
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(pos.x + nodeRadius * 0.65, pos.y - nodeRadius * 0.65, badgeRadius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      ctx.shadowColor = 'transparent'
      ctx.fillStyle = style.end
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`P${task.priority}`, pos.x + nodeRadius * 0.65, pos.y - nodeRadius * 0.65)
    })

    ctx.restore()
  }, [tasks, dependencies, zoom, pan])

  if (tasks.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhuma tarefa para visualizar. Adicione tarefas para ver o grafo de dependências.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🗺️ Mapa de Dependências Otimizado
          </h3>
          <p className="text-sm text-muted-foreground">
            Layout inteligente com espaçamento adaptativo • Arraste para mover • Scroll para zoom
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(Math.max(0.3, zoom - 0.2))}
            disabled={zoom <= 0.3}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold min-w-[60px] text-center bg-primary/10 px-3 py-1 rounded-md">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setZoom(0.8)
              setPan({ x: 50, y: 50 })
            }}
            title="Resetar visualização"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoom(Math.min(2, zoom + 0.2))}
            disabled={zoom >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        {[
          { priority: 1, label: 'Baixa', color: 'bg-slate-600', textColor: 'text-slate-700' },
          { priority: 2, label: 'Normal', color: 'bg-blue-600', textColor: 'text-blue-700' },
          { priority: 3, label: 'Média', color: 'bg-yellow-600', textColor: 'text-yellow-700' },
          { priority: 4, label: 'Alta', color: 'bg-orange-600', textColor: 'text-orange-700' },
          { priority: 5, label: 'Urgente', color: 'bg-red-600', textColor: 'text-red-700' },
        ].map(({ priority, label, color, textColor }) => (
          <div key={priority} className="flex items-center gap-2 text-sm">
            <div className={`h-8 w-8 rounded-full ${color} border-4 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs`}>
              P{priority}
            </div>
            <span className={`font-bold ${textColor}`}>{label}</span>
          </div>
        ))}
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-[800px] rounded-xl border-2 border-gray-300 shadow-2xl cursor-grab active:cursor-grabbing bg-gradient-to-br from-gray-50 to-gray-100"
        onMouseDown={(e) => {
          setIsDragging(true)
          setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            setPan({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y
            })
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onWheel={(e) => {
          e.preventDefault()
          const delta = e.deltaY > 0 ? -0.1 : 0.1
          setZoom(Math.max(0.3, Math.min(2, zoom + delta)))
        }}
      />
      
      <div className="flex flex-wrap gap-3 justify-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
        <Badge variant="default" className="text-base py-2 px-5 font-bold bg-blue-600 hover:bg-blue-700">
          📋 {tasks.length} Tarefas
        </Badge>
        <Badge variant="default" className="text-base py-2 px-5 font-bold bg-purple-600 hover:bg-purple-700">
          🔗 {dependencies.length} Dependências
        </Badge>
        <Badge variant="default" className="text-base py-2 px-5 font-bold bg-green-600 hover:bg-green-700">
          ⚡ Zoom {Math.round(zoom * 100)}%
        </Badge>
      </div>
      
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">💡 Melhorias do Layout:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li><strong>Espaçamento inteligente</strong>: Algoritmo force-directed evita sobreposição</li>
          <li><strong>Cores distintas</strong>: Cada prioridade tem cor única e vibrante</li>
          <li><strong>Organização hierárquica</strong>: Tarefas organizadas por ordem de execução</li>
          <li><strong>Separação por prioridade</strong>: Tarefas urgentes no topo, baixas embaixo</li>
          <li><strong>Canvas maior</strong>: 800px de altura para melhor visualização</li>
        </ul>
      </div>
    </div>
  )
}
