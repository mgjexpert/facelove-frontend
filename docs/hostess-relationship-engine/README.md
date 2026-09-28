# FaceLove Hostess Relationship Engine — Blueprint v1

Status: **implementation-ready specification**  
Date: **2026-09-28**  
Pilot persona: **Micaela**  
Priority markets: **Brazil + Portugal**  
Runtime target: **Atendimento.Center + n8n + Chatwoot + Evolution API + AI**  
Product integration: **FaceLove.Online + FaceLove media/access catalog**

## Purpose

This dossier defines the technical and conversational architecture for a persistent, multimodal FaceLove Hostess.

The objective is not to reproduce a linear Typebot funnel. The objective is to build a long-running relationship engine that:

- recognizes returning contacts;
- safely links identities across channels when verified;
- remembers relevant personal context and open conversational threads;
- adapts warmth, flirt and intimacy to reciprocity;
- keeps a coherent day-to-day persona and availability;
- supports text, audio, images and videos;
- can share approved free media without turning every interaction into a sale;
- can introduce and fulfill premium content contextually;
- supports WhatsApp Brazil and Portugal first;
- extends to Instagram DM, Facebook Messenger and web/Typebot entrypoints;
- allows immediate human takeover in Chatwoot.

## Repository responsibility

This blueprint lives in "facelove-frontend" because that repository is the product source of truth.

Provider-specific media ingestion, playback and storage remain in "mgjexpert/facelove-conteudo".

Conversational runtime remains in Atendimento.Center.

~~~text
Channels
  ↓
Evolution / Meta / Web
  ↓
Chatwoot
  ↓
Atendimento.Center + n8n
  ↓
Identity + Memory + Relationship + Persona + AI
  ↓
FaceLove content/access services
  ↓
Chatwoot / Evolution / Meta outbound
~~~

## Pilot channels

### Micaela BR
- Channel: WhatsApp
- Market: Brazil
- Expected E.164 prefix: +55
- Default language: pt-BR
- Tone: Brazilian casual

### Micaela PT
- Channel: WhatsApp
- Market: Portugal
- Expected E.164 prefix: +351
- Default language: Portuguese adapted to the interlocutor
- Persona remains Brazilian. Residence/travel facts come from Persona Canon and World State and are never reinvented per contact.

### Social
- Instagram DM
- Facebook Messenger
- future web chat / Typebot acquisition entrypoints

## Product principle

**Relationship first, monetization contextual.**

The engine must be able to decide that the correct commercial action for a conversation is "none".

Premium content is a product capability, not the objective of every message.

## Dossier

- 01-ARCHITECTURE.md — end-to-end architecture and ownership
- 02-CONVERSATION-ENGINE.md — relationship model and prompt/runtime stack
- 03-DATA-MODEL.md — identity, memory and state schema
- 04-N8N-WORKFLOWS.md — orchestration map
- 05-CONTENT-PREMIUM.md — free/premium content integration
- 06-CHANNELS-MULTIMODAL.md — WhatsApp, Instagram, Facebook, audio and images
- 07-TEST-ROLL-OUT.md — rollout, tests and acceptance
- 08-IMPLEMENTATION-HANDOFF.md — immediate checklist for the implementation agent
- 09-PROMPT-PACK.md — versioned Persona/Planner/Writer/Memory prompt templates

## Non-negotiable constraints

- Adult/premium adult paths require explicit 18+ eligibility.
- Never infer age from appearance.
- Never send adult media to an unknown-age contact.
- Never create fake payment events, fake scarcity, false emergencies or invented financial hardship.
- Do not volunteer implementation details in ordinary conversation. If directly asked whether the experience is virtual/AI, answer accurately and briefly rather than making a false denial.
- Human operators can pause AI immediately.
- Secrets, cookies, tokens and private signed media URLs never enter Git.
- Private media authorization is server-side.
- Contact identities are never merged across channels based only on display name.
