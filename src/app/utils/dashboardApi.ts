// api-gateway BFF 대시보드 API
// 포트: 8081 (VITE_GATEWAY_URL)

export interface DashboardSummaryResponse {
  totalOrders: number;
  inProgressVehicles: number;
  completedVehicles: number;
  lowStockParts: number;
  generatedAt: string;
}

export interface DashboardStageVehicleResponse {
  vehicleId: number;
  vehicleNumber: string;
  orderId: number;
  carModel: string;
  carColor: string;
  currentProcess: string;
  currentStation: string | null;
  currentLineId: number;
  status: string;
  processStartedAt: string | null;
}

// stage-board: { "차체": [...], "도장": [...], ... }
export type StageBoardResponse = Record<string, DashboardStageVehicleResponse[]>;

const API_BASE = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8081';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export interface NotificationEvent {
  id: string;
  type: 'LINE_FAULT' | 'STOCK_LOW';
  source: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH';
  occurredAt: string;
  payload: Record<string, unknown>;
}

export const dashboardService = {
  getSummary:   () => request<DashboardSummaryResponse>('/dashboard/summary'),
  getStageBoard: () => request<StageBoardResponse>('/dashboard/stage-board'),

  subscribeRealtimeFlow(onData: (data: StageBoardResponse) => void): () => void {
    const es = new EventSource(`${API_BASE}/dashboard/realtime-flow`);
    es.addEventListener('realtime-flow', (e) => {
      try { onData(JSON.parse(e.data)); } catch { /* ignore parse error */ }
    });
    return () => es.close();
  },

  subscribeNotifications(onEvent: (event: NotificationEvent) => void): () => void {
    const es = new EventSource(`${API_BASE}/dashboard/notifications`);
    es.addEventListener('notification', (e) => {
      try { onEvent(JSON.parse(e.data)); } catch { /* ignore parse error */ }
    });
    return () => es.close();
  },
};
