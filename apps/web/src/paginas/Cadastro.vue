<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const roteador = useRouter()

const nomeDaEmpresaDigitado = ref('')
const nomeDoUsuarioDigitado = ref('')
const emailDigitado = ref('')
const senhaDigitada = ref('')
const carregando = ref(false)
const mensagemDeErro = ref('')

async function cadastrarUsuario() {
  if (!nomeDaEmpresaDigitado.value || !nomeDoUsuarioDigitado.value || !emailDigitado.value || !senhaDigitada.value) {
    mensagemDeErro.value = 'Por favor, preencha todos os campos.'
    return
  }

  carregando.value = true
  mensagemDeErro.value = ''

  try {
    const resposta = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requisicao': '1' },
      body: JSON.stringify({
        nomeEmpresa: nomeDaEmpresaDigitado.value,
        nome: nomeDoUsuarioDigitado.value,
        email: emailDigitado.value,
        senha: senhaDigitada.value
      })
    })

    if (resposta.ok) {
      roteador.push({ name: 'entrar', query: { cadastroSucesso: 'true' } })
    } else {
      const erroJson = await resposta.json()
      mensagemDeErro.value = erroJson.erro?.mensagem || 'Ocorreu um erro ao criar a conta.'
    }
  } catch (erro) {
    mensagemDeErro.value = 'Falha na conexão. Tente novamente mais tarde.'
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
          Crie a conta da sua empresa. Rápido, seguro e sem complicações.
        </p>
      </div>

      <div v-if="mensagemDeErro" style="background-color: var(--erro); color: var(--sobre-erro); padding: 12px; border-radius: var(--raio); margin-bottom: 16px; text-align: center; font-weight: bold;">
        {{ mensagemDeErro }}
      </div>

      <form @submit.prevent="cadastrarUsuario" style="display: flex; flex-direction: column; gap: 16px;">
        
        <div>
          <label class="suave" style="display: block; margin-bottom: 4px; font-size: 14px;">Nome da Empresa</label>
          <input 
            type="text" 
            v-model="nomeDaEmpresaDigitado" 
            placeholder="Ex: Minha Empresa Ltda."
            :disabled="carregando"
            required
            style="width: 100%; padding: 12px; background: var(--fundo); border: 2px solid var(--linha); border-radius: var(--raio); color: var(--texto); outline: none;"
          />
        </div>

        <div>
          <label class="suave" style="display: block; margin-bottom: 4px; font-size: 14px;">Seu Nome Completo</label>
          <input 
            type="text" 
            v-model="nomeDoUsuarioDigitado" 
            placeholder="Ex: Matheus Braga"
            :disabled="carregando"
            required
            style="width: 100%; padding: 12px; background: var(--fundo); border: 2px solid var(--linha); border-radius: var(--raio); color: var(--texto); outline: none;"
          />
        </div>

        <div>
          <label class="suave" style="display: block; margin-bottom: 4px; font-size: 14px;">E-mail de Trabalho</label>
          <input 
            type="email" 
            v-model="emailDigitado" 
            placeholder="bragaus@outlook.com"
            :disabled="carregando"
            required
            style="width: 100%; padding: 12px; background: var(--fundo); border: 2px solid var(--linha); border-radius: var(--raio); color: var(--texto); outline: none;"
          />
        </div>

        <div>
          <label class="suave" style="display: block; margin-bottom: 4px; font-size: 14px;">Senha Segura</label>
          <input 
            type="password" 
            v-model="senhaDigitada" 
            placeholder="••••••••"
            :disabled="carregando"
            required
            minlength="8"
            style="width: 100%; padding: 12px; background: var(--fundo); border: 2px solid var(--linha); border-radius: var(--raio); color: var(--texto); outline: none;"
          />
        </div>

        <div style="display: flex; align-items: center; justify-content: center; padding: 16px; background: var(--superficie-2); border: 1px dashed var(--linha); border-radius: var(--raio); margin-top: 8px;">
          <svg style="width: 16px; height: 16px; color: var(--selado); margin-right: 8px;" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          <span style="font-size: 14px;">Conexão segura e verificada</span>
        </div>

        <button 
          type="submit" 
          class="botao primario"
          :disabled="carregando"
          style="width: 100%; margin-top: 8px;"
        >
          {{ carregando ? 'Criando...' : 'Criar Minha Conta' }}
        </button>
        
        <div style="text-align: center; margin-top: 24px; font-size: 14px;">
          <span class="suave">Já tem uma conta? </span>
          <router-link :to="{ name: 'entrar' }" style="color: var(--primaria); font-weight: bold; text-decoration: none;">
            Entrar
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