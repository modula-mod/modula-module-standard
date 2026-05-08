from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ExampleFeedItem:
	id: str
	title: str
	summary: str
	created_at: int
