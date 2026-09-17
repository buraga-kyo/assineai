<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PassoAPasso, CampoTexto, CampoSelecao } from '@assineai/ui'
import { useStoreCriacaoEnvelope } from '../store/criacaoEnvelope'

const roteador = useRouter()
const store = useStoreCriacaoEnvelope()
const passos = ['Documento', 'Assinantes', 'Campos', 'Pronto']

// Variavel temporaria pro signatario novo
const novoNome = ref('')
const novoEmail = ref('')
const novoCanal = ref('email')

function adicionarSignatario() {
  if (novoNome.value && novoEmail.value) {
    store.signatarios.push({
      nome: novoNome.value,
      email: novoEmail.value,
      canal: novoCanal.value
    })
    novoNome.value = ''
    novoEmail.value = ''
    novoCanal.value = 'email'
  }
}

function removerSignatario(indice: number) {
  store.signatarios.splice(indice, 1)
}

function subiuArquivo(evento: Event) {
  const input = evento.target as HTMLInputElement
  if (input.files && input.files[0]) {
    store.documento = input.files[0]
  }
}

async function enviar() {
  try {
    await store.dispararEnvelope(store.documento?.name || 'Novo Contrato')
    roteador.push({ name: 'envelopes' })
  } catch (e) {
    alert('Erro ao criar envelope: ' + e)
  }
}
</script>

<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="roteador.back()">Cancelar Criação</v-btn>
    
    <h1 class="text-h4 font-weight-black mb-6">Criar Envelope</h1>

    <v-card class="pa-4 mb-6" variant="outlined">
      <PassoAPasso :passos="passos" :passo-atual="store.passoAtual" />
    </v-card>

    <v-card class="pa-6" variant="outlined">
      <!-- PASSO 0: Documento -->
      <div v-if="store.passoAtual === 0">
        <h2 class="text-h6 mb-4">Escolha o PDF</h2>
        
        <v-file-input
          accept="application/pdf"
          label="Clique para subir o documento"
          variant="outlined"
          prepend-icon=""
          prepend-inner-icon="mdi-file-pdf-box"
          @change="subiuArquivo"
        ></v-file-input>
        
        <div v-if="store.documento" class="text-success mt-2">
          Arquivo pronto: {{ store.documento.name }}
        </div>
      </div>

      <!-- PASSO 1: Assinantes -->
      <div v-if="store.passoAtual === 1">
        <h2 class="text-h6 mb-4">Quem vai assinar?</h2>
        
        <div class="bg-surface-variant pa-4 rounded mb-6">
          <v-row align="center">
            <v-col cols="12" md="4"><CampoTexto v-model="novoNome" rotulo="Nome" placeholder="João da Silva" hide-details /></v-col>
            <v-col cols="12" md="4"><CampoTexto v-model="novoEmail" rotulo="Contato" placeholder="Email ou Telefone" hide-details /></v-col>
            <v-col cols="12" md="3"><CampoSelecao v-model="novoCanal" rotulo="Canal" :items="['email', 'whatsapp', 'slack', 'telegram']" hide-details /></v-col>
            <v-col cols="12" md="1">
              <v-btn color="primary" block @click="adicionarSignatario"><v-icon>mdi-plus</v-icon></v-btn>
            </v-col>
          </v-row>
        </div>

        <v-list v-if="store.signatarios.length > 0" lines="two">
          <v-list-item v-for="(sig, i) in store.signatarios" :key="i" class="border-b">
            <v-list-item-title class="font-weight-bold">{{ sig.nome }}</v-list-item-title>
            <v-list-item-subtitle>{{ sig.canal }} - {{ sig.email }}</v-list-item-subtitle>
            <template #append>
              <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="removerSignatario(i)"></v-btn>
            </template>
          </v-list-item>
        </v-list>
        <p v-else class="text-center text-medium-emphasis my-4">Nenhum signatário adicionado ainda.</p>
      </div>

      <!-- PASSO 2: Campos (Carimbo) -->
      <div v-if="store.passoAtual === 2">
        <h2 class="text-h6 mb-4">Onde vai o carimbo?</h2>
        
        <v-radio-group v-model="store.configCarimbo.tipo">
          <v-radio label="Na última página (Automático)" value="ultima_pagina"></v-radio>
          <v-radio label="Escolher a posição exata (Manual)" value="marcacao_manual"></v-radio>
        </v-radio-group>
        
        <div v-if="store.configCarimbo.tipo === 'marcacao_manual'" class="bg-surface-variant pa-8 text-center rounded">
          <v-icon icon="mdi-cursor-move" size="48" class="mb-2 opacity-50"></v-icon>
          <p>O pdf.js renderizaria o documento aqui pra você arrastar e soltar o carimbo.</p>
          <p class="text-caption mt-2">Vamos gravar a proporção (ex: X: 0.8, Y: 0.95) pra não quebrar com resoluções diferentes.</p>
        </div>
      </div>

      <!-- PASSO 3: Revisar e Enviar -->
      <div v-if="store.passoAtual === 3">
        <h2 class="text-h6 mb-4">Pronto pra disparar?</h2>
        
        <CampoTexto 
          v-model="store.configEnvio.mensagem" 
          rotulo="Mensagem no e-mail/zap" 
          class="mb-4"
        />
        
        <v-checkbox 
          v-model="store.configEnvio.exigirCodigo"
          label="Exigir que o signatário digite um código enviado pro e-mail na hora de assinar"
          color="primary"
          hide-details
        ></v-checkbox>
      </div>

      <!-- BOTÕES DE NAVEGAÇÃO -->
      <div class="d-flex justify-space-between mt-8 pt-4 border-t">
        <v-btn variant="outlined" :disabled="store.passoAtual === 0" @click="store.passoAnterior">Voltar</v-btn>
        <v-btn v-if="store.passoAtual < 3" color="primary" @click="store.proximoPasso">Avançar</v-btn>
        <v-btn v-else color="success" prepend-icon="mdi-send" @click="enviar">Enviar pra Assinatura</v-btn>
      </div>
    </v-card>
  </v-container>
</template>
