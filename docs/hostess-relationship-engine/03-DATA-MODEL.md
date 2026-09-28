# 03 — Data Model

## Principle

Conversation state belongs to Atendimento.Center. Product/media/access state belongs to FaceLove.

Do not duplicate the complete FaceLove catalog inside n8n.

## Recommended entities

### ai_agents

~~~text
id
slug
display_name
persona_canon_version
default_language
status
created_at
updated_at
~~~

Pilot slug: "micaela"

### ai_agent_channels

~~~text
id
agent_id
channel
channel_account
market
default_locale
default_timezone
chatwoot_inbox_id
evolution_instance
is_active
config_json
~~~

Initial:
- micaela_br
- micaela_pt

Prepared:
- micaela_instagram
- micaela_facebook

### people

~~~text
id
preferred_name
adult_status unknown|confirmed_18_plus|not_eligible
preferred_language
country_code
timezone
created_at
last_seen_at
~~~

### person_identities

~~~text
id
person_id
identity_type whatsapp|chatwoot|instagram|facebook|facelove
identity_value
channel_account
verified_link boolean
created_at
~~~

Never merge people from display name alone.

### relationship_states

~~~text
person_id
agent_id
stage
familiarity
trust
emotional_closeness
flirt_intensity
reciprocity
engagement
purchase_readiness
relationship_depth
last_mood
last_topic
last_interaction_at
updated_at
~~~

### conversation_memories

~~~text
id
person_id
agent_id
category
fact
confidence
source_message_id
importance
first_seen_at
last_confirmed_at
expires_at nullable
status active|superseded|deleted
~~~

### conversation_summaries

~~~text
conversation_id
person_id
agent_id
rolling_summary
updated_at
~~~

### open_loops

Examples:
- asked about a job interview the next day;
- user promised to send a pet photo;
- conversation paused before an answer.

~~~text
id
person_id
agent_id
topic
status
due_after nullable
priority
created_at
resolved_at
~~~

### world_states

~~~text
id
agent_id
valid_from
valid_until
timezone
availability
mood
current_context
today_story
conversation_hooks jsonb
canon_version
~~~

### ai_media_deliveries

~~~text
id
person_id
agent_id
media_asset_id
delivery_class free|preview|premium
channel
conversation_id
sent_at
result
~~~

Used to avoid repetitive media.

### ai_agent_runs

~~~text
id
event_id
person_id
agent_id
conversation_id
planner_version
prompt_version
model
decision_json
latency_ms
result
created_at
~~~

Persist operational decisions only. Do not persist hidden chain-of-thought.

### ai_followups

~~~text
id
person_id
agent_id
reason
earliest_at
latest_at
status
message_strategy
created_at
~~~

## Chatwoot custom attributes

Recommended:
- facelove_person_id
- facelove_agent=micaela
- market=BR|PT|...
- adult_status
- relationship_stage
- ai_enabled
- premium_status
- last_ai_run_id

Recommended labels:
- facelove
- micaela
- ai_on
- ai_off
- human_requested
- premium
- adult_verified

## Identity resolution

Priority:
1. exact WhatsApp E.164 identity;
2. exact platform-scoped social identity;
3. authenticated FaceLove account link;
4. explicit cross-channel link verified by workflow.

Never use fuzzy matching of names/photos to merge identities automatically.

## Memory write rules

Good memory candidates:
- preferred name;
- stable preferences;
- city/country if volunteered;
- pets;
- work/interests;
- birthday when explicitly shared and appropriate;
- important commitments;
- open conversational loops.

Avoid storing:
- unnecessary intimate details;
- raw private media indefinitely;
- sensitive data not needed for the interaction;
- inferred protected traits.

Memory extractor proposes candidates. Deterministic validation decides what is persisted.
