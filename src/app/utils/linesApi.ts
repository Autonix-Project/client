// line-service 백엔드 DTO 타입 정의 및 API 호출
// 백엔드 포트: 8083 (api-gateway: 8081 경유)

export type BackendLineStatus = 'NORMAL' | 'FAULT' | 'STOPPED';
export type LineType = '차체' | '도장' | '조립' | '품질검사' | '출고';
export type VehicleStatus = 'PENDING' | 'PROCESSING' | 'QC_PASS' | 'QC_FAIL' | 'COMPLETED';

export interface LineResponseDTO {
  lineId: number;
  lineNumber: string;
  lineName: string;
  lineType: LineType;
  lineStatus: BackendLineStatus;
}

export interface VehicleResponseDTO {
  vehicleId: number;
  vehicleNumber: string;
  orderId: number;
  carModel: string;
  carColor: string;
  currentProcess: LineType;
  currentStation: string;
  currentLineId: number;
  status: VehicleStatus;
  processStartedAt: string; // ISO 8601 (LocalDateTime)
}

export interface ProcessHistoryResponseDTO {
  historyId: number;
  vehicleId: number;
  lineId: number;
  processType: string; // 차체/도장/조립/품질검사/출고
  station: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMinutes: number | null;
}

export interface NotificationResponseDTO {
  notificationId: number;
  notificationType: string;
  sourceService: string;
  message: string;
  referenceId: number;
  createdAt: string;
  isRead: boolean;
}

const API_BASE: string =
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL
  ?? 'http://localhost:8081';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API 오류: ${res.status} ${res.statusText} [${path}]`);
  }
  return res.json();
}

export const linesService = {
  // GET /lines - 전체 라인 목록 + 상태
  getAll: () => request<LineResponseDTO[]>('/lines'),

  // GET /lines/{lineId} - 라인 상세
  getById: (lineId: number) => request<LineResponseDTO>(`/lines/${lineId}`),

  // GET /lines/{lineId}/vehicles - 라인에 할당된 차량 목록
  getVehiclesByLine: (lineId: number) =>
    request<VehicleResponseDTO[]>(`/lines/${lineId}/vehicles`),

  // GET /lines/vehicles/active - 가동 중인 전체 차량
  getActiveVehicles: () => request<VehicleResponseDTO[]>('/lines/vehicles/active'),

  // GET /lines/vehicles/{vehicleId}/timeline - 공정 이력 조회
  getVehicleTimeline: (vehicleId: number) =>
    request<ProcessHistoryResponseDTO[]>(`/lines/vehicles/${vehicleId}/timeline`),

  // GET /lines/notification - 장애 알림 목록
  getNotifications: () => request<NotificationResponseDTO[]>('/lines/notification'),

  // GET /lines/assembly/station-map - 조립라인 스테이션별 차량
  getAssemblyStationMap: () => request<VehicleResponseDTO[]>('/lines/assembly/station-map'),

  // GET /lines/stage-board - 공정별 차량 현황
  getStageBoard: () => request<Record<string, VehicleResponseDTO[]>>('/lines/stage-board'),

  // PATCH /lines/{lineId}/status - 라인 상태 변경
  // body: { "status": "FAULT" | "NORMAL" | "STOPPED" }
  changeLineStatus: (lineId: number, status: BackendLineStatus) =>
    request<LineResponseDTO>(`/lines/${lineId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// 경과 시간 계산 유틸리티
export function calcElapsed(processStartedAt: string): string {
  const started = new Date(processStartedAt);
  const now = new Date();
  const diffMs = now.getTime() - started.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}분`;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}
