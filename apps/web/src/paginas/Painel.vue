<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStoreSessao } from '../store/sessao'

const sessao = useStoreSessao()
const roteador = useRouter()

async function sairDoApp() {
  await sessao.sair()
  roteador.push({ name: 'entrar' })
}
</script>

<template>
  <v-container class="h-100 d-flex flex-column align-center justify-center">
    <div class="w-100 mb-6 d-flex justify-space-between align-center">
      <h1 class="text-h3 font-weight-black text-primary text-uppercase" style="letter-spacing: -2px;">AssineAI <span class="text-accent">NEON</span></h1>
      <v-btn color="error" variant="outlined" class="text-uppercase font-weight-bold" @click="sairDoApp">Encerrar Sessão</v-btn>
    </div>

    <v-row class="w-100">
      <!-- Card principal com a vibração Roça Neon -->
      <v-col cols="12" md="8">
        <v-card class="pa-8 border-md border-primary" style="background-color: var(--v-theme-surface);">
          <h2 class="text-h4 mb-2 text-primary font-weight-bold">Bem-vindo, Operador.</h2>
          <p class="text-h6 text-medium-emphasis mb-8">Sessão ativa: <strong class="text-primary">{{ sessao.usuario?.email || 'admin@demo.com' }}</strong></p>
          
          <div class="d-flex gap-4">
            <v-btn size="x-large" color="primary" class="text-accent font-weight-black" prepend-icon="mdi-file-document-plus" :to="{ name: 'envelopes' }">
              Criar Novo Envelope
            </v-btn>
            <v-btn size="x-large" color="accent" class="text-primary font-weight-black ml-4" prepend-icon="mdi-format-list-bulleted" :to="{ name: 'envelopes' }">
              Ver Meus Envelopes
            </v-btn>
          </div>
        </v-card>
      </v-col>
      
      <!-- Card secundário lateral (Status) -->
      <v-col cols="12" md="4">
        <v-card class="pa-6 h-100 bg-primary text-accent d-flex flex-column justify-center align-center border-md border-accent">
          <v-icon icon="mdi-shield-check" size="64" class="mb-4"></v-icon>
          <h3 class="text-h5 font-weight-bold text-center">Status do Sistema</h3>
          <p class="text-center mt-2 opacity-80">Conexão Segura e Operante.</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
