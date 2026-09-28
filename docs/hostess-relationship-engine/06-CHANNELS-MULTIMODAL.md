# 06 — Channels and Multimodal

## WhatsApp BR and PT

Both lines map to the same logical agent "micaela" and separate channel accounts.

### micaela_br

~~~text
market: BR
default_locale: pt-BR
phone_prefix: +55
~~~

### micaela_pt

~~~text
market: PT
default_locale: Portuguese adapted to interlocutor
phone_prefix: +351
~~~

Channel account sets defaults; it does not rewrite Persona Canon.

## Instagram and Facebook

Use exactly the same normalized inbound event and relationship engine.

Initial social pilot:
- one Instagram inbox/account;
- one Facebook Messenger inbox/page;
- inbound routed through Chatwoot or the existing Atendimento social adapter;
- platform-scoped user ID stored as person_identity;
- no automatic merge to WhatsApp by name or profile image.

Cross-channel continuity begins only after an explicit/verified identity link.

## Audio inbound

~~~text
voice attachment
→ secure server-side download
→ mime/size validation
→ speech-to-text
→ transcript
→ multimodal message bundle
→ relationship engine
~~~

Operational metadata can include:
- language;
- duration;
- transcription status;
- attachment ID.

Do not require permanent retention of the original audio.

## Audio outbound

~~~text
planner asks for voice
→ response writer creates short spoken text
→ TTS with approved/consented voice
→ channel-compatible encoding
→ dispatcher
→ delivery log
~~~

Use only an approved synthetic voice or a voice for which the necessary consent exists.

The system should not answer every audio with audio. Selection depends on:
- user preference;
- context;
- recent media behavior;
- World State;
- operational availability.

If TTS fails, fall back to text.

## Image inbound

~~~text
image
→ secure download
→ visual understanding
→ concise description + useful tags
→ optional memory candidate
→ response
~~~

Useful categories:
- pet;
- food;
- travel/environment;
- clothing colors/style;
- object/product;
- visible text when relevant;
- broad non-sensitive scene context.

Do not:
- infer identity from face;
- perform biometric matching;
- infer age as proof of adulthood;
- infer sensitive attributes unnecessarily.

## Video inbound

Implement after image/audio baseline.

Possible processing:
- metadata;
- audio transcription;
- a limited number of representative frames;
- user caption/context.

Avoid expensive full-video analysis when not necessary.

## Reactions and stickers

Normalize as lightweight interaction context.

They can affect tone/engagement slightly but must not cause major relationship-stage jumps.

## Typing and delays

Delay is controlled by orchestration, not by the language model.

Delay profile can consider:
- message length;
- media generation;
- World State availability;
- channel norms.

Avoid extreme artificial waits designed to pressure the user.

## Message rendering

### WhatsApp
Prefer short/medium messages. Split naturally when useful.

### Instagram/Facebook
Allow slightly longer messages but keep conversational rhythm.

### Web/Typebot
Can use buttons/structured options where the experience benefits, but should hand off to the same relationship engine for free-form conversation.

## Quiet hours

Use a known contact timezone when available.

Fallback:
- market-level timezone defaults;
- never assume precise physical location from phone prefix alone.

Proactive follow-ups should respect quiet-hour configuration.
