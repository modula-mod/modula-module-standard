# Music Player Module Example

Shell mode: `media-player`

Surfaces:
- board
- route
- floating-player
- bottom-bar
- marketplace

Permissions:
- local-storage: required, low risk, stores library and playlist preferences.
- network: optional, medium risk, streams remote audio and fetches metadata.
- notifications: optional, medium risk, playback reminders and now-playing alerts.

Navigation:
- `/module/music-player`
- optional module-owned bottom bar item for Now Playing.

Actions:
- open library
- create playlist
- play track
- pause
- skip
- export playlist

Data collections:
- tracks
- playlists
- playback-state

UI contract shape:
- `ui/screens/index.ui.json` for library.
- `ui/screens/detail.ui.json` for playlist/detail.
- `ui/components/player.ui.json` for now-playing controls.

Security risks:
- External media URLs.
- Notification permission.
- Future DRM/provider credentials must remain backend-scoped.

