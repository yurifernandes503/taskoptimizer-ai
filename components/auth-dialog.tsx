'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { hashPassword, verifyPassword, validateEmail, validatePassword } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const setUser = useStore((state) => state.setUser)
  const registerUser = useStore((state) => state.registerUser)
  const getUserByEmail = useStore((state) => state.getUserByEmail)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      // Validações
      if (!name || !email || !password || !confirmPassword) {
        setError('Por favor, preencha todos os campos')
        return
      }

      if (!validateEmail(email)) {
        setError('Por favor, insira um e-mail válido (ex: usuario@dominio.com)')
        return
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        setError(passwordValidation.message || 'Senha inválida')
        return
      }

      if (password !== confirmPassword) {
        setError('As senhas não coincidem')
        return
      }

      // Verificar se usuário já existe
      const existingUser = getUserByEmail(email)
      if (existingUser) {
        setError('Este e-mail já está cadastrado')
        return
      }

      // Criar hash da senha e registrar usuário
      const passwordHash = await hashPassword(password)
      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash,
        createdAt: new Date(),
      }

      registerUser(newUser)
      
      // Pequeno delay para garantir que o localStorage foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setUser({ id: newUser.id, name, email, createdAt: newUser.createdAt })
      
      setSuccess('Conta criada com sucesso! Bem-vindo!')
      
      // Fechar dialog após 1 segundo
      setTimeout(() => {
        onOpenChange(false)
        // Limpar campos
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setSuccess('')
      }, 1000)
      
    } catch (err) {
      console.error('[v0] Erro ao registrar:', err)
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        setError('Por favor, preencha todos os campos')
        return
      }

      if (!validateEmail(email)) {
        setError('Por favor, insira um e-mail válido (ex: usuario@dominio.com)')
        return
      }

      const registeredUser = getUserByEmail(email)
      if (!registeredUser) {
        setError('E-mail ou senha incorretos')
        return
      }

      const isValid = await verifyPassword(password, registeredUser.passwordHash)
      if (!isValid) {
        setError('E-mail ou senha incorretos')
        return
      }

      setUser({
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        createdAt: registeredUser.createdAt,
      })
      
      setSuccess('Login realizado com sucesso!')
      
      // Fechar dialog após 800ms
      setTimeout(() => {
        onOpenChange(false)
        // Limpar campos
        setEmail('')
        setPassword('')
        setSuccess('')
      }, 800)
      
    } catch (err) {
      console.error('[v0] Erro ao fazer login:', err)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl">TaskOptimizer AI</DialogTitle>
          </div>
          <DialogDescription>
            Otimize suas tarefas com algoritmos inteligentes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Criar Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-500 text-green-700 bg-green-50">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">E-mail</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-500 text-green-700 bg-green-50">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-name">Nome Completo</Label>
                <Input
                  id="register-name"
                  placeholder="João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">E-mail</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Deve conter: 6+ caracteres, 1 maiúscula, 1 número
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirmar Senha</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
