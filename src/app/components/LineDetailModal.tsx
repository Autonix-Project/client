import { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import {
  linesService,
  LineResponseDTO,
  VehicleResponseDTO,
  calcElapsed,
} from '../utils/linesApi';

interface LineDetailModalProps {
  line: LineResponseDTO;
  onClose: () => void;
}

// 백엔드 LineType 순서에 맞춘 스테이션 목록
const PROCESS_STEPS = ['차체', '도장', '조립', '품질검사', '출고'] as const;

const VEHICLE_STATUS_LABEL: Record<string, string> = {
  PENDING:    '대기',
  PROCESSING: '진행 중',
  QC_PASS:    'QC 통과',
  QC_FAIL:    'QC 실패',
  COMPLETED:  '완료',
};

const VEHICLE_STATUS_COLOR: Record<string, string> = {
  PENDING:    'bg-secondary text-muted-foreground',
  PROCESSING: 'bg-primary/10 text-primary',
  QC_PASS:    'bg-[#39D353]/10 text-[#39D353]',
  QC_FAIL:    'bg-destructive/10 text-destructive',
  COMPLETED:  'bg-[#39D353]/10 text-[#39D353]',
};

export function LineDetailModal({ line, onClose }: LineDetailModalProps) {
  const [vehicles, setVehicles] = useState<VehicleResponseDTO[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    linesService
      .getVehiclesByLine(line.lineId)
      .then(setVehicles)
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false));
  }, [line.lineId]);

  // 스테이션별 상태 계산
  const currentProcessIndex = PROCESS_STEPS.indexOf(line.lineType as (typeof PROCESS_STEPS)[number]);

  const getStationState = (idx: number) => {
    if (line.lineStatus === 'FAULT' && idx === currentProcessIndex) return 'failed';
    if (idx < currentProcessIndex) return 'completed';
    if (idx === currentProcessIndex) return 'in-progress';
    return 'pending';
  };

  const processingCount = vehicles.filter(v => v.status === 'PROCESSING').length;
  const completedCount = vehicles.filter(v => v.status === 'COMPLETED' || v.status === 'QC_PASS').length;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-[modalFadeIn_0.2s_ease-out]"
          onClick={e => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold">{line.lineName}</h2>
                  <span className="text-sm text-muted-foreground">{line.lineNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    line.lineStatus === 'NORMAL'  ? 'bg-[#39D353]/10 text-[#39D353]' :
                    line.lineStatus === 'FAULT'   ? 'bg-destructive/10 text-destructive' :
                    'bg-[#FFA500]/10 text-[#FFA500]'
                  }`}>
                    {line.lineStatus === 'NORMAL' ? '정상' : line.lineStatus === 'FAULT' ? '장애' : '중지'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                    {line.lineType} 공정
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
            {/* 공정 흐름 스테이션 맵 */}
            <div className="mb-8">
              <h3 className="font-bold mb-6">공정 흐름</h3>
              <div className="flex items-center justify-between px-4">
                {PROCESS_STEPS.map((step, idx) => {
                  const state = getStationState(idx);
                  return (
                    <div key={step} className="flex items-center">
                      <div className="flex flex-col items-center">
                        {state === 'completed' && (
                          <div className="w-12 h-12 rounded-full bg-[#39D353]/10 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-[#39D353]" />
                          </div>
                        )}
                        {state === 'in-progress' && (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Circle className="w-6 h-6 text-primary fill-primary animate-pulse" />
                          </div>
                        )}
                        {state === 'pending' && (
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        {state === 'failed' && (
                          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                          </div>
                        )}
                        <p className="text-sm mt-2 font-medium">{step}</p>
                        {step === line.lineType && (
                          <p className="text-xs text-muted-foreground mt-0.5">현재</p>
                        )}
                      </div>

                      {idx < PROCESS_STEPS.length - 1 && (
                        <div className="w-12 h-px bg-border mx-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 할당 차량 테이블 */}
            <div className="mb-8">
              <h3 className="font-bold mb-4">
                할당 차량
                {!loadingVehicles && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({vehicles.length}대)
                  </span>
                )}
              </h3>

              {loadingVehicles ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">차량 데이터 로딩 중...</span>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm bg-secondary/30 rounded-lg">
                  현재 할당된 차량이 없습니다.
                </div>
              ) : (
                <div className="bg-secondary/50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">차량번호</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">차종</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">컬러</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">현재 공정</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">경과시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map(v => (
                        <tr key={v.vehicleId} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium">{v.vehicleNumber}</td>
                          <td className="px-4 py-3">{v.carModel}</td>
                          <td className="px-4 py-3 text-muted-foreground">{v.carColor}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {v.currentProcess}
                              {v.currentStation ? ` · ${v.currentStation}` : ''}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded ${VEHICLE_STATUS_COLOR[v.status] ?? 'bg-secondary text-muted-foreground'}`}>
                              {VEHICLE_STATUS_LABEL[v.status] ?? v.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground text-sm">
                            {v.processStartedAt ? calcElapsed(v.processStartedAt) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 공정 요약 메트릭 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">전체 차량</p>
                <p className="text-2xl font-bold">{vehicles.length}대</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">진행 중</p>
                <p className="text-2xl font-bold text-primary">{processingCount}대</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">완료</p>
                <p className="text-2xl font-bold text-[#39D353]">{completedCount}대</p>
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
