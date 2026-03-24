const BASE = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8081';

export const CAR_TYPES = ['SONATA', 'AVANTE', 'GRANDEUR', 'TUCSON', 'PALISADE'] as const;
export const COLOR_TYPES = ['WHITE', 'BLACK', 'SILVER', 'BLUE', 'RED', 'GRAY'] as const;
export const DESTINATION_TYPES = ['SEOUL', 'BUSAN', 'DAEGU', 'INCHEON'] as const;

export const CAR_TYPE_LABELS: Record<string, string> = {
  SONATA: '소나타', AVANTE: '아반떼', GRANDEUR: '그랜저',
  TUCSON: '투싼', PALISADE: '팰리세이드',
};
export const COLOR_LABELS: Record<string, string> = {
  WHITE: '흰색', BLACK: '검정', SILVER: '실버',
  BLUE: '파랑', RED: '빨강', GRAY: '회색',
};
export const DESTINATION_LABELS: Record<string, string> = {
  SEOUL: '서울', BUSAN: '부산', DAEGU: '대구', INCHEON: '인천',
};

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  carModel: string;
  carColor: string;
  destination: string;
  status: string;
  totalQuantity: number;
  deadline: string | null;
  createdAt?: string;
}

export interface CreateOrderPayload {
  carType: string;
  color: string;
  destination: string;
  totalQuantity: number;
  deadline?: string;
}

export const ordersService = {
  async getAll(): Promise<OrderResponse[]> {
    const res = await fetch(`${BASE}/orders`);
    if (!res.ok) throw new Error('주문 목록 조회 실패');
    const json = await res.json();
    return json.data ?? json;
  },

  async create(payload: CreateOrderPayload): Promise<OrderResponse> {
    const res = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || '주문 등록 실패');
    }
    const json = await res.json();
    return json.data ?? json;
  },
};
