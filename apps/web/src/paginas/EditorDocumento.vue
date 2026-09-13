<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CampoTexto } from '@assineai/ui'

const roteador = useRouter()

const titulo = ref('Contrato de Prestação de Serviços')
const blocos = ref([
  { id: 1, tipo: 'titulo', conteudo: 'CONTRATO DE SERVIÇOS' },
  { id: 2, tipo: 'paragrafo', conteudo: 'Pelo presente instrumento...' },
  { id: 3, tipo: 'clausula', numero: 1, titulo: 'DO OBJETO', conteudo: 'O objeto deste contrato é...' },
  { id: 4, tipo: 'assinaturas', conteudo: '' }
])

const salvando = ref(false)

function adicionarBloco(tipo: string) {
  blocos.value.push({
    id: Date.now(),
    tipo,
    conteudo: '',
    ...(tipo === 'clausula' ? { numero: blocos.value.filter(b => b.tipo === 'clausula').length + 1, titulo: '' } : {})
  })
}

function removerBloco(indice: number) {
  blocos.value.splice(indice, 1)
}

function moverBloco(indice: number, direcao: -1 | 1) {
  if (indice + direcao < 0 || indice + direcao >= blocos.value.length) return
  const temp = blocos.value[indice]!
  blocos.value[indice] = blocos.value[indice + direcao]!
  blocos.value[indice + direcao] = temp
}

async function salvar() {
  salvando.value = true
  setTimeout(() => {
    salvando.value = false
    roteador.push({ name: 'painel' })
  }, 1000)
}

// Simulador simples de Typst via HTML
const markdownPreview = computed(() => {
  return blocos.value.map(b => {
    if (b.tipo === 'titulo') return `<h1>${b.conteudo || 'TÍTULO'}</h1>`
    if (b.tipo === 'paragrafo') return `<p>${b.conteudo || 'Parágrafo...'}</p>`
    if (b.tipo === 'clausula') return `<h3>Cláusula ${b.numero}. ${b.titulo || 'TÍTULO'}</h3><p>${b.conteudo || 'Texto da cláusula...'}</p>`
    if (b.tipo === 'assinaturas') return `<div style="margin-top: 40px; border-top: 1px solid #000; width: 200px; text-align: center;">Assinatura</div>`
    return ''
  }).join('<br/>')
})
</script>

<template>
  <v-container fluid class="h-100 pa-0">
    <v-row no-gutters class="h-100">
      
      <!-- PAINEL ESQUERDO: EDITOR -->
      <v-col cols="12" md="6" class="h-100 border-e overflow-y-auto bg-surface d-flex flex-column">
        <div class="pa-4 border-b d-flex align-center justify-space-between bg-surface-variant">
          <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="roteador.back()">Voltar</v-btn>
          <v-btn color="primary" :loading="salvando" @click="salvar">Salvar Modelo</v-btn>
        </div>
        
        <div class="pa-6 flex-grow-1">
          <CampoTexto v-model="titulo" rotulo="Título do Modelo" class="mb-6" />
          
          <div class="blocos-lista mb-6">
            <v-card 
              v-for="(bloco, i) in blocos" 
              :key="bloco.id"
              variant="outlined"
              class="mb-3 pa-3"
            >
              <div class="d-flex justify-space-between align-start mb-2">
                <v-chip size="small" class="text-uppercase">{{ bloco.tipo }}</v-chip>
                <div>
                  <v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click="moverBloco(i, -1)" :disabled="i === 0"></v-btn>
                  <v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click="moverBloco(i, 1)" :disabled="i === blocos.length - 1"></v-btn>
                  <v-btn icon="mdi-delete" size="x-small" color="error" variant="text" @click="removerBloco(i)"></v-btn>
                </div>
              </div>

              <!-- Titulo -->
              <v-text-field v-if="bloco.tipo === 'titulo'" v-model="bloco.conteudo" density="compact" hide-details placeholder="Ex: CONTRATO DE SERVIÇOS"></v-text-field>

              <!-- Paragrafo -->
              <v-textarea v-if="bloco.tipo === 'paragrafo'" v-model="bloco.conteudo" density="compact" hide-details rows="2" placeholder="Digite o texto..."></v-textarea>

              <!-- Clausula -->
              <div v-if="bloco.tipo === 'clausula'">
                <v-text-field v-model="bloco.titulo" density="compact" hide-details placeholder="Ex: DO OBJETO" class="mb-2"></v-text-field>
                <v-textarea v-model="bloco.conteudo" density="compact" hide-details rows="2" placeholder="Texto da cláusula..."></v-textarea>
              </div>
            </v-card>
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <v-btn variant="outlined" size="small" @click="adicionarBloco('titulo')">+ Título</v-btn>
            <v-btn variant="outlined" size="small" @click="adicionarBloco('paragrafo')">+ Parágrafo</v-btn>
            <v-btn variant="outlined" size="small" @click="adicionarBloco('clausula')">+ Cláusula</v-btn>
            <v-btn variant="outlined" size="small" @click="adicionarBloco('assinaturas')">+ Bloco de Assinaturas</v-btn>
          </div>
        </div>
      </v-col>

      <!-- PAINEL DIREITO: PREVIEW (TYPST SIMULADO) -->
      <v-col cols="12" md="6" class="h-100 bg-surface-variant pa-6 overflow-y-auto">
        <v-card class="w-100 pa-8 elevation-2 mx-auto" style="min-height: 842px; max-width: 595px; background: white; color: black;">
          <div v-html="markdownPreview"></div>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>
