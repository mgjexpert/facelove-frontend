# FaceLove Spaces — Arquitetura Alpha

## 1. Objetivo

Validar o núcleo reutilizável do FaceLove:

```text
Identity
  ↓
Profile
  ↓
Space
  ↓
Post
  ↓
Media
  ↓
Permission
  ↓
Playback
```

Community, Dating e Events deverão reutilizar identidade, perfil, media e permissões em vez de criar silos.

## 2. Domínio

Produção prevista:

```text
https://facelove.online
```

Rotas Alpha:

```text
/                  landing
/spaces            produto Spaces
/@[username]       perfil/space público
/s/[token]         acesso por convite
/login
/signup
/dashboard/*
```

## 3. Entidades

### profiles
Extensão pública de `auth.users`.

Campos previstos:

- id
- username
- display_name
- bio
- avatar_asset_id ou avatar_url temporário durante o Alpha
- cover_asset_id ou cover_url temporário durante o Alpha
- location_text
- is_creator
- created_at
- updated_at

### spaces

- id
- owner_id
- slug
- title
- description
- visibility
- status
- created_at
- updated_at

### posts

- id
- space_id
- author_id
- caption
- visibility
- status
- published_at
- created_at
- updated_at

Valores iniciais de `visibility`:

- public
- followers
- private
- access_link

Futuro:

- subscribers
- paid

### media_assets

- id
- owner_id
- provider
- external_id
- media_type
- mime_type
- source_reference
- thumbnail_reference
- width
- height
- duration_seconds
- metadata jsonb
- status
- created_at

O campo canónico é a referência do provider. URLs temporárias não são identidade.

### post_media

- post_id
- media_asset_id
- position

### follows

- follower_id
- followed_profile_id
- created_at

### access_links

- id
- space_id
- token_hash
- label
- expires_at
- max_uses
- uses_count
- require_account
- revoked_at
- created_by
- created_at

### access_events

Auditoria mínima:

- id
- access_link_id
- viewer_user_id nullable
- event_type
- created_at
- metadata

## 4. Media Provider Contract

O produto deve tratar o fornecedor como detalhe de infraestrutura.

```ts
export type MediaProvider =
  | "mega"
  | "google_drive"
  | "supabase"
  | "cloudflare"
  | "mux"
  | "external";

export type MediaKind = "image" | "video";

export interface PlaybackSource {
  kind: MediaKind;
  url: string;
  mimeType?: string;
  posterUrl?: string;
  expiresAt?: string;
  supportsRange?: boolean;
}

export interface MediaProviderAdapter {
  provider: MediaProvider;
  resolve(asset: MediaAsset, context: PlaybackContext): Promise<PlaybackSource>;
}
```

A implementação pode mudar sem alterar o feed.

## 5. Fluxo público

```text
GET /@anaoliveira
  ↓
load public profile
  ↓
load posts visible to anonymous viewer
  ↓
load permitted media metadata
  ↓
resolve playback only for allowed assets
```

Conteúdo privado não deve ser retornado e depois escondido.

## 6. Fluxo por convite

```text
/s/<token>
  ↓
hash token
  ↓
lookup access_links
  ↓
validate revoked/expires/max_uses/account
  ↓
create/refresh authorized session
  ↓
load permitted private posts
  ↓
resolve media playback
  ↓
record access_event
```

## 7. Integração Supabase

Supabase fornece:

- Auth;
- Postgres;
- RLS;
- opcionalmente Storage para assets futuros.

Todas as mudanças estruturais devem ser migrations versionadas.

Princípios RLS:

- owner edita somente recursos próprios;
- anonymous lê apenas conteúdo público;
- authenticated lê conteúdo conforme política;
- acesso por convite deve passar por função/API controlada;
- service role exclusivamente server-side.

## 8. Testes de media existentes

Os testes de laboratório já demonstraram que o gateway de MEGA consegue trabalhar com pedidos HTTP Range e servir leitura parcial de JPEG/MP4. O frontend não deve incorporar a implementação do PoC; deve apenas consumir o adapter quando ele estiver integrado.

Google Drive também deve permanecer como provider substituível.

## 9. Visual

A linguagem das maquetes FaceLove deve ser preservada:

- base escura;
- contraste alto;
- accents rosa/rose;
- tipografia elegante;
- atmosfera premium/cinematográfica;
- glass/blur discreto;
- imagem e vídeo como protagonistas.

No Space individual, reduzir ornamentos para maximizar legibilidade, velocidade e foco na pessoa.

## 10. Evolução

### Alpha 0.1
Profile + feed + media + private access.

### Alpha 0.2
Auth + dashboard + criação/edição.

### Alpha 0.3
Follows + reactions/comments.

### Beta
Creator controls, analytics e políticas 18+ quando definidas.

### Futuro
Community, Dating, Events, Live, subscriptions e payments.
