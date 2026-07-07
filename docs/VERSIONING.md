# Versioning

MMS uses semver for:

- standard version: `mmsVersion`;
- registry version: `registryVersion`;
- module version: `version`;
- release tags: `source.ref`.

Recommended tag format:

- `vault-notes-v0.3.0`
- `tasks-v0.3.0`

Update behavior:

- installed version lower than registry version means update available;
- update fetches the latest package ref;
- rollback may use previous installed version when available;
- added permissions should trigger user review.

