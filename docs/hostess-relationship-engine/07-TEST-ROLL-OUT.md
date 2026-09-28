# 07 — Test Plan and Rollout

## Rollout sequence

### Phase A — Shadow mode

- ingest real test messages;
- execute identity/memory/planner;
- do not auto-send;
- compare proposed reply with operator expectation;
- validate relationship deltas and memory writes.

### Phase B — Internal auto-reply

- allowlisted contacts only;
- BR and PT WhatsApp;
- text first;
- Chatwoot operator monitors.

### Phase C — Multimodal

- inbound audio transcription;
- image understanding;
- outbound audio;
- approved relationship-free media.

### Phase D — Premium

- product lookup;
- checkout;
- trusted payment confirmation;
- entitlement;
- access link/direct fulfillment.

### Phase E — Social

- Instagram DM;
- Facebook Messenger;
- platform-specific identity handling;
- verified cross-channel linking.

### Phase F — Proactive relationship follow-up

- open-loop follow-ups;
- quiet hours;
- frequency caps;
- suppression rules.

## Functional test matrix

### Identity

- new BR WhatsApp contact;
- returning BR contact;
- new PT contact;
- same display name + different phone remains separate;
- new Instagram identity remains separate from phone;
- explicit verified link merges identities correctly.

### Memory

- remembers preferred name;
- remembers pet/work/interests;
- revisits a real open loop;
- superseded memory stops being used;
- contact-specific memory does not leak to another person.

### Relationship pacing

- neutral user stays neutral/warm;
- reciprocal flirt may increase gradually;
- user de-escalates → agent de-escalates;
- one flirty message does not jump to high intimacy;
- premium purchase does not force emotional closeness;
- rejection of offer suppresses repeated immediate upsell.

### World State

- same-day story remains coherent across contacts;
- current context is not contradicted in next message;
- night/morning behavior follows configured timezone;
- agent is not presented as permanently available.

### Media

- approved free asset can be sent;
- recent duplicate is avoided;
- premium asset blocked without entitlement;
- adult asset blocked without 18+ status;
- provider failure falls back gracefully.

### Audio

- inbound voice transcription;
- noisy/unsupported audio fallback;
- outbound TTS;
- TTS failure → text fallback.

### Image

- normal photo produces relevant contextual response;
- image analysis does not create identity/age assertions;
- original retention follows policy.

### Human handoff

- label/assignment disables AI;
- no AI reply during handoff;
- operator receives context summary;
- AI resumes only after explicit enable.

### Commerce

- AI cannot fabricate price;
- checkout retrieved from product source;
- pending payment is not treated as paid;
- duplicate webhook does not duplicate entitlement;
- fulfillment is idempotent.

## Social test script

Repeat for Instagram and Facebook:

1. fresh account sends "oi";
2. several free-form turns;
3. send a normal image;
4. verify visual-context response;
5. leave and return later;
6. verify same-platform memory continuity;
7. request human;
8. verify AI stops;
9. release handoff;
10. continue;
11. optionally verify cross-channel linking through explicit flow.

## Acceptance criteria

Micaela v1 pilot is ready when:

- BR and PT WhatsApp use the same persona engine;
- contacts are isolated correctly;
- returning contact continues from memory;
- human handoff is reliable;
- responses are natural and channel-sized;
- adult paths are gated;
- free media selector works;
- premium delivery requires entitlement;
- payment state cannot be hallucinated;
- inbound audio works;
- image understanding works;
- outbound audio works with approved voice or safe fallback;
- Instagram/Facebook test status is documented and at least one end-to-end path per connected channel is verified;
- side effects are idempotent;
- secrets remain outside Git.

## Metrics

Operational:
- inbound events;
- AI runs;
- duplicate events suppressed;
- delivery failures;
- handoffs;
- media success;
- payment fulfillment success.

Relationship/product:
- returning-contact rate;
- conversation depth;
- voluntary re-engagement;
- offer frequency;
- premium interest;
- checkout conversion;
- cooling-off rate.

Do not optimize only for conversion. Durable engagement is a first-class product outcome.
