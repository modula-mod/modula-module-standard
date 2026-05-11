"""Widget contract helpers for generated Modula modules."""
from __future__ import annotations

WIDGETS = [
    {
        "id": "example-feed-widget",
        "title": "Example Feed Widget",
        "description": "Board-ready preview widget exposed by the module.",
        "surface": "board",
        "size": "medium",
        "entry": "widgets/BoardWidget",
        "permissions": ["example.read"],
        "data_source": "/api/modula/example-module/items",
        "refresh_policy": "on_focus_or_60s",
    },
    {
        "id": "example-stats-widget",
        "title": "Example Stats Widget",
        "description": "Compact module summary for profile and Board.",
        "surface": "board",
        "size": "small",
        "entry": "widgets/StatsWidget",
        "permissions": ["example.read"],
        "data_source": "/api/modula/example-module/summary",
        "refresh_policy": "on_focus_or_120s",
    },
]
