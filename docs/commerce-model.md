# Modula Commerce Model

Modula commerce is layered on top of the existing package safety and ownership model.

## Core distinctions

- Package ownership:
  - who publishes and manages the package
- Entitlement:
  - who is allowed to install or use the package
- Install governance:
  - runtime safety, validation, review, permissions, and kill-switch enforcement

Payment or entitlement does not bypass platform safety.

## Pricing models

Supported listing policies:

- `free`
- `one_time`
- `subscription_monthly`
- `subscription_yearly`
- `seat_monthly`
- `enterprise_contact`
- `internal_only`

Listings attach pricing and availability to an existing `item_type` and `item_slug`.

## Entitlement scopes

Supported scopes:

- `user`
- `org`
- `workspace`
- `system`

The runtime gate resolves the requested scope and then checks direct entitlement plus allowed inherited scopes where applicable.

## Install and use enforcement

Commerce is enforced through billing resolution and license checks:

- `GET /api/modula/billing/listings/resolve`
- `GET /api/modula/billing/licenses/check`

The effective rule is:

1. resolve commercial policy
2. resolve caller scope
3. check entitlement
4. keep runtime trust, validation, and kill-switch enforcement active

## Trials and grants

Current supported grant paths:

- free grant
- trial grant
- paid order confirmation
- internal/admin grant through the existing billing models

## Publisher surfaces

Publisher-facing billing surfaces currently include:

- listings
- earnings
- payouts
- account orders and licenses

These surfaces are intended to make commercial readiness explicit before full external billing rails are added.

## CLI

Useful inspection commands:

- `modula marketplace commerce <itemType> <itemSlug>`
- `modula package stats <packageId>`
- `modula review-status <path>`
- `modula source <path>`

## Boundary rule

Commerce grants entitlement.

It does not grant:

- unsafe execution
- private identity data access
- bypass of review or module permission rules
- bypass of workspace or organization boundaries
