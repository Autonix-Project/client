// inventory-service 백엔드 DTO 타입 정의 및 API 호출
// 백엔드 포트: 8084 (api-gateway: 8081 경유)

export interface InventoryTransactionResponseDTO {
  id: number;
  partId: number;
  transactionType: string;
  quantity: number;
  remainingStock: number;
  vehicleId: number | null;
  orderNumber: string | null;
  createdAt: string; // ISO 8601
}

export interface PartsResponseDTO {
  id: number;
  partName: string;
  partCode: string;
  currentStock: number;
  minStock: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  stockRate: number;       // (currentStock / minStock) * 100
  status: 'OK' | 'LOW' | 'CRITICAL';
  transactions: InventoryTransactionResponseDTO[] | null;
}

const API_BASE = import.meta.env.VITE_INVENTORY_API_URL ?? 'http://localhost:8084';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const inventoryService = {
  getAll:     () => request<PartsResponseDTO[]>('/inventory/parts'),
  getById:    (id: number) => request<PartsResponseDTO>(`/inventory/parts/${id}`),
  getLowStock: () => request<PartsResponseDTO[]>('/inventory/parts/low-stock'),
};
