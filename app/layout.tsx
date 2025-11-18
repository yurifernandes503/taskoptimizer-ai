import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaskOptimizer AI - Otimização Inteligente de Tarefas',
  description: 'Otimize o agendamento de suas tarefas com algoritmos avançados incluindo ordenação topológica, programação dinâmica, guloso e heap',
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
