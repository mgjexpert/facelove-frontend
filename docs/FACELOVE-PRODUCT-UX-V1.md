# FaceLove — Product UX/UI V1

**Status:** implementation brief  
**Phase:** Alpha funcional → produto coerente  
**Rule:** evolution, not rebuild.

## Objective

Transform the existing FaceLove technical Alpha into a premium, mobile-first social product while preserving the working Supabase/Auth/private-media architecture.

Brand direction: **Pessoas Reais · Momentos Reais · Conexões Reais.**

FaceLove is the ecosystem. Spaces is the first operational module. Community, Dating, Events and Live are future modules and must not be represented as already-functional products.

## Non-negotiable preservation

Before visual changes, audit current `main`, routes, components, Supabase schema/RLS, Auth, profiles, spaces, posts, albums, media assets/sources, access links/events and the frontend → gateway → Supabase → MEGA path.

Do not replace working data with mocks. Preserve:

- Supabase Auth and RLS
- persistent profiles, Spaces, posts and albums
- private invitation flow and signed access sessions
- access expiration, limits, revocation and activation audit
- server-side private source resolution
- MEGA gateway abstraction
- HTTP Range and video seek
- Space/album isolation
- secrets exclusively server-side

MEGA is infrastructure, not product UI. The user sees Fotos, Vídeos, Álbuns, Conteúdo and Acesso — never provider URLs, source keys, gateway tokens or external IDs.

## Visual direction

The supplied FaceLove mockups are **art direction**, not literal page layouts.

Translate their identity into product UI:

- near-black cinematic surfaces
- hot pink / magenta brand accents
- expressive plush/velvet FaceLove logo for hero/marketing moments
- premium lifestyle photography
- controlled glow and glass
- high-contrast readable typography
- sensual but elegant atmosphere
- calm application surfaces beneath expressive marketing

Marketing can be visually intense; application UI must remain clean, fast and legible.

### Core tokens

- background: `#070307`
- secondary background: `#0D060B`
- surface: `#140B11`
- elevated: `#1C1018`
- brand pink: `#FF1778`
- hot pink: `#FF2D8D`
- magenta: `#D90B67`
- primary text: `#FFF9FC`
- secondary text: `#CBB8C2`
- muted text: `#8F7D87`
- borders: subtle white/brand alpha
- card radius: ~20px
- motion: subtle, <=450ms, respect reduced motion

## Product shell

Create reusable FaceLove primitives rather than route-specific duplicated UI:

`FaceLoveLogo`, `AppHeader`, `MobileNavigation`, `Avatar`, `VerifiedBadge`, `ProfileCard`, `SpaceCard`, `PostCard`, `MediaGrid`, `MediaCard`, `VideoPlayer`, `AlbumCard`, `LockedAlbum`, `AccessState`, buttons, inputs, panels, modal, toast, skeleton and empty state.

Desktop header: logo; Descobrir; Spaces; future ecosystem entries; authentication/account actions.

Authenticated mobile: app-like bottom navigation with safe-area support.

## Route priorities

### 1. `/` — ecosystem gateway

Build a cinematic but performant entry point.

Hero:
- FaceLove expressive logo
- eyebrow: “PESSOAS REAIS • MOMENTOS REAIS • CONEXÕES REAIS”
- headline: “Vive. Partilha. Conecta-te.”
- supporting copy about people, stories, communities and experiences
- primary CTA: signup when logged out, dashboard when logged in
- secondary CTA: explore

Below hero:
- ecosystem selector: Spaces active; Community/Dating/Events clearly future
- “Descobre pessoas no FaceLove” using **real published Supabase profiles**
- public Spaces/content preview using **real public data**
- real-world lifestyle/editorial section
- final account CTA

Never load private media for landing previews.

### 2. `/spaces`

Turn the current catalog into genuine social discovery: featured/new public profiles, elegant responsive cards, search-ready architecture, no fake metrics.

### 3. `/@[username]`

Premium personal Space with cover/avatar identity, name, handle, bio, location and only real statistics.

Tabs/sections should evolve toward Mural, Fotos, Vídeos and Exclusivo while respecting the current data model.

Public media renders normally. Locked albums show only safe public metadata/cover. Authorized private catalogs load only after access validation.

### 4. Private album experience

States: locked, checking, authorized, expired, revoked, invalid.

Authorized images: responsive grid/masonry + lightbox + lazy loading.

Authorized videos: cinematic cards/player through existing FaceLove proxy. Preserve HTTP Range and seek.

Never leak provider identity or private source metadata.

### 5. Auth

Redesign `/login`, `/signup`, confirmation and error states so they feel native to FaceLove rather than generic Supabase forms. Preserve existing auth logic, including verified handle behavior where currently supported.

### 6. `/dashboard` → FaceLove Studio

Evolve the existing dashboard, do not replace it.

Navigation target: Visão geral, Perfil, Mural, Álbuns, Media, Acessos, Definições.

Only show real data. Access management should expose safe metadata such as album, label, grant kind, expiration, uses and status — never original stored tokens or provider secrets.

## Mobile-first requirements

Audit at 375, 390, 768 and 1440px. Minimum 44px tap targets. No horizontal overflow. Respect safe areas. Prioritize content over decorative effects. Forms must behave correctly with mobile keyboards.

## Performance

Use responsive images, lazy loading below fold, stable aspect-ratio skeletons, optimized fonts and dynamic imports where useful. Do not preload private media. Do not fetch every Space's media on discovery pages. Preserve authorized Range streaming.

## Do not fake

Do not implement fake matches, messaging, payments, subscriptions, followers, likes, online state, reservations or social proof. Future modules can have architecture/navigation placeholders only when explicitly marked as future.

## Implementation sequence

1. Audit current baseline and run build/tests.
2. Establish design tokens and reusable primitives.
3. Implement shared shell/navigation.
4. Redesign landing with real public Supabase data.
5. Redesign Spaces discovery and profile.
6. Redesign private album/access states without changing authorization semantics.
7. Redesign authentication.
8. Evolve dashboard into FaceLove Studio.
9. Add loading/error/empty/404/access-expiry states.
10. Run responsive, accessibility, performance and regression audit.

## Definition of done

Before proposing merge:

- build passes
- relevant tests pass
- existing Spaces work
- private invitations still work
- authorized images load
- authorized MP4 playback and seek work
- unauthorized media remains blocked
- login works
- dashboard works
- no secrets/private provider URLs reach client UI
- screenshots are produced for key routes at mobile and desktop widths
- changed-files summary and regression report are documented

## Working instruction

Act as senior product designer + senior frontend engineer + conservative maintainer. The current backend/media work is valuable and must not be destabilized for visual convenience.

The desired outcome is not a collection of redesigned pages. It is **one recognizable FaceLove ecosystem**, with the supplied campaign imagery defining the emotional world and the real application translating that world into a restrained, premium interface.
