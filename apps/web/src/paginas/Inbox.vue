<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CampoTexto, ChipCanal } from '@assineai/ui'

const roteador = useRouter()
const busca = ref('')
const conversaAtiva = ref<string | null>(null)

// Mock
const conversas = ref([
  { id: '1', contato: 'João da Silva', canal: 'whatsapp', ultimaMensagem: 'ACEITO 123456', estado: 'pendente', data: '10:30' },
  { id: '2', contato: 'Clínica Sol', canal: 'telegram', ultimaMensagem: 'Oi, tenho uma dúvida sobre o contrato', estado: 'aberta', data: 'Ontem' }
])

const mensagens = ref([
  { id: '1', texto: 'Aqui está o seu documento para assinatura.', enviadaPorNos: true, hora: '10:00' },
  { id: '2', texto: 'ACEITO 123456', enviadaPorNos: false, hora: '10:30' }
])

const novaMensagem = ref('')

function enviar() {
  if (!novaMensagem.value) return
  mensagens.value.push({
    id: Date.now().toString(),
    texto: novaMensagem.value,
    enviadaPorNos: true,
    hora: 'Agora'
  })
  novaMensagem.value = ''
}
</script>

<template>
  <v-container fluid class="h-100 pa-0">
    <v-row no-gutters class="h-100">
      
      <!-- Lista de Conversas -->
      <v-col cols="12" md="4" class="h-100 border-e overflow-y-auto bg-surface">
        <div class="pa-4 border-b d-flex align-center justify-space-between">
          <h1 class="text-h5 font-weight-black">Inbox</h1>
          <v-chip size="small" color="primary">2 não lidas</v-chip>
        </div>
        <div class="pa-4">
          <CampoTexto v-model="busca" rotulo="" placeholder="Buscar conversa..." hide-details prepend-inner-icon="mdi-magnify" />
        </div>
        
        <v-list lines="two" bg-color="transparent" class="pa-0">
          <v-list-item
            v-for="conv in conversas"
            :key="conv.id"
            :active="conversaAtiva === conv.id"
            color="primary"
            class="border-b py-3 cursor-pointer"
            @click="conversaAtiva = conv.id"
          >
            <v-list-item-title class="font-weight-bold d-flex justify-space-between mb-1">
              {{ conv.contato }}
              <span class="text-caption text-medium-emphasis">{{ conv.data }}</span>
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-2">{{ conv.ultimaMensagem }}</v-list-item-subtitle>
            
            <div class="mt-2 d-flex justify-space-between align-center">
              <ChipCanal :canal="conv.canal as any" />
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
              <h2 class="text-h6 font-weight-bold">João da Silva</h2>
              <span class="text-caption text-medium-emphasis">via WhatsApp</span>
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
              <div class="text-caption text-medium-emphasis mt-1">{{ msg.hora }}</div>
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
                @keyup.enter="enviar"
              ></v-text-field>
              <v-btn color="primary" height="48" @click="enviar">
                <v-icon icon="mdi-send"></v-icon>
              </v-btn>
            </div>
            <div class="text-caption text-medium-emphasis mt-2 text-center">
              A resposta será enviada direto para o WhatsApp do contato.
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
