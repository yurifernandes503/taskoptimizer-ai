import type { AlgorithmType } from './types'

export interface AlgorithmInfo {
  name: string
  description: string
  timeComplexity: string
  spaceComplexity: string
  bestFor: string
  icon: string
}

export const algorithmInfo: Record<AlgorithmType, AlgorithmInfo> = {
  topological: {
    name: 'Ordenação Topológica (Kahn)',
    description:
      'Organiza tarefas respeitando suas dependências. Processa primeiro tarefas sem dependências, depois libera as próximas disponíveis.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    bestFor: 'Tarefas com dependências complexas que precisam seguir ordem específica',
    icon: '🔄',
  },
  dp: {
    name: 'Programação Dinâmica',
    description:
      'Encontra a melhor combinação de tarefas maximizando prioridades e respeitando dependências. Usa memória para evitar recalcular soluções.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n)',
    bestFor: 'Maximizar valor total das tarefas completadas',
    icon: '📊',
  },
  greedy: {
    name: 'Algoritmo Guloso',
    description:
      'Escolhe sempre a melhor opção no momento: prioriza tarefas urgentes e importantes. Rápido, mas pode não ser perfeito.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    bestFor: 'Quando tarefas de alta prioridade devem ser feitas primeiro',
    icon: '⚡',
  },
  heap: {
    name: 'Heap Mínimo',
    description:
      'Sempre executa a tarefa mais curta disponível. Minimiza tempo de espera e finaliza rapidamente tarefas pequenas.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    bestFor: 'Minimizar tempo médio de conclusão e espera',
    icon: '⏱️',
  },
}
