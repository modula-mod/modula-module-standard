from __future__ import annotations

from pydantic import BaseModel


class ExampleFeedItemOut(BaseModel):
	id: str
	title: str
	summary: str
	created_at: int


class ExampleFeedOut(BaseModel):
	items: list[ExampleFeedItemOut]
