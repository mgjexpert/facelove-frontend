# FaceLove × Atendimento.Center — Integration Blueprint V1

**Status:** operational handoff + next implementation phase  
**Date:** 2026-09-26  
**Tenant:** FaceLove  
**Principle:** preserve the working production channel and evolve around it.

## 1. Confirmed operational baseline

The FaceLove WhatsApp channel is operational in production through the existing Atendimento.Center stack.

Current confirmed flow:

```text
WhatsApp
  ↓
Evolution API
  ↓
Chatwoot inbox (FaceLove tenant/channel)
  ↓
Human operator
  ↓
Evolution API
  ↓
WhatsApp
```

Bidirectional messaging has been validated with a real device, including delivery back to the phone and READ status propagation.

The self-hosted platform currently includes:

- Atlas VPS platform
- Chatwoot
- Evolution API
- Redis
- PostgreSQL
- Typebot / Atendimento Flow
- Atendimento.Center backend
- private Docker networking
- shared edge networking

The FaceLove WhatsApp instance is already provisioned and connected. **Do not reprovision, rename or replace the working instance during this phase.**

## 2. Networking rule

The working solution uses trusted service-to-service communication inside Docker rather than sending internal webhook traffic through public DNS.

Do not undo this merely to silence a non-blocking residual Evolution log warning.

Treat the current internal network path as the baseline until a controlled infrastructure change is explicitly required.

Do not hardcode deployment-specific internal hostnames in FaceLove product code. Keep infrastructure routing in Atendimento.Center/Evolution/Chatwoot configuration.

## 3. Residual Evolution warning

A residual Evolution API log may report a failed source-ID update after a successful message send.

Current evidence indicates:

- outbound delivery succeeds;
- inbound delivery succeeds;
- Chatwoot receives conversation events;
- READ status is received;
- the warning occurs after the successful operational path.

Therefore:

**Do not modify DNS, Caddy, container networks or the connected FaceLove instance solely because of this warning.**

Investigate only if it begins to correlate with a real functional failure.

## 4. Security action required

During troubleshooting, sensitive integration credentials appeared in logs.

Affected classes include:

- Chatwoot Channel::Api signing secret;
- Chatwoot access/integration token configured in Evolution.

Never place those values in Git, screenshots, prompts, tickets or documentation.

### Coordinated rotation runbook

Perform rotation in a controlled maintenance window:

1. Record the current working FaceLove integration topology without copying secret values.
2. Create/rotate the Chatwoot integration credential.
3. Update the corresponding Evolution FaceLove integration configuration in the same maintenance window.
4. Rotate the Channel::Api signing secret where applicable and update the counterpart that validates/signs requests.
5. Restart/reload only the services that require it.
6. Test inbound WhatsApp → Chatwoot.
7. Test outbound Chatwoot → WhatsApp.
8. Confirm message status updates.
9. Confirm no authentication failures in Chatwoot/Evolution logs.
10. Revoke the old credentials only after the new path has passed both-direction testing.

Avoid rotating both sides blindly without a rollback reference.

## 5. Target FaceLove support architecture

```text
Customer
   ↓
WhatsApp / Instagram / Messenger / FaceLove Webchat
   ↓
Atendimento.Center
   ↓
Tenant resolver: FACELOVE
   ↓
Conversation Router
   ├── Typebot / Flow Engine
   │      deterministic journeys
   │
   ├── FaceLove Hostess AI
   │      conversational understanding
   │      knowledge + intent
   │      controlled actions
   │
   └── Chatwoot Human Operator
          assisted/manual service
   ↓
FaceLove CRM / operational state
   ↓
Lead stage / activity / follow-up / automation
```

Atendimento.Center is the orchestration and customer-service layer.

The FaceLove Supabase project remains the **product data layer** for identities, Spaces, posts, albums and product access.

Do not collapse both databases into one concern.

## 6. Boundary between FaceLove product and Atendimento.Center

### FaceLove application owns

- product account identity;
- public profile / Space;
- posts;
- albums;
- media metadata;
- private-access entitlements;
- product authentication;
- product settings.

### Atendimento.Center owns

- inbound/outbound conversation;
- omnichannel contact identity;
- support context;
- lead qualification;
- operational CRM stage;
- assignment;
- human handoff;
- follow-up;
- automation execution;
- channel metadata.

### Integration principle

Link the systems using explicit identifiers after verification.

Do **not** copy private media-source credentials, MEGA links or Supabase secrets into the CRM.

Potential safe link fields:

- `facelove_user_id`
- `facelove_profile_id`
- `facelove_username`
- `chatwoot_contact_id`
- `channel_contact_id`

Only attach a FaceLove product identity to a messaging contact when the identity relationship is verified.

## 7. Router state model

Every inbound message should resolve:

```json
{
  "tenant": "facelove",
  "channel": "whatsapp|instagram|messenger|webchat",
  "conversation_id": "internal-id",
  "contact_id": "internal-id",
  "state": "new|bot|ai|human|waiting|closed",
  "intent": "optional-normalized-intent",
  "handoff_required": false
}
```

The router should be idempotent against channel message IDs to prevent duplicate actions.

## 8. First FaceLove intent taxonomy

The first production classifier should remain small and operationally useful.

1. `general_information`
   - What is FaceLove?
   - How does it work?
   - What is a Space?

2. `account_access`
   - login;
   - signup;
   - email confirmation;
   - owner access.

3. `private_access`
   - invitation link;
   - expired link;
   - revoked link;
   - access tier;
   - cannot open private content.

4. `creator_onboarding`
   - wants a FaceLove Space;
   - profile onboarding;
   - media/source setup;
   - account association.

5. `community_interest`
   - future Community questions;
   - waitlist/interest capture.

6. `dating_interest`
   - future Dating questions;
   - waitlist/interest capture.

7. `events_interest`
   - future Events questions;
   - waitlist/interest capture.

8. `safety_privacy_report`
   - privacy concern;
   - abuse/reporting;
   - access/security issue.

9. `human_support`
   - explicit request for a person;
   - complaint;
   - unresolved case;
   - sensitive or ambiguous case.

Do not let the Hostess claim future Community/Dating/Events functionality is already live.

## 9. First Typebot production flow

The first deterministic FaceLove flow should solve routing and qualification, not attempt to replace the Hostess.

### Entry

Friendly FaceLove welcome.

Collect/derive:

- channel identity;
- language;
- new/existing contact;
- explicit intent when obvious.

### Primary choices

- Conhecer o FaceLove
- Aceder à minha conta / Space
- Tenho um convite / acesso privado
- Quero criar ou gerir um Space
- Eventos / Comunidade / Dating
- Falar com atendimento

### Rules

**Private access:** ask only the minimum necessary. Never request or store MEGA source links from visitors.

**Account issue:** gather username/email only when needed and with clear purpose.

**Creator onboarding:** capture interest, preferred username, basic contact data and onboarding stage.

**Human request:** immediate Chatwoot handoff.

**AI route:** when the request is open-ended and not a deterministic transaction, pass structured context to the Hostess.

## 10. Hostess AI role

The Hostess is not a free autonomous agent. It is a conversational layer with controlled tools.

### Responsibilities

- explain FaceLove;
- understand free-text intent;
- answer approved FAQs;
- explain current Spaces functionality;
- qualify leads;
- guide users through known processes;
- call approved Typebot flows;
- create/update CRM operational data through allowlisted actions;
- request human handoff.

### It must not

- invent account status;
- reveal private user data;
- reveal private Space media;
- expose MEGA/provider details;
- generate invitation credentials without an authorized backend action;
- claim a payment succeeded without authoritative confirmation;
- pretend future modules are live;
- override access controls;
- execute unrestricted database queries.

## 11. Hostess tool/action allowlist V1

Suggested controlled actions:

- `get_public_facelove_info`
- `lookup_public_space_by_handle`
- `get_current_product_status`
- `start_typebot_flow`
- `create_or_update_lead`
- `add_crm_activity`
- `request_human_handoff`
- `get_support_case_status`

Future, after explicit authorization and audit:

- resend account confirmation;
- validate an invitation status without returning the secret token;
- create owner onboarding task.

## 12. Human handoff contract

A handoff should send Chatwoot a compact structured summary:

```json
{
  "tenant": "facelove",
  "reason": "private_access_issue",
  "customer_summary": "Visitor reports an expired private invitation.",
  "known_identity": {
    "facelove_username": null,
    "verified": false
  },
  "collected_fields": {},
  "conversation_state": "human",
  "priority": "normal"
}
```

The customer must not have to repeat information already collected unless verification requires it.

When a human takes control, automated replies should pause for that conversation until released back to automation.

## 13. FaceLove CRM minimum model

Use the Atendimento.Center CRM/operational store for lead/service state.

Minimum fields:

- tenant
- contact_id
- primary_channel
- channel_external_id
- display_name
- phone/email when legitimately collected
- language
- facelove_username if supplied/verified
- facelove_user_id if safely linked
- primary_intent
- stage
- tags
- assigned_team/operator
- last_activity_at
- next_follow_up_at
- consent/preferences where required

Suggested stages:

`new → identified → qualified → onboarding → active → human_followup → converted → closed`

Support cases may use a parallel case status rather than forcing every support interaction into a sales funnel.

## 14. Omnichannel sequence

Do not integrate every channel at once.

Recommended order:

1. Stabilize WhatsApp + document baseline.
2. Rotate exposed secrets safely.
3. Inventory existing FaceLove Typebots.
4. Deploy the first router + deterministic FaceLove entry flow.
5. Introduce Hostess AI behind the router.
6. Validate human handoff/re-entry.
7. Connect CRM activity and follow-up.
8. Add Instagram.
9. Add Facebook/Messenger.
10. Add FaceLove webchat using the same router and tenant identity.

Each new channel should normalize into the same internal conversation contract.

## 15. Immediate acceptance tests

### WhatsApp baseline

- inbound arrives once;
- outbound arrives once;
- correct FaceLove inbox;
- correct contact;
- READ/status updates do not break the flow.

### Router

- deterministic request enters Typebot;
- open-ended request reaches Hostess;
- explicit human request reaches Chatwoot;
- human-controlled conversation suppresses bot responses;
- release-to-automation works.

### Tenant isolation

- FaceLove flows cannot access another tenant's CRM context;
- FaceLove knowledge is scoped to FaceLove;
- FaceLove channel credentials are tenant-scoped;
- no cross-tenant memory.

### Security

- no secret values in logs;
- no raw private-media source links in CRM;
- no private provider credentials in Hostess context;
- sensitive operational actions produce audit events.

## 16. Connection to FaceLove Product UX V1

The FaceLove application and the Atendimento.Center operation should present one consistent brand.

Use the FaceLove visual system for future webchat and customer-facing messaging surfaces:

- near-black surfaces;
- hot-pink accent;
- warm, human tone;
- concise copy;
- premium but approachable identity.

Operational infrastructure must stay visually invisible to the customer.

The product design brief lives in:

`docs/FACELOVE-PRODUCT-UX-V1.md`

## 17. Next work package

### Workstream A — Product

Continue the current design branch:

`design/facelove-product-ux-v1`

Priority:

1. design tokens;
2. global shell;
3. landing;
4. Spaces;
5. profile/private-album UX;
6. auth;
7. FaceLove Studio.

### Workstream B — Atendimento.Center

On the Atendimento.Center project/repository:

1. write a sanitized production baseline document;
2. execute coordinated secret rotation;
3. export/inventory existing FaceLove Typebots;
4. define router state model;
5. implement first FaceLove entry flow;
6. implement Hostess tool contract;
7. implement human handoff state;
8. connect CRM activity;
9. test end-to-end on WhatsApp;
10. only then add Meta channels.

Do not implement Atendimento.Center infrastructure changes inside `facelove-frontend`.

## Final architectural rule

**FaceLove = product and customer experience.**  
**Atendimento.Center = omnichannel service/orchestration platform.**  
**Chatwoot = human operations surface.**  
**Typebot = deterministic workflow engine.**  
**Hostess AI = controlled conversational intelligence.**

Keep these responsibilities distinct and integrate them through explicit contracts.
