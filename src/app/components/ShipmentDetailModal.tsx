import { X, Package, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { ShipmentView } from '../utils/shippingsApi';

interface ShipmentDetailModalProps {
  shipment: ShipmentView;
  onClose: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ShipmentDetailModal({ shipment, onClose }: ShipmentDetailModalProps) {
  const departureIso  = shipment.createdAt;
  const arrivalIso    = shipment.arrivalAt ?? new Date(new Date(departureIso).getTime() + 4 * 3600000).toISOString();

  const start    = new Date(departureIso).getTime();
  const end      = new Date(arrivalIso).getTime();
  const progress = shipment.status === 'DELIVERED'
    ? 100
    : shipment.status === 'IN_TRANSIT'
      ? Math.min(Math.round(((Date.now() - start) / (end - start)) * 100), 95)
      : 0;

  const steps = [
    { id: 1, label: '출고대기',  icon: Package,     status: shipment.status === 'PENDING'    ? 'current' : 'completed' },
    { id: 2, label: '배송중',    icon: Truck,       status: shipment.status === 'IN_TRANSIT' ? 'current' : shipment.status === 'DELIVERED' ? 'completed' : 'pending' },
    { id: 3, label: '배송완료',  icon: CheckCircle2, status: shipment.status === 'DELIVERED' ? 'completed' : 'pending' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center" onClick={onClose}>
        <div
          className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[modalFadeIn_0.2s_ease-out]"
          onClick={e => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{shipment.shippingNumber}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  shipment.status === 'PENDING'    ? 'bg-secondary text-muted-foreground' :
                  shipment.status === 'IN_TRANSIT' ? 'bg-primary/10 text-primary' :
                                                     'bg-[#39D353]/10 text-[#39D353]'
                }`}>
                  {shipment.status === 'PENDING' ? '출고대기' : shipment.status === 'IN_TRANSIT' ? '배송중' : '배송완료'}
                </span>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* 차량 정보 */}
            <div className="mb-8">
              <h3 className="font-bold mb-4">차량 정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">차량 ID</p>
                  <p className="font-bold">{shipment.carId}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">차종</p>
                  <p className="font-bold">{shipment.modelName}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">출발지</p>
                  <p className="font-bold">평택 공장</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">운송 번호</p>
                  <p className="font-bold">{shipment.shippingNumber}</p>
                </div>
              </div>
            </div>

            {/* 배송 타임라인 */}
            <div className="mb-8">
              <h3 className="font-bold mb-6">배송 진행 타임라인</h3>
              <div className="flex items-center justify-between relative px-4">
                <div className="absolute top-6 left-0 right-0 h-1 bg-secondary mx-12">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: shipment.status === 'PENDING' ? '0%' : shipment.status === 'IN_TRANSIT' ? '50%' : '100%' }}
                  />
                </div>
                {steps.map(step => {
                  const Icon = step.icon;
                  const isActive    = step.status === 'current';
                  const isCompleted = step.status === 'completed';
                  return (
                    <div key={step.id} className="flex flex-col items-center z-10 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                        isCompleted ? 'bg-[#39D353]' : isActive ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        <Icon className={`w-6 h-6 ${isCompleted || isActive ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <p className={`text-sm font-medium ${isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 진행률 (배송중만) */}
            {shipment.status === 'IN_TRANSIT' && (
              <div className="mb-8 bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">배송 진행률</p>
                  <p className="font-bold text-primary">{progress}%</p>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* 배송 상세 */}
            <div>
              <h3 className="font-bold mb-4">배송 상세</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">출발시각</p>
                  </div>
                  <p className="font-bold">{formatDate(departureIso)}</p>
                  <p className="text-sm text-muted-foreground">{formatTime(departureIso)}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">예상도착</p>
                  </div>
                  <p className="font-bold">{formatDate(arrivalIso)}</p>
                  <p className="text-sm text-muted-foreground">{formatTime(arrivalIso)}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">배송 차량</p>
                  </div>
                  <p className="font-bold">대형 캐리어</p>
                  <p className="text-sm text-muted-foreground">카 캐리어</p>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-card border-t border-border p-4">
            <button
              onClick={onClose}
              className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded-lg font-medium transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
