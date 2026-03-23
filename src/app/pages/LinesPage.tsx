import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Wrench, Zap, Bell } from 'lucide-react';
import { toast } from 'sonner';
import {
  linesService,
  LineResponseDTO,
  BackendLineStatus,
  NotificationResponseDTO,
  VehicleResponseDTO,
} from '../utils/linesApi';
import { LineDetailModal } from '../components/LineDetailModal';

const STATUS_CONFIG: Record<BackendLineStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  NORMAL:  { label: '정상 가동', color: 'text-[#39D353]',   bgColor: 'bg-[#39D353]/10',   icon: CheckCircle },
  FAULT:   { label: '장애 발생', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: AlertCircle },
  STOPPED: { label: '중지',      color: 'text-[#FFA500]',   bgColor: 'bg-[#FFA500]/10',   icon: Wrench },
};

const LINE_TYPE_COLOR: Record<string, string> = {
  차체:    'bg-blue-500/10 text-blue-400',
  도장:    'bg-purple-500/10 text-purple-400',
  조립:    'bg-primary/10 text-primary',
  품질검사:'bg-yellow-500/10 text-yellow-400',
  출고:    'bg-[#39D353]/10 text-[#39D353]',
};

// 같은 라인의 반복 알림 중복 제거 (referenceId+type 기준 최신 1건만 유지)
function deduplicateNotifications(notifs: NotificationResponseDTO[]): NotificationResponseDTO[] {
  const map = new Map<string, NotificationResponseDTO>();
  for (const n of notifs) {
    const key = `${n.notificationType}_${n.referenceId}`;
    const existing = map.get(key);
    if (!existing || new Date(n.createdAt) > new Date(existing.createdAt)) {
      map.set(key, n);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function LinesPage() {
  const [lines, setLines] = useState<LineResponseDTO[]>([]);
  const [vehicleCountMap, setVehicleCountMap] = useState<Record<number, number>>({});
  const [notifications, setNotifications] = useState<NotificationResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<LineResponseDTO | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [linesData, activeVehicles, notifs] = await Promise.all([
        linesService.getAll(),
        linesService.getActiveVehicles(),
        linesService.getNotifications(),
      ]);
      setLines(linesData);
      setNotifications(notifs);

      const countMap: Record<number, number> = {};
      (activeVehicles as VehicleResponseDTO[]).forEach(v => {
        countMap[v.currentLineId] = (countMap[v.currentLineId] ?? 0) + 1;
      });
      setVehicleCountMap(countMap);
    } catch {
      toast.error('라인 데이터 로딩 실패', { description: '서버 연결을 확인해주세요.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFailure = async (lineId: number) => {
    setActionLoading(lineId);
    try {
      await linesService.changeLineStatus(lineId, 'FAULT');
      await loadAll();
      toast.error('라인 장애가 발생했습니다', { description: '수동으로 복구하세요.' });
    } catch {
      toast.error('장애 시뮬레이션 실패');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecover = async (lineId: number) => {
    setActionLoading(lineId);
    try {
      await linesService.changeLineStatus(lineId, 'NORMAL');
      await loadAll();
      toast.success('라인이 정상 복구되었습니다');
    } catch {
      toast.error('복구 실패');
    } finally {
      setActionLoading(null);
    }
  };

  const faultLines = lines.filter(l => l.lineStatus === 'FAULT');
  const dedupedNotifs = deduplicateNotifications(notifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">라인 관리</h1>
          <p className="text-muted-foreground">생산 라인 상태 모니터링 및 제어</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
            <Bell className="w-4 h-4" />
            미확인 알림 {unreadCount}건
          </div>
        )}
      </div>

      {/* 장애 배너 */}
      {faultLines.length > 0 && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-destructive mb-1">라인 장애 감지</p>
              <p className="text-sm text-destructive/80">
                {faultLines.length}개 라인 장애 발생: {faultLines.map(l => l.lineName).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 최근 알림 — 중복 제거된 목록 */}
      {dedupedNotifs.length > 0 && (
        <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">최근 알림</h2>
            <span className="ml-auto text-xs text-muted-foreground">라인별 최신 1건</span>
          </div>
          <ul className="divide-y divide-border max-h-40 overflow-y-auto">
            {dedupedNotifs.slice(0, 5).map(n => (
              <li key={n.notificationId} className="px-4 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />}
                  <span className="text-sm truncate">{n.message}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {new Date(n.createdAt).toLocaleString('ko-KR', {
                    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 라인 그리드 — 홀수 마지막 카드는 full-width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {lines.map((line, index) => {
          const isLastOdd = lines.length % 2 === 1 && index === lines.length - 1;
          const config = STATUS_CONFIG[line.lineStatus];
          const Icon = config.icon;
          const vehicleCount = vehicleCountMap[line.lineId] ?? 0;
          const isWorking = actionLoading === line.lineId;

          return (
            <div
              key={line.lineId}
              className={`bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors ${isLastOdd ? 'md:col-span-2' : ''}`}
              onClick={() => setSelectedLine(line)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{line.lineName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LINE_TYPE_COLOR[line.lineType] ?? 'bg-secondary text-muted-foreground'}`}>
                        {line.lineType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{line.lineNumber}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">가동 차량</p>
                  <p className="text-2xl font-bold">{vehicleCount}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">공정 유형</p>
                  <p className="text-lg font-bold">{line.lineType}</p>
                </div>
              </div>

              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                {line.lineStatus === 'NORMAL' && (
                  <button
                    onClick={() => handleSimulateFailure(line.lineId)}
                    disabled={isWorking}
                    className="flex-1 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>장애 시뮬레이션</span>
                  </button>
                )}
                {line.lineStatus === 'FAULT' && (
                  <button
                    onClick={() => handleRecover(line.lineId)}
                    disabled={isWorking}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>복구</span>
                  </button>
                )}
                {line.lineStatus === 'STOPPED' && (
                  <button
                    onClick={() => handleRecover(line.lineId)}
                    disabled={isWorking}
                    className="flex-1 px-4 py-2 bg-[#FFA500]/10 text-[#FFA500] rounded-lg hover:bg-[#FFA500]/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>가동 재개</span>
                  </button>
                )}
                {isWorking && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 라인 요약 */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">라인 요약</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#39D353] mb-1">{lines.filter(l => l.lineStatus === 'NORMAL').length}</p>
            <p className="text-sm text-muted-foreground">정상 가동</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-destructive mb-1">{lines.filter(l => l.lineStatus === 'FAULT').length}</p>
            <p className="text-sm text-muted-foreground">장애 발생</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#FFA500] mb-1">{lines.filter(l => l.lineStatus === 'STOPPED').length}</p>
            <p className="text-sm text-muted-foreground">중지</p>
          </div>
        </div>
      </div>

      {selectedLine && (
        <LineDetailModal line={selectedLine} onClose={() => setSelectedLine(null)} />
      )}
    </div>
  );
}
