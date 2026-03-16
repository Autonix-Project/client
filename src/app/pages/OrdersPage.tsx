import { useState, useEffect } from 'react';
import { ClipboardList, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { ordersAPI, ProductionOrder, OrderPriority, CAR_MODELS } from '../utils/api';
import { toast } from 'sonner';

// Simple date formatting
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const PRIORITY_CONFIG = {
  HIGH: { label: '높음', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  NORMAL: { label: '보통', color: 'text-[#FFA500]', bgColor: 'bg-[#FFA500]/10' },
  LOW: { label: '낮음', color: 'text-muted-foreground', bgColor: 'bg-secondary' },
};

const STATUS_CONFIG = {
  PENDING: { label: '대기중', color: 'text-muted-foreground', bgColor: 'bg-secondary' },
  IN_PRODUCTION: { label: '생산중', color: 'text-primary', bgColor: 'bg-primary/10' },
  COMPLETED: { label: '완료', color: 'text-[#39D353]', bgColor: 'bg-[#39D353]/10' },
};

export function OrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [modelName, setModelName] = useState(CAR_MODELS[0]);
  const [quantity, setQuantity] = useState('1');
  const [priority, setPriority] = useState<OrderPriority>('NORMAL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      toast.error('주문 데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1 || qty > 50) {
      toast.error('수량은 1~50 사이로 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await ordersAPI.create({
        modelName,
        quantity: qty,
        priority,
      });
      
      toast.success('주문이 등록되었습니다. 시뮬레이션을 시작합니다.');
      await loadOrders();
      
      // Reset form
      setQuantity('1');
      setPriority('NORMAL');
    } catch (error) {
      toast.error('주문 등록 실패');
    } finally {
      setSubmitting(false);
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
        <h1 className="text-3xl font-bold mb-2">생산 주문 등록</h1>
        <p className="text-muted-foreground">신규 생산 주문을 등록하고 관리합니다</p>
      </div>

      {/* Order Form */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">주문 입력 폼</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="model" className="block text-sm mb-2">
              차종 선택
            </label>
            <select
              id="model"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CAR_MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm mb-2">
              생산 수량 (1~50)
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm mb-3">우선순위</label>
            <div className="flex gap-4">
              {(['HIGH', 'NORMAL', 'LOW'] as OrderPriority[]).map(p => (
                <label
                  key={p}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                    priority === p
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={priority === p}
                    onChange={(e) => setPriority(e.target.value as OrderPriority)}
                    className="accent-primary"
                  />
                  <span>{PRIORITY_CONFIG[p].label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '생산 주문 등록'}
          </button>
        </form>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">최근 등록 주문 목록</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left">주문번호</th>
                <th className="px-6 py-4 text-left">차종</th>
                <th className="px-6 py-4 text-center">수량</th>
                <th className="px-6 py-4 text-center">우선순위</th>
                <th className="px-6 py-4 text-left">등록시각</th>
                <th className="px-6 py-4 text-center">상태</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    등록된 주문이 없습니다
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const priorityConfig = PRIORITY_CONFIG[order.priority];
                  const statusConfig = STATUS_CONFIG[order.status];
                  
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{order.modelName}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-lg">{order.quantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(new Date(order.createdAt))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} flex items-center gap-1.5`}>
                            {order.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            {order.status === 'IN_PRODUCTION' && <TrendingUp className="w-3 h-3" />}
                            {order.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
