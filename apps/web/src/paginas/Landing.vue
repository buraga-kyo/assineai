<script setup lang="ts">
import { useRouter } from 'vue-router'

const roteador = useRouter()
</script>

<template>
  <div class="landing-page" style="min-height: 100vh; display: flex; flex-direction: column; background: var(--fundo);">
    
    <!-- Cabeçalho Roça Neon -->
    <header class="topo" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; border-bottom: 2px solid var(--linha);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="logo" style="font-family: var(--fonte-titulo); color: var(--primaria); font-size: 24px;">ASSINEAI</span>
      </div>
      <div>
        <a class="botao contorno" href="#" @click.prevent="roteador.push({ name: 'entrar' })" style="margin-right: 16px;">Entrar</a>
        <a class="botao primario" href="#" @click.prevent="roteador.push({ name: 'cadastro' })">Criar Conta</a>
      </div>
    </header>

    <main class="conteudo" style="flex: 1; display: flex; flex-direction: column; padding: 0;">
      
      <!-- Hero Section -->
      <section style="background-color: var(--superficie-2); padding: 80px 24px; text-align: center; border-bottom: 2px solid var(--linha);">
        <div style="max-width: 800px; margin: 0 auto;">
          <span class="chip selado mb-4" style="display: inline-block;">Agora com prova de anterioridade</span>
          
          <h1 style="font-family: var(--fonte-titulo); font-size: 48px; color: var(--texto); line-height: 1.1; margin-bottom: 24px; text-transform: uppercase;">
            Assinatura digital com a <span style="color: var(--primaria);">cara do seu negócio.</span>
          </h1>
          
          <p class="suave" style="font-size: 18px; margin-bottom: 40px;">
            Esqueça portais de assinatura confusos. Mande seus contratos direto pelo WhatsApp ou Telegram do cliente, com o tema da sua empresa e validade jurídica inquestionável.
          </p>
          
          <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <a class="botao primario" href="#" @click.prevent="roteador.push({ name: 'cadastro' })" style="font-size: 18px; padding: 16px 32px;">Começar Agora</a>
            <a class="botao contorno" href="#funcionalidades" style="font-size: 18px; padding: 16px 32px;">Ver Recursos</a>
          </div>
        </div>
      </section>

      <!-- Diferenciais -->
      <section id="funcionalidades" style="padding: 80px 24px; max-width: 1200px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 64px;">
          <h2 style="font-family: var(--fonte-titulo); font-size: 32px; color: var(--texto); margin-bottom: 16px; text-transform: uppercase;">Feito para não travar o negócio</h2>
          <p class="suave" style="font-size: 18px;">A burocracia não pode ser mais difícil que vender.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
          
          <article class="cartao" style="--cor: var(--selado); padding: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
            <h3 style="font-size: 24px; margin-bottom: 16px;">Pelo Zap ou Telegram</h3>
            <p class="suave">O cliente recebe o PDF e aceita ali mesmo no chat da sua empresa. Sem precisar baixar aplicativo ou criar senha.</p>
          </article>

          <article class="cartao" style="--cor: var(--primaria); padding: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎨</div>
            <h3 style="font-size: 24px; margin-bottom: 16px;">Estúdio de Marca</h3>
            <p class="suave">Seu logo, sua cor, sua fonte. O relatório final sai parecendo um documento feito pela sua própria equipe.</p>
          </article>

          <article class="cartao" style="--cor: var(--aguardando); padding: 32px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔗</div>
            <h3 style="font-size: 24px; margin-bottom: 16px;">Rede Blockchain</h3>
            <p class="suave">Cada assinatura e arquivo são ancorados de forma definitiva no tempo usando OpenTimestamps. Inviolável e verificável para sempre.</p>
          </article>

        </div>
      </section>

      <!-- CTA Final -->
      <section style="background-color: var(--superficie-2); padding: 80px 24px; text-align: center; border-top: 2px solid var(--linha);">
        <h2 style="font-family: var(--fonte-titulo); font-size: 32px; color: var(--texto); margin-bottom: 32px; text-transform: uppercase;">Pronto para fechar contratos mais rápido?</h2>
        <a class="botao primario" href="#" @click.prevent="roteador.push({ name: 'cadastro' })" style="font-size: 18px; padding: 16px 32px;">Testar a Plataforma</a>
      </section>

    </main>

    <footer style="background-color: var(--superficie); padding: 32px; text-align: center; border-top: 2px solid var(--linha);">
      <div style="font-family: var(--fonte-titulo); color: var(--texto); margin-bottom: 8px;">ASSINEAI © 2026</div>
      <p class="suave" style="font-size: 14px;">Infraestrutura assinada com a vibração Roça Neon.</p>
    </footer>

  </div>
</template>

<style scoped>
</style>