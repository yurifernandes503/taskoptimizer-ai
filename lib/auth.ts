// Utilitário para hash de senha simples (educacional - use bcrypt em produção)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export function validateEmail(email: string): boolean {
  // Regex mais completo para validação de email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(email)) {
    return false
  }
  
  // Verificações adicionais
  const parts = email.split('@')
  if (parts.length !== 2) return false
  
  const [localPart, domain] = parts
  
  // Local part não pode ser vazio ou começar/terminar com ponto
  if (!localPart || localPart.startsWith('.') || localPart.endsWith('.')) {
    return false
  }
  
  // Domínio deve ter pelo menos um ponto
  if (!domain.includes('.')) {
    return false
  }
  
  // Parte após o último ponto (TLD) deve ter 2+ caracteres
  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return false
  }
  
  return true
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'A senha deve ter no mínimo 6 caracteres' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um número' }
  }
  return { valid: true }
}
