import { useState, useEffect } from 'react';
import { Package, TrendingUp, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { dashboardService, DashboardSummaryResponse, DashboardStageVehicleResponse, StageBoardResponse } from '../utils/dashboardApi';
import { toast } from 'sonner';

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '-';
  const started = new Date(dateStr);
  const seconds = Math.floor((Date.now() - started.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return `${seconds}초 전`;
}

const STAGE_COLUMNS: { key: string; label: string; color: string }[] = [
  { key: '차체',    label: '차체',    color: 'bg-blue-500' },
  { key: '도장',    label: '도장',    color: 'bg-purple-500' },
  { key: '조립',    label: '조립',    color: 'bg-yellow-500' },
  { key: '품질검사', label: '품질검사', color: 'bg-green-500' },
  { key: '출고',    label: '출고',    color: 'bg-primary' },
];

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [stageBoard, setStageBoard] = useState<StageBoardResponse>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, stageBoardData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getStageBoard(),
      ]);
      setSummary(summaryData);
      setStageBoard(stageBoardData);
    } catch (error) {
      toast.error('대시보드 데이터 로딩 실패');
    } finally {
      setLoading(false);
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
        <StatCard icon={Package}       label="전체 주문 수"   value={summary?.totalOrders ?? 0}        color="text-blue-500" />
        <StatCard icon={TrendingUp}    label="생산 중 차량"   value={summary?.inProgressVehicles ?? 0} color="text-primary" />
        <StatCard icon={CheckCircle2}  label="완료 차량"      value={summary?.completedVehicles ?? 0}  color="text-[#39D353]" />
        <StatCard icon={AlertTriangle} label="재고 경고"      value={summary?.lowStockParts ?? 0}      color="text-[#FFA500]"
          alert={(summary?.lowStockParts ?? 0) > 0} />
      </div>

      {/* Kanban Board */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">차량 상태 보드</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGE_COLUMNS.map(col => {
            const vehicles = stageBoard[col.key] ?? [];
            return (
              <div key={col.key} className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                  <h3 className="font-medium">{col.label}</h3>
                  <span className="ml-auto text-sm text-muted-foreground">{vehicles.length}</span>
                </div>

                <div className="space-y-3">
                  {vehicles.map(v => (
                    <VehicleCard key={v.vehicleId} vehicle={v} />
                  ))}
                  {vehicles.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">없음</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
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

function VehicleCard({ vehicle }: { vehicle: DashboardStageVehicleResponse }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:border-primary transition-all">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="font-medium text-sm">{vehicle.vehicleNumber}</p>
          <p className="text-xs text-muted-foreground">{vehicle.carModel}</p>
        </div>
        {vehicle.carColor && (
          <span className="text-xs text-muted-foreground">{vehicle.carColor}</span>
        )}
      </div>
      {vehicle.currentStation && (
        <p className="text-xs text-primary mb-1">{vehicle.currentStation}</p>
      )}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{formatTimeAgo(vehicle.processStartedAt)}</span>
      </div>
    </div>
  );
}
