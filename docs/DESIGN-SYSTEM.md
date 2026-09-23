# FaceLove — Direção Visual

## Princípio

O FaceLove deve parecer **premium, humano, cinematográfico e contemporâneo**, sem parecer um clone visual de uma plataforma adulta.

As maquetes iniciais definiram uma linguagem de:

- fundos negros / graphite / midnight;
- rosa e rose neon como accent;
- branco de alto contraste;
- luz suave, bokeh e reflexos;
- tipografia editorial elegante em títulos;
- UI moderna e limpa em produto;
- fotografia como protagonista.

## Dois níveis visuais

### Marca / landing / Events
Pode ser mais rica, cinematográfica e emocional.

### Spaces / perfil / feed
Deve ser mais silenciosa:
- menos efeitos;
- mais área para media;
- hierarquia clara;
- excelente legibilidade;
- interação familiar;
- mobile-first.

## Tokens iniciais

Sugestão sem fixar valores definitivos:

```css
--facelove-bg
--facelove-bg-elevated
--facelove-surface
--facelove-surface-hover
--facelove-text
--facelove-text-muted
--facelove-border
--facelove-pink
--facelove-rose
--facelove-danger
--facelove-success
--facelove-overlay
```

Nenhum componente deve espalhar hex codes da marca diretamente.

## Ana Oliveira — composição alvo

### Header
- cover full-width;
- avatar sobreposto;
- display name;
- @username;
- bio;
- metadados discretos;
- CTAs Seguir / Mensagem / Acesso privado.

### Tabs
- Posts
- Fotos
- Vídeos
- Sobre

### Feed
Mistura editorial de:
- cards de texto + media;
- galleries;
- vídeo com poster;
- cards bloqueados;
- badges de visibilidade.

### Conteúdo bloqueado
Não sexualizar o estado visual. Usar linguagem neutra:

```text
Conteúdo privado
Disponível através de convite.
[Introduzir acesso]
```

## Acesso privado

A rota `/s/[token]` deve manter a marca FaceLove e comunicar:

- quem convidou;
- duração do acesso quando relevante;
- estado válido/expirado;
- privacidade;
- CTA claro.

## Componentes base

Prioridade:

- Button
- IconButton
- Card
- Avatar
- Badge
- Tabs
- Modal/Sheet
- MediaCard
- MediaPlayer
- LockedMedia
- ProfileHeader
- PostCard
- AccessGate
- Skeleton
- Toast

## Motion

Usar animações discretas:
- 150–250 ms para UI;
- fades/scale pequenos;
- não atrasar artificialmente navegação;
- respeitar `prefers-reduced-motion`.

## Responsividade

Primeiro validar:
- 390 px mobile;
- tablet;
- desktop 1440 px.

O conteúdo de perfil deve continuar agradável em ecrãs grandes sem simplesmente esticar o feed.

## Acessibilidade

- contraste suficiente;
- focus states;
- navegação por teclado;
- alt text;
- captions/controles em vídeo quando disponíveis;
- botões com labels sem depender apenas de ícones.
