import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Wrench, Zap } from 'lucide-react';
import { linesAPI, ProductionLine, LineStatus } from '../utils/api';
import { toast } from 'sonner';
import { LineDetailModal } from '../components/LineDetailModal';

const STATUS_CONFIG: Record<LineStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  NORMAL: { label: '정상 가동', color: 'text-[#39D353]', bgColor: 'bg-[#39D353]/10', icon: CheckCircle },
  FAILURE: { label: '장애 발생', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: AlertCircle },
  MAINTENANCE: { label: '유지보수', color: 'text-[#FFA500]', bgColor: 'bg-[#FFA500]/10', icon: Wrench },
};

export function LinesPage() {
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);

  useEffect(() => {
    loadLines();
  }, []);

  const loadLines = async () => {
    try {
      const data = await linesAPI.getAll();
      setLines(data);
    } catch (error) {
      toast.error('라인 데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFailure = async (lineId: string) => {
    setActionLoading(lineId);
    try {
      await linesAPI.simulateFailure(lineId);
      await loadLines();
      toast.error('라인 장애가 시뮬레이션되었습니다', {
        description: '자동 복구를 시도하거나 수동으로 복구하세요',
      });
    } catch (error) {
      toast.error('시뮬레이션 실패');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecover = async (lineId: string) => {
    setActionLoading(lineId);
    try {
      await linesAPI.recover(lineId);
      await loadLines();
      toast.success('라인이 정상 복구되었습니다');
    } catch (error) {
      toast.error('복구 실패');
    } finally {
      setActionLoading(null);
    }
  };

  const failedLines = lines.filter(l => l.status === 'FAILURE');

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
        <h1 className="text-3xl font-bold mb-2">라인 관리</h1>
        <p className="text-muted-foreground">생산 라인 상태 모니터링 및 제어</p>
      </div>

      {/* Alert Banner */}
      {failedLines.length > 0 && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive mb-1">라인 장애 감지</p>
              <p className="text-sm text-destructive/80">
                {failedLines.length}개 라인에서 장애가 발생했습니다: {failedLines.map(l => l.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lines.map(line => {
          const config = STATUS_CONFIG[line.status];
          const Icon = config.icon;
          
          return (
            <div 
              key={line.id} 
              className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedLine(line)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{line.name}</h3>
                    <p className="text-sm text-muted-foreground">{line.id}</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">할당 차량</p>
                  <p className="text-2xl font-bold">{line.assignedCars}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">가동률</p>
                  <p className="text-2xl font-bold">
                    {line.status === 'NORMAL' ? '98%' : line.status === 'FAILURE' ? '0%' : '50%'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {line.status === 'NORMAL' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateFailure(line.id);
                    }}
                    disabled={actionLoading === line.id}
                    className="flex-1 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>장애 시뮬레이션</span>
                  </button>
                )}
                
                {line.status === 'FAILURE' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecover(line.id);
                    }}
                    disabled={actionLoading === line.id}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>자동 복구</span>
                  </button>
                )}
                
                {actionLoading === line.id && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Line Detail Modal */}
      {selectedLine && (
        <LineDetailModal line={selectedLine} onClose={() => setSelectedLine(null)} />
      )}

      {/* Summary */}
      <div className="mt-8 bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">라인 요약</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#39D353] mb-1">
              {lines.filter(l => l.status === 'NORMAL').length}
            </p>
            <p className="text-sm text-muted-foreground">정상 가동</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-destructive mb-1">
              {lines.filter(l => l.status === 'FAILURE').length}
            </p>
            <p className="text-sm text-muted-foreground">장애 발생</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#FFA500] mb-1">
              {lines.filter(l => l.status === 'MAINTENANCE').length}
            </p>
            <p className="text-sm text-muted-foreground">유지보수</p>
          </div>
        </div>
      </div>
    </div>
  );
}