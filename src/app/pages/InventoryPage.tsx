import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';
import { inventoryAPI, InventoryItem } from '../utils/api';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InventoryDetailModal } from '../components/InventoryDetailModal';

const STATUS_CONFIG = {
  OK: { label: '정상', color: 'text-[#39D353]', bgColor: 'bg-[#39D353]/10', badgeColor: 'bg-[#39D353]' },
  LOW: { label: '부족', color: 'text-[#FFA500]', bgColor: 'bg-[#FFA500]/10', badgeColor: 'bg-[#FFA500]' },
  CRITICAL: { label: '긴급', color: 'text-destructive', bgColor: 'bg-destructive/10', badgeColor: 'bg-destructive' },
};

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await inventoryAPI.getAll();
      setInventory(data);
    } catch (error) {
      toast.error('재고 데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateShortage = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      await inventoryAPI.simulateShortage(itemId);
      await loadInventory();
      toast.warning('재고 부족이 시뮬레이션되었습니다', {
        description: '재고를 보충해야 합니다',
      });
    } catch (error) {
      toast.error('시뮬레이션 실패');
    } finally {
      setActionLoading(null);
    }
  };

  const criticalItems = inventory.filter(i => i.status === 'CRITICAL');
  const lowItems = inventory.filter(i => i.status === 'LOW');

  const chartData = inventory.map(item => ({
    name: item.name,
    현재고: item.currentStock,
    최소기준: item.minStock,
    status: item.status,
  }));

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
        <h1 className="text-3xl font-bold mb-2">재고 관리</h1>
        <p className="text-muted-foreground">부품 재고 현황 모니터링</p>
      </div>

      {/* Alert Banners */}
      {criticalItems.length > 0 && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive mb-1">긴급 재고 부족</p>
              <p className="text-sm text-destructive/80">
                {criticalItems.length}개 부품의 재고가 심각하게 부족합니다
              </p>
            </div>
          </div>
        </div>
      )}

      {lowItems.length > 0 && (
        <div className="bg-[#FFA500]/10 border border-[#FFA500] rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-[#FFA500] mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-[#FFA500] mb-1">재고 부족 경고</p>
              <p className="text-sm text-[#FFA500]/80">
                {lowItems.length}개 부품의 재고가 최소 기준 이하입니다
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Chart */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">재고 현황 차트</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="name" stroke="#999999" />
            <YAxis stroke="#999999" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1A1A1A', 
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                color: '#E8E8E8'
              }}
            />
            <Bar dataKey="현재고" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.status === 'CRITICAL' ? '#FF2D2D' :
                    entry.status === 'LOW' ? '#FFA500' :
                    '#39D353'
                  } 
                />
              ))}
            </Bar>
            <Bar dataKey="최소기준" fill="#FF4D00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left">부품명</th>
                <th className="px-6 py-4 text-center">현재고</th>
                <th className="px-6 py-4 text-center">최소기준</th>
                <th className="px-6 py-4 text-center">재고율</th>
                <th className="px-6 py-4 text-center">상태</th>
                <th className="px-6 py-4 text-center">작업</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const config = STATUS_CONFIG[item.status];
                const percentage = Math.round((item.currentStock / item.minStock) * 100);
                
                return (
                  <tr 
                    key={item.id} 
                    className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-bold">{item.currentStock}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-muted-foreground">{item.minStock}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              percentage < 50 ? 'bg-destructive' :
                              percentage < 100 ? 'bg-[#FFA500]' :
                              'bg-[#39D353]'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateShortage(item.id);
                          }}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50 text-sm"
                        >
                          {actionLoading === item.id ? '...' : '부족 시뮬레이션'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Detail Modal */}
      {selectedItem && (
        <InventoryDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}