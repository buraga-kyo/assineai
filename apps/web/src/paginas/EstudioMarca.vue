<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreTema } from '../store/tema'
import { CampoTexto, CampoSelecao } from '@assineai/ui'

const roteador = useRouter()
const store = useStoreTema()

onMounted(() => {
  store.carregarTema()
})

// Observa mudanças na paleta pra checar o contraste
watch(() => store.tema.paleta, () => {
  store.validarContraste()
}, { deep: true })

async function salvar() {
  if (store.erroContraste) return
  await store.salvarTema()
  // Poderia mostrar um toast aqui, mas vou só voltar
  roteador.push({ name: 'painel' })
}
</script>

<template>
  <v-container fluid class="h-100 pa-0">
    <v-row no-gutters class="h-100">
      
      <!-- PAINEL ESQUERDO: CONFIGURAÇÕES -->
      <v-col cols="12" md="4" class="h-100 border-e overflow-y-auto bg-surface">
        <div class="pa-6">
          <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="roteador.back()">Voltar</v-btn>
          
          <h1 class="text-h4 font-weight-black mb-6">Estúdio de Marca</h1>
          
          <v-card variant="flat" class="mb-6">
            <h2 class="text-h6 mb-4">Logo e Identidade</h2>
            <CampoTexto v-model="store.tema.marca.nome" rotulo="Nome da Empresa" placeholder="Sua Empresa Ltda." class="mb-3" />
            <v-file-input label="Logomarca (PNG ou SVG)" variant="outlined" density="comfortable" prepend-icon="" prepend-inner-icon="mdi-image"></v-file-input>
          </v-card>

          <v-divider class="mb-6"></v-divider>

          <v-card variant="flat" class="mb-6">
            <h2 class="text-h6 mb-4">Cores e Fonte</h2>
            
            <div class="d-flex align-center gap-4 mb-4">
              <div class="flex-grow-1">
                <CampoTexto v-model="store.tema.paleta.primaria" rotulo="Cor Primária (Hex)" />
              </div>
              <!-- Preview da cor -->
              <div class="rounded-circle border mt-2" :style="{ width: '48px', height: '48px', backgroundColor: store.tema.paleta.primaria }"></div>
            </div>

            <div class="d-flex align-center gap-4 mb-4">
              <div class="flex-grow-1">
                <CampoTexto v-model="store.tema.paleta.fundo" rotulo="Cor de Fundo (Hex)" />
              </div>
              <div class="rounded-circle border mt-2" :style="{ width: '48px', height: '48px', backgroundColor: store.tema.paleta.fundo }"></div>
            </div>
            
            <div v-if="store.erroContraste" class="text-error text-caption mb-4">
              <v-icon icon="mdi-alert" size="small"></v-icon>
              Essas cores não dão leitura juntas (Contraste reprovado).
            </div>

            <CampoSelecao v-model="store.tema.tipografia.familia" rotulo="Fonte Principal" :items="['Inter', 'Montserrat', 'Roboto', 'Merriweather']" />
          </v-card>

          <v-divider class="mb-6"></v-divider>

          <v-card variant="flat" class="mb-6">
            <h2 class="text-h6 mb-4">Textos do PDF</h2>
            <CampoTexto v-model="store.tema.textos.tituloRelatorio" rotulo="Título do Relatório" class="mb-3" />
            <v-textarea v-model="store.tema.textos.rodape" label="Rodapé" variant="outlined" rows="2" density="comfortable"></v-textarea>
          </v-card>

          <div class="d-flex gap-2">
            <v-btn color="primary" block size="large" :loading="store.carregando" :disabled="store.erroContraste" @click="salvar">
              Salvar Tema
            </v-btn>
          </div>
        </div>
      </v-col>

      <!-- PAINEL DIREITO: PREVIEW DO PDF AO VIVO -->
      <v-col cols="12" md="8" class="h-100 bg-surface-variant pa-6 d-flex flex-column align-center">
        <h2 class="text-h6 mb-4 text-medium-emphasis">Prévia do Documento</h2>
        
        <!-- Mock do PDF renderizado -->
        <v-card 
          class="pdf-preview flex-grow-1 w-100 rounded elevation-2 pa-8 overflow-y-auto mx-auto" 
          max-width="800"
          :style="{ backgroundColor: store.tema.paleta.fundo }"
        >
          <div class="text-center mb-8 pb-4 border-b">
            <h1 
              :style="{ color: store.tema.paleta.primaria, fontFamily: store.tema.tipografia.familia }"
              class="text-h4 font-weight-black mb-2"
            >
              {{ store.tema.textos.tituloRelatorio }}
            </h1>
            <p :style="{ color: store.tema.paleta.texto }">{{ store.tema.marca.nome }}</p>
          </div>
          
          <div :style="{ color: store.tema.paleta.texto, fontFamily: store.tema.tipografia.familia }" class="mb-12">
            <p class="mb-4">Este é um documento de exemplo para mostrar como o seu tema será aplicado nos PDFs assinados na plataforma.</p>
            <p class="mb-4">O carimbo de assinatura, a fonte do texto e as cores do relatório seguem exatamente a configuração que você definir no painel ao lado.</p>
          </div>

          <!-- Mock do Carimbo -->
          <div 
            class="carimbo pa-4 mt-12 rounded border"
            :style="{ borderColor: store.tema.paleta.primaria + '80', backgroundColor: store.tema.paleta.primaria + '10', color: store.tema.paleta.texto }"
          >
            <div class="d-flex align-center">
              <v-icon icon="mdi-check-decagram" :color="store.tema.paleta.primaria" size="32" class="mr-4"></v-icon>
              <div>
                <div class="font-weight-bold" :style="{ fontFamily: store.tema.tipografia.familia }">Assinado Digitalmente</div>
                <div class="text-caption">Cód: ENV-EXEMPLO-123</div>
              </div>
            </div>
          </div>

          <div class="text-center mt-12 pt-8 text-caption opacity-60" :style="{ color: store.tema.paleta.texto }">
            {{ store.tema.textos.rodape }}
          </div>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>

<style scoped>
.pdf-preview {
  transition: all 0.3s ease;
  min-height: 800px;
}
.carimbo {
  max-width: 300px;
  margin-left: auto;
}
</style>
