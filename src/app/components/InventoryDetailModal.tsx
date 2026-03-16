import { X, TrendingDown, TrendingUp } from 'lucide-react';
import { InventoryItem } from '../utils/api';

interface InventoryDetailModalProps {
  item: InventoryItem;
  onClose: () => void;
}

interface InventoryTransaction {
  date: string;
  type: 'USAGE' | 'INCOMING';
  quantity: number;
  remaining: number;
  relatedCar?: string;
}

// Mock transaction data
const mockTransactions: InventoryTransaction[] = [
  { date: '2026-03-16', type: 'USAGE', quantity: -15, remaining: 145, relatedCar: 'CAR-012' },
  { date: '2026-03-15', type: 'INCOMING', quantity: 50, remaining: 160, relatedCar: '-' },
  { date: '2026-03-15', type: 'USAGE', quantity: -12, remaining: 110, relatedCar: 'CAR-011' },
  { date: '2026-03-14', type: 'USAGE', quantity: -8, remaining: 122, relatedCar: 'CAR-010' },
  { date: '2026-03-13', type: 'USAGE', quantity: -18, remaining: 130, relatedCar: 'CAR-009' },
  { date: '2026-03-12', type: 'INCOMING', quantity: 100, remaining: 148, relatedCar: '-' },
  { date: '2026-03-11', type: 'USAGE', quantity: -22, remaining: 48, relatedCar: 'CAR-008' },
];

export function InventoryDetailModal({ item, onClose }: InventoryDetailModalProps) {
  const currentStock = item.quantity;
  const minThreshold = item.minThreshold;
  const stockPercent = (currentStock / minThreshold) * 100;
  
  // Calculate estimated depletion days
  const avgDailyUsage = 15; // Mock average
  const daysRemaining = Math.floor(currentStock / avgDailyUsage);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-[modalFadeIn_0.2s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{item.name}</h2>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">{item.id}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'OK' ? 'bg-[#39D353]/10 text-[#39D353]' :
                    item.status === 'LOW' ? 'bg-[#FFA500]/10 text-[#FFA500]' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {item.status === 'OK' ? '정상' : item.status === 'LOW' ? '부족' : '긴급'}
                  </span>
                </div>
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
            {/* Stock Level */}
            <div className="mb-8">
              <h3 className="font-bold mb-4">재고 현황</h3>
              <div className="bg-secondary/50 rounded-lg p-6">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">현재 재고</p>
                    <p className="text-3xl font-bold">{currentStock}개</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">최소 기준</p>
                    <p className="text-xl font-bold text-muted-foreground">{minThreshold}개</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                      stockPercent > 100 ? 'bg-[#39D353]' :
                      stockPercent > 50 ? 'bg-[#FFA500]' :
                      'bg-destructive'
                    }`}
                    style={{ width: `${Math.min(stockPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {stockPercent.toFixed(0)}% of minimum threshold
                </p>
              </div>
            </div>

            {/* Depletion Estimate */}
            <div className="mb-8 bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                <p className="font-medium">예상 소진일</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                현재 생산 속도 기준 약 <span className="font-bold text-foreground">{daysRemaining}일</span> 후 소진 예정
              </p>
            </div>

            {/* Transaction History */}
            <div>
              <h3 className="font-bold mb-4">최근 7일 입출고 내역</h3>
              <div className="bg-secondary/50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">날짜</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">구분</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">수량</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">잔여</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">관련차량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {transaction.date}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                            transaction.type === 'INCOMING'
                              ? 'bg-[#39D353]/10 text-[#39D353]'
                              : 'bg-[#FFA500]/10 text-[#FFA500]'
                          }`}>
                            {transaction.type === 'INCOMING' ? (
                              <><TrendingUp className="w-3 h-3" /> 입고</>
                            ) : (
                              <><TrendingDown className="w-3 h-3" /> 사용</>
                            )}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          transaction.quantity > 0 ? 'text-[#39D353]' : 'text-[#FFA500]'
                        }`}>
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {transaction.remaining}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {transaction.relatedCar !== '-' ? (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {transaction.relatedCar}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
