# Maps Module Example

Shell mode: `map`

Surfaces:
- route
- board
- marketplace

Permissions:
- location: optional, high risk, shows current location.
- network: required, medium risk, fetches tiles and directions.

Navigation:
- `/module/maps`
- saved places and directions subroutes.

Actions:
- search place
- save place
- get directions
- share location

Data collections:
- saved-places
- routes
- searches

UI contract shape:
- map route shell.
- board card for saved places or next destination.

Security risks:
- Location privacy.
- External map providers.
- Sharing must be explicit.

