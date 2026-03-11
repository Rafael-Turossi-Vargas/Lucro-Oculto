# Lucro Oculto

> **Descubra onde sua empresa está perdendo dinheiro.**
> Plataforma SaaS de auditoria financeira inteligente para pequenas e médias empresas.

---

## Sobre o Produto

O Lucro Oculto é um auditor financeiro automatizado que analisa dados financeiros de PMEs e identifica:

- Assinaturas esquecidas e ferramentas subutilizadas
- Sobreposição de ferramentas com funções similares
- Crescimento anormal de custos por categoria
- Pagamentos duplicados
- Concentração excessiva de custos
- Risco de pressão no caixa

O sistema entrega um **Score de Eficiência Financeira** (0–100), lista de vazamentos, oportunidades de economia e um plano de ação priorizado — com estimativa de economia em reais.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS 4 |
| Componentes | Radix UI + shadcn/ui pattern |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Banco de dados | PostgreSQL (Supabase) |
| ORM | Prisma |
| Autenticação | NextAuth v4 |
| Upload | Supabase Storage |
| Parser CSV | Papa Parse |
| Parser Excel | SheetJS (xlsx) |
| PDF | @react-pdf/renderer |
| Email | Resend |
| Ícones | Lucide React |
| Deploy | Vercel |

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL local ou conta no Supabase
- Conta no Resend (emails)
- Conta na Vercel (deploy)

---

## Setup Local

### 1. Clone e instale dependências

```bash
git clone https://github.com/seu-usuario/lucro-oculto.git
cd lucro-oculto
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com seus valores:

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/lucro_oculto"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
```

### 3. Configure o banco de dados

**Opção A: PostgreSQL local**
```bash
createdb lucro_oculto
npx prisma migrate dev --name init
npx prisma generate
```

**Opção B: Supabase (recomendado)**
1. Crie um projeto em supabase.com
2. Copie a Connection String para `DATABASE_URL`
3. Execute as migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Rode o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/           # Login, cadastro, recuperação de senha
│   ├── (app)/            # Área autenticada (dashboard, análises)
│   └── api/              # API routes (auth, upload, analysis, reports)
├── components/
│   ├── ui/               # Componentes base do design system
│   ├── layout/           # Sidebar, header, app shell
│   ├── landing/          # Componentes da landing page
│   ├── dashboard/        # Componentes do dashboard
│   ├── onboarding/       # Wizard de onboarding
│   └── upload/           # Upload de arquivos
├── lib/
│   ├── analysis/         # Engine de análise financeira
│   │   └── rules/        # Regras de detecção (subscriptions, anomalies, etc.)
│   ├── parsers/          # Parsers CSV e Excel
│   ├── pdf/              # Geração de relatórios PDF
│   └── email/            # Templates de email
├── constants/            # Categorias, nichos, planos
└── types/                # TypeScript types
```

---

## Formato de Arquivo para Upload

O sistema aceita arquivos CSV ou Excel com as seguintes colunas:

| Coluna | Obrigatório | Formato |
|---|---|---|
| Data | Sim | DD/MM/YYYY ou YYYY-MM-DD |
| Descrição | Sim | Texto livre |
| Valor | Sim | Número (negativo = despesa) |

**Exemplo CSV:**
```csv
data,descricao,valor
01/01/2024,SLACK TECNOLOGIA,-139.90
05/01/2024,FORNECEDOR ABC LTDA,-2500.00
10/01/2024,RECEITA CLIENTE XYZ,15000.00
15/01/2024,NOTION LABS INC,-45.00
```

---

## Regras de Análise

O sistema usa uma engine de regras determinísticas:

### Score de Eficiência Financeira
- Base: 100 pontos
- Penalizações por assinaturas sobrepostas, anomalias, duplicatas, concentração e risco de caixa
- Subscores: Assinaturas, Fornecedores, Recorrentes, Concentração, Caixa

### Detecções Automáticas
1. **Assinaturas** — Padrões mensais recorrentes com keywords SaaS
2. **Sobreposição** — Ferramentas da mesma categoria funcional
3. **Anomalias** — Crescimento > 20% vs período anterior por categoria
4. **Duplicatas** — Mesmo valor + descrição similar em janela de 7 dias
5. **Concentração** — Categoria > 35% ou fornecedor > 20% do total
6. **Caixa** — Projeção de pressão nos próximos 30 dias

---

## Planos

| | Grátis | Pro | Premium |
|---|---|---|---|
| Análises/mês | 1 | Ilimitadas | Ilimitadas |
| Linhas por upload | 200 | 10.000 | 50.000 |
| Score completo | Básico | ✅ | ✅ |
| Relatório PDF | Resumido | ✅ Premium | ✅ Avançado |
| Histórico | — | 12 meses | Completo |
| Alertas | 3 | Ilimitados | Ilimitados |
| Multi-empresa | — | — | Até 3 |
| **Preço** | R$0 | **R$97/mês** | **R$297/mês** |

---

## Deploy (Vercel + Supabase)

### 1. Prepare o banco (Supabase)
1. Crie projeto em supabase.com
2. Copie DATABASE_URL, ANON_KEY, SERVICE_ROLE_KEY

### 2. Configure Resend
1. Crie conta em resend.com, verifique domínio, gere API Key

### 3. Deploy na Vercel
```bash
vercel
```

Configure as variáveis de ambiente no painel da Vercel, depois:
```bash
npx prisma migrate deploy
```

---

## Checklist de Produção

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] DATABASE_URL apontando para Supabase produção
- [ ] NEXTAUTH_SECRET gerado e seguro (32+ chars)
- [ ] NEXTAUTH_URL com URL de produção
- [ ] Migrations executadas (`prisma migrate deploy`)
- [ ] Supabase Storage bucket criado ("uploads")
- [ ] Resend configurado e domínio verificado
- [ ] Build de produção testado (`npm run build`)
- [ ] Domínio configurado na Vercel

---

## Comandos Úteis

```bash
npm run dev                    # Desenvolvimento
npm run build                  # Build de produção
npx prisma migrate dev         # Nova migration (dev)
npx prisma migrate deploy      # Migrations em produção
npx prisma generate            # Gerar Prisma Client
npx prisma studio              # Interface visual do banco
```

---

*Lucro Oculto — Mais lucro sem vender mais.*
