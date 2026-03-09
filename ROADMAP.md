# 🎮 Steam Explorer - Roadmap de Desenvolvimento

**Última Atualização:** Janeiro 2025  
**Versão Atual:** 1.0

---

## 📊 Análise do Estado Atual

### ✅ Features JÁ IMPLEMENTADAS

| Feature | Status | Notas |
|---------|--------|-------|
| Sistema de XP | ✅ Completo | Barra XP no header + página level.html |
| Página de Levels | ✅ Completo | 20 níveis, nomes e ícones |
| Temas visuais | ✅ Completo | Matrix, Fire, Retro, Light, Dark, RGB |
| Temas sazonais | ✅ Completo | Christmas + Halloween com preview |
| Sistema de traduções | ✅ Base pronta | languages.js com 5 idiomas (EN, ES, PT, FR, DE) |
| Cache de API (PHP) | ✅ Parcial | 24h cache no PHP (api.php) |
| **IndexedDB Cache** | ✅ **NOVO** | **Cache local de conquistas + jogos + perfil** |
| Exportar imagem | ✅ Completo | html2canvas implementado |
| Ranking/Grid de jogos | ✅ Completo | CSS com ranking-col e ranking-grid |
| Scan de conquistas | ✅ Melhorado | 15 requests paralelos, retry automático |
| Painel de scan | ✅ Completo | Pause/Resume/Retry + indicador de cache |
| **Carregamento instantâneo** | ✅ **NOVO** | **Dados do cache carregam em <1s** |
| **Sync em background** | ✅ **NOVO** | **Novos jogos detectados automaticamente** |

---

### 🔧 Features PARCIALMENTE IMPLEMENTADAS

| Feature | Status | O que falta |
|---------|--------|-------------|
| HowLongToBeat | 🔧 Schema pronto | Campo `hltb_main` no database.js, falta integração API |
| Metacritic | 🔧 Schema pronto | Campo `metacritic_score` no database.js, falta integração |
| Multi-idiomas | 🔧 Base pronta | Expandir traduções, adicionar seletor UI |
| Gráficos | 🔧 Chart.js incluso | Só tem básico, falta radar/heatmap |

---

### 🆕 Features NOVAS (Não Existem)

#### 📅 **Visualização de Dados**
- [ ] Heatmap calendar (estilo GitHub)
- [ ] Mural de jogos (grid visual)
- [ ] Museu de troféus 3D
- [ ] Confetti/chuva para platinas
- [ ] Gráfico radar de gêneros

#### 🎯 **Gamificação**
- [ ] Desafios diários/semanais
- [ ] Conquistas do site (badges)
- [ ] Bingo de jogos
- [ ] Modo Nuzlocke
- [ ] Streaks (dias consecutivos)

#### 📊 **Estatísticas Avançadas**
- [ ] Calculadora valor/tempo
- [ ] Valor estimado da conta
- [ ] Previsão de conclusão
- [ ] Comparação entre perfis
- [ ] Histórico de preços

#### 🌐 **Social**
- [ ] Leaderboard global
- [ ] Botões de compartilhamento
- [ ] Integração Discord
- [ ] Desafios entre amigos
- [ ] Perfil público

#### 🔧 **Técnico/Performance**
- [ ] IndexedDB (cache local robusto)
- [ ] Lazy loading de imagens
- [ ] Service Worker (PWA)
- [ ] Acessibilidade (ARIA)
- [ ] Modo offline

#### 🧪 **BETA/Experimental**
- [ ] Museu 3D interativo (Three.js)
- [ ] Player de soundtracks
- [ ] Gerador de wallpapers
- [ ] Integração Spotify gaming
- [ ] Modo VR

---

## 🗓️ FASES DE DESENVOLVIMENTO

### 📦 FASE 1 - Fundação (1-2 semanas)
> Infraestrutura e melhorias técnicas

1. **IndexedDB Cache**
   - Armazenar jogos, conquistas, imagens
   - Sincronização inteligente com Steam API
   - Fallback offline

2. **PWA/Service Worker**
   - Manifesto
   - Caching strategies
   - Push notifications

3. **Lazy Loading**
   - Intersection Observer para imagens
   - Virtualização de listas longas

4. **Acessibilidade**
   - ARIA labels
   - Navegação por teclado
   - Modo alto contraste

**Arquivos afetados:** `index.html`, novo `sw.js`, novo `manifest.json`, novo `idb-store.js`

---

### 📊 FASE 2 - Dados e Visualização (2-3 semanas)
> Integrações externas e gráficos avançados

1. **HowLongToBeat API**
   - Proxy no server.js para evitar CORS
   - Tempo médio de conclusão
   - Badge com tempo estimado

2. **Metacritic Integration**
   - Score nos cards de jogos
   - Filtro por nota

3. **Heatmap Calendar**
   - Calendário estilo GitHub
   - Baseado em conquistas por dia
   - Tooltip com detalhes

4. **Gráfico Radar de Gêneros**
   - Chart.js radar chart
   - Análise de gêneros jogados
   - Comparação visual

5. **Histórico de Preços**
   - IsThereAnyDeal API
   - Gráfico de linha temporal
   - Alertas de preço

**Arquivos afetados:** `server.js`, `index.html`, novo `heatmap.js`, novo `integrations.js`

---

### 🎮 FASE 3 - Gamificação (2-3 semanas)
> Engajamento e conquistas do site

1. **Sistema de Badges do Site**
   - Conquistas por marcos (100 jogos, 50% platinas, etc.)
   - Badges visuais no perfil
   - Notificações de conquista

2. **Desafios Diários**
   - "Complete uma conquista hoje"
   - "Jogue 1 hora de qualquer jogo"
   - Sistema de recompensas XP

3. **Streaks**
   - Contador de dias consecutivos
   - Multiplicador de XP
   - Animações de celebração

4. **Bingo de Jogos**
   - Cartela aleatória de requisitos
   - "Complete um jogo indie", "50h em RPG"
   - Modo competitivo

**Arquivos afetados:** `level.html`, novo `challenges.js`, novo `badges.html`

---

### 🌐 FASE 4 - Social (2-3 semanas)
> Compartilhamento e competição

1. **Leaderboard**
   - Ranking de XP
   - Top completionists
   - Filtro por amigos

2. **Perfil Público**
   - URL única por usuário
   - Card de estatísticas
   - Open Graph meta tags

3. **Compartilhamento**
   - Twitter/X cards
   - Discord embeds
   - Imagem personalizada

4. **Comparação de Perfis**
   - Side-by-side de stats
   - Jogos em comum
   - "Quem tem mais?"

**Arquivos afetados:** novo `profile.html`, novo `leaderboard.html`, `server.js`

---

### 🧪 FASE 5 - Experimental BETA (3-4 semanas)
> Features avançadas opcionais

1. **Museu 3D de Troféus**
   - Three.js ou Babylon.js
   - Navegação WASD
   - Iluminação dinâmica

2. **Player de Soundtracks**
   - Integração YouTube Music API
   - Playlist baseada em jogos
   - Mini player flutuante

3. **Gerador de Wallpapers**
   - Canvas API
   - Templates customizáveis
   - Montagem com jogos favoritos

4. **Modo VR (Futuro)**
   - WebXR
   - Tour virtual pela coleção
   - Interação com mãos

---

## 🎨 NOVA ARQUITETURA PROPOSTA

```
SAE/
├── index.html          # App principal
├── level.html          # Sistema XP
├── hall.html           # Hall da fama
├── roleta.html         # Roleta
├── precos.html         # Preços
│
├── pages/              # 🆕 NOVAS PÁGINAS
│   ├── leaderboard.html
│   ├── profile.html
│   ├── badges.html
│   ├── heatmap.html
│   ├── compare.html
│   └── museum.html     # 3D (BETA)
│
├── js/                 # 🆕 MODULARIZAÇÃO
│   ├── core/
│   │   ├── api.js
│   │   ├── cache.js      # IndexedDB
│   │   └── storage.js
│   ├── features/
│   │   ├── xp.js
│   │   ├── challenges.js
│   │   ├── badges.js
│   │   ├── heatmap.js
│   │   └── radar.js
│   ├── integrations/
│   │   ├── hltb.js
│   │   ├── metacritic.js
│   │   ├── itad.js       # IsThereAnyDeal
│   │   └── protondb.js
│   └── ui/
│       ├── themes.js
│       ├── modals.js
│       └── animations.js
│
├── css/
│   ├── base.css
│   ├── themes.css
│   └── components.css
│
├── assets/
│   ├── badges/
│   ├── sounds/
│   └── models/         # 3D assets
│
├── api.php             # Backend PHP
├── server.js           # Proxy Node.js
├── sw.js               # 🆕 Service Worker
├── manifest.json       # 🆕 PWA
└── languages.js        # Traduções
```

---

## 📋 PRÓXIMOS PASSOS IMEDIATOS

### Esta Semana
1. [ ] Escolher FASE prioritária
2. [ ] Criar branch de desenvolvimento
3. [ ] Implementar IndexedDB básico
4. [ ] Adicionar seletor de idiomas na UI

### Próxima Sprint
1. [ ] HowLongToBeat integration
2. [ ] Heatmap calendar
3. [ ] Sistema de badges inicial

---

## 📞 DECISÕES NECESSÁRIAS

1. **Prioridade de Fase?**
   - [ ] Fase 1 (Técnico/Performance)
   - [ ] Fase 2 (Dados/Visualização)
   - [ ] Fase 3 (Gamificação)
   - [ ] Fase 4 (Social)
   - [ ] Fase 5 (Experimental)

2. **Backend preferido?**
   - [ ] Manter PHP + Node.js
   - [ ] Migrar tudo para Node.js
   - [ ] Adicionar API serverless

3. **Hospedagem final?**
   - [ ] XAMPP local apenas
   - [ ] VPS próprio
   - [ ] Vercel/Netlify + Supabase

---

## 📝 Notas de Implementação

### IndexedDB Schema Proposto
```javascript
const stores = {
  'games': { keyPath: 'appid', indexes: ['name', 'playtime'] },
  'achievements': { keyPath: 'id', indexes: ['appid', 'unlocked'] },
  'cache': { keyPath: 'key', indexes: ['timestamp'] },
  'challenges': { keyPath: 'id', indexes: ['type', 'completed'] },
  'badges': { keyPath: 'id', indexes: ['earnedAt'] }
};
```

### APIs Externas Necessárias
| API | Propósito | Limitações |
|-----|-----------|------------|
| Steam Web API | Jogos, Conquistas | Rate limit |
| HowLongToBeat | Tempo de jogo | Sem API oficial (scraping) |
| Metacritic | Notas | Sem API oficial (scraping) |
| IsThereAnyDeal | Preços | API key gratuita |
| ProtonDB | Compatibilidade Linux | API pública |

---

**🚀 Vamos construir algo incrível!**

*Escolha uma fase para começarmos!*
