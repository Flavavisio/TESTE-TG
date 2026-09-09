# Total Gest

Plataforma de gestão operacional para PME de serviços técnicos e manutenção (segurança eletrónica, AVAC, eletricidade, limpeza, entre outras áreas) — Field Service, Manutenção e CRM, tudo numa única aplicação.

🔗 [totalgest.pt](https://www.totalgest.pt)

---

## Stack

- **Frontend:** HTML/JS/CSS puro (SPA), PWA-capable — sem framework nem build step
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL, Auth, Edge Functions, Storage)
- **Faturação:** integração com Moloni e TOConline

## Estrutura do repositório

```
totalgest/
├── index.html                 # Página principal — TEM de ficar na raiz do servidor
├── styles.css
├── app-principal.js           # Lógica da aplicação
├── pwa-service-worker.js
├── landing-calculadora.js     # Calculadora da landing page pública
├── pdf-loader.js              # Carregamento assíncrono do jsPDF/autoTable
├── emailjs-config.js
├── equip.html                 # Histórico de equipamento por QR code (login próprio)
├── TOTALGEST_CRM.html         # Módulo de CRM / Propostas comerciais
│
├── supabase/functions/        # Edge Functions (Deno) — uma pasta por função
│   ├── faturar-moloni/
│   ├── faturar-toconline/
│   ├── historico-equipamento/
│   ├── lembrete-ponto/
│   ├── verificar-licencas-diario/
│   └── super-function/        # Envio de emails (todos os templates)
│
├── sql/migrations/            # Alterações à base de dados, por ordem cronológica
│
└── docs/                      # Manuais e guias de integração
```

## Deploy

### Site
Todos os ficheiros da raiz (`index.html`, `*.js`, `*.css`, `equip.html`, `TOTALGEST_CRM.html`) têm de ser publicados **juntos, na raiz** do servidor — o `index.html` referencia-os por caminho relativo (`"styles.css"`, `"app-principal.js"`, etc.), sem subpastas.

⚠️ Depois desta separação, o site só funciona servido a sério por HTTP/HTTPS — não abre corretamente em ficheiro local (`file://`), por restrições de segurança dos browsers a scripts externos.

### Edge Functions
No painel da Supabase → **Edge Functions** → criar cada função com o nome da pasta (ex.: `faturar-moloni`) → colar o conteúdo do respetivo `index.ts` → Deploy.

Manter **"Verify JWT" ativo** em todas, exceto `verificar-licencas-diario` (usa proteção própria por `x-cron-secret`, chamada por cron job).

### Base de dados
Correr as migrações em `sql/migrations/`, por ordem numérica, no SQL Editor da Supabase.

## Integrações

| Fornecedor | Estado |
|---|---|
| Moloni | ✅ Completa (ver `docs/Integracao_Moloni_TotalGest.docx`) |
| TOConline | ✅ Faturação básica (ver `docs/Integracao_TOConline_TotalGest.docx`) |

## Documentação

- `docs/Total_Gest_Manual_Completo.docx` — manual completo de utilização
- `docs/Total_Gest_Guia_Rapida.docx` — guia rápida para novos clientes
- `docs/Total_Gest_Guia_Moloni.docx` — guia de configuração da integração Moloni
- `docs/Integracao_*_TotalGest.docx` — resumo técnico do que está implementado em cada integração
