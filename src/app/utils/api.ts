// Mock API and WebSocket simulation for Smart Factory Dashboard

export type CarStatus = 'BODY_ASSEMBLY' | 'ENGINE_INSTALL' | 'PAINTING' | 'QC' | 'READY_FOR_SHIPPING';
export type LineStatus = 'NORMAL' | 'FAILURE' | 'MAINTENANCE';
export type OrderPriority = 'HIGH' | 'NORMAL' | 'LOW';
export type OrderStatus = 'PENDING' | 'IN_PRODUCTION' | 'COMPLETED';

export interface Car {
  id: string;
  modelName: string;
  status: CarStatus;
  startTime: Date;
  hasIssue: boolean;
  processHistory?: ProcessStep[];
  assignedLine?: string;
  totalElapsedMinutes?: number;
  reworkCount?: number;
  remainingSteps?: number;
}

export interface ProcessStep {
  name: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in minutes
  failureReason?: string;
}

export interface ProductionOrder {
  id: string;
  modelName: string;
  quantity: number;
  priority: OrderPriority;
  status: OrderStatus;
  createdAt: Date;
}

export const CAR_MODELS = [
  '소나타 N라인',
  '투싼 하이브리드',
  '아이오닉6',
  '팰리세이드',
  '코나 일렉트릭',
];

export interface ProductionLine {
  id: string;
  name: string;
  status: LineStatus;
  assignedCars: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minThreshold: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
  currentStock: number;
  minStock: number;
}

export interface Shipment {
  id: string;
  carId: string;
  modelName: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  destination: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalOrders: number;
  inProduction: number;
  completed: number;
  inventoryAlerts: number;
}

// Mock data storage
let mockCars: Car[] = [
  { id: 'CAR-001', modelName: 'Model X', status: 'BODY_ASSEMBLY', startTime: new Date(Date.now() - 3600000), hasIssue: false },
  { id: 'CAR-002', modelName: 'Model S', status: 'BODY_ASSEMBLY', startTime: new Date(Date.now() - 7200000), hasIssue: false },
  { id: 'CAR-003', modelName: 'Model Y', status: 'ENGINE_INSTALL', startTime: new Date(Date.now() - 5400000), hasIssue: false },
  { id: 'CAR-004', modelName: 'Model 3', status: 'ENGINE_INSTALL', startTime: new Date(Date.now() - 1800000), hasIssue: false },
  { id: 'CAR-005', modelName: 'Model X', status: 'PAINTING', startTime: new Date(Date.now() - 9000000), hasIssue: false },
  { id: 'CAR-006', modelName: 'Model S', status: 'PAINTING', startTime: new Date(Date.now() - 10800000), hasIssue: true },
  { id: 'CAR-007', modelName: 'Model Y', status: 'QC', startTime: new Date(Date.now() - 14400000), hasIssue: false },
  { id: 'CAR-008', modelName: 'Model 3', status: 'QC', startTime: new Date(Date.now() - 12600000), hasIssue: false },
  { id: 'CAR-009', modelName: 'Model X', status: 'READY_FOR_SHIPPING', startTime: new Date(Date.now() - 18000000), hasIssue: false },
  { id: 'CAR-010', modelName: 'Model S', status: 'READY_FOR_SHIPPING', startTime: new Date(Date.now() - 16200000), hasIssue: false },
];

let mockLines: ProductionLine[] = [
  { id: 'LINE-1', name: '조립 라인 A', status: 'NORMAL', assignedCars: 5 },
  { id: 'LINE-2', name: '조립 라인 B', status: 'NORMAL', assignedCars: 3 },
  { id: 'LINE-3', name: '도장 라인', status: 'NORMAL', assignedCars: 4 },
  { id: 'LINE-4', name: 'QC 라인', status: 'NORMAL', assignedCars: 2 },
];

let mockInventory: InventoryItem[] = [
  { id: 'INV-001', name: '엔진 블록', quantity: 45, minThreshold: 20, status: 'OK', currentStock: 45, minStock: 20 },
  { id: 'INV-002', name: '변속기', quantity: 15, minThreshold: 20, status: 'LOW', currentStock: 15, minStock: 20 },
  { id: 'INV-003', name: '타이어 세트', quantity: 8, minThreshold: 15, status: 'CRITICAL', currentStock: 8, minStock: 15 },
  { id: 'INV-004', name: '배터리', quantity: 32, minThreshold: 25, status: 'OK', currentStock: 32, minStock: 25 },
  { id: 'INV-005', name: '시트 세트', quantity: 55, minThreshold: 30, status: 'OK', currentStock: 55, minStock: 30 },
  { id: 'INV-006', name: '도어 패널', quantity: 12, minThreshold: 20, status: 'LOW', currentStock: 12, minStock: 20 },
];

let mockShipments: Shipment[] = [
  { id: 'SHIP-001', carId: 'CAR-101', modelName: 'Model X', status: 'PENDING', destination: '서울 딜러', createdAt: new Date(Date.now() - 3600000) },
  { id: 'SHIP-002', carId: 'CAR-102', modelName: 'Model S', status: 'IN_TRANSIT', destination: '부산 딜러', createdAt: new Date(Date.now() - 7200000) },
  { id: 'SHIP-003', carId: 'CAR-103', modelName: 'Model Y', status: 'DELIVERED', destination: '대구 딜러', createdAt: new Date(Date.now() - 86400000) },
  { id: 'SHIP-004', carId: 'CAR-104', modelName: 'Model 3', status: 'IN_TRANSIT', destination: '인천 딜러', createdAt: new Date(Date.now() - 10800000) },
];

let mockOrders: ProductionOrder[] = [
  { id: 'ORD-001', modelName: '소나타 N라인', quantity: 5, priority: 'HIGH', status: 'IN_PRODUCTION', createdAt: new Date(Date.now() - 7200000) },
  { id: 'ORD-002', modelName: '투싼 하이브리드', quantity: 3, priority: 'NORMAL', status: 'IN_PRODUCTION', createdAt: new Date(Date.now() - 3600000) },
  { id: 'ORD-003', modelName: '아이오닉6', quantity: 10, priority: 'HIGH', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000) },
];

let orderCounter = 4;

// Enhanced car data for CAR-006
const enhancedCarData: Record<string, Car> = {
  'CAR-006': {
    id: 'CAR-006',
    modelName: '소나타 N라인',
    status: 'PAINTING',
    startTime: new Date(Date.now() - 10800000),
    hasIssue: true,
    assignedLine: 'LINE-3',
    totalElapsedMinutes: 180,
    reworkCount: 1,
    remainingSteps: 2,
    processHistory: [
      {
        name: '차체조립',
        status: 'COMPLETED',
        startTime: new Date(Date.now() - 10800000),
        endTime: new Date(Date.now() - 10800000 + 2700000),
        duration: 45,
      },
      {
        name: '도장',
        status: 'FAILED',
        startTime: new Date(Date.now() - 10800000 + 2700000),
        endTime: new Date(Date.now() - 10800000 + 4500000),
        duration: 30,
        failureReason: '기포 불량 발견',
      },
      {
        name: '도장 (재작업)',
        status: 'IN_PROGRESS',
        startTime: new Date(Date.now() - 3600000),
        duration: 60,
      },
      {
        name: '조립',
        status: 'PENDING',
      },
      {
        name: '품질검사',
        status: 'PENDING',
      },
    ],
  },
};

// Mock Auth
export const authAPI = {
  login: async (username: string, password: string): Promise<{ token: string; user: { name: string } }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (username && password) {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: { name: username }
      };
    }
    throw new Error('Invalid credentials');
  }
};

// Mock API endpoints
export const carsAPI = {
  getAll: async (): Promise<Car[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCars;
  },
  
  getById: async (carId: string): Promise<Car | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Return enhanced data if available
    if (enhancedCarData[carId]) {
      return enhancedCarData[carId];
    }
    return mockCars.find(c => c.id === carId) || null;
  },
  
  getStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const inProduction = mockCars.filter(c => c.status !== 'READY_FOR_SHIPPING').length;
    const completed = mockCars.filter(c => c.status === 'READY_FOR_SHIPPING').length;
    const inventoryAlerts = mockInventory.filter(i => i.status !== 'OK').length;
    
    return {
      totalOrders: mockCars.length + completed,
      inProduction,
      completed,
      inventoryAlerts
    };
  }
};

export const linesAPI = {
  getAll: async (): Promise<ProductionLine[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockLines;
  },
  
  simulateFailure: async (lineId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const line = mockLines.find(l => l.id === lineId);
    if (line) {
      line.status = 'FAILURE';
    }
  },
  
  recover: async (lineId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const line = mockLines.find(l => l.id === lineId);
    if (line) {
      line.status = 'NORMAL';
    }
  }
};

export const inventoryAPI = {
  getAll: async (): Promise<InventoryItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockInventory;
  },
  
  simulateShortage: async (itemId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const item = mockInventory.find(i => i.id === itemId);
    if (item) {
      item.currentStock = Math.max(0, item.currentStock - 10);
      if (item.currentStock < item.minStock * 0.5) {
        item.status = 'CRITICAL';
      } else if (item.currentStock < item.minStock) {
        item.status = 'LOW';
      }
    }
  }
};

export const shipmentsAPI = {
  getAll: async (): Promise<Shipment[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockShipments;
  }
};

export const ordersAPI = {
  getAll: async (): Promise<ProductionOrder[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockOrders;
  },
  
  create: async (order: Omit<ProductionOrder, 'id' | 'status' | 'createdAt'>): Promise<ProductionOrder> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newOrder: ProductionOrder = {
      id: 'ORD-' + orderCounter++,
      ...order,
      status: 'IN_PRODUCTION',
      createdAt: new Date(),
    };
    mockOrders.push(newOrder);
    return newOrder;
  }
};

// WebSocket simulation
export type WebSocketMessage = 
  | { type: 'CAR_STATUS_UPDATE'; data: Car }
  | { type: 'LINE_STATUS_UPDATE'; data: ProductionLine }
  | { type: 'INVENTORY_ALERT'; data: InventoryItem }
  | { type: 'NEW_ORDER'; data: Car };

export class MockWebSocket {
  private listeners: ((message: WebSocketMessage) => void)[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;

  connect() {
    console.log('WebSocket connected');
    
    // Simulate random updates every 5-10 seconds
    this.interval = setInterval(() => {
      const random = Math.random();
      
      if (random < 0.3 && mockCars.length > 0) {
        // Update car status
        const car = mockCars[Math.floor(Math.random() * mockCars.length)];
        const statuses: CarStatus[] = ['BODY_ASSEMBLY', 'ENGINE_INSTALL', 'PAINTING', 'QC', 'READY_FOR_SHIPPING'];
        const currentIndex = statuses.indexOf(car.status);
        if (currentIndex < statuses.length - 1) {
          car.status = statuses[currentIndex + 1];
          this.emit({ type: 'CAR_STATUS_UPDATE', data: car });
        }
      } else if (random < 0.5 && mockInventory.length > 0) {
        // Inventory alert
        const item = mockInventory[Math.floor(Math.random() * mockInventory.length)];
        if (item.currentStock > 5) {
          item.currentStock -= Math.floor(Math.random() * 5);
          if (item.currentStock < item.minStock * 0.5) {
            item.status = 'CRITICAL';
          } else if (item.currentStock < item.minStock) {
            item.status = 'LOW';
          }
          this.emit({ type: 'INVENTORY_ALERT', data: item });
        }
      }
    }, 8000);
  }

  disconnect() {
    console.log('WebSocket disconnected');
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  onMessage(callback: (message: WebSocketMessage) => void) {
    this.listeners.push(callback);
  }

  private emit(message: WebSocketMessage) {
    this.listeners.forEach(listener => listener(message));
  }
}