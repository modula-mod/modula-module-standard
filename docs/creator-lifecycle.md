# Creator Lifecycle

Modula packages should follow a disciplined lifecycle:

1. create with a starter kit
2. validate locally
3. preview in Package Studio
4. build a release artifact
5. publish from the canonical GitHub repo
6. submit to Marketplace review
7. address review notes
8. install or update through Marketplace

## Gates

Release-ready means the package is technically buildable and publishable.

Review-ready means the package also exposes:

- publisher metadata
- support metadata
- source provenance
- public/private safety clarity
- automation safety metadata when relevant

## Team and organization publishing

The creator lifecycle now supports both identity-owned and organization-owned packages.

Ownership model:

- identity-owned package
- organization-owned package
- platform-owned review infrastructure

Recommended workflow:

1. create and validate as a package author
2. preview locally in Package Studio
3. decide whether the package is identity-owned or organization-owned
4. publish from the canonical GitHub source of truth
5. submit with the correct owner context
6. review using explicit org and package roles

Recommended roles:

- org roles: `owner`, `admin`, `maintainer`, `reviewer`, `publisher`, `viewer`
- package roles: `package_owner`, `package_maintainer`, `package_reviewer`, `package_publisher`

Rules:

- org roles do not automatically imply full package control
- package-level roles should remain explicit
- package ownership is shared state
- private identity state stays identity-owned
