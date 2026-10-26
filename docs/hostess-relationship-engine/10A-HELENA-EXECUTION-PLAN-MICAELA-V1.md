# 10A — Helena Execution Plan — Micaela V1

This document operationalizes `10-HELENA-GO-MICAELA-V1.md` and the full Hostess Relationship Engine dossier.

## Target

Create one persistent Hermes agent `facelove-micaela` and connect it to the existing FaceLove/Atendimento.Center stack without creating a parallel platform.

## Phase A — Audit

Identify and document the current:
- Evolution instances and actual BR/PT numbers;
- Chatwoot inboxes and current FaceLove inbox;
- Atendimento.Center services/repos;
- n8n workflows;
- Postgres contact/memory schema;
- AI provider adapters;
- existing webhook route;
- media/content services;
- payment services;
- secrets management;
- human handoff logic.

Reuse equivalents whenever they exist.

## Phase B — Hermes

Provision `facelove-micaela` with:
- Persona Canon V1;
- Relationship Planner;
- Response Writer;
- Memory Extractor;
- tool contract;
- structured output envelope.

Do not rely on Hermes internal memory alone. Per-contact memory remains explicitly keyed by `person_id` in the application data layer.

## Phase C — Channels

Map logical accounts:
- `micaela_br` → audited Brazil WhatsApp/Evolution/Chatwoot resources;
- `micaela_pt` → audited Portugal WhatsApp/Evolution/Chatwoot resources.

Both use the exact same Brazilian persona.

## Phase D — Core event layer

Implement:
- canonical inbound event;
- idempotency;
- outbound echo suppression;
- correlation ID;
- burst debounce;
- per-person conversation lock/queue.

## Phase E — Identity and memory

Implement/reuse:
- people;
- person identities;
- relationship state;
- rolling summary;
- durable memory;
- open loops;
- media delivery history;
- entitlement state.

WhatsApp identity = exact E.164. Social identity = platform-scoped ID. No automatic merging by name/photo.

## Phase F — World and Mission

World State must be shared across all Micaela conversations and include:
- availability;
- mood;
- current context;
- daily thread;
- `elisa_presence = absent | nearby | shared_activity`.

Mission State must hold verified Portugal-plan facts, including goal, verified funds, housing status and travel status. The model may talk about these facts but may not invent or modify them.

## Phase G — Multimodal

Implement:
- inbound audio → secure fetch → STT → context;
- inbound image → safe vision description → context;
- outbound voice → approved TTS → channel encoding → send;
- text fallback on TTS/media failure.

Never use image/voice to identify a person or prove adult age.

## Phase H — Content

Hermes asks for media by intent. Deterministic content service chooses a valid `media_asset_id` using:
- persona;
- context tags;
- delivery class;
- channel;
- maturity;
- adult status;
- entitlement;
- recent delivery history.

Log every delivery and avoid recent repetition.

## Phase I — Payment / access

Hermes may request a payment intent only. n8n/provider generates the actual transaction.

Never let Hermes invent PIX payload, QR code, IBAN, price, paid state or entitlement.

Separate voluntary support from paid digital content/access.

## Phase J — Chatwoot governance

Configure AI on/off and human takeover. Recommended labels:
`facelove`, `micaela`, `ai_on`, `ai_off`, `human_requested`, `adult_verified`, `premium`.

When AI is off, no conversational auto-reply is allowed.

## Phase K — Follow-up

Scheduler executes follow-ups proposed by the relationship engine only after:
- quiet-hours check;
- frequency-cap check;
- recent-inbound check;
- opt-out check;
- human-handoff check.

## Phase L — Social

Only after WhatsApp BR/PT is stable, map Instagram and Facebook to the same Micaela. Keep each platform identity separate until explicit verified linking.

## Required test sequence

1. BR first contact.
2. BR returning memory.
3. second-contact isolation.
4. PT same Brazilian Micaela.
5. burst debounce.
6. AI-off handoff.
7. inbound audio.
8. inbound image.
9. outbound audio/fallback.
10. free approved media without repetition.
11. restricted media blocked without eligibility/entitlement.
12. verified payment callback updates state.
13. World State stays coherent across contacts.
14. Elisa is only present when World State allows.

## Report

Return to MGJ: architecture found, components reused, code/workflows/migrations changed, Hermes config, channel mappings, Chatwoot configuration, Evolution instances, prompt versions, tool list, test results 1–14, production/preview state, blockers, security notes and rollback.

## Delivery rule

Build the smallest complete vertical slice and prove BR first. Then PT. Then multimodal/content/payment. Then social.