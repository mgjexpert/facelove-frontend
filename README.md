# FaceLove Frontend

Aplicação principal do **FaceLove.Online**.

Este repositório concentra a experiência de produto: identidade, autenticação, perfis, **FaceLove Spaces**, mural, permissões, acesso privado e, progressivamente, Community, Dating e Events.

> Estado atual: **bootstrap / Spaces Alpha 0.1**

## Visão do ecossistema

O FaceLove deve nascer como uma aplicação única, com identidade e conta comuns, e produtos modulares:

- **Community** — comunidade, mural, grupos e descoberta social.
- **Dating** — perfis, intenções, descoberta, match e chat.
- **Events** — eventos, reservas, tickets e experiências.
- **Spaces** — espaço pessoal por utilizador, com fotos, vídeos, posts e acesso controlado.
- **Live** — evolução futura de streaming em tempo real.

A primeira implementação é o **Spaces**, porque ele valida o núcleo reutilizável do restante ecossistema: perfis, posts, media, permissões, autenticação e links de acesso.

## Utilizador de demonstração

A referência visual e funcional da versão Alpha será:

- Nome: **Ana Oliveira**
- Username: **@anaoliveira**
- Natureza: utilizadora/creator de demonstração
- Objetivo: validar perfil, mural, imagens, vídeos, visibilidade pública/privada e links de acesso.

Ana é uma fixture de desenvolvimento. Não presumir que qualquer conteúdo real pertence à pessoa fictícia e não publicar dados pessoais ou media privados sem autorização explícita.

## Rotas previstas no Alpha

```text
/                         landing FaceLove
/spaces                   apresentação FaceLove Spaces
/@anaoliveira             perfil público de demonstração
/@[username]              perfil público genérico
/s/[token]                convite/acesso privado
/login                    autenticação
/signup                   criação de conta
/dashboard                área do proprietário do Space
/dashboard/posts          gestão de posts
/dashboard/media          biblioteca de media
/dashboard/access         convites e acessos
/dashboard/settings       perfil e preferências
```

## Princípios técnicos

1. **Frontend não conhece MEGA, Drive ou outro fornecedor diretamente.**
   Todo media passa por uma camada abstrata de provider.
2. **Nunca persistir URLs temporárias como fonte canónica.**
   Guardar provider + referência externa + metadata. O playback é resolvido no momento do pedido.
3. **Autorização no servidor, não no CSS.**
   Conteúdo privado não deve ser retornado ao browser sem autorização.
4. **Supabase RLS desde o primeiro schema.**
5. **Nenhuma service role key no client.**
6. **Media privado não entra no Git.**
7. **Design system único** para Community, Dating, Events e Spaces.
8. O projeto deve continuar portável entre providers de vídeo/ficheiros.

## Stack alvo

- Next.js / App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres + RLS
- Provider abstraction para media
- Deploy alvo: Vercel
- Domínio: **facelove.online**

## Modelo conceitual inicial

O Alpha será construído ao redor destas entidades:

```text
auth.users
profiles
spaces
posts
media_assets
post_media
follows
space_access
access_links
access_events
```

A definição detalhada e a política de acesso estão em `docs/ARCHITECTURE.md`.

## Contrato de Media

Um post referencia um ou mais `media_assets`. Cada asset descreve o fornecedor, mas o componente visual não implementa regras específicas do fornecedor.

Exemplo conceitual:

```ts
type MediaProvider =
  | "mega"
  | "google_drive"
  | "supabase"
  | "cloudflare"
  | "mux"
  | "external";

interface MediaAsset {
  id: string;
  provider: MediaProvider;
  externalId: string;
  type: "image" | "video";
  mimeType?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}
```

O frontend pede uma fonte reproduzível a uma camada como:

```ts
getPlaybackSource(mediaAsset)
```

A implementação concreta pertence a `src/lib/media/providers/*`.

## Repositório irmão

O laboratório de conteúdo e streaming fica em:

**mgjexpert/facelove-conteudo**

Esse repositório deve validar providers, Range requests, manifests, ingestão e metadata, sem acoplar o produto a um fornecedor específico.

## Ambientes

- `development` — desenvolvimento local.
- `preview` — branches/PRs na Vercel.
- `production` — facelove.online.

O conteúdo experimental de MEGA/Drive não deve ser usado como dependência permanente de produção sem passar pela camada de Media Provider.

## Variáveis de ambiente

Copiar `.env.example` para `.env.local`.

Nunca commitar chaves reais, cookies, tokens de providers, service role keys ou URLs privadas.

## Fluxo de trabalho recomendado

- Base estável: `main`
- Trabalho do GPT Work / experiências: `work/<tema>`
- Alterações relevantes entram por PR.
- Cada PR deve explicar objetivo, provider testado, rotas afetadas e limitações conhecidas.

As instruções específicas para agentes estão em `AGENTS.md`.

## Marco Alpha 0.1

O Alpha é considerado utilizável quando existirem:

- perfil de Ana Oliveira;
- feed com imagens e vídeos;
- player conectado ao contrato de media;
- posts públicos;
- posts privados;
- link/token temporário;
- autenticação;
- dashboard básico;
- RLS;
- comportamento responsivo;
- identidade visual FaceLove consistente.

O objetivo inicial não é reconstruir Tinder, OnlyFans ou Facebook. É provar o **núcleo FaceLove** de identidade + conteúdo + acesso e deixar a fundação preparada para os restantes produtos.
