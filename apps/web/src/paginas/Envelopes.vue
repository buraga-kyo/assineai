<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreEnvelopes } from '../store/envelopes'
import { CartaoEnvelope } from '@assineai/ui'

const store = useStoreEnvelopes()
const roteador = useRouter()

const filtroEstado = ref('Todos')

onMounted(() => {
  store.carregarLista()
})

function irParaDetalhe(id: string) {
  roteador.push({ name: 'envelope-detalhe', params: { id } })
}
</script>

<template>
  <!-- O layout base "App" (sidebar + topbar) do Roça Neon.
       Idealmente extraído para um Layout.vue, mas por fidelidade imediata aplicamos aqui. -->
  <div class="app">
    <nav class="lateral">
      <div class="logo">A</div>
      <a class="ativo" href="#">
        <svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/></svg>
        Envelopes
      </a>
      <a href="#">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
        Contatos
      </a>
      <a href="#">
        <svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>
        Conversas
      </a>
      <a href="#">
        <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18c2 0 2-2 1-3s0-2 2-2h1a5 5 0 0 0 5-5c0-4-4-8-9-8z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16" cy="10" r="1"/></svg>
        Estúdio
      </a>
      <a href="#">
        <svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1"/><path d="M14 10a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1"/></svg>
        Canais
      </a>
    </nav>
    
    <div class="principal">
      <header class="topo">
        <div class="busca">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          Buscar envelope, contato ou código
        </div>
        <div class="empresa">
          <span>Clínica Sol</span>
          <b class="avatar">CS</b>
        </div>
      </header>
      
      <main class="conteudo">
        <div class="cabecalho">
          <h1>Envelopes</h1>
          <a class="botao primario" href="#" @click.prevent="roteador.push({ name: 'novo-envelope' })">
            <svg viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4z"/></svg>
            Mandar para assinar
          </a>
        </div>
        
        <nav class="filtros">
          <a :class="{ ativo: filtroEstado === 'Todos' }" href="#" @click.prevent="filtroEstado = 'Todos'">Todos <span>{{ store.lista.length }}</span></a>
          <a :class="{ ativo: filtroEstado === 'Aguardando' }" href="#" @click.prevent="filtroEstado = 'Aguardando'">Aguardando <span>-</span></a>
          <a :class="{ ativo: filtroEstado === 'Selados' }" href="#" @click.prevent="filtroEstado = 'Selados'">Selados <span>-</span></a>
          <a :class="{ ativo: filtroEstado === 'Recusados' }" href="#" @click.prevent="filtroEstado = 'Recusados'">Recusados <span>-</span></a>
        </nav>
        
        <section class="lista">
          <div v-if="store.carregando" style="text-align:center; padding:32px;">Carregando envelopes...</div>
          <div v-else-if="store.lista.length === 0" style="text-align:center; padding:32px; color:var(--texto-suave);">Nenhum envelope encontrado.</div>
          
          <template v-else>
            <div 
              v-for="env in store.lista" 
              :key="env.id"
              style="cursor: pointer;"
              @click="irParaDetalhe(env.id)"
            >
              <CartaoEnvelope
                :codigo="env.codigo"
                :titulo="env.titulo"
                :estado="env.estado"
                :prazo="env.prazo"
                :signatarios="env.signatarios"
              />
            </div>
          </template>
        </section>
      </main>
    </div>
  </div>
</template>
