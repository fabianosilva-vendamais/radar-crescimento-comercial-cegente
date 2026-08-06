# Radar de Crescimento Comercial — App Next.js (deploy Vercel + Supabase)

Aplicação Next.js (App Router) que converte o protótipo
`Radar de Crescimento Comercial.dc.html` (Evento **VendaMais + Cegente**,
São José do Rio Preto) em produção, com persistência no Supabase e envio de
e-mail por SMTP (Gmail).

> **Banco e deploy totalmente separados do projeto Lopas.** Crie um **novo**
> projeto no Supabase e um **novo** projeto na Vercel para este Radar. Nenhuma
> chave, tabela ou URL é compartilhada com o Raio-X Lopas Conecta.

**Nenhum texto, pergunta, pontuação, classificação ou regra do diagnóstico foi
alterado.** A lógica determinística foi portada verbatim
(`src/lib/radar-logic.ts`) e conferida automaticamente contra o protótipo
(constantes de negócio, `bandOf(3..15)` e `compute`/`lead` nos 12 participantes
de demonstração — batem 100%). Rode a conferência com:

```bash
npm run verify-logic
```

## Pontuação (inalterada)

- 5 dimensões, cada uma com 3 perguntas de escala (1 a 5) → **3 a 15 por dimensão**.
- Nota total = soma das 5 dimensões → **15 a 75**.
- 4 classificações: Crescimento vulnerável (15–30), em construção (31–45),
  estruturado (46–60), escalável (61–75).
- Prioridade comercial interna (Quente / Morno / Nutrição) — nunca visível ao participante.

## Rotas

| Rota | O que é |
|---|---|
| `/` | Participante (jornada: início → identificação → perfil → escala → 18 perguntas → leitura) |
| `/r/{codigo}` | Reabrir leitura pelo código (longo e não adivinhável, prefixo `RC-`) |
| `/admin` | Painel administrativo — login por **Supabase Auth** |
| `/telao` | Painel do evento — agregado e anônimo (só a partir de 10 respostas) |

## Arquitetura

- **Persistência:** Supabase (Postgres). Tabelas `participantes`, `respostas`,
  `resultados`, `emails`, `acompanhamento` — criadas pela migração
  `supabase/migrations/0001_init.sql`. A tabela `participantes` grava a coluna
  `origem = 'Evento VendaMais + Cegente'`.
- **RLS:** participantes só inserem; leitura individual só para admin autenticado;
  o telão lê **apenas** a função agregada e anônima `telao_stats()`.
- **E-mail:** Nodemailer + SMTP (Gmail), com fila (envios serializados) e até
  3 tentativas.
- **Chaves:** 100% em variáveis de ambiente. Nada de chave no código.

---

## PASSO A PASSO — o que fazer no Supabase (manual)

> Faça isto UMA vez, antes do primeiro deploy, em um **projeto Supabase novo**.

### 1. Criar as tabelas + RLS + função do telão
1. Abra **supabase.com** → crie/abra o **projeto do Radar** (separado do Lopas).
2. Menu lateral → **SQL Editor** → **New query**.
3. Abra o arquivo `supabase/migrations/0001_init.sql` deste repositório, **copie
   todo o conteúdo** e cole no editor.
4. Clique **Run**. Deve aparecer "Success. No rows returned".
5. Confira em **Table Editor**: devem existir as 5 tabelas com "RLS enabled".

### 2. Criar o usuário admin (substitui a senha `demo2026` do protótipo)
1. Menu lateral → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Informe o **e-mail da equipe VendaMais** e uma **senha forte**.
3. Marque **Auto Confirm User** (para o login funcionar sem e-mail de confirmação).
4. É esse e-mail/senha que você usará em `/admin`.

Pronto — nada mais precisa ser feito no painel do Supabase.

---

## Variáveis de ambiente para cadastrar na Vercel

Vercel → **novo** projeto do Radar → **Settings → Environment Variables → Add**
(ambiente **Production**; recomendo marcar também **Preview**).

| Nome | Valor | Marcar "Sensitive"? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | a URL do **projeto Supabase do Radar** | não |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a **chave publicável** `sb_publishable_...` (Supabase → Settings → API Keys) | não |
| `SUPABASE_SERVICE_ROLE_KEY` | a **chave secreta** `sb_secret_...` (Supabase → Settings → API Keys) | **sim** |
| `SMTP_HOST` | `smtp.gmail.com` | não |
| `SMTP_PORT` | `465` | não |
| `SMTP_USER` | seu e-mail completo `@vendamais.com.br` | não |
| `SMTP_PASS` | a **senha de app** de 16 letras do Gmail | **sim** |
| `EMAIL_FROM` | `VendaMais + Cegente <seu-email@vendamais.com.br>` | não |
| `REPORT_BASE_URL` | a URL pública do site (ex.: `https://radar-crescimento-comercial.vercel.app`) | não |

Observações:
- **Formato novo de chaves do Supabase:** o app já é compatível. Use a **chave
  publicável** (`sb_publishable_...`) em `NEXT_PUBLIC_SUPABASE_ANON_KEY` e a
  **chave secreta** (`sb_secret_...`) em `SUPABASE_SERVICE_ROLE_KEY`.
- As duas variáveis `NEXT_PUBLIC_*` são **públicas** (o navegador precisa delas
  para o login do admin e para o telão).
- A `service_role` e a `SMTP_PASS` são **secretas** — marque como **Sensitive**.
- Depois de cadastrar, faça **Redeploy** (a Vercel só aplica variáveis novas em
  um novo build).
- `REPORT_BASE_URL` monta o link do relatório no e-mail: `{REPORT_BASE_URL}/r/{codigo}`.
  Se não definir, o app usa a URL do próprio deploy da Vercel automaticamente.

## Rodar localmente (opcional)

```bash
cp .env.local.example .env.local   # preencha os valores do projeto do Radar
npm install
npm run dev                        # http://localhost:3000
```

## Checklist de véspera

- [ ] Projeto Supabase **novo** (separado do Lopas) com a migração SQL aplicada e usuário admin criado
- [ ] Todas as variáveis cadastradas no projeto **novo** da Vercel + Redeploy feito
- [ ] Teste completo pelo celular: responder → leitura → e-mail na caixa de entrada
- [ ] Reabertura por código (`/r/{codigo}`) funciona
- [ ] `/admin` exige login e mostra o participante de teste
- [ ] `/telao` em tela cheia (agrega só a partir de 10 respostas)
- [ ] Apagar os dados de teste no Supabase (Table Editor → delete) antes do evento
- [ ] QR Code apontando para a URL raiz do site
