// shipping-service 백엔드 DTO 타입 정의 및 API 호출
// 백엔드 포트: 8085 (api-gateway: 8081 경유)

export type ShippingState = '출고대기' | '배송중' | '배송완료';
export type ShipStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';

export interface ShippingResponseDTO {
  shippingId: number;
  shippingNumber: string;
  shippingCarId: string;
  carModel: string;
  shippingState: ShippingState;
  createdAt: string;   // ISO 8601
  arrivalAt: string | null;
}

/** 프론트엔드 뷰 타입 (백엔드 DTO에서 변환) */
export interface ShipmentView {
  id: string;
  shippingNumber: string;
  carId: string;
  modelName: string;
  status: ShipStatus;
  createdAt: string;
  arrivalAt: string | null;
}

const STATE_MAP: Record<string, ShipStatus> = {
  '출고대기': 'PENDING',
  '배송중':   'IN_TRANSIT',
  '배송완료': 'DELIVERED',
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function toView(dto: ShippingResponseDTO): ShipmentView {
  return {
    id:             String(dto.shippingId),
    shippingNumber: dto.shippingNumber,
    carId:          dto.shippingCarId,
    modelName:      dto.carModel,
    status:         STATE_MAP[dto.shippingState] ?? 'PENDING',
    createdAt:      dto.createdAt,
    arrivalAt:      dto.arrivalAt,
  };
}

export const shippingsService = {
  getAll:   () => request<ShippingResponseDTO[]>('/shippings').then(list => list.map(toView)),
  getById:  (id: number) => request<ShippingResponseDTO>(`/shippings/${id}`).then(toView),
};
