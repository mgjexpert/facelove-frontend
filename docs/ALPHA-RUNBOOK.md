# Spaces Alpha 0.1 — execução e limites

## Arranque

```bash
npm ci
npm run dev
```

Abra `/`, `/spaces` e `/@anaoliveira`. Sem gateway, o perfil usa a fixture `fixtures/ana-oliveira.json` e `fixtures/ana-posts.json`. Há cartões públicos e bloqueados, mas nenhum URL de media privada é resolvido. O retrato de capa/avatar é uma personagem gerada especificamente para esta demo, não a pessoa presente nos media de teste.

Para a experiência local com media real, execute primeiro o repositório irmão `facelove-conteudo`: instale as dependências, gere o manifest privado com `npm run manifest:local` e inicie o gateway com `MEGA_FOLDER_URL` e `MEDIA_GATEWAY_TOKEN` no ambiente do servidor. Configure no frontend, **somente em `.env.local`**:

```text
MEDIA_GATEWAY_URL=http://127.0.0.1:4100
MEDIA_GATEWAY_TOKEN=<mesmo token do gateway>
FACELOVE_DEMO_ACCESS_TOKEN=<token aleatório do convite local>
FACELOVE_DEMO_COOKIE_SECRET=<segredo aleatório de pelo menos 32 bytes>
```

O gateway devolve catálogo sanitizado ao servidor Next.js. `/api/media/[key]` verifica autorização, encaminha `Range` e entrega o stream. Um convite válido em `/s/[token]` ativa cookie HttpOnly assinado por até 24 horas. `demo-preview` só funciona sem gateway configurado: demonstra a UI de acesso sem libertar media real. `/access` aceita o código recebido fora da aplicação.

## Contrato de dados

`src/lib/media/types.ts` define `MediaAsset`, `PlaybackSource` e visibilidades. `getSpaceContent` é a fronteira atual entre fixture e futura leitura Supabase. O `MediaCard` e o `MediaPlayer` recebem apenas assets e uma URL FaceLove `/api/media/:key`, sem bibliotecas MEGA/Drive.

O Supabase `uwsuavbskwankqchqkcu` ainda não possui tabelas `public`; esta etapa não cria schema ou contas reais. A ligação de Auth/Postgres será feita com migrations versionadas e RLS antes de substituir a fixture. Nenhuma chave service role entra no browser. O convite local não é um substituto de links persistidos, revogação ou controlo de utilização na base de dados.

## Verificação

```bash
npm run typecheck
npm run build
```

O laboratório irmão executa `npm test` e `npm run verify:live`. A preview integrada precisa dos dois servidores na mesma rede local e do manifest privado criado a partir de media a que o operador tenha direito de acesso.

## Limitações da preview

- Os botões Seguir e Mensagem são apenas estado visual; não simulam ações concluídas.
- O gateway MEGA usa um processo Node persistente. Não colocar o streaming de vídeos grandes numa Function Vercel sem validar duração, tráfego e quota.
- Falta geração de thumbnails, transcodificação, persistência de convites e autenticação Supabase.
- A versão publicada sem gateway mostra cartões de demonstração. Media real e tokens locais nunca entram no Git nem numa preview pública.
