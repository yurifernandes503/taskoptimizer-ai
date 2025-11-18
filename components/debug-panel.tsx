'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

export function DebugPanel() {
  const registeredUsers = useStore((state) => state.registeredUsers)
  const user = useStore((state) => state.user)

  // Mostrar apenas em desenvolvimento
  if (process.env.NODE_ENV === 'production') return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Painel de Debug</CardTitle>
        </div>
        <CardDescription>
          Informações do sistema (visível apenas em desenvolvimento)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Usuário Atual:</h3>
          {user ? (
            <div className="text-sm bg-muted p-3 rounded-md">
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhum usuário logado</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold">Usuários Registrados:</h3>
            <Badge variant="secondary">{registeredUsers.length}</Badge>
          </div>
          {registeredUsers.length > 0 ? (
            <div className="space-y-2">
              {registeredUsers.map((u, index) => (
                <div key={u.id} className="text-sm bg-muted p-3 rounded-md">
                  <p><strong>#{index + 1} - {u.name}</strong></p>
                  <p className="text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Criado em: {new Date(u.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhum usuário registrado ainda</p>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md border border-blue-200">
          <p className="font-semibold mb-1">📝 Como funciona:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Os usuários são salvos no <code className="bg-blue-100 px-1 rounded">localStorage</code> do navegador</li>
            <li>As senhas são armazenadas com hash SHA-256</li>
            <li>Os dados persistem mesmo após fechar o navegador</li>
            <li>Cada usuário tem suas próprias tarefas e cronogramas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
