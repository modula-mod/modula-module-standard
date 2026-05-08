from __future__ import annotations

import time

from .models import ExampleFeedItem


def list_feed_items(limit: int = 20) -> list[ExampleFeedItem]:
	now = int(time.time())
	limit = max(1, min(int(limit or 20), 50))

	# Template-only sample records. Replace with real persistence in production modules.
	return [
		ExampleFeedItem(
			id=f'example-{index + 1}',
			title=f'Example item {index + 1}',
			summary='Replace this repository adapter with real module persistence.',
			created_at=now - (index * 120),
		)
		for index in range(limit)
	]
