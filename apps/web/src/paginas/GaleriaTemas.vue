<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreTema } from '../store/tema'

const roteador = useRouter()
const storeTema = useStoreTema()

const carregando = ref(false)

// Simula a leitura dos JSONs da pasta temas
const temasGaleria = ref([
  { id: 'advocacia', nome: 'Advocacia Clássica', cor: '#1A365D', fonte: 'Merriweather' },
  { id: 'musica', nome: 'Música & Cultura (Dark)', cor: '#D946EF', fonte: 'Montserrat', fundo: '#0F172A' },
  { id: 'medicina', nome: 'Saúde & Medicina', cor: '#0891B2', fonte: 'Inter' },
  { id: 'agro', nome: 'Agronegócio', cor: '#0B5D3B', fonte: 'Roboto' },
  { id: 'psicologia', nome: 'Psicologia e Terapia', cor: '#8B5CF6', fonte: 'Inter' },
  { id: 'associacao', nome: 'Associações e ONGs', cor: '#EA580C', fonte: 'Roboto' }
])

async function aplicarTema(temaId: string) {
  carregando.value = true
  try {
    // API mock: busca o tema e aplica na empresa atual
    await new Promise(resolve => setTimeout(resolve, 600))
    // Joga o cara pro estúdio pra ele ver como ficou
    roteador.push({ name: 'estudio' })
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="roteador.back()">Voltar</v-btn>
    
    <div class="mb-8 text-center">
      <h1 class="text-h3 font-weight-black mb-4">Galeria de Temas</h1>
      <p class="text-h6 text-medium-emphasis">Escolha a base que mais combina com a sua profissão e ajuste depois.</p>
    </div>

    <v-row>
      <v-col v-for="tema in temasGaleria" :key="tema.id" cols="12" sm="6" md="4">
        <v-card 
          variant="outlined" 
          class="h-100 d-flex flex-column"
          :style="{ backgroundColor: tema.fundo || '#FFFFFF' }"
        >
          <!-- Mock visual de como seria o PDF -->
          <div class="pa-6 border-b text-center flex-grow-1" :style="{ backgroundColor: tema.fundo || '#FFFFFF' }">
            <h3 
              class="text-h5 font-weight-bold mb-4" 
              :style="{ color: tema.cor, fontFamily: tema.fonte }"
            >
              {{ tema.nome }}
            </h3>
            
            <div class="w-75 mx-auto border pa-3 rounded text-left opacity-70" :style="{ borderColor: tema.cor }">
              <v-icon icon="mdi-text-box-outline" size="24" :color="tema.cor" class="mb-2"></v-icon>
              <div class="text-caption mb-1" :style="{ color: tema.fundo ? '#FFFFFF' : '#1B1B1B' }">Documento de Teste</div>
              <div style="height: 4px; width: 60%; background-color: currentColor; opacity: 0.3" class="mb-1"></div>
              <div style="height: 4px; width: 80%; background-color: currentColor; opacity: 0.3" class="mb-1"></div>
              <div style="height: 4px; width: 40%; background-color: currentColor; opacity: 0.3"></div>
            </div>
          </div>
          
          <div class="pa-4 bg-surface">
            <v-btn block :color="tema.cor" :loading="carregando" @click="aplicarTema(tema.id)">
              <span :style="{ color: tema.fundo ? '#FFFFFF' : '#FFFFFF' }">Aplicar este Tema</span>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>
