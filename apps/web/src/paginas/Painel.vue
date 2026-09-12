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
  <v-container>
    <v-card class="pa-6 mt-8" variant="outlined">
      <h1 class="text-h4 mb-4">Painel de Operações</h1>
      <p>Você tá logado como <strong>{{ sessao.usuario?.email }}</strong></p>
      
      <v-btn color="error" class="mt-4" @click="sairDoApp">Sair</v-btn>
    </v-card>
  </v-container>
</template>
