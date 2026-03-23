import { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp } from 'lucide-react';
import { inventoryService, PartsResponseDTO, InventoryTransactionResponseDTO } from '../utils/inventoryApi';

interface InventoryDetailModalProps {
  item: PartsResponseDTO;
  onClose: () => void;
}

const TRANSACTION_TYPE_LABEL: Record<string, string> = {
  INBOUND:  '입고',
  OUTBOUND: '사용',
  USAGE:    '사용',
  IN:       '입고',
  OUT:      '사용',
};

export function InventoryDetailModal({ item, onClose }: InventoryDetailModalProps) {
  const [transactions, setTransactions] = useState<InventoryTransactionResponseDTO[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    inventoryService.getById(item.id)
      .then(detail => setTransactions(detail.transactions ?? []))
      .catch(() => setTransactions([]))
      .finally(() => setLoadingTx(false));
  }, [item.id]);

  const stockPercent = item.stockRate;

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
                <h2 className="text-2xl font-bold mb-1">{item.partName}</h2>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">{item.partCode}</p>
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
                    <p className="text-3xl font-bold">{item.currentStock}<span className="text-lg ml-1 text-muted-foreground">{item.unit}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">최소 기준</p>
                    <p className="text-xl font-bold text-muted-foreground">{item.minStock}<span className="text-sm ml-1">{item.unit}</span></p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                      stockPercent >= 100 ? 'bg-[#39D353]' :
                      stockPercent >= 50 ? 'bg-[#FFA500]' :
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

            {/* Transaction History */}
            <div>
              <h3 className="font-bold mb-4">입출고 내역</h3>
              <div className="bg-secondary/50 rounded-lg overflow-hidden">
                {loadingTx ? (
                  <div className="p-8 text-center text-muted-foreground">로딩 중...</div>
                ) : transactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">내역이 없습니다</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-secondary border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">일시</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">구분</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">수량</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">잔여</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">관련차량</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const isInbound = tx.transactionType.toUpperCase().includes('IN') ||
                                          tx.transactionType.toUpperCase() === 'INBOUND';
                        const label = TRANSACTION_TYPE_LABEL[tx.transactionType.toUpperCase()] ?? tx.transactionType;
                        const date = tx.createdAt ? tx.createdAt.replace('T', ' ').slice(0, 16) : '-';

                        return (
                          <tr key={tx.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-3 text-sm text-muted-foreground">{date}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                                isInbound
                                  ? 'bg-[#39D353]/10 text-[#39D353]'
                                  : 'bg-[#FFA500]/10 text-[#FFA500]'
                              }`}>
                                {isInbound ? (
                                  <><TrendingUp className="w-3 h-3" /> {label}</>
                                ) : (
                                  <><TrendingDown className="w-3 h-3" /> {label}</>
                                )}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-right font-medium ${
                              tx.quantity > 0 ? 'text-[#39D353]' : 'text-[#FFA500]'
                            }`}>
                              {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                            </td>
                            <td className="px-4 py-3 text-right font-bold">{tx.remainingStock}</td>
                            <td className="px-4 py-3 text-sm">
                              {tx.vehicleId ? (
                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                  #{tx.vehicleId}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
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
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
