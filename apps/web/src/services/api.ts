export interface ApiHealth {
  status: 'ok';
  service: string;
  timestamp: string;
  schedulerEnabled: false;
  externalWritesEnabled: boolean;
}

export async function getApiHealth(): Promise<ApiHealth> {
  const response = await fetch('/api/health', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`API interna respondeu HTTP ${response.status}`);
  return response.json() as Promise<ApiHealth>;
}
