from __future__ import annotations

from fastapi import APIRouter, Query

from .service import get_feed
from .schemas import ExampleFeedOut

router = APIRouter()


@router.get('/feed', response_model=ExampleFeedOut)
async def feed(limit: int = Query(default=20, ge=1, le=50)):
	return get_feed(limit=limit)


@router.get('/explore')
async def explore():
	return {'status': 'ok', 'surface': 'explore', 'items': []}


@router.get('/settings')
async def settings():
	return {'status': 'ok', 'surface': 'settings', 'configurable': True}
