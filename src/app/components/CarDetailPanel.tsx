import { X, Clock, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { Car, ProcessStep } from '../utils/api';

interface CarDetailPanelProps {
  car: Car;
  onClose: () => void;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
}

const STATUS_COLORS = {
  COMPLETED: 'text-[#39D353]',
  IN_PROGRESS: 'text-primary',
  FAILED: 'text-destructive',
  PENDING: 'text-muted-foreground',
};

export function CarDetailPanel({ car, onClose }: CarDetailPanelProps) {
  const currentStatus = car.status === 'BODY_ASSEMBLY' ? '차체조립' :
    car.status === 'ENGINE_INSTALL' ? '엔진설치' :
    car.status === 'PAINTING' ? '도장' :
    car.status === 'QC' ? '품질검사' : '출고대기';

  const estimatedCompletion = new Date(car.startTime.getTime() + (car.totalElapsedMinutes || 240) * 60000);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-card border-l border-border z-50 overflow-y-auto animate-[slideInFromRight_0.3s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{car.id}</h2>
              <p className="text-muted-foreground">{car.modelName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              car.hasIssue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            }`}>
              {currentStatus}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>예상 완료: {formatTime(estimatedCompletion)}</span>
            </div>
          </div>
        </div>

        {/* Process Timeline */}
        <div className="p-6">
          <h3 className="font-bold mb-6">공정 타임라인</h3>

          <div className="space-y-1">
            {car.processHistory?.map((step, index) => (
              <ProcessTimelineItem key={index} step={step} />
            ))}
          </div>

          {!car.processHistory && (
            <p className="text-sm text-muted-foreground">상세 공정 정보가 없습니다</p>
          )}
        </div>

        {/* Event Log */}
        {car.processHistory && (
          <div className="px-6 pb-6">
            <h3 className="font-bold mb-4">이력 로그</h3>
            <div className="space-y-2">
              {car.processHistory
                .filter(step => step.startTime)
                .reverse()
                .map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg bg-secondary/50 ${
                      step.status === 'FAILED' ? 'border-l-2 border-destructive' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.startTime && formatTime(step.startTime)}
                        </p>
                      </div>
                      {step.status === 'FAILED' && step.failureReason && (
                        <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded">
                          실패
                        </span>
                      )}
                      {step.status === 'COMPLETED' && (
                        <span className="px-2 py-0.5 bg-[#39D353]/10 text-[#39D353] text-xs rounded">
                          완료
                        </span>
                      )}
                    </div>
                    {step.failureReason && (
                      <p className="text-xs text-destructive mt-2">원인: {step.failureReason}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">총 경과시간</p>
              <p className="text-xl font-bold">{formatDuration(car.totalElapsedMinutes || 120)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">재작업 횟수</p>
              <p className="text-xl font-bold">{car.reworkCount || 0}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">담당 라인</p>
              <p className="text-xl font-bold">{car.assignedLine || 'N/A'}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">잔여 공정 수</p>
              <p className="text-xl font-bold">{car.remainingSteps || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}

function ProcessTimelineItem({ step }: { step: ProcessStep }) {
  const getIcon = () => {
    if (step.status === 'COMPLETED') return <CheckCircle2 className="w-5 h-5 text-[#39D353]" />;
    if (step.status === 'FAILED') return <AlertTriangle className="w-5 h-5 text-destructive" />;
    if (step.status === 'IN_PROGRESS') return <Circle className="w-5 h-5 text-primary animate-pulse fill-primary" />;
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="flex gap-4 py-3">
      <div className="flex flex-col items-center">
        {getIcon()}
        <div className="w-px h-full bg-border mt-2"></div>
      </div>

      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between mb-1">
          <p className={`font-medium ${STATUS_COLORS[step.status]}`}>
            {step.name}
          </p>
          {step.duration && (
            <span className="text-xs text-muted-foreground">
              {formatDuration(step.duration)}
            </span>
          )}
        </div>

        {step.status === 'COMPLETED' && step.endTime && (
          <p className="text-xs text-muted-foreground">
            완료: {formatTime(step.endTime)}
          </p>
        )}

        {step.status === 'FAILED' && step.failureReason && (
          <div className="mt-2 px-3 py-2 bg-destructive/5 border border-destructive/20 rounded text-xs text-destructive">
            {step.failureReason}
          </div>
        )}

        {step.status === 'IN_PROGRESS' && step.startTime && (
          <p className="text-xs text-muted-foreground">
            진행 중 • 시작: {formatTime(step.startTime)}
          </p>
        )}

        {step.status === 'PENDING' && (
          <p className="text-xs text-muted-foreground opacity-60">
            대기 중
          </p>
        )}
      </div>
    </div>
  );
}
