# TaskOptimizer AI

Sistema inteligente de otimização e agendamento de tarefas com múltiplos algoritmos.

## 🚀 Características

- **4 Algoritmos de Otimização**: Ordenação Topológica, Programação Dinâmica, Guloso e Heap
- **Gerenciamento Completo de Tarefas**: CRUD completo com prioridades e prazos
- **Grafo de Dependências**: Visualização interativa em Canvas
- **Análise Comparativa**: Gráficos e métricas de desempenho
- **Interface Moderna**: Design responsivo com Tailwind CSS
- **Armazenamento Local**: Dados persistentes no navegador

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Abrir no navegador
http://localhost:3000
\`\`\`

## 📖 Guia de Uso

### 1. Adicionar Tarefas
- Clique em "Nova Tarefa"
- Preencha título, descrição, duração e prioridade
- Defina um prazo (opcional)

### 2. Criar Dependências
- Vá para a aba "Dependências"
- Selecione uma tarefa e defina de qual outra ela depende
- Visualize o grafo interativo

### 3. Gerar Cronograma
- Acesse "Gerar Cronograma"
- Escolha um algoritmo
- Defina data/hora de início
- Clique em "Gerar"

### 4. Comparar Algoritmos
- Gere cronogramas com diferentes algoritmos
- Acesse "Comparação de Algoritmos"
- Analise métricas e gráficos

## 🧮 Algoritmos Implementados

### Ordenação Topológica
- **Complexidade**: O(V + E)
- **Melhor para**: Dependências complexas
- **Garante**: Ordem correta de execução

### Programação Dinâmica
- **Complexidade**: O(n × W)
- **Melhor para**: Otimização global
- **Considera**: Prioridade e tempo

### Algoritmo Guloso
- **Complexidade**: O(n log n)
- **Melhor para**: Execução rápida
- **Estratégia**: Prioridade primeiro

### Baseado em Heap
- **Complexidade**: O(n log n)
- **Melhor para**: Grandes volumes
- **Eficiente**: Inserção e remoção

## 🛠️ Tecnologias

- **Frontend**: Next.js 16, React 19
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Estado**: Zustand
- **UI**: Radix UI, shadcn/ui
- **Gráficos**: Recharts
- **Datas**: date-fns

## 📁 Estrutura do Projeto

\`\`\`
taskoptimizer-ai/
├── app/                    # Páginas Next.js
├── components/             # Componentes React
│   ├── ui/                # Componentes de UI
│   ├── task-form.tsx      # Formulário de tarefas
│   ├── task-list.tsx      # Lista de tarefas
│   ├── dependency-*.tsx   # Gerenciamento de dependências
│   ├── schedule-*.tsx     # Geração de cronogramas
│   └── algorithm-*.tsx    # Comparação de algoritmos
├── lib/
│   ├── algorithms.ts      # Implementação dos algoritmos
│   ├── types.ts           # Definições TypeScript
│   └── store.ts           # Estado global Zustand
└── scripts/               # Scripts SQL (referência)
\`\`\`

## 🎯 Casos de Uso

- **Estudantes**: Organizar estudos e projetos acadêmicos
- **Desenvolvedores**: Planejar sprints e tarefas de desenvolvimento
- **Gerentes**: Organizar projetos com dependências complexas
- **Educação**: Demonstrar algoritmos de otimização na prática

## 🤝 Contribuindo

Este é um projeto educacional. Sugestões e melhorias são bem-vindas!

## 📄 Licença

Projeto desenvolvido para fins educacionais.

---

Desenvolvido com ❤️ usando Next.js e React
