# Modula Module Standard 2.1

Standard 2.1 makes a registry product capable of being either a first-class module or a governed extension of another product. It evolves Standard 2.0 in place: dependency resolution, permissions, capabilities, services, functions, jobs, events, widgets, UI registries, backend trust, and provenance remain authoritative.

Standard 1.0, 1.1, 1.2, and 2.0 manifests remain valid unchanged. `extensionProduct` is optional and requires `standardVersion: 2.1.0` when present.

## Product taxonomy

`extensionProduct.kind` is one of:

- `module`: an independently usable application environment;
- `addon`: a substantial extension for a target product;
- `plugin`: a lighter behavioural extension;
- `function`: a headless invocable contract;
- `tool`: an actionable host-discovered capability;
- `widget`: a compact declarative presentation;
- `connector`: a governed bridge to an external provider;
- `service`: backend execution infrastructure.

Every installable item is still a registry product with immutable release provenance. The kind changes its role, not its integrity requirements.

## Targets and the extension graph

Add-ons, plugins, functions, tools, and widgets declare at least one target product and semantic version range. Targets may also name the typed capabilities and extension points they require.

The persisted runtime graph must be acyclic, deterministic, and bounded. Manifests may lower the host limits through `graphPolicy`; Standard 2.1 permits at most 16 levels and 256 nodes. Hosts must reject cycles before persistence and must report the stable cycle path.

## Extension points

Any product, including an extension, may expose namespaced extension points. Each point restricts contribution kinds, platforms, capacity, and an optional required capability. A core module remains fully usable when no extension is installed.

## Contributions

Contributions are declarative references to existing action, function, view, or widget contracts. Standard kinds are:

- `view.section`
- `toolbar.action`
- `editor.command`
- `editor.attachment`
- `menu.item`
- `contextMenu.item`
- `settings.section`
- `home.section`
- `widget`
- `record.decorator`
- `search.provider`
- `composer.tool`
- `background.action`

An allowed UI contribution is not a data grant. The host must independently check installation state, target compatibility, declared contribution, capability grant, resource ownership, platform, and invocation scope.

Contribution presentation and standalone module views are product-owned MPS
frontend artifacts. Standard 2.1 defines the module/extension semantics; MPS
defines the frontend representation. The Shell renders both through generic
host primitives and must not contain product-name UI branches. See
[module-frontend-profile.md](module-frontend-profile.md).

## Security invariants

- Extensions never import another product implementation or query another product database.
- Extensions receive scoped capability-broker invocations, not raw Greenfield session bearers.
- Backends are resolved through the existing trusted service registry and SSRF policy; manifests cannot supply an arbitrary target URL.
- Arbitrary JavaScript, HTML, component code, remote entries, and runtime evaluation remain prohibited.
- Extension failure must be isolated from the host product.
- Extension-owned metadata uses the extension product ID as its namespace.
- Uninstall retention is explicit as `KEEP_DATA` or `DELETE_DATA` and never deletes target-owned records.

## Reference contracts

`vaultNotesStandard21ManifestFixture` demonstrates an independently usable module exposing extension points. `vaultFormattingStandard21ManifestFixture` demonstrates a frontend-only plugin that targets Vault Notes and contributes a declared editor command without backend access.
