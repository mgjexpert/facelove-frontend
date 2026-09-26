# FaceLove — Visual Alignment V2

**Purpose:** correct the current visual divergence between the implemented frontend and the approved FaceLove campaign/mockup direction.

**Priority:** HIGH — this is a visual/product correction, not a backend rewrite.

## 1. Current mismatch found in code

The current frontend is functionally useful but visually too close to a generic premium SaaS/social template.

Concrete causes in `main`:

1. `/` uses one `ana-fictional-cover.jpg` as the full hero background.
2. The expressive FaceLove logo is rendered as a small square plush app tile above the hero headline.
3. The hero is left-aligned, text-led and visually sparse, while the approved maquettes are brand-led, layered and editorial.
4. The main typography remains Arial + Georgia, which does not reproduce the luxury/social campaign language.
5. The ecosystem section is a grid of four generic feature cards.
6. People cards fall back to initials instead of photography.
7. The same Ana image is reused in multiple major landing sections.
8. `/spaces` is still a technical two-column introduction with a hardcoded Ana preview.
9. Non-Ana profiles can have empty covers and initial-letter avatars even though `profiles` already has `avatar_path` and `cover_path`.
10. The global CSS contains legacy FaceLove tokens followed by a second FaceLove 2.0 token block, creating a large cascade of old and new aesthetics.
11. The header is a separate dark bar above the hero; the campaign direction needs a more immersive overlay/surface relationship.
12. Current buttons/cards are clean but visually generic and do not carry enough FaceLove-specific identity.

The objective is not to turn the application into a poster. It is to make the first impression unmistakably FaceLove and then transition into calmer product UI.

---

## 2. Visual hierarchy correction

### Current hierarchy

```text
small square logo
↓
huge generic headline
↓
single portrait background
↓
CTA
↓
generic cards
```

### Target hierarchy

```text
cinematic world / collage
↓
FaceLove brand mark + wordmark
↓
Pessoas Reais · Momentos Reais · Conexões Reais
↓
short emotional proposition
↓
primary entry CTA
↓
real people / real Spaces / experiences
```

The brand, photography and atmosphere should create the first impression before explanatory copy.

---

## 3. Brand asset system

The application needs three distinct logo assets/components.

### A. App Icon

Use the plush/furry square FaceLove artwork.

Use for:

- favicon / PWA icon
- social avatar
- selected splash moments
- authentication accent
- campaign tiles

Do **not** use this as the primary navigation wordmark.

### B. FaceLove Wordmark

Transparent background.

Visual target:

- `Face`: ivory/soft white
- `Love`: saturated FaceLove pink
- heart detail inside/around Love
- subtle depth
- no square/furry background

Use for:

- global header
- hero
- footer
- product surfaces

### C. FaceLove Heart Mark

Standalone interlocking heart mark.

Use for:

- compact mobile branding
- loading states
- badges
- buttons selectively
- app navigation accent

Update `FaceLoveLogo` to support explicit variants:

```tsx
<FaceLoveLogo variant="wordmark" />
<FaceLoveLogo variant="mark" />
<FaceLoveLogo variant="app-icon" />
```

Do not overload one image asset for all contexts.

---

## 4. Typography

Replace the current Arial/Georgia visual dependency.

Suggested system:

- UI / body: **Manrope** or **Inter**
- premium editorial display: **Cormorant Garamond**
- emotional script accent: **Allura** or equivalent, used very sparingly

Use `next/font`.

Rules:

- UI must stay readable.
- Script typography may appear only on short campaign phrases.
- Hero brand remains visually dominant.
- Avoid using serif italics as the only method of creating luxury.

Target examples:

```text
FaceLove
PESSOAS REAIS · MOMENTOS REAIS · CONEXÕES REAIS
Muito mais que um Dating
Vive mais. Conecta-te.
```

---

## 5. Landing hero — target composition

The landing hero should feel much closer to the supplied `Maquete_entrada` / `Maquete_Pub` universe.

### Desktop

Minimum 900px visual depth on large screens; full first viewport.

Use a layered editorial collage, not one full-bleed portrait.

Suggested composition:

```text
┌─────────────────────────────────────────────────────────────┐
│ transparent / glass header                                  │
│                                                             │
│ lifestyle      dark center / brand       friends/nightlife  │
│ photo stack    FaceLove wordmark         photo stack        │
│ 26–30%         40–48%                    26–30%              │
│                                                             │
│ beach          heart mark                group selfie       │
│ party          statement                 nightlife          │
│ travel         CTA                       phone/product UI    │
│                                                             │
│ ───────────── trust / experiences rail ─────────────────── │
└─────────────────────────────────────────────────────────────┘
```

### Center brand block

Primary visual:

- transparent FaceLove wordmark or mark
- not the square app icon

Eyebrow:

`PESSOAS REAIS · MOMENTOS REAIS · CONEXÕES REAIS`

Campaign line:

`Muito mais que um Dating`

Supporting copy:

short; maximum ~2 lines on desktop.

CTA:

`Entrar no FaceLove`

Secondary:

`Descobrir`

Domain lockup:

`FaceLove.Online`

### Photography

Use an approved public marketing set representing:

- friendship
- beach/travel
- nightlife
- groups
- real moments
- couple/romance
- events

Never source hero photography from private MEGA albums.

Only use media explicitly cleared for public/marketing usage.

### Collage treatment

- asymmetrical crops
- controlled diagonal/pink separators
- dark center area for legibility
- magenta bloom
- warm skin tones
- cinematic vignette
- selective blur/depth
- no excessive neon around every element

### Phone/product preview

One high-quality phone mockup is enough.

Prefer a real FaceLove UI screenshot/state over fabricated metrics.

Do not fill the hero with multiple phones if it reduces clarity.

---

## 6. Header

Current header behaves like a separate website bar.

Target:

### At top of hero

- transparent or near-transparent
- subtle bottom gradient
- compact wordmark
- navigation in soft white
- CTA pill in brand pink

### After scroll

- sticky glass surface
- `rgba(7,3,7,.80)`
- blur ~18px
- thin white-alpha border
- no hard opaque rectangle unless accessibility requires it

Desktop nav:

- Descobrir
- Spaces
- Community · em preparação
- Dating · em preparação
- Events · em preparação

Keep future modules clearly non-operational.

---

## 7. Replace generic ecosystem cards

The current four-card grid reads as SaaS feature cards.

Replace with **media-led ecosystem panels**.

### Spaces

Largest / active panel.

Visual:

- profile/Space preview
- public content mosaic
- hot-pink active edge

Copy:

`O teu espaço. As tuas histórias.`

### Community

Lifestyle/group image.

Status:

`Em preparação`

### Dating

Romantic/social image.

Status:

`Em preparação`

### Events

Nightlife/experience image.

Status:

`Em preparação`

Desktop may use a 2x2 or asymmetric editorial grid.

Mobile should use horizontal snap cards.

---

## 8. Real people section

Current landing cards with letter avatars are a major visual regression.

### Required improvement

Use `avatar_path` and `cover_path` already present in the `profiles` model.

Add a safe helper for public Supabase Storage paths.

If a profile does not yet have an approved public avatar:

1. prefer an approved public media asset for that Space;
2. otherwise use a high-quality neutral FaceLove placeholder;
3. initial-only avatars are final fallback, not the default design.

Card should include:

- real/approved avatar
- display name
- @username
- short bio
- optional location only when real data exists
- visual cover strip or image background

Never fabricate followers, online status, verification or engagement counts.

---

## 9. Public profile image resolution

The data model already contains:

- `profiles.avatar_path`
- `profiles.cover_path`

But `/@[username]` currently only uses the Ana hardcoded image and otherwise renders no cover.

Correct this.

### Target resolver

```ts
getPublicProfileImage(path)
```

Rules:

- resolve only from approved public Supabase Storage
- no private provider URLs
- no MEGA source usage
- handle null safely
- optimize through Next/Image-compatible URLs when possible

Profile page order:

1. `profile.cover_path`
2. approved public fallback
3. branded gradient placeholder

Avatar order:

1. `profile.avatar_path`
2. approved public media fallback
3. premium FaceLove placeholder
4. initial as last resort

---

## 10. Spaces directory redesign

Current `/spaces` is too technical and Ana-centric.

Target:

### Hero

`Descobre Spaces`

Short copy only.

### Featured grid

Visual cards driven by real published profiles.

Each card:

- cover image
- avatar
- display name
- handle
- 1-line bio
- visual link affordance

### Secondary discovery

- new Spaces
- public moments/posts
- future filters

Do not hardcode Ana as the central product experience once multiple Spaces exist.

---

## 11. Profile / Space visual target

Profiles should combine an Instagram-quality identity surface with FaceLove exclusivity.

### Header

- large cinematic cover
- gradient into app background
- avatar overlapping cover
- display name + handle
- bio
- action row
- access state

### Action design

Current disabled Follow / Message buttons make the product look unfinished.

For features not operational:

- either omit them from primary UI;
- or mark them elegantly as future, outside the main action row.

Do not show disabled primary actions as if the platform is broken.

Primary live actions should be functional:

- Share
- Private access
- Studio for owner

### Tabs

Target:

- Mural
- Fotos
- Vídeos
- Exclusivo
- Sobre

Only show tabs that have meaningful content.

---

## 12. Private album visual language

Locked content should feel premium, not like an error state.

Target card:

- dark velvet surface
- subtle blurred/abstract background
- heart-lock mark
- album title
- description
- tier/access status
- CTA

When authorized:

- clean media grid
- full-screen lightbox for images
- cinematic player for video
- FaceLove controls where needed
- keep HTTP Range/seek intact

No provider branding.

---

## 13. Landing content rhythm

Avoid repeated rectangles on a dark background.

Recommended rhythm:

1. **Hero campaign collage**
2. **Ecosystem visual panels**
3. **Real published people / Spaces**
4. **Editorial horizontal story**
5. **Spaces / private access product story**
6. **Real-life / experiences collage**
7. **Trust / privacy / control**
8. **Final FaceLove CTA**
9. **Rich footer**

Use changes in section density, image ratios and background depth to create editorial rhythm.

---

## 14. Color refinement

Core:

- background: `#070307`
- deep wine-black: `#0D060B`
- surface: `#140B11`
- elevated: `#1C1018`
- pink: `#FF1778`
- hot pink: `#FF2D8D`
- magenta: `#D90B67`
- blush: `#FF78AE`
- ivory: `#FFF9FC`

Use velvet burgundy gradients in campaign sections.

Avoid turning every border/icon/text into pink.

Pink is the signature accent; black/ivory creates the premium base.

---

## 15. CSS cleanup

The current `globals.css` contains old tokens and a second FaceLove 2.0 override block.

This must be normalized before further visual iteration.

Refactor without changing product behavior:

```text
styles/
  tokens.css
  base.css
  shell.css
  marketing.css
  spaces.css
  profile.css
  auth.css
  studio.css
```

If splitting files introduces unnecessary Next.js risk, keep one import entry but divide the CSS into these conceptual sections.

There must be one authoritative token definition.

Remove stale style rules after confirming no route depends on them.

---

## 16. Button and control language

Primary CTA:

- saturated pink
- full white text
- pill / soft capsule
- subtle glow only on hover

Secondary:

- dark translucent
- white-alpha border

Tertiary:

- text / icon only

Avoid generic gray rectangular controls.

Form inputs:

- dark surface
- 12–14px radius
- clear focus ring
- subtle inner highlight
- no bright border until focus

---

## 17. Mobile target

The current product must feel like a native social app on mobile.

### Landing

- reduced collage complexity
- no giant square app-icon above text
- FaceLove wordmark centered
- 1–2 focal photos
- CTA visible without excessive scrolling
- horizontal ecosystem panels

### Authenticated app

- bottom navigation
- safe-area spacing
- visual content reaches closer to screen edges
- profiles/media dominate
- avoid desktop card-in-card nesting

---

## 18. Marketing imagery governance

For all campaign surfaces:

- use only authorized public images;
- use confirmed adult models/users for sensual campaign imagery;
- preserve consent/usage records outside the public client;
- private Space albums are never marketing sources by default.

The design can be sensual and nightlife-oriented without making explicit content the core public brand.

---

## 19. Immediate implementation package

### Step 1 — Brand + shell

- create logo variants
- replace Arial/Georgia typography
- normalize tokens
- make header hero-aware/glass
- create responsive container system

### Step 2 — Landing hero

- replace single Ana background with editorial collage
- move square furry logo to app-icon role
- make wordmark/heart central
- introduce approved lifestyle imagery
- add brand/trust rail

### Step 3 — Landing body

- replace generic ecosystem cards
- render real people with public imagery
- remove repeated Ana image
- add editorial experience section

### Step 4 — Spaces

- replace Ana-first technical page with discovery UI
- use real profiles
- implement public avatar/cover resolver

### Step 5 — Profiles

- honor `avatar_path` and `cover_path`
- improve cover/avatar composition
- remove dead disabled primary actions
- upgrade tabs and private-album states

### Step 6 — Auth / Studio

- apply same visual system
- preserve all functionality

---

## 20. Visual acceptance criteria

The redesign is not complete until:

- a screenshot of `/` is immediately recognizable as the same brand universe as the supplied maquettes;
- the page no longer looks like a generic dark SaaS landing;
- FaceLove pink + black + ivory hierarchy is obvious;
- photography plays a major role;
- the square furry icon is used intentionally, not as the only brand asset;
- real profile imagery replaces initials where approved imagery exists;
- mobile feels like a consumer social product;
- private media security is unchanged;
- build/tests remain green.

### Screenshot review sizes

- 390 × 844
- 430 × 932
- 768 × 1024
- 1440 × 1000
- 1920 × 1080

Compare each screenshot side-by-side with the approved FaceLove maquettes before marking the phase complete.
