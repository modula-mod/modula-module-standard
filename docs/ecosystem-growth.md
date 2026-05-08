# Ecosystem Growth

## Discovery model

Marketplace discovery is structured, not decorative.

- `featured`: curated or high-trust packages with strong workspace relevance
- `new`: recently created or recently updated packages
- `trending`: packages gaining install, adoption, or activity momentum
- `recommended`: rules-based suggestions grounded in identity/workspace context

## Growth diagnostics

Growth should stay inspectable.

- recent growth events should distinguish `package_viewed`, `package_installed`, `package_updated`, `package_uninstalled`, and workspace-linked usage events
- package-level growth detail should expose usage summary, quality signals, recommendation reason, and relevant starter bundles
- creator and operator surfaces should prefer aggregate metrics plus explicit event types over vanity counters

## Install vs adoption vs active use

These are different states.

- `install`: the package is present in runtime
- `adoption`: the package is surfaced in a workspace, panel, automation, or identity context
- `active use`: the package has recent activity inside the current usage window

Growth surfaces should never collapse these into one vanity metric.

## Creator guidance

The expected creator loop is:

1. create the package
2. validate release readiness
3. preview locally
4. publish from the GitHub source of truth
5. submit for Marketplace review
6. observe install, adoption, and active-use signals

## Workspace onboarding

For a new collaborative workspace, the expected sequence is:

1. add members
2. add shared board panels
3. pin shared resources
4. configure shared automations
5. connect relevant packages
6. capture decisions in shared knowledge

Starter bundles should reinforce this flow instead of replacing it:

- `identity starter`
- `creator starter`
- `team workspace starter`
- `productivity starter`

## Trust and quality signals

Package growth surfaces should expose meaningful quality indicators:

- reviewed
- verified publisher
- release ready
- has docs
- has support link
- safe by default
- requires confirmation where relevant

## Privacy boundary

Growth and recommendation signals must remain aggregate and scope-safe.

- workspace recommendations may use workspace-shared context
- creator surfaces may use package and publisher metrics
- identity-private mail, private Board state, and private notifications must not leak into shared growth surfaces
