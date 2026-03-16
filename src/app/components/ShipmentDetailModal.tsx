import { X, Package, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { Shipment } from '../utils/api';

interface ShipmentDetailModalProps {
  shipment: Shipment;
  onClose: () => void;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ShipmentDetailModal({ shipment, onClose }: ShipmentDetailModalProps) {
  const departureTime = shipment.createdAt;
  const estimatedArrival = new Date(departureTime.getTime() + 4 * 3600000); // +4 hours
  
  // Calculate progress for in-transit shipments
  const progress = shipment.status === 'IN_TRANSIT' ? 
    Math.min(((Date.now() - departureTime.getTime()) / (4 * 3600000)) * 100, 95) : 
    shipment.status === 'DELIVERED' ? 100 : 0;

  const steps = [
    { 
      id: 1, 
      label: '출고대기', 
      status: shipment.status === 'PENDING' ? 'current' : 'completed',
      icon: Package,
    },
    { 
      id: 2, 
      label: '배송중', 
      status: shipment.status === 'IN_TRANSIT' ? 'current' : shipment.status === 'DELIVERED' ? 'completed' : 'pending',
      icon: Truck,
    },
    { 
      id: 3, 
      label: '배송완료', 
      status: shipment.status === 'DELIVERED' ? 'completed' : 'pending',
      icon: CheckCircle2,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[modalFadeIn_0.2s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{shipment.id}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  shipment.status === 'PENDING' ? 'bg-secondary text-muted-foreground' :
                  shipment.status === 'IN_TRANSIT' ? 'bg-primary/10 text-primary' :
                  'bg-[#39D353]/10 text-[#39D353]'
                }`}>
                  {shipment.status === 'PENDING' ? '출고대기' : 
                   shipment.status === 'IN_TRANSIT' ? '배송중' : '배송완료'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Vehicle Info */}
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
                  <p className="text-xs text-muted-foreground mb-1">목적지</p>
                  <p className="font-bold">{shipment.destination}</p>
                </div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="mb-8">
              <h3 className="font-bold mb-6">배송 진행 타임라인</h3>
              <div className="flex items-center justify-between relative px-4">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-secondary mx-12">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ 
                      width: shipment.status === 'PENDING' ? '0%' : 
                             shipment.status === 'IN_TRANSIT' ? '50%' : '100%' 
                    }}
                  />
                </div>

                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.status === 'current';
                  const isCompleted = step.status === 'completed';

                  return (
                    <div key={step.id} className="flex flex-col items-center z-10 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                        isCompleted ? 'bg-[#39D353]' :
                        isActive ? 'bg-primary' :
                        'bg-secondary'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isCompleted ? 'text-white' :
                          isActive ? 'text-white' :
                          'text-muted-foreground'
                        }`} />
                      </div>
                      <p className={`text-sm font-medium ${
                        isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar (for in-transit only) */}
            {shipment.status === 'IN_TRANSIT' && (
              <div className="mb-8 bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">배송 진행률</p>
                  <p className="font-bold text-primary">{Math.round(progress)}%</p>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Delivery Details */}
            <div>
              <h3 className="font-bold mb-4">배송 상세</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">출발시각</p>
                  </div>
                  <p className="font-bold">{formatDate(departureTime)}</p>
                  <p className="text-sm text-muted-foreground">{formatTime(departureTime)}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">예상도착</p>
                  </div>
                  <p className="font-bold">{formatDate(estimatedArrival)}</p>
                  <p className="text-sm text-muted-foreground">{formatTime(estimatedArrival)}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">배송 차량</p>
                  </div>
                  <p className="font-bold">LGS-{Math.floor(Math.random() * 9000) + 1000}</p>
                  <p className="text-sm text-muted-foreground">대형 캐리어</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
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
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
