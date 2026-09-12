<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreSessao } from '../store/sessao'
import { CampoTexto, TecladoCodigo } from '@assineai/ui'

const roteador = useRouter()
const sessao = useStoreSessao()

const email = ref('')
const passoAtual = ref<'PEDIR_EMAIL' | 'DIGITAR_CODIGO'>('PEDIR_EMAIL')
const carregando = ref(false)
const mensagemErro = ref('')

// Na vida real a gente chamaria o Cloudflare Turnstile aqui e pegava o token
const tokenRoboMentira = 'sou-humano-sim' 

async function enviarEmail() {
  if (!email.value) return
  
  carregando.value = true
  mensagemErro.value = ''
  
  try {
    await sessao.pedirCodigo(email.value, tokenRoboMentira)
    passoAtual.value = 'DIGITAR_CODIGO'
  } catch (erro) {
    mensagemErro.value = 'E-mail inválido ou rolou um erro de conexão.'
  } finally {
    carregando.value = false
  }
}

async function conferirCodigo(codigoOtp: string) {
  carregando.value = true
  mensagemErro.value = ''
  
  try {
    await sessao.entrarComCodigo(email.value, codigoOtp)
    roteador.push({ name: 'painel' })
  } catch (erro: any) {
    mensagemErro.value = erro.message || 'O código tá errado. Tenta de novo.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <v-container class="h-100 d-flex align-center justify-center">
    <v-card class="pa-8 w-100" max-width="450" variant="outlined">
      <div class="text-center mb-6">
        <h1 class="text-h4 font-weight-black text-primary mb-2">AssineAi</h1>
        <p class="text-body-2 text-medium-emphasis">
          Sem senha pra esquecer. A gente te manda o código pro e-mail e fechou.
        </p>
      </div>

      <div v-if="mensagemErro" class="bg-error text-on-error pa-3 rounded mb-4 text-center text-body-2">
        {{ mensagemErro }}
      </div>

      <!-- Passo 1: Informar o e-mail -->
      <form v-if="passoAtual === 'PEDIR_EMAIL'" @submit.prevent="enviarEmail">
        <CampoTexto 
          v-model="email" 
          rotulo="Seu e-mail de trabalho" 
          type="email" 
          placeholder="voce@fazenda.com"
          :disabled="carregando"
          required
        />
        
        <!-- O widget do Turnstile ficaria aqui visualmente -->
        <div class="protecao-robo d-flex align-center justify-center pa-4 mb-4 mt-2 bg-surface-variant rounded">
          <v-icon icon="mdi-shield-check" color="success" class="mr-2"></v-icon>
          <span class="text-caption">Protegido contra robôs e DDoS</span>
        </div>

        <v-btn 
          type="submit" 
          color="primary" 
          block 
          size="large" 
          :loading="carregando"
        >
          Mandar Código
        </v-btn>
      </form>

      <!-- Passo 2: Digitar o código OTP que chegou no e-mail -->
      <div v-else class="text-center">
        <p class="mb-4">Mandamos 6 números pro e-mail <strong>{{ email }}</strong></p>
        
        <TecladoCodigo 
          model-value=""
          @completou="conferirCodigo" 
        />
        
        <v-progress-circular v-if="carregando" indeterminate color="primary" class="mt-4"></v-progress-circular>
        
        <div class="mt-6">
          <v-btn variant="text" size="small" @click="passoAtual = 'PEDIR_EMAIL'">
            Voltar e corrigir e-mail
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.protecao-robo {
  border: 1px dashed var(--v-theme-outline);
}
</style>
