import type { FeedItem } from './types';

export async function loadFeed(apiBase: string): Promise<{ items: FeedItem[] }> {
  const response = await fetch(`${apiBase}/feed`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Example module API ${response.status}`);
  }
  const text = await response.text();
  if (!text.trim()) return { items: [] };
  return JSON.parse(text) as { items: FeedItem[] };
}
