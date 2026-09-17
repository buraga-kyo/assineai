import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStoreSessao = defineStore('sessao', () => {
  const autenticado = ref(false)
  const usuario = ref<{ nome: string, email: string } | null>(null)

  // Bate na API de verdade pra ver se o cookie existe e se a sessão tá de pé
  async function verificarSessao() {
    try {
      const resposta = await fetch('/api/sessao') // O Vite vai fazer o proxy pro backend depois
      if (resposta.ok) {
        const dados = await resposta.json()
        autenticado.value = true
        usuario.value = dados.usuario
        return true
      }
    } catch (erro) {
      console.error('Sessão caiu ou API fora do ar')
    }
    
    autenticado.value = false
    usuario.value = null
    return false
  }

  // Pede o código OTP pro email
  async function pedirCodigo(email: string, tokenAntiRobo: string) {
    const resposta = await fetch('/api/sessao/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requisicao': '1' },
      body: JSON.stringify({ email, tokenAntiRobo })
    })
    
    if (!resposta.ok) throw new Error('Não deu pra pedir o código')
    return true
  }

  // Manda o código pra logar de vez
  async function entrarComCodigo(email: string, codigo: string) {
    const resposta = await fetch('/api/sessao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requisicao': '1' },
      body: JSON.stringify({ email, codigo })
    })
    
    if (!resposta.ok) {
      const erro = await resposta.json()
      throw new Error(erro.mensagem || 'Código errado ou vencido')
    }
    
    const dados = await resposta.json()
    autenticado.value = true
    usuario.value = dados.usuario
    return true
  }

  // Mata a sessão
  async function sair() {
    await fetch('/api/sessao', { method: 'DELETE', headers: { 'X-Requisicao': '1' } })
    autenticado.value = false
    usuario.value = null
  }

  return { autenticado, usuario, verificarSessao, pedirCodigo, entrarComCodigo, sair }
})
