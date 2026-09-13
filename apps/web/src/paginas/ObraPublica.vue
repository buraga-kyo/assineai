<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { GrupoAtributos } from '@assineai/ui'

const rota = useRoute()
const codigo = rota.params.codigo as string

const obra = ref({
  titulo: 'Minha Música Nova',
  codigoPublico: codigo,
  criadoEm: '12/09/2026',
  arquivos: [
    { tipo: 'audio', hash: 'a1b2c3d4e5f6g7h8i9j0', ancorado: true }
  ]
})
</script>

<template>
  <v-app class="bg-surface">
    <v-app-bar flat color="surface-variant">
      <v-toolbar-title class="font-weight-bold">AssineAi | Registro Autoral</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="px-4 py-8" style="max-width: 800px; margin: 0 auto;">
        
        <v-card class="pa-6 mb-6 text-center" variant="outlined">
          <v-icon icon="mdi-music-clef-treble" color="primary" size="64" class="mb-2"></v-icon>
          <h1 class="text-h4 font-weight-black mb-2">Prova de Anterioridade</h1>
          <p class="text-body-1 text-medium-emphasis">
            Esta página comprova publicamente a existência do arquivo nesta data exata, utilizando criptografia e a rede Bitcoin.
          </p>
        </v-card>

        <v-card class="pa-6" variant="outlined">
          <h2 class="text-h6 mb-4">Dados da Obra</h2>
          <GrupoAtributos titulo="Título Registrado" :valor="obra.titulo" />
          <GrupoAtributos titulo="Código" :valor="obra.codigoPublico" />
          <GrupoAtributos titulo="Data de Registro" :valor="obra.criadoEm" />

          <h2 class="text-h6 mt-6 mb-4">Arquivos Ancorados</h2>
          
          <div v-for="(arq, i) in obra.arquivos" :key="i" class="pa-4 bg-surface-variant rounded mb-3">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-uppercase font-weight-bold">{{ arq.tipo }}</span>
              <v-chip size="small" :color="arq.ancorado ? 'success' : 'warning'">
                <v-icon start size="14" :icon="arq.ancorado ? 'mdi-bitcoin' : 'mdi-clock-outline'"></v-icon>
                {{ arq.ancorado ? 'Ancorado na Blockchain' : 'Processando...' }}
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mb-1">Hash SHA-256</div>
            <div class="text-mono" style="font-family: monospace; word-break: break-all;">{{ arq.hash }}</div>
          </div>

          <div class="mt-6 text-center">
            <v-btn variant="outlined" color="primary" prepend-icon="mdi-download">Baixar Certificado em PDF</v-btn>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
