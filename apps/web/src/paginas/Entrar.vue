<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreSessao } from '../store/sessao'
import { TecladoCodigo } from '@assineai/ui'

const roteador = useRouter()
const sessao = useStoreSessao()

const email = ref('')
const senha = ref('')
const carregando = ref(false)
const mensagemErro = ref('')

async function logarComSenha() {
  if (!email.value || !senha.value) return
  
  carregando.value = true
  mensagemErro.value = ''
  
  try {
    const resposta = await fetch('/api/sessao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requisicao': '1' },
      body: JSON.stringify({ email: email.value, senha: senha.value })
    })

    if (resposta.ok) {
      roteador.push({ name: 'envelopes' })
    } else {
      const erroJson = await resposta.json()
      mensagemErro.value = erroJson.erro?.mensagem || 'Senha ou e-mail inválidos.'
    }
  } catch (erro: any) {
    mensagemErro.value = 'E-mail inválido ou rolou um erro de conexão.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="signatario" style="min-height: 100vh; display: grid; place-items: center;">
    <main class="cartao-assinar" style="width: 100%; max-width: 450px;">
      
      <div class="text-center mb-6" style="margin-bottom: 24px;">
        <h1 style="font-family: var(--fonte-titulo); color: var(--primaria); text-transform: uppercase; font-size: 32px; letter-spacing: var(--espaco-titulo); margin-bottom: 8px;">AssineAi</h1>
        <p class="suave">
          Faça login para gerenciar seus documentos e assinaturas.
        </p>
      </div>

      <div v-if="mensagemErro" style="background-color: var(--erro); color: var(--sobre-erro); padding: 12px; border-radius: var(--raio); margin-bottom: 16px; text-align: center; font-weight: bold;">
        {{ mensagemErro }}
      </div>

      <form style="display: flex; flex-direction: column; gap: 16px;" @submit.prevent="logarComSenha">
        <div>
          <label class="suave" style="display: block; margin-bottom: 4px; font-size: 14px;">E-mail de Trabalho</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="bragaus@outlook.com"
            :disabled="carregando"
            required
            style="width: 100%; padding: 12px; background: var(--fundo); border: 2px solid var(--linha); border-radius: var(--raio); color: var(--texto); outline: none;"
          />
        </div>

        <div>
          <label class="suave" style="display: block; margin-bottom: 4px; font-size: 14px;">Senha Segura</label>
          <input 
            v-model="senha" 
            type="password" 
            placeholder="••••••••"
            :disabled="carregando"
            required
            minlength="8"
            style="width: 100%; padding: 12px; background: var(--fundo); border: 2px solid var(--linha); border-radius: var(--raio); color: var(--texto); outline: none;"
          />
        </div>
        
        <div style="display: flex; align-items: center; justify-content: center; padding: 16px; background: var(--superficie-2); border: 1px dashed var(--linha); border-radius: var(--raio); margin-top: 8px;">
          <svg style="width: 16px; height: 16px; color: var(--selado); margin-right: 8px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          <span style="font-size: 14px;">Protegido contra robôs e DDoS</span>
        </div>

        <button 
          type="submit" 
          class="botao primario"
          :disabled="carregando"
          style="width: 100%; margin-top: 8px;"
        >
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>

        <div style="text-align: center; margin-top: 24px; font-size: 14px;">
          <span class="suave">Ainda não tem conta? </span>
          <router-link :to="{ name: 'cadastro' }" style="color: var(--primaria); font-weight: bold; text-decoration: none;">
            Criar conta
          </router-link>
        </div>
      </form>

    </main>
  </div>
</template>

<style scoped>
input:focus {
  border-color: var(--primaria) !important;
}
</style>