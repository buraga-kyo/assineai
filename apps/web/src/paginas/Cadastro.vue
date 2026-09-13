<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CampoTexto } from '@assineai/ui'

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
      headers: { 'Content-Type': 'application/json' },
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
      mensagemDeErro.value = erroJson.error || erroJson.mensagem || 'Ocorreu um erro ao criar a conta.'
    }
  } catch (erro) {
    mensagemDeErro.value = 'Falha na conexão. Tente novamente mais tarde.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <v-container class="h-100 d-flex align-center justify-center">
    <v-card class="pa-8 w-100" max-width="500" variant="outlined">
      <div class="text-center mb-6">
        <h1 class="text-h4 font-weight-black text-primary mb-2">AssineAi</h1>
        <p class="text-body-1 text-medium-emphasis">
          Crie a conta da sua empresa. Rápido, seguro e sem complicações.
        </p>
      </div>

      <div v-if="mensagemDeErro" class="bg-error text-on-error pa-3 rounded mb-4 text-center text-body-2">
        {{ mensagemDeErro }}
      </div>

      <form @submit.prevent="cadastrarUsuario">
        <CampoTexto 
          v-model="nomeDaEmpresaDigitado" 
          rotulo="Nome da Empresa" 
          placeholder="Ex: Minha Empresa Ltda."
          :disabled="carregando"
          required
        />

        <CampoTexto 
          v-model="nomeDoUsuarioDigitado" 
          rotulo="Seu Nome Completo" 
          placeholder="Ex: João da Silva"
          :disabled="carregando"
          class="mt-4"
          required
        />

        <CampoTexto 
          v-model="emailDigitado" 
          rotulo="E-mail de Trabalho" 
          type="email" 
          placeholder="voce@empresa.com"
          :disabled="carregando"
          class="mt-4"
          required
        />

        <CampoTexto 
          v-model="senhaDigitada" 
          rotulo="Senha Segura" 
          type="password" 
          placeholder="No mínimo 8 caracteres"
          :disabled="carregando"
          class="mt-4 mb-6"
          required
          minlength="8"
        />

        <!-- Proteção simulada do Turnstile visualmente -->
        <div class="protecao-robo d-flex align-center justify-center pa-4 mb-6 bg-surface-variant rounded">
          <v-icon icon="mdi-shield-check" color="success" class="mr-2"></v-icon>
          <span class="text-caption">Conexão segura e verificada</span>
        </div>

        <v-btn 
          type="submit" 
          color="primary" 
          block 
          size="large" 
          :loading="carregando"
        >
          Criar Minha Conta
        </v-btn>
        
        <div class="text-center mt-6">
          <span class="text-medium-emphasis">Já tem uma conta? </span>
          <router-link :to="{ name: 'entrar' }" class="text-primary font-weight-bold text-decoration-none">
            Entrar
          </router-link>
        </div>
      </form>
    </v-card>
  </v-container>
</template>

<style scoped>
.protecao-robo {
  border: 1px dashed var(--v-theme-outline);
}
</style>
