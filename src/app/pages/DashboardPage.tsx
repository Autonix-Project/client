import { useState, useEffect } from 'react';
import { Package, TrendingUp, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { carsAPI, Car, CarStatus, DashboardStats, MockWebSocket, WebSocketMessage } from '../utils/api';
import { toast } from 'sonner';
import { CarDetailPanel } from '../components/CarDetailPanel';

// Simple time formatting
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return `${seconds}초 전`;
}

const STATUS_COLUMNS: { status: CarStatus; label: string; color: string }[] = [
  { status: 'BODY',     label: '차체',    color: 'bg-blue-500' },
  { status: 'PAINTING', label: '도장',    color: 'bg-purple-500' },
  { status: 'ASSEMBLY', label: '조립',    color: 'bg-yellow-500' },
  { status: 'QC',       label: '품질검사', color: 'bg-green-500' },
  { status: 'SHIPPING', label: '출고',    color: 'bg-primary' },
];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    inProduction: 0,
    completed: 0,
    inventoryAlerts: 0,
  });
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    loadData();

    // WebSocket simulation
    const ws = new MockWebSocket();
    ws.connect();
    ws.onMessage(handleWebSocketMessage);

    return () => {
      ws.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      const [statsData, carsData] = await Promise.all([
        carsAPI.getStats(),
        carsAPI.getAll(),
      ]);
      setStats(statsData);
      setCars(carsData);
    } catch (error) {
      toast.error('데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    if (message.type === 'CAR_STATUS_UPDATE') {
      setCars(prev => 
        prev.map(car => car.id === message.data.id ? message.data : car)
      );
      toast.info(`${message.data.id} 상태 업데이트: ${message.data.status}`);
    } else if (message.type === 'INVENTORY_ALERT') {
      toast.warning(`재고 경고: ${message.data.name} - 현재 ${message.data.currentStock}개`);
      setStats(prev => ({ ...prev, inventoryAlerts: prev.inventoryAlerts + 1 }));
    }
  };

  const getCarsByStatus = (status: CarStatus) => {
    return cars.filter(car => car.status === status);
  };

  const handleCarClick = async (carId: string) => {
    const detailedCar = await carsAPI.getById(carId);
    if (detailedCar) {
      setSelectedCar(detailedCar);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">생산 현황 대시보드</h1>
        <p className="text-muted-foreground">실시간 자동차 조립라인 모니터링</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Package}
          label="전체 주문 수"
          value={stats.totalOrders}
          color="text-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="생산 중 차량"
          value={stats.inProduction}
          color="text-primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="완료 차량"
          value={stats.completed}
          color="text-[#39D353]"
        />
        <StatCard
          icon={AlertTriangle}
          label="재고 경고"
          value={stats.inventoryAlerts}
          color="text-[#FFA500]"
          alert={stats.inventoryAlerts > 0}
        />
      </div>

      {/* Kanban Board */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">차량 상태 보드</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map(column => (
            <div key={column.status} className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                <h3 className="font-medium">{column.label}</h3>
                <span className="ml-auto text-sm text-muted-foreground">
                  {getCarsByStatus(column.status).length}
                </span>
              </div>
              
              <div className="space-y-3">
                {getCarsByStatus(column.status).map(car => (
                  <CarCard key={car.id} car={car} onClick={() => handleCarClick(car.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Car Detail Panel */}
      {selectedCar && (
        <CarDetailPanel car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, alert }: { 
  icon: any; 
  label: string; 
  value: number; 
  color: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-lg p-6 ${alert ? 'border-[#FFA500]' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        {alert && <div className="w-2 h-2 bg-[#FFA500] rounded-full animate-pulse"></div>}
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function CarCard({ car, onClick }: { car: Car; onClick: () => void }) {
  const elapsed = formatTimeAgo(car.startTime);
  
  return (
    <div className={`bg-card border rounded-lg p-3 transition-all hover:border-primary cursor-pointer ${
      car.hasIssue ? 'border-destructive bg-destructive/5' : 'border-border'
    }`} onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm">{car.id}</p>
          <p className="text-xs text-muted-foreground">{car.modelName}</p>
        </div>
        {car.hasIssue && (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{elapsed}</span>
      </div>
    </div>
  );
}