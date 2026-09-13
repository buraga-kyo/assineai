<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CampoTexto } from '@assineai/ui'

const roteador = useRouter()

const obras = ref([
  { id: '1', titulo: 'Minha Música Nova', codigo: 'OBR-1234', data: '12/09/2026', ancorado: true },
  { id: '2', titulo: 'Letra Original V2', codigo: 'OBR-9999', data: '10/09/2026', ancorado: false }
])

const modalAberto = ref(false)
const novaObra = ref({ titulo: '', arquivo: null as File | null })
const salvando = ref(false)

async function salvarObra() {
  salvando.value = true
  setTimeout(() => {
    salvando.value = false
    modalAberto.value = false
    obras.value.unshift({
      id: Date.now().toString(),
      titulo: novaObra.value.titulo,
      codigo: 'OBR-' + Math.floor(Math.random() * 10000),
      data: 'Hoje',
      ancorado: false
    })
    novaObra.value = { titulo: '', arquivo: null }
  }, 1000)
}
</script>

<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6 mt-4">
      <h1 class="text-h4 font-weight-black">Registro de Obras</h1>
      <v-btn color="primary" @click="modalAberto = true">Registrar Obra</v-btn>
    </div>

    <v-card class="pa-4 mb-6 bg-surface-variant" variant="flat">
      <p class="text-body-2 text-medium-emphasis">
        Suba o áudio, a letra ou a partitura. Nós calculamos o hash e ancoramos na Blockchain do Bitcoin gratuitamente para gerar a Prova de Anterioridade.
      </p>
    </v-card>

    <div v-for="obra in obras" :key="obra.id" class="mb-4">
      <v-card variant="outlined" class="pa-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h3 class="text-h6 font-weight-bold d-flex align-center gap-2">
              {{ obra.titulo }}
              <v-chip size="x-small" :color="obra.ancorado ? 'success' : 'warning'">
                {{ obra.ancorado ? 'Ancorado' : 'Processando...' }}
              </v-chip>
            </h3>
            <div class="text-caption text-medium-emphasis mt-1">
              Código: {{ obra.codigo }} • Criado em: {{ obra.data }}
            </div>
          </div>
          <div>
            <v-btn variant="text" prepend-icon="mdi-download">Certificado PDF</v-btn>
            <v-btn variant="text" color="primary" prepend-icon="mdi-link" :to="`/o/${obra.codigo}`">Ver Página</v-btn>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Modal Novo -->
    <v-dialog v-model="modalAberto" max-width="500">
      <v-card class="pa-6">
        <h2 class="text-h5 font-weight-bold mb-4">Nova Obra</h2>
        
        <CampoTexto v-model="novaObra.titulo" rotulo="Título da Obra" class="mb-4" />
        
        <v-file-input
          v-model="novaObra.arquivo"
          label="Arquivo (MP3, WAV, PDF, TXT)"
          variant="outlined"
          prepend-icon=""
          prepend-inner-icon="mdi-upload"
          class="mb-6"
        ></v-file-input>

        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="modalAberto = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="salvando" @click="salvarObra" :disabled="!novaObra.titulo">Gerar Hash</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>
