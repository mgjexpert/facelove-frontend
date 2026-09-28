# 04 — n8n / Atendimento.Center Workflows

## WF-01 — Channel Inbound Router

Trigger: Chatwoot webhook for inbound message.

Steps:
1. validate source/signature;
2. normalize event;
3. idempotency lookup;
4. map inbox/channel account to agent;
5. suppress outbound echoes;
6. check AI enabled/handoff;
7. send to debounce queue.

## WF-02 — Debounce + Multimodal Intake

Goal: combine message bursts.

Steps:
1. short configured debounce;
2. collect unprocessed messages for conversation;
3. securely fetch attachments;
4. audio → transcription;
5. image → description/tags;
6. video → metadata and optional limited processing;
7. produce one multimodal bundle.

Never infer age from appearance.

## WF-03 — Identity + Context Loader

Load:
- person and channel identities;
- relationship state;
- rolling summary;
- top durable memories;
- open loops;
- recent messages;
- current World State;
- FaceLove entitlement/premium status.

## WF-04 — Relationship Planner

Structured-output AI call.

Output:
- intent;
- relationship delta;
- reply strategy;
- media intent;
- commerce action;
- handoff;
- memory candidates;
- follow-up candidate.

No side effects.

## WF-05 — Response Generator + Humanizer

Input: planner decision.

Output:

~~~json
{
  "messages": [
    {"type": "text", "text": "..."}
  ],
  "preferred_delay_profile": "short|normal|long",
  "send_audio": false
}
~~~

Rules:
- channel-sized messages;
- no forced question at the end;
- adaptive locale/style;
- preserve Persona Canon.

## WF-06 — Media Selector

Triggered when planner requests media.

Query approved catalog using:
- persona=micaela;
- channel compatibility;
- adult-status compatibility;
- delivery class;
- recent-delivery exclusions;
- intent tags.

Return internal media_asset_id.

## WF-07 — Premium / Entitlement

State machine:

~~~text
none
→ interest
→ offer_shown
→ checkout_opened
→ paid
→ fulfilled
~~~

Actions:
- retrieve product/tier;
- create/fetch trusted checkout;
- wait for payment webhook;
- create entitlement;
- fulfill by FaceLove link or approved direct delivery.

AI cannot set "paid".

## WF-08 — Outbound Dispatcher

Channel renderer:
- WhatsApp via existing Chatwoot/Evolution route;
- Instagram/Facebook via connected Chatwoot/Meta route;
- web via Atendimento/Typebot adapter.

Responsibilities:
- ordering;
- delay;
- media upload;
- outbound event recording;
- retry without duplication.

## WF-09 — Memory Extractor

After successful response:
1. propose durable facts;
2. validate allowed categories;
3. update summary;
4. update open loops;
5. apply relationship delta.

Never store hidden reasoning.

## WF-10 — Follow-up Scheduler

Valid reasons:
- explicitly agreed continuation;
- real future event/open loop;
- relationship-appropriate check-in;
- long-term re-engagement.

Controls:
- frequency caps;
- quiet hours;
- recent-inbound suppression;
- human-handoff suppression;
- opt-out behavior.

Avoid generic scheduled "good morning" blasts.

## WF-11 — World State

One shared state per persona/time window.

Inputs:
- Persona Canon;
- real configured schedule/event data if available;
- operator constraints.

Outputs:
- availability;
- mood;
- current context;
- lightweight daily thread;
- conversation hooks.

## WF-12 — Human Handoff

Trigger:
- user requests human;
- assignment/label changes;
- internal rule.

Actions:
- ai_enabled=false;
- create operator summary;
- preserve memory;
- stop automated conversational outbound.

## Reliability

Every side-effect workflow needs:
- correlation ID;
- event/run IDs;
- retry policy;
- dead-letter path;
- alerting;
- idempotent send/fulfillment.
