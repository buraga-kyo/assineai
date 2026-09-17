<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const roteador = useRouter()

const mensagens = ref([
  { id: 1, autor: 'bot', texto: 'Olá! Sou o seu Assistente Jurídico. Para iniciar, me fale o modelo que você quer preencher. Exemplo: advocacia-honorarios, musica-split-sheet.' },
])

const input = ref('')
const carregando = ref(false)
const slugAtual = ref('advocacia-honorarios')
const variaveisPreenchidas = ref<Record<string, string>>({})
const prontoParaGerar = ref(false)

async function enviar() {
  if (!input.value) return
  
  mensagens.value.push({
    id: Date.now(),
    autor: 'user',
    texto: input.value
  })
  
  carregando.value = true
  const textoEnviado = input.value
  input.value = ''
  
  try {
    const res = await fetch('/api/assistente/entrevista', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slugMinuta: slugAtual.value,
        mensagem: textoEnviado,
        variaveisJaPreenchidas: variaveisPreenchidas.value
      })
    })

    if (res.ok) {
      const data = await res.json()
      variaveisPreenchidas.value = data.variaveis
      prontoParaGerar.value = data.pronto
      mensagens.value.push({ id: Date.now(), autor: 'bot', texto: data.resposta })
    } else {
      mensagens.value.push({ id: Date.now(), autor: 'bot', texto: 'Desculpe, ocorreu um erro na comunicação.' })
    }
  } catch (e) {
    mensagens.value.push({ id: Date.now(), autor: 'bot', texto: 'Desculpe, a conexão falhou.' })
  } finally {
    carregando.value = false
  }
}

async function gerar() {
  carregando.value = true
  try {
    const res = await fetch('/api/assistente/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slugMinuta: slugAtual.value,
        variaveis: variaveisPreenchidas.value
      })
    })

    if (res.ok) {
      const data = await res.json()
      roteador.push({ name: 'novo-envelope' }) // Na vida real redirecionaria pro /envelopes/:id
    }
  } catch (e) {
    alert('Falha ao gerar o documento')
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <v-container fluid class="h-100 pa-0">
    <div class="d-flex flex-column h-100 bg-surface-variant">
      
      <!-- Cabeçalho -->
      <div class="pa-4 bg-surface border-b d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h6 font-weight-black">Assistente de Documentos</h1>
          <span class="text-caption text-medium-emphasis">Assistente Jurídico com Assistente</span>
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
        <div v-if="carregando && mensagens[mensagens.length-1]?.autor === 'user'" class="text-caption text-medium-emphasis">Assistente digitando...</div>
      </div>

      <!-- Input -->
      <div class="pa-4 bg-surface border-t">
        <div class="d-flex gap-2 mx-auto" style="max-width: 800px;">
          <v-text-field
            v-model="input"
            variant="outlined"
            density="comfortable"
            hide-details
            placeholder="Responda o Assistente..."
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
