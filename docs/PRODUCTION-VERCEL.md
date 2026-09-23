# FaceLove Spaces Alpha em `facelove.online`

Esta é uma implantação **Alpha de produção** com perfil de demonstração e um convite partilhado. A hospedagem do frontend é Vercel; o gateway MEGA é um segundo projeto Vercel. O Supabase do projeto ainda não contém o schema de contas/posts com RLS e não é usado nesta fase. Não apresentar esta implantação como plataforma aberta de contas privadas até Auth, RLS, convites individuais, revogação e auditoria estarem implementados.

## 1. Publicar primeiro o gateway

Na Vercel, Import Git Repository → `mgjexpert/facelove-conteudo`. Projeto sugerido: `facelove-conteudo`; Production Branch: `main`; Framework Preset: **Other**; Root Directory: raiz; Install Command: `npm ci`; sem Build Command ou Output Directory. O ficheiro `vercel.json` mapeia as rotas para a Function Node e define `maxDuration: 300`. Configure estas três variáveis em **Production**, exclusivamente nesse projeto:

| Variável | Como obter |
| --- | --- |
| `MEGA_FOLDER_URL` | Link completo da pasta MEGA autorizada, com chave após `#`. Guardar só na Vercel. |
| `MEDIA_MANIFEST_BASE64` | Conteúdo do manifest privado local codificado em base64, gerado conforme [VERCEL-GATEWAY.md](https://github.com/mgjexpert/facelove-conteudo/blob/main/docs/VERCEL-GATEWAY.md). |
| `MEDIA_GATEWAY_TOKEN` | Segredo aleatório forte, de pelo menos 24 caracteres. Usar o mesmo valor no frontend. |

Faça deploy da branch `main` e use a URL **Production** estável indicada no painel, por exemplo `https://<gateway>.vercel.app`. Verifique `GET /health = 200` e `GET /v1/catalog` sem token `= 401`. Depois confira o catálogo autenticado e pelo menos um `HEAD` e um `Range` a um ficheiro MEGA. **Não associe `facelove.online` ao gateway.** Não coloque URL da pasta, manifest ou token em `NEXT_PUBLIC_`, no Git ou nesta conversa.

## 2. Publicar o frontend

Import Git Repository → `mgjexpert/facelove-frontend`. Projeto sugerido: `facelove-frontend`; Production Branch: `main`; Framework Preset: **Next.js**; Root Directory: raiz; Install Command: `npm ci`; Build Command: `npm run build`; Output Directory: padrão Next.js. Em Settings → Environment Variables → **Production**, defina:

| Variável | Valor |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://facelove.online` |
| `MEDIA_GATEWAY_URL` | URL HTTPS estável do projeto gateway, sem caminho `/api` |
| `MEDIA_GATEWAY_TOKEN` | Mesmo segredo configurado no gateway; apenas server-side |
| `FACELOVE_DEMO_ACCESS_TOKEN` | Novo convite aleatório forte; partilhar apenas com os testers autorizados |
| `FACELOVE_DEMO_COOKIE_SECRET` | Outro segredo aleatório independente, com pelo menos 32 caracteres |
| `FACELOVE_DEMO_ACCESS_EXPIRES_AT` | Data futura ISO 8601, por exemplo no formato `AAAA-MM-DDTHH:MM:SSZ` |
| `FACELOVE_PUBLIC_DEMO_MEDIA` | `true` para mostrar fotografias e clips **ficcionais** no perfil público |

Gerar segredos separados localmente com `openssl rand -hex 32` e copiá-los diretamente para as variáveis da Vercel. Não reutilizar o token do gateway como convite ou assinatura de cookie. Depois de alterar variáveis, fazer novo deployment: o build e as Functions precisam dos valores da configuração atual. **Não configurar `SUPABASE_SERVICE_ROLE_KEY` no browser nem criar `NEXT_PUBLIC_` para credenciais privadas.** As variáveis Supabase da `.env.example` não são necessárias enquanto os dados continuarem em fixture.

## 3. Associar domínio

Depois de validar as URLs `*.vercel.app`, no projeto **frontend** abra Settings → Domains e adicione `facelove.online`. Opcionalmente adicione `www.facelove.online` com redirecionamento permanente para o domínio principal. No registrador do domínio, crie ou altere **somente** os registos DNS indicados pelo próprio painel Vercel para a conta e domínio; verifique conflitos com A/CNAME anteriores e aguarde a validação e o certificado HTTPS. Não adicionar o domínio ao gateway. A Vercel documenta este fluxo em [Set up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain).

## 4. Aceitação antes de partilhar

1. `https://facelove.online/`, `/spaces` e `/@anaoliveira` carregam em mobile e desktop. As fotos e os vídeos públicos são **ficcionais** e identificados como demo.
2. O catálogo do gateway autorizado contém 50 fotos e 5 MP4 em dois packs com `visibility=access_link`; não devolve `externalId` ao cliente. O gateway responde `401` sem Bearer.
3. `/api/media/mega-video-001` no frontend, sem convite, responde `403`. A página pública não inclui keys de media privada no HTML.
4. O convite privado em `/s/<token>` ativa um cookie HttpOnly; depois, a aba Fotos mostra 50 entradas e Vídeos mostra 5. `HEAD` do vídeo responde `200`, um seek HTTP Range responde `206`, e uma faixa fora dos limites responde `416`.
5. Verificar carga, latência de primeira leitura, egress e duração das Functions com clips reais antes de abrir tráfego. O teste local não substitui a verificação após o deploy.

## Limites de acesso do Alpha

Todos os packs reais deste manifest usam **um único convite partilhado**. A sessão expira em no máximo 24 horas e respeita `FACELOVE_DEMO_ACCESS_EXPIRES_AT`; para revogar sessões imediatamente é preciso rodar `FACELOVE_DEMO_COOKIE_SECRET`. Não há limite de usos, revogação por pessoa, Auth Supabase, RLS ou auditoria persistida. Este controlo serve para o piloto privado, não para uma oferta pública de subscrições ou distribuição de ficheiros pessoais. MEGA e Google Drive continuam substituíveis atrás do gateway, mas o adapter Drive ainda não foi implementado/testado; apenas MEGA tem playback e Range validados.
