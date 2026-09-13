<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const roteador = useRouter()

const mensagens = ref([
  { id: 1, autor: 'bot', texto: 'Olá! Sou o seu Copiloto Jurídico. Qual documento você quer criar hoje?' },
  { id: 2, autor: 'user', texto: 'Quero um contrato de honorários.' },
  { id: 3, autor: 'bot', texto: 'Perfeito. Para começarmos, qual o nome do seu cliente?' }
])

const input = ref('')
const carregando = ref(false)

function enviar() {
  if (!input.value) return
  
  mensagens.value.push({
    id: Date.now(),
    autor: 'user',
    texto: input.value
  })
  
  carregando.value = true
  const textoEnviado = input.value
  input.value = ''
  
  // Mock da resposta
  setTimeout(() => {
    carregando.value = false
    if (textoEnviado.includes('João')) {
      mensagens.value.push({ id: Date.now(), autor: 'bot', texto: 'Entendi, João. E qual o valor total dos honorários?' })
    } else {
      mensagens.value.push({ id: Date.now(), autor: 'bot', texto: 'Anotado. Clica ali embaixo para gerar o PDF e irmos para a tela de envio!' })
    }
  }, 1000)
}

function gerar() {
  carregando.value = true
  // Mock de redirecionar pro envelope
  setTimeout(() => {
    roteador.push({ name: 'novo-envelope' })
  }, 1500)
}
</script>

<template>
  <v-container fluid class="h-100 pa-0">
    <div class="d-flex flex-column h-100 bg-surface-variant">
      
      <!-- Cabeçalho -->
      <div class="pa-4 bg-surface border-b d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h6 font-weight-black">Copiloto de Documentos</h1>
          <span class="text-caption text-medium-emphasis">Assistente Jurídico com IA</span>
        </div>
        <v-btn color="primary" @click="gerar" :loading="carregando">Gerar Envelope</v-btn>
      </div>

      <!-- Chat -->
      <div class="flex-grow-1 overflow-y-auto pa-6 d-flex flex-column gap-4">
        <div 
          v-for="msg in mensagens" 
          :key="msg.id"
          class="d-flex flex-column"
          :class="msg.autor === 'user' ? 'align-end' : 'align-start'"
        >
          <div 
            class="pa-4 rounded-lg text-body-1"
            :class="msg.autor === 'user' ? 'bg-primary text-white' : 'bg-surface border'"
            style="max-width: 75%"
          >
            {{ msg.texto }}
          </div>
        </div>
        <div v-if="carregando && mensagens[mensagens.length-1].autor === 'user'" class="text-caption text-medium-emphasis">Copiloto digitando...</div>
      </div>

      <!-- Input -->
      <div class="pa-4 bg-surface border-t">
        <div class="d-flex gap-2 mx-auto" style="max-width: 800px;">
          <v-text-field
            v-model="input"
            variant="outlined"
            density="comfortable"
            hide-details
            placeholder="Responda o Copiloto..."
            @keyup.enter="enviar"
          ></v-text-field>
          <v-btn color="primary" height="48" @click="enviar">
            <v-icon icon="mdi-send"></v-icon>
          </v-btn>
        </div>
      </div>

    </div>
  </v-container>
</template>
