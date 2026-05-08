export type SurfaceId = 'main' | 'explore' | 'settings';

export type ModulaContext = {
  packageId?: string;
  version?: string;
  apiBase?: string;
  surface?: {
    id?: string | null;
    route?: string | null;
    title?: string | null;
    type?: string | null;
    entry?: string | null;
  } | null;
};

export type FeedItem = {
  id: string;
  title: string;
  summary: string;
  created_at: number;
};
