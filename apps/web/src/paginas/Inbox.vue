<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CampoTexto, ChipCanal } from '@assineai/ui'

const roteador = useRouter()
const busca = ref('')
const conversaAtiva = ref<any>(null)

const conversas = ref<any[]>([])
const mensagens = ref<any[]>([])
const novaMensagem = ref('')
const carregando = ref(false)

async function carregarConversas() {
  const res = await fetch('/api/inbox/conversas')
  if (res.ok) {
    conversas.value = await res.json()
  }
}

onMounted(() => {
  carregarConversas()
})

watch(conversaAtiva, async (novaConvId) => {
  if (!novaConvId) {
    mensagens.value = []
    return
  }
  const res = await fetch(`/api/inbox/conversas/${novaConvId.id}/mensagens`)
  if (res.ok) {
    mensagens.value = await res.json()
  }
})

async function enviar() {
  if (!novaMensagem.value || !conversaAtiva.value) return
  const texto = novaMensagem.value
  novaMensagem.value = ''
  
  // Otimista
  mensagens.value.push({
    id: Date.now().toString(),
    texto,
    enviadaPorNos: true,
    hora: 'Enviando...'
  })

  carregando.value = true
  try {
    await fetch(`/api/inbox/conversas/${conversaAtiva.value.id}/mensagens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requisicao': '1' },
      body: JSON.stringify({ texto })
    })
    // Atualiza
    const res = await fetch(`/api/inbox/conversas/${conversaAtiva.value.id}/mensagens`)
    if (res.ok) mensagens.value = await res.json()
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <v-container fluid class="h-100 pa-0">
    <v-row no-gutters class="h-100">
      
      <!-- Lista de Conversas -->
      <v-col cols="12" md="4" class="h-100 border-e overflow-y-auto bg-surface">
        <div class="pa-4 border-b d-flex align-center justify-space-between">
          <h1 class="text-h5 font-weight-black">Inbox</h1>
        </div>
        <div class="pa-4">
          <CampoTexto v-model="busca" rotulo="" placeholder="Buscar conversa..." hide-details prepend-inner-icon="mdi-magnify" />
        </div>
        
        <v-list lines="two" bg-color="transparent" class="pa-0">
          <v-list-item
            v-for="conv in conversas"
            :key="conv.id"
            :active="conversaAtiva?.id === conv.id"
            color="primary"
            class="border-b py-3 cursor-pointer"
            @click="conversaAtiva = conv"
          >
            <v-list-item-title class="font-weight-bold d-flex justify-space-between mb-1">
              Contato {{ conv.contatoId }}
            </v-list-item-title>
            
            <div class="mt-2 d-flex justify-space-between align-center">
              <v-chip size="x-small" :color="conv.estado === 'aberta' ? 'error' : 'warning'">{{ conv.estado }}</v-chip>
            </div>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Chat Ativo -->
      <v-col cols="12" md="8" class="h-100 d-flex flex-column bg-surface-variant">
        <template v-if="conversaAtiva">
          <!-- Header -->
          <div class="pa-4 border-b bg-surface d-flex justify-space-between align-center">
            <div>
              <h2 class="text-h6 font-weight-bold">Contato {{ conversaAtiva.contatoId }}</h2>
            </div>
            <v-btn variant="outlined" size="small">Resolver</v-btn>
          </div>

          <!-- Mensagens -->
          <div class="flex-grow-1 overflow-y-auto pa-6 d-flex flex-column gap-4">
            <div 
              v-for="msg in mensagens" 
              :key="msg.id"
              class="d-flex flex-column"
              :class="msg.enviadaPorNos ? 'align-end' : 'align-start'"
            >
              <div 
                class="pa-3 rounded-lg text-body-1"
                :class="msg.enviadaPorNos ? 'bg-primary text-white' : 'bg-surface border'"
                style="max-width: 80%"
              >
                {{ msg.texto }}
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="pa-4 bg-surface border-t">
            <div class="d-flex gap-2">
              <v-text-field
                v-model="novaMensagem"
                variant="outlined"
                density="comfortable"
                hide-details
                placeholder="Digite sua resposta..."
                :disabled="carregando"
                @keyup.enter="enviar"
              ></v-text-field>
              <v-btn color="primary" height="48" :loading="carregando" @click="enviar">
                <v-icon icon="mdi-send"></v-icon>
              </v-btn>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="h-100 d-flex flex-column justify-center align-center opacity-60">
          <v-icon icon="mdi-forum-outline" size="64" class="mb-4"></v-icon>
          <p class="text-h6">Selecione uma conversa para começar</p>
        </div>
      </v-col>

    </v-row>
  </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
