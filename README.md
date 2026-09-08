# Massa Mãe

App pessoal (Next.js + Supabase + Google Calendar + Resend) para criar e manter
uma massa mãe: explicação inicial, registo da data de início, lembretes
automáticos no Google Calendar e por email, e um questionário para diagnosticar
o estado da massa em qualquer altura.

Sem contas de utilizador — é para uso pessoal/familiar, protegida apenas por
estar num URL que só tu conheces (ou podes pôr atrás de proteção da Vercel).

## 1. Supabase

1. Cria um projeto em supabase.com (ou usa um que já tenhas, como o do Revisto —
   as tabelas estão todas prefixadas `massamae_` para poderem coexistir).
2. Corre o conteúdo de `supabase/schema.sql` no SQL Editor do Supabase.
3. Em Project Settings → API, copia o `Project URL` e a `service_role key`
   para `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Google Calendar

1. Vai a console.cloud.google.com, cria um projeto (ou usa um existente).
2. Ativa a "Google Calendar API" em APIs & Serviços → Biblioteca.
3. Em APIs & Serviços → Ecrã de consentimento OAuth, configura como "Externo"
   e adiciona o teu próprio email como utilizador de teste (não precisa de
   verificação para uso pessoal).
4. Em Credenciais → Criar credenciais → ID de cliente OAuth → "Aplicação Web".
   - URI de redirecionamento autorizado: `https://o-teu-dominio.vercel.app/api/google/callback`
5. Copia o Client ID e Client Secret para `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.

## 3. Resend

1. Cria conta em resend.com, gera uma API key → `RESEND_API_KEY`.
2. Verifica um domínio próprio (ou usa `onboarding@resend.dev` para testar).
3. Define `REMINDER_EMAIL` com o email para onde queres receber os lembretes.

## 4. Deploy na Vercel

1. `vercel.json` já define o cron diário (`/api/cron/daily`, todos os dias às 7h UTC —
   ajusta a hora no ficheiro se quiseres outra).
2. Define todas as variáveis de `.env.example` nas Environment Variables do
   projeto na Vercel, incluindo um `CRON_SECRET` aleatório.
3. Faz deploy. Depois de estar no ar, abre o site, vai a "Ligar Google
   Calendar" e autoriza — a partir daí os eventos são criados sozinhos.

## Notas

- Os primeiros 7 dias (criação) têm um calendário fixo. A partir do dia 7,
  escolhes na app se queres manter na bancada (alimentação diária) ou no
  frigorífico (semanal) — isso muda os lembretes automaticamente.
- O cron corre uma vez por dia e cria o evento + envia o email da tarefa
  desse dia para todas as massas com `status = 'ativa'`.
- O questionário de diagnóstico (`/diagnostico/[id]`) não depende do
  calendário — podes usá-lo a qualquer momento para perceber se a massa
  está bem, com fome, fraca, ou se deve ser descartada.
