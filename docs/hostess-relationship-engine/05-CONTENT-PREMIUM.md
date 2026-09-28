# 05 — Content, Free Media and Premium

## Product principle

Media exists to enrich the relationship.

The system must not treat every image, video or audio as a teaser for a sale.

## Media delivery classes

~~~text
public
relationship_free
preview
premium
event
transactional
~~~

Adult-rated media is restricted to explicitly confirmed 18+ paths.

## Catalog metadata

Compose with the existing FaceLove media_assets contract.

Recommended fields:

~~~text
asset_id
owner_id / persona_id
media_type image|video|audio
provider
external_id
visibility
delivery_class
maturity_rating
theme
mood
context_tags[]
locale_tags[]
market_tags[]
channel_allowlist[]
access_tier nullable
product_id nullable
album_id nullable
safe_preview boolean
status
metadata jsonb
~~~

The AI receives safe metadata and IDs. It should not receive raw provider credentials.

## Free relationship media

Examples:
- casual/lifestyle photo;
- creator-approved non-explicit sensual photo;
- short casual video;
- contextual photo matching the topic;
- voice note generated or selected for the interaction.

Free media can be sent without CTA.

Rules:
- respect per-contact frequency caps;
- avoid recent duplicate assets;
- match conversation context;
- never send adult-rated media without adult eligibility;
- every asset must be explicitly approved for that delivery class.

## Preview media

Preview is not synonymous with "free".

Use preview only when:
- the asset is approved as preview;
- eligibility allows it;
- context supports it;
- recent-delivery limits allow it.

## Premium media

Delivery requires confirmed entitlement.

Preferred fulfillment order:
1. FaceLove controlled access link;
2. approved direct WhatsApp delivery when product rules allow;
3. future subscriber/private Space.

## Product / entitlement adapter

Atendimento.Center should consume product truth from FaceLove rather than hardcoding products in prompts.

Conceptual service contract:

~~~text
GET  hostess catalog by agent + market
POST create checkout
GET  entitlements by person
POST create controlled access link
GET  resolve media asset
~~~

Implementation can be API routes, server functions or another trusted service. The exact URL shape is not mandatory.

## Payment state machine

~~~text
interest
→ offer_shown
→ checkout_opened
→ payment_pending
→ paid
→ entitlement_created
→ fulfilled
~~~

Rules:
- price comes from product catalog;
- checkout comes from payment service;
- paid comes only from a trusted payment confirmation;
- entitlement is deterministic;
- fulfillment is idempotent;
- AI cannot invent a price, discount, payment or entitlement.

## FaceLove tiers

Map commercial offers to the FaceLove access model instead of creating a parallel access system.

Supported concepts can include:
- free/guest;
- VIP;
- VIP Premium;
- ALL-IN;
- time-limited access;
- album-specific access.

Names, quotas and prices remain configuration, not prompt text.

## Content service separation

~~~text
Atendimento.Center
  asks for: "relationship_free + lifestyle + micaela"
        ↓
FaceLove content selector
  returns: approved media_asset_id
        ↓
facelove-conteudo / provider adapter
  resolves delivery/playback
        ↓
channel dispatcher
~~~

## Privacy

- private media stays outside Git;
- private provider URLs are not logged into prompts;
- temporary URLs are generated server-side;
- logs reference media_asset_id;
- inbound user media is not retained indefinitely by default;
- delete/retention policies must be configurable.

## Adult eligibility

Before adult-rated content:
- obtain explicit 18+ confirmation;
- store adult_status;
- do not infer from photo, voice or language;
- unknown or contradictory status blocks the adult path;
- unsolicited explicit content is not sent.
