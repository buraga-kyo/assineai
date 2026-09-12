<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { GrupoAtributos, ChipCanal } from '@assineai/ui'

const rota = useRoute()
const codigo = rota.params.codigo as string

const carregandoHash = ref(false)
const resultadoHash = ref<'aguardando' | 'bateu' | 'nao-bateu'>('aguardando')

// Puxa do backend de mentira
const dadosEnvelope = ref({
  titulo: 'Contrato de Arrendamento Sítio 2',
  status: 'concluido',
  dataCriacao: '12/09/2026',
  hashOficial: '8f4e2b1a9c...', // Aqui viria o SHA-256 verdadeiro do DB
  signatarios: [
    { nome: 'João da Silva', canal: 'whatsapp', dataHora: '12/09/2026 às 11:30' },
    { nome: 'Clínica Sol', canal: 'email', dataHora: '12/09/2026 às 14:15' }
  ]
})

// Calcula o SHA-256 do arquivo local sem subir pro servidor
async function conferirArquivoLocal(evento: Event) {
  const input = evento.target as HTMLInputElement
  const arquivo = input.files?.[0]
  
  if (!arquivo) return
  
  carregandoHash.value = true
  resultadoHash.value = 'aguardando'
  
  try {
    const arrayBuffer = await arquivo.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const arrayBytes = Array.from(new Uint8Array(hashBuffer))
    const hashHex = arrayBytes.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Na vida real a gente compara com o hashExato (sem reticências)
    // Aqui pro mock vamos só fingir sucesso sempre que for um PDF
    resultadoHash.value = (arquivo.type === 'application/pdf') ? 'bateu' : 'nao-bateu'
    console.log('Hash Calculado:', hashHex)
  } catch (erro) {
    resultadoHash.value = 'nao-bateu'
  } finally {
    carregandoHash.value = false
  }
}

function baixarProvaOts() {
  // Chamada de mentira pro download do .ots
  console.log('Baixando prova do OpenTimestamps...')
}
</script>

<template>
  <v-app class="bg-surface">
    <!-- Barra simples sem muita frescura pq é pública -->
    <v-app-bar flat color="surface-variant">
      <v-toolbar-title class="font-weight-bold">AssineAi | Verificação</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="px-4 py-8" style="max-width: 800px; margin: 0 auto;">
        
        <v-card class="pa-6 mb-6 text-center" variant="outlined">
          <v-icon icon="mdi-shield-check" color="success" size="64" class="mb-2"></v-icon>
          <h1 class="text-h4 font-weight-black mb-2">Documento Autêntico</h1>
          <p class="text-body-1 text-medium-emphasis">
            Esse documento foi assinado na plataforma e a validade dele pode ser comprovada matematicamente.
          </p>
        </v-card>

        <v-row>
          <v-col cols="12" md="7">
            <v-card class="pa-6 h-100" variant="outlined">
              <h2 class="text-h6 mb-4">Dados do Documento</h2>
              <GrupoAtributos titulo="Código do Envelope" :valor="codigo" />
              <GrupoAtributos titulo="Título" :valor="dadosEnvelope.titulo" />
              <GrupoAtributos titulo="Data de Criação" :valor="dadosEnvelope.dataCriacao" />
              
              <div class="mt-4 pa-3 bg-surface-variant rounded">
                <div class="text-caption text-medium-emphasis mb-1">Hash SHA-256 (Identidade única do arquivo)</div>
                <div class="d-flex align-center justify-space-between">
                  <span class="text-mono font-weight-bold text-truncate">{{ dadosEnvelope.hashOficial }}</span>
                  <v-btn icon="mdi-content-copy" size="small" variant="text"></v-btn>
                </div>
              </div>

              <h2 class="text-h6 mt-6 mb-4">Quem Assinou</h2>
              <v-list lines="two" bg-color="transparent" class="pa-0">
                <v-list-item v-for="(sig, i) in dadosEnvelope.signatarios" :key="i" class="px-0 border-b">
                  <v-list-item-title class="font-weight-bold">{{ sig.nome }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <ChipCanal :canal="sig.canal as any" class="mr-2" />
                    {{ sig.dataHora }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <v-card class="pa-6 h-100 bg-surface-variant" variant="flat">
              <h2 class="text-h6 mb-4">Confira você mesmo</h2>
              
              <p class="text-body-2 mb-4">
                Tem o PDF aí com você? Sobe ele aqui e a gente calcula o Hash na hora, sem mandar pro nosso servidor. Se bater, é porque o arquivo não foi adulterado.
              </p>

              <v-file-input
                accept="application/pdf"
                label="Selecione o seu PDF local"
                variant="outlined"
                prepend-icon=""
                prepend-inner-icon="mdi-file-pdf-box"
                :loading="carregandoHash"
                @change="conferirArquivoLocal"
              ></v-file-input>

              <div v-if="resultadoHash === 'bateu'" class="pa-4 bg-success text-on-success rounded text-center mt-2">
                <v-icon icon="mdi-check-decagram" class="mb-2"></v-icon><br>
                O arquivo é original e não foi adulterado!
              </div>

              <div v-if="resultadoHash === 'nao-bateu'" class="pa-4 bg-error text-on-error rounded text-center mt-2">
                <v-icon icon="mdi-alert-octagon" class="mb-2"></v-icon><br>
                Esse arquivo foi alterado ou não é o original.
              </div>

              <v-divider class="my-6"></v-divider>

              <h3 class="text-subtitle-1 font-weight-bold mb-2">Prova de Anterioridade</h3>
              <p class="text-caption text-medium-emphasis mb-4">
                Esse documento foi ancorado na Blockchain do Bitcoin. Isso prova que ele já existia nessa data.
              </p>
              <v-btn block variant="outlined" prepend-icon="mdi-bitcoin" @click="baixarProvaOts">
                Baixar Prova (.ots)
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.text-mono {
  font-family: var(--v-theme-typography-mono, monospace);
}
</style>
