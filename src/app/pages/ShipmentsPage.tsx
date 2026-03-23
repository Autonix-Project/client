import { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { shippingsService, ShipmentView, ShipStatus } from '../utils/shippingsApi';
import { toast } from 'sonner';
import { ShipmentDetailModal } from '../components/ShipmentDetailModal';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins  = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins}`;
}

function calcProgress(createdAt: string, arrivalAt: string | null): number {
  const start = new Date(createdAt).getTime();
  const end   = arrivalAt ? new Date(arrivalAt).getTime() : start + 4 * 3600000;
  const pct   = ((Date.now() - start) / (end - start)) * 100;
  return Math.min(Math.max(Math.round(pct), 0), 95);
}

const STATUS_CONFIG: Record<ShipStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING:    { label: '출고 대기', color: 'text-[#FFA500]',   bgColor: 'bg-[#FFA500]/10',   icon: Clock },
  IN_TRANSIT: { label: '배송 중',   color: 'text-primary',     bgColor: 'bg-primary/10',     icon: Truck },
  DELIVERED:  { label: '배송 완료', color: 'text-[#39D353]',   bgColor: 'bg-[#39D353]/10',   icon: CheckCircle2 },
};

export function ShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | ShipStatus>('ALL');
  const [selectedShipment, setSelectedShipment] = useState<ShipmentView | null>(null);

  useEffect(() => { loadShipments(); }, []);

  const loadShipments = async () => {
    try {
      const data = await shippingsService.getAll();
      setShipments(data);
    } catch {
      toast.error('배송 데이터 로딩 실패', { description: '서버 연결을 확인해주세요.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = filter === 'ALL' ? shipments : shipments.filter(s => s.status === filter);

  const stats = {
    pending:    shipments.filter(s => s.status === 'PENDING').length,
    inTransit:  shipments.filter(s => s.status === 'IN_TRANSIT').length,
    delivered:  shipments.filter(s => s.status === 'DELIVERED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">배송 현황</h1>
        <p className="text-muted-foreground">차량 출고 및 배송 추적</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-[#FFA500]" />
            <span className="text-sm text-muted-foreground">출고 대기</span>
          </div>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">배송 중</span>
          </div>
          <p className="text-3xl font-bold">{stats.inTransit}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-[#39D353]" />
            <span className="text-sm text-muted-foreground">배송 완료</span>
          </div>
          <p className="text-3xl font-bold">{stats.delivered}</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        {(['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            {f === 'ALL' ? '전체' : STATUS_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* 배송 목록 */}
      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {filteredShipments.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">배송 데이터가 없습니다</p>
          </div>
        ) : (
          filteredShipments.map(shipment => {
            const config = STATUS_CONFIG[shipment.status];
            const Icon = config.icon;
            const progress = calcProgress(shipment.createdAt, shipment.arrivalAt);

            return (
              <div key={shipment.id} className="p-6 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{shipment.shippingNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        차량 ID: {shipment.carId} • {shipment.modelName}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className={`font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-[72px]">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">출발:</span>
                    <span className="font-medium">{formatDateTime(shipment.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">도착 예정:</span>
                    <span className="font-medium">
                      {shipment.arrivalAt ? formatDateTime(shipment.arrivalAt) : '-'}
                    </span>
                  </div>

                  {shipment.status === 'IN_TRANSIT' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => setSelectedShipment(shipment)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    상세 정보
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
        />
      )}
    </div>
  );
}
