# FaceLove Spaces Alpha — preview na Vercel

> Este documento descreve a preview sem media real. Para os dois projetos em `main` e o domínio `facelove.online`, siga [PRODUCTION-VERCEL.md](PRODUCTION-VERCEL.md).

## Preview sem media pessoal

Importe `mgjexpert/facelove-frontend` como projeto **Next.js** na Vercel, com root directory no diretório raiz, install command `npm ci` e build command `npm run build`. Use a branch `work/spaces-alpha` para uma **Preview Deployment**; não associe `facelove.online` nem promova o deploy para Production nesta fase. O deploy de preview não precisa de variáveis de ambiente: usa apenas o perfil de demonstração e dez ficheiros ficcionais gerados para testar fotos, vídeos e HTTP Range.

Rotas de revisão: `/`, `/spaces`, `/@anaoliveira` e `/s/demo-preview`. Os quatro últimos media estão marcados como `access_link`: sem ativar o convite, `/api/media/ana-video-003` devolve `403`; após ativação devolve `206` a um pedido Range. O código `demo-preview` e os ficheiros ficcionais **não** representam autorização de produção.

Para validar a preview acessível via HTTP:

```bash
FACELOVE_PREVIEW_URL=https://<endereco-da-preview> npm run verify:preview
```

Se a Preview Deployment estiver protegida pela Vercel Authentication, abra-a autenticado ou obtenha um link de partilha temporário antes de executar a verificação HTTP. Não desative a proteção apenas para os testes.

## Media real com gateway

O frontend continua independente da origem. Quando existir um gateway `facelove-conteudo` acessível ao servidor Next.js por HTTPS, configure **apenas** no ambiente Server da Vercel `MEDIA_GATEWAY_URL`, `MEDIA_GATEWAY_TOKEN`, `FACELOVE_DEMO_ACCESS_TOKEN` e `FACELOVE_DEMO_COOKIE_SECRET`. O último segredo deve ter pelo menos 32 bytes aleatórios. Nunca use `localhost` como URL do gateway num deploy Vercel, nunca crie variáveis `NEXT_PUBLIC_` para estas credenciais e nunca inclua manifests ou IDs reais no Git. Configure variáveis diferentes para Preview e Production.

Sem gateway configurado, a função de media usa os ficheiros ficcionais incorporados no build, com autorização antes de abrir os ficheiros. Com gateway configurado, usa o catálogo e stream do laboratório, sem fallback para os ficheiros de demonstração se o gateway falhar. O modo Vercel `production` desativa o provider de demonstração; falta ainda autenticação Supabase, migrations/RLS, links revogáveis e uma infraestrutura apropriada para vídeo grande. Não promover para o domínio final antes destes controlos.

## Verificação técnica

- `npm run typecheck && npm run build` valida tipos e build.
- `npm run verify:preview` testa 200 nas páginas e foto, 206 no seek, 416 fora do tamanho, 403 antes do convite e 206 depois da ativação.
- Os ficheiros em `src/lib/media/demo-assets/` são gerados, ficcionais e entram apenas no trace da Function `/api/media/*`. Como estão no repositório, não são um meio para armazenar conteúdo verdadeiramente privado; a autorização para conteúdo real continua a acontecer antes de resolver o provider.
- O gateway MEGA experimental e os testes técnicos reais permanecem em `facelove-conteudo`. Deploy de vídeo real exige observar duração da Function, egress, quotas e fiabilidade da origem.
