# AGENTS.md — FaceLove Frontend

Este ficheiro define como GPT Work e outros agentes devem trabalhar neste repositório.

## Objetivo atual

Construir **FaceLove Spaces Alpha 0.1** sem comprometer a evolução futura para Community, Dating, Events e Live.

A referência de demonstração é **Ana Oliveira / @anaoliveira**.

## Responsabilidade deste repositório

Trabalhar aqui quando a tarefa envolver:

- UI/UX do FaceLove;
- Next.js, React e TypeScript;
- autenticação;
- perfis;
- Spaces;
- mural/posts;
- permissões e links privados;
- player e componentes de media;
- integração com Supabase;
- rotas públicas e dashboard;
- design system;
- integração com o contrato de media produzido pelo repositório `facelove-conteudo`.

Não transformar este repositório num laboratório específico de MEGA ou Google Drive.

## Repositório irmão

`mgjexpert/facelove-conteudo` é o laboratório de media.

O frontend deve consumir um contrato estável de media. Se um provider exigir código experimental, criar ou validar primeiro a implementação no repositório de conteúdo e trazer para cá apenas a interface/adaptor necessária.

## Regra mais importante

**Nunca acoplar componentes React diretamente a URLs ou SDKs de MEGA/Drive.**

Errado:

```tsx
<video src={megaTemporaryUrl} />
```

Correto, conceitualmente:

```tsx
const playback = await resolvePlaybackSource(asset)
<MediaPlayer source={playback} />
```

## Segurança

- Nunca commitar `.env.local`.
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY`.
- Nunca commitar cookies/sessões de MEGA/Google.
- Nunca commitar URLs privadas de media que concedam acesso direto.
- Conteúdo privado deve ser autorizado no servidor.
- RLS deve existir antes de considerar uma tabela pronta.
- Não usar "esconder visualmente" como mecanismo de autorização.
- Tokens de convite persistidos devem ser hashados quando forem implementados de forma definitiva.

## Conteúdo de teste

Pode usar fotos/vídeos disponibilizados ao GPT Work para desenvolvimento, mas:

1. manter media fora do Git;
2. usar referências/provider IDs ou manifests sanitizados;
3. identificar Ana Oliveira como fixture/demo;
4. não inferir nomes, autoria, consentimento ou contexto íntimo a partir de ficheiros;
5. não tornar conteúdo privado publicamente acessível apenas para facilitar testes.

## Branches

Para trabalho experimental:

```text
work/spaces-alpha
work/media-player
work/private-access
work/ana-profile
```

Evitar mudanças experimentais diretamente em `main`.

## Primeiras tarefas do GPT Work

### 1. Scaffold do app
Inicializar Next.js App Router + TypeScript + Tailwind mantendo esta documentação.

### 2. Design tokens
Criar tokens sem hardcode repetido:

```text
--facelove-pink
--facelove-rose
--facelove-bg
--facelove-surface
--facelove-text
--facelove-muted
--facelove-border
```

Direção visual: dark premium, cinematográfica, rosa/rose como accent, mas o Space individual deve ser mais limpo e centrado no conteúdo que as maquetes institucionais.

### 3. Rotas Alpha
Implementar primeiro:

```text
/
/spaces
/@anaoliveira
/s/[token]
/login
/dashboard
```

### 4. Fixture Ana Oliveira
Criar fixture desacoplada de media real. Conteúdo deve poder chegar via API/manifest.

### 5. Media abstraction
Criar:

```text
src/lib/media/
  types.ts
  resolve-playback.ts
  providers/
```

Nenhum componente deve depender do provider.

### 6. Supabase
Somente depois do contrato visual e do modelo estarem estáveis, ligar Auth/Postgres usando migrations versionadas. Não criar tabelas manualmente sem migration.

## Critérios de aceite do perfil Ana

A página `/@anaoliveira` deve mostrar:

- cover;
- avatar;
- nome + username;
- bio;
- tabs Posts/Fotos/Vídeos/Sobre;
- feed responsivo;
- image cards;
- video cards;
- estados locked/unlocked;
- CTA Seguir;
- CTA Acesso privado;
- skeleton/loading;
- empty/error states.

## Critérios de aceite do acesso privado

`/s/[token]` deve suportar no Alpha:

- token inválido;
- token expirado;
- acesso válido;
- limite de utilizações, quando disponível;
- página privada sem indexação;
- media só resolvido depois da autorização.

## Não implementar ainda

Salvo instrução explícita:

- pagamentos;
- subscrições;
- marketplace adulto;
- live streaming de produção;
- matching/dating completo;
- tickets de Events;
- mensagens em tempo real;
- algoritmos de recomendação.

Preparar interfaces para extensão, mas não aumentar escopo.

## Entrega de cada sessão Work

Ao terminar uma sessão de implementação, registar no PR ou resumo:

- o que foi alterado;
- ficheiros principais;
- como executar;
- variáveis necessárias;
- testes executados;
- limitações;
- próximo passo recomendado.

Não substituir a arquitetura por uma solução mais rápida sem documentar a razão.
