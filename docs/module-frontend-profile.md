# Module frontend profile

Module Standard defines module-specific requirements on top of the Modula
Product Standard (MPS). MPS is authoritative for the generic frontend schema,
compiler, artifact, validation, compatibility, resources and provenance. This
document deliberately does not duplicate that contract.

## Ownership invariant

An application module owns its product-specific frontend definition and
assets. The Modula host owns rendering primitives, navigation integration,
platform adaptation, security boundaries, accessibility baseline and lifecycle
presentation.

A normal new module must not require product-specific frontend source in the
Modula Shell repository. The module repository contains the experience and
publishes it as an immutable, validated MPS frontend artifact.

## Module profile rules

For `identity.kind: module`:

- a normal user-facing application uses `frontend.mode: declarative`;
- it declares a usable entry view and logical product routes;
- it uses Greenfield/product data bindings and host-mediated actions;
- module-specific settings are product-owned and rendered within the generic
  Shell management surface;
- product assets are release artifacts, while typography, semantic colour,
  surfaces, system appearance and native chrome remain host-owned;
- required native UI functionality is requested as a versioned host
  capability, not downloaded as executable code.

`frontend.mode: none` is valid only when the MPS product explicitly declares a
headless module and the selected publication profile permits it. It must not be
the silent default for an application module.

Plugins, add-ons, tools and widgets normally use MPS `host-contribution`, with
optional declarative settings/detail views where their product profile allows
them. Services and engines normally use `none`.

## Release and lifecycle

The frontend artifact is part of one coherent product release with its
manifest, assets, schemas, contracts and backend bindings. Its SHA-256 is bound
to provenance. Any meaningful frontend change creates a new immutable product
release.

The host resolves only the installed exact release. Disabled and uninstalled
products cannot render their frontend or contributions. Update activation is
atomic; a failed update keeps the previous verified release according to the
platform rollback policy.

## Security

Module frontends must not include arbitrary JavaScript/JSX, raw HTML, arbitrary
CSS/style objects, remote bundles, dynamic native implementations, undeclared
network access, secrets, direct cross-product storage access, or generic
WebView product UI.

All record, settings, function, service and capability actions pass through the
host/Greenfield policy boundary and remain account/product scoped.

## Generic primitive admission

If a product cannot express a reusable behavior with existing MPS primitives:

1. prove the gap using a product-neutral case;
2. define generic semantics in MPS;
3. add MPS schema, validator and testkit coverage;
4. add host renderer/native-adapter support;
5. add a neutral fixture;
6. then consume the new versioned primitive from the product.

Product-specific escape hatches are not permitted.
