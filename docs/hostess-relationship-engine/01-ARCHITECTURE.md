# 01 — Architecture

## Target architecture

~~~text
WhatsApp BR (+55) ─┐
WhatsApp PT (+351) ├─ Evolution ─┐
                   │             │
Instagram DM ──────┤             │
Facebook Messenger ┤─────────────┼─ Chatwoot
Web / Typebot ─────┘             │
                                 ↓
                         Atendimento.Center
                              + n8n
                                 ↓
                  Hostess Relationship Engine
       Identity → Memory → Planner → Persona → Reply
                     ↘ Media / Commerce ↙
                                 ↓
                 Atendimento Postgres + FaceLove
                                 ↓
                         Outbound Dispatcher
                                 ↓
                  Chatwoot / Evolution / Meta
~~~

## Ownership boundaries

### Atendimento.Center/Postgres owns

- normalized contact identity used by AI;
- channel identities;
- current relationship state;
- rolling conversation summaries;
- durable user facts learned in conversation;
- open loops;
- follow-up state;
- AI run metadata;
- human handoff state;
- conversational analytics.

### FaceLove/Supabase owns

- profile and persona references used by the product;
- media catalog;
- albums;
- access links;
- entitlement/access state;
- future premium products/tiers;
- product-side access audit.

### facelove-conteudo owns

- provider adapters;
- provider source references;
- streaming/playback resolution;
- media metadata enrichment;
- provider-specific delivery behavior.

### Chatwoot owns

- operational inbox;
- current conversation;
- assignment;
- human operator interface;
- labels/custom attributes used for routing.

### n8n owns

- webhook orchestration;
- retries;
- idempotent workflow execution;
- calls between Chatwoot, Evolution, AI, databases and FaceLove services.

### Typebot owns

- optional acquisition/onboarding micro-flows;
- forms/campaign entry flows;
- deterministic fallback flows.

Typebot is not the long-term source of relationship memory.

## Inbound pipeline

~~~text
event received
→ verify source
→ idempotency check
→ normalize channel event
→ ignore own outbound echo
→ map channel to persona
→ resolve contact identity
→ load handoff state
→ debounce message burst
→ process attachments
→ load memory + relationship
→ enforce adult eligibility where relevant
→ load World State
→ Relationship Planner
→ Response Generator
→ optional media/commerce action
→ channel renderer
→ send
→ persist result
→ extract memory candidates
→ update relationship state
~~~

## Canonical normalized event

~~~json
{
  "event_id": "provider-event-id",
  "channel": "whatsapp|instagram|facebook|web",
  "channel_account": "micaela_br|micaela_pt|...",
  "conversation_external_id": "...",
  "sender_external_id": "...",
  "sender_phone_e164": "+55...",
  "direction": "inbound",
  "message_type": "text|audio|image|video|document|reaction",
  "text": "...",
  "attachments": [],
  "timestamp": "ISO-8601",
  "metadata": {}
}
~~~

## Idempotency

Persist the tuple:

"event_id + channel + channel_account"

If already processed:
- do not regenerate AI;
- do not resend media;
- do not rerun commerce actions.

## Human handoff

AI stops when:
- Chatwoot assignment/label policy disables AI;
- label "ai_off" exists;
- custom attribute "ai_enabled=false";
- user explicitly asks for a human and routing policy requires handoff;
- an operational/safety condition requires review.

Resume only after an authorized state change.

## Side-effect rule

AI recommends actions. Deterministic code executes them.

Examples:
- AI may output "commerce_action=offer"; n8n retrieves a real offer.
- AI may output "media_intent=casual"; media service selects an approved asset.
- AI may never invent payment success, an entitlement, an asset URL or an event booking.
