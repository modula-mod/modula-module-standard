from __future__ import annotations

from .repository import list_feed_items
from .schemas import ExampleFeedItemOut, ExampleFeedOut


def get_feed(limit: int = 20) -> ExampleFeedOut:
	items = list_feed_items(limit=limit)
	return ExampleFeedOut(
		items=[
			ExampleFeedItemOut(
				id=item.id,
				title=item.title,
				summary=item.summary,
				created_at=item.created_at,
			)
			for item in items
		]
	)
