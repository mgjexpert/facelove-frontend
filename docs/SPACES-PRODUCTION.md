# FaceLove Spaces · catálogo, acesso e Vercel

## O que já está persistido

O Supabase `uwsuavbskwankqchqkcu` tem migrations em `supabase/migrations/` (nomes e versões iguais ao histórico remoto). `profiles`, `spaces`, `posts`, `albums`, `media_assets` e `post_media` são dados persistentes. Foram criados perfis editoriais de Ana Oliveira, Emily, Jade, Micaela Gomes e Eva Martinez, cinco posts públicos de apresentação (texto provisório), onze álbuns privados e onze fontes MEGA. Não existem contas reais no Auth: `owner_id` está vazio até associação por email verificado. Nenhuma pessoa representada nos ficheiros foi identificada por estes nomes.

`public.media_sources` contém URLs de pasta com chaves de partilha MEGA. `public.access_links` guarda apenas hashes SHA-256 de tokens. Ambos têm RLS, grants revogados de `anon` e `authenticated` e ficam legíveis apenas com a chave service role do **gateway**. Não copiar os seus valores para fixtures, frontend, screenshots, issues ou Git. O gateway regista ativações de convite em `access_events`; o Supabase Auth gere sessões e registos de autenticação. Não há auditoria de cada visualização ou cada byte servido.

## Vercel · dois projetos separados

| Projeto Vercel | Variável | Valor / origem |
| --- | --- | --- |
| `facelove-frontend` | `NEXT_PUBLIC_SUPABASE_URL` | `https://uwsuavbskwankqchqkcu.supabase.co` |
| `facelove-frontend` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publishable em Supabase → Project Settings → API Keys; a anon key antiga também é aceite em `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `facelove-frontend` | `NEXT_PUBLIC_SITE_URL` | `https://facelove.online` (ou domínio de preview para testes) |
| `facelove-frontend` | `MEDIA_GATEWAY_URL` | `https://facelove-conteudo.vercel.app` |
| `facelove-frontend` | `MEDIA_GATEWAY_TOKEN` | Mesmo valor longo e aleatório no gateway (mínimo 24 caracteres) |
| `facelove-frontend` | `FACELOVE_DEMO_COOKIE_SECRET` | Segredo aleatório com mínimo 32 caracteres; assina cookies de álbum, servidor apenas |
| `facelove-conteudo` | `SUPABASE_URL` | `https://uwsuavbskwankqchqkcu.supabase.co` |
| `facelove-conteudo` | `SUPABASE_SECRET_KEY` | Chave **secret** (`sb_secret_...`) em Supabase → Settings → API Keys; configurar **só** neste projeto Vercel. `SUPABASE_SERVICE_ROLE_KEY` é uma alternativa legacy |
| `facelove-conteudo` | `MEDIA_GATEWAY_TOKEN` | Mesmo valor do frontend; servidor apenas |

As variáveis devem existir no ambiente **Production** dos projetos respetivos; adicionar Preview se quiser testar branches. Fazer **Redeploy** nos dois projetos após configurar; `facelove-conteudo` primeiro. Remover `MEGA_FOLDER_URL` antigo do projeto gateway depois de confirmar a leitura do catálogo Supabase. Nunca adicionar uma secret key ao projeto frontend ou usar o prefixo `NEXT_PUBLIC_` para segredos.

## Auth e associação de contas

Em Supabase → Authentication → URL Configuration, usar `https://facelove.online` como Site URL e permitir `https://facelove.online/auth/confirm` (e a URL Vercel de preview quando necessária). O signup pede **email real verificado + palavra-passe**, com pelo menos 12 caracteres. Após a confirmação, um administrador valida a identidade e associa o utilizador ao perfil correto com uma única atualização SQL:

```sql
update public.profiles
set owner_id = (select id from auth.users where email = 'email-verificado@example.org')
where username = 'anaoliveira' and owner_id is null;
```

Substituir email e username e verificar a pessoa antes de executar. Não atribuir uma conta desconhecida a um Space real. O dashboard permite editar nome, bio, posts públicos e títulos/descrições dos álbuns depois da associação. O login aceita email ou `@handle` e a palavra-passe guardada pelo Supabase Auth. 2FA, Google e Apple exigem configuração e fluxo próprios e **não estão ativados**. A equipa pode alterar metadata e fontes manualmente no Supabase SQL Editor.

## Publicação pública

O bucket `public-media` guarda apenas media **público**. O seu nome e tipo são persistidos em `media_assets`; `post_media` associa o asset ao post. `external_id` é o caminho no bucket, como `anaoliveira/retrato-01.jpg`. Para adicionar uma fotografia manualmente:

1. Enviar o ficheiro no Supabase Storage para `public-media/anaoliveira/retrato-01.jpg` (o bucket é público).
2. Criar uma linha em `media_assets` com `space_id` correto, `provider='supabase'`, `external_id='anaoliveira/retrato-01.jpg'`, `media_type='image'`, `visibility='public'`, `mime_type='image/jpeg'`, título e `id` gerado.
3. Inserir em `post_media` o `post_id`, `media_asset_id` e a `position`.

O frontend lê as linhas públicas via RLS e serve o ficheiro por `/api/media/[id]`. O dashboard ainda não oferece upload de ficheiros; o modelo permite construir esse fluxo depois de definir limites de tamanho, verificação de ficheiros e permissões de Storage. Nunca carregar media privado neste bucket.

## Álbuns e convites

Cada álbum pertence a um Space e aceita `media_type=image|video|mixed`. `media_sources` contém `provider` e a origem privada; o gateway localiza a subpasta escolhida, seleciona até **50 fotografias e 5 MP4 por álbum**, entrega catálogo sanitizado e faz streaming HTTP Range. Uma foto e um vídeo podem ficar na mesma pasta se o álbum for `mixed`. As coleções atuais têm pastas separadas; Micaela tem uma terceira coleção especial.

Para mudar uma pasta: localizar o `album_id` em `albums`, editar a **única** linha respetiva em `media_sources` no Supabase SQL Editor. O catálogo do gateway tem cache de 5 minutos. O adapter MEGA está funcional; `google_drive` é uma opção do modelo e do contrato, mas ainda requer implementação e teste de credenciais, descoberta e Range antes de ser operacional.

Para criar um convite de álbum em máquina administrativa, colocar `SUPABASE_URL` e `SUPABASE_SECRET_KEY` apenas no ambiente local, então executar:

```bash
node scripts/create-album-invite.mjs anaoliveira 1 7d free
node scripts/create-album-invite.mjs anaoliveira 2 lifetime free
node scripts/create-album-invite.mjs micaelagomes 3 7d manual_paid
```

O comando mostra o link completo **uma única vez**; regista apenas o hash no Supabase. `manual_paid` significa concessão manual após validação externa, sem cobrança automática. Em `access_links`, `expires_at=NULL` permite reativar o convite sem prazo, `max_uses` limita ativações e `revoked_at=now()` revoga imediatamente também sessões ativas. Cada ativação dá uma sessão assinada até 30 dias (limitada pela validade do convite); o browser precisa de reabrir o convite para renovar. O gateway valida revogação em cada acesso a media. Não há pagamentos, cobranças nem subscrições.

## Verificação

Após redeploy, verificar `/spaces`, `/@emily`, `/@jade`, `/@anaoliveira`, `/@micaelagomes`, `/@evamartinez`, `/login`, `/signup` e `/dashboard`. `/health` do gateway deve responder `200`. Um GET anónimo ao catálogo responde `401`. Aceder a `/s/<token>` com um convite válido, ativar e fazer seek num MP4: a rota `/api/media/<key>` deve devolver `206 Partial Content` e `Content-Range`; sem convite deve devolver `403`. `npm run build` no frontend e `npm test` no gateway executam verificações locais; a leitura real das pastas e streaming em produção só se confirmam após colocar as variáveis no Vercel.
