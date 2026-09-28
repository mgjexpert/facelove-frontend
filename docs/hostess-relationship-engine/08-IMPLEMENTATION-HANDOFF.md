# 08 — Immediate Implementation Handoff

This file is the execution order for the AI/agent managing Atendimento.Center.

## Step 0 — Audit first

Before creating anything, inspect existing equivalents:

- contact model;
- conversation persistence;
- agent/persona configuration;
- Chatwoot webhooks;
- Evolution adapters;
- n8n workflows;
- PostgreSQL schema;
- AI provider abstraction;
- media delivery services;
- payment/entitlement services.

Do not duplicate a schema or workflow that already exists.

## Step 1 — Register Micaela

Create one logical agent:

~~~text
micaela
~~~

Attach:
- micaela_br;
- micaela_pt.

Prepare:
- micaela_instagram;
- micaela_facebook.

Use one Persona Canon across channels.

## Step 2 — Canonical inbound event

Every channel adapter must emit the normalized event described in 01-ARCHITECTURE.md.

Add:
- correlation ID;
- idempotency;
- outbound-echo suppression.

## Step 3 — Identity + memory MVP

Implement or map:
- person;
- channel identity;
- relationship state;
- rolling summary;
- durable memory;
- open loops.

Use normalized E.164 for WhatsApp.

## Step 4 — Prompt/runtime package

Create versioned:
- Persona Canon;
- Relationship Planner prompt;
- Response Writer prompt;
- Memory Extractor prompt;
- Humanizer rules;
- adult eligibility gate.

Prompts receive structured data from DB/services.

## Step 5 — Chatwoot control surface

Configure:
- facelove;
- micaela;
- ai_on / ai_off;
- human_requested;
- adult_verified;
- premium.

Custom attributes should expose:
- person ID;
- agent;
- market;
- adult status;
- relationship stage;
- AI enabled;
- premium status.

## Step 6 — BR/PT WhatsApp vertical slice

Prove this path for both numbers:

~~~text
WhatsApp
→ Evolution
→ Chatwoot
→ Atendimento
→ identity/memory
→ planner
→ writer
→ Chatwoot/Evolution
→ WhatsApp
~~~

Prove returning-contact memory before adding premium.

## Step 7 — Multimodal

Implement:
- secure attachment retrieval;
- audio STT;
- image understanding;
- approved TTS;
- attachment/result logging.

Fallback to text when media processing fails.

## Step 8 — FaceLove content adapter

Do not scan arbitrary Drive folders on every conversation.

Consume a curated FaceLove catalog:
- relationship_free;
- preview;
- premium;
- event content.

Select by media_asset_id.

## Step 9 — Premium transaction path

Implement deterministic:

~~~text
interest
→ real catalog offer
→ checkout
→ payment confirmation
→ entitlement
→ fulfillment
~~~

No LLM may skip payment verification.

## Step 10 — Instagram/Facebook pilot

Connect test inboxes to the same inbound router.

Keep platform identities separate until verified cross-channel linking.

## Step 11 — World State

Create one controlled state per persona/time window.

MVP:
- availability;
- mood;
- current context;
- daily thread/hooks.

Add operator override.

## Step 12 — Follow-ups

Enable only after memory and handoff are stable.

Implement:
- open-loop follow-up;
- quiet hours;
- frequency caps;
- recent-inbound suppression;
- opt-out/stop behavior.

## Required implementation report

Return:
1. architecture found in Atendimento.Center;
2. existing components reused;
3. files/workflows changed;
4. DB migrations;
5. environment variables added;
6. webhook routes;
7. Chatwoot labels/attributes;
8. n8n workflow names/IDs;
9. tests executed;
10. BR result;
11. PT result;
12. Instagram result;
13. Facebook result;
14. premium entitlement result;
15. known limitations;
16. rollback instructions.

## Definition of done

Do not mark complete until:
- BR and PT receive/reply end-to-end;
- returning memory works;
- AI off/handoff works;
- duplicate events do not duplicate replies;
- adult media is blocked without adult eligibility;
- one approved free asset can be delivered;
- one premium entitlement can only be fulfilled after trusted payment confirmation;
- one inbound audio is transcribed;
- one inbound image is understood;
- one outbound audio is delivered or safely falls back;
- Instagram/Facebook adapter status is tested/documented.
