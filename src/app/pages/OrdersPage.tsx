import { useState, useEffect } from 'react';
import { ClipboardList, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { ordersAPI, ProductionOrder, CAR_MODELS, CAR_COLORS } from '../utils/api';
import { toast } from 'sonner';

function formatDateTime(date: Date): string {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const mins  = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins}`;
}

const STATUS_CONFIG = {
  PENDING:       { label: '대기중', color: 'text-muted-foreground', bgColor: 'bg-secondary' },
  IN_PRODUCTION: { label: '생산중', color: 'text-primary',          bgColor: 'bg-primary/10' },
  COMPLETED:     { label: '완료',   color: 'text-[#39D353]',        bgColor: 'bg-[#39D353]/10' },
};

export function OrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [modelName, setModelName] = useState(CAR_MODELS[0]);
  const [quantity, setQuantity] = useState('1');
  const [color, setColor] = useState(CAR_COLORS[0]);
  const [destination, setDestination] = useState('');

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch {
      toast.error('주문 데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1 || qty > 50) {
      toast.error('수량은 1~50 사이로 입력해주세요');
      return;
    }
    if (!destination.trim()) {
      toast.error('목적지를 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await ordersAPI.create({ modelName, quantity: qty, color, destination: destination.trim() });
      toast.success('주문이 등록되었습니다.');
      await loadOrders();
      setQuantity('1');
      setDestination('');
    } catch {
      toast.error('주문 등록 실패');
    } finally {
      setSubmitting(false);
    }
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
        <h1 className="text-3xl font-bold mb-2">생산 주문 등록</h1>
        <p className="text-muted-foreground">신규 생산 주문을 등록하고 관리합니다</p>
      </div>

      {/* 주문 입력 폼 */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">주문 입력 폼</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="model" className="block text-sm mb-2">차종 선택</label>
            <select
              id="model"
              value={modelName}
              onChange={e => setModelName(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CAR_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm mb-2">생산 수량 (1~50)</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="color" className="block text-sm mb-2">차량 색상</label>
              <select
                id="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CAR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm mb-2">목적지</label>
              <input
                id="destination"
                type="text"
                placeholder="예: 서울 딜러"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
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

      {/* 주문 목록 */}
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
                <th className="px-6 py-4 text-left">색상</th>
                <th className="px-6 py-4 text-center">수량</th>
                <th className="px-6 py-4 text-left">목적지</th>
                <th className="px-6 py-4 text-left">등록시각</th>
                <th className="px-6 py-4 text-center">상태</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    등록된 주문이 없습니다
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const statusConfig = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{order.id}</td>
                      <td className="px-6 py-4 font-medium">{order.modelName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{order.color ?? '-'}</td>
                      <td className="px-6 py-4 text-center font-bold text-lg">{order.quantity}</td>
                      <td className="px-6 py-4 text-muted-foreground">{order.destination ?? '-'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDateTime(new Date(order.createdAt))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {order.status === 'PENDING'       && <Clock className="w-3 h-3" />}
                            {order.status === 'IN_PRODUCTION' && <TrendingUp className="w-3 h-3" />}
                            {order.status === 'COMPLETED'     && <CheckCircle className="w-3 h-3" />}
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
