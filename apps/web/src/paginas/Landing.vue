<script setup lang="ts">
import { useRouter } from 'vue-router'

const roteador = useRouter()
</script>

<template>
  <v-app class="bg-surface">
    <!-- Cabeçalho Limpo -->
    <v-app-bar flat class="px-md-8 px-4 border-b bg-surface">
      <div class="d-flex align-center">
        <v-icon icon="mdi-pen" color="primary" size="32" class="mr-2"></v-icon>
        <span class="text-h6 font-weight-black text-primary" style="letter-spacing: -1px;">AssineAi</span>
      </div>
      <v-spacer></v-spacer>
      <v-btn variant="text" class="mr-2 d-none d-sm-inline-flex" href="#como-funciona">Como Funciona</v-btn>
      <v-btn color="primary" variant="flat" @click="roteador.push({ name: 'entrar' })">Acessar Plataforma</v-btn>
    </v-app-bar>

    <v-main>
      <!-- Hero Section -->
      <section class="pa-4 pa-md-12 text-center" style="background-color: var(--v-theme-surface-variant)">
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="8" lg="6">
              <v-chip color="success" size="small" variant="flat" class="mb-6 font-weight-bold text-uppercase px-4">
                Agora com prova de anterioridade
              </v-chip>
              
              <h1 class="text-h3 text-md-h2 font-weight-black mb-6" style="line-height: 1.1;">
                Assinatura digital com a <span class="text-primary">cara do seu negócio.</span>
              </h1>
              
              <p class="text-body-1 text-md-h6 text-medium-emphasis mb-8 px-md-8">
                Esqueça portais de assinatura confusos. Mande seus contratos direto pelo WhatsApp ou Telegram do cliente, com o tema da sua empresa e validade jurídica inquestionável.
              </p>
              
              <div class="d-flex flex-column flex-sm-row justify-center gap-4 mb-12">
                <v-btn color="primary" size="x-large" @click="roteador.push({ name: 'cadastro' })" elevation="2">
                  Começar Agora
                </v-btn>
                <v-btn variant="outlined" size="x-large" href="#funcionalidades">
                  Ver Recursos
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- Diferenciais -->
      <section id="funcionalidades" class="py-16">
        <v-container>
          <div class="text-center mb-12">
            <h2 class="text-h4 font-weight-black mb-4">Feito para não travar o negócio</h2>
            <p class="text-body-1 text-medium-emphasis">A burocracia não pode ser mais difícil que vender.</p>
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-card class="h-100 pa-6 text-center" variant="outlined">
                <v-icon icon="mdi-whatsapp" color="success" size="64" class="mb-4"></v-icon>
                <h3 class="text-h5 font-weight-bold mb-3">Pelo Zap ou Telegram</h3>
                <p class="text-medium-emphasis">O cliente recebe o PDF e aceita ali mesmo no chat da sua empresa. Sem precisar baixar aplicativo ou criar senha.</p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="h-100 pa-6 text-center" variant="outlined">
                <v-icon icon="mdi-palette" color="primary" size="64" class="mb-4"></v-icon>
                <h3 class="text-h5 font-weight-bold mb-3">Estúdio de Marca</h3>
                <p class="text-medium-emphasis">Seu logo, sua cor, sua fonte. O relatório final sai parecendo um documento feito pela sua própria equipe.</p>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="h-100 pa-6 text-center" variant="outlined">
                <v-icon icon="mdi-bitcoin" color="warning" size="64" class="mb-4"></v-icon>
                <h3 class="text-h5 font-weight-bold mb-3">Rede Bitcoin</h3>
                <p class="text-medium-emphasis">Cada assinatura e arquivo são ancorados na blockchain de forma definitiva. Inviolável e verificável para sempre.</p>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>
      
      <!-- CTA Final -->
      <section class="py-16 bg-surface-variant text-center">
        <v-container>
          <h2 class="text-h4 font-weight-black mb-6">Pronto para fechar contratos mais rápido?</h2>
          <v-btn color="primary" size="x-large" @click="roteador.push({ name: 'cadastro' })">
            Testar a Plataforma
          </v-btn>
        </v-container>
      </section>

    </v-main>
    
    <v-footer class="bg-surface border-t py-6 text-center d-flex flex-column">
      <div class="mb-2 font-weight-bold">AssineAi © 2026</div>
      <div class="text-caption text-medium-emphasis">Infraestrutura assinada com a vibração Roça Neon.</div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
