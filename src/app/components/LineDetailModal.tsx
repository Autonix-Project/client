import { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, AlertCircle, Loader2, Package } from 'lucide-react';
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

const PROCESS_STEPS = ['차체', '도장', '조립', '품질검사', '출고'] as const;

// 조립 라인 전용 스테이션 정의
const ASSEMBLY_STATIONS = [
  {
    name: '파워트레인 장착',
    parts: ['엔진', '변속기', '드라이브샤프트'],
  },
  {
    name: '섀시/하부 조립',
    parts: ['타이어', '브레이크 세트', '서스펜션'],
  },
  {
    name: '전장 시스템',
    parts: ['배터리', 'ECU', '센서'],
  },
  {
    name: '내부 조립',
    parts: ['시트', '에어백', '내부 부품'],
  },
];

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

  const isAssemblyLine = line.lineType === '조립';

  useEffect(() => {
    linesService
      .getVehiclesByLine(line.lineId)
      .then(setVehicles)
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false));
  }, [line.lineId]);

  // 공정 흐름 스테이션 상태 계산
  const currentProcessIndex = PROCESS_STEPS.indexOf(line.lineType as (typeof PROCESS_STEPS)[number]);
  const getStationState = (idx: number) => {
    if (line.lineStatus === 'FAULT' && idx === currentProcessIndex) return 'failed';
    if (idx < currentProcessIndex) return 'completed';
    if (idx === currentProcessIndex) return 'in-progress';
    return 'pending';
  };

  // 메트릭
  const processingCount = vehicles.filter(v => v.status === 'PROCESSING').length;
  const completedCount  = vehicles.filter(v => v.status === 'COMPLETED' || v.status === 'QC_PASS').length;
  const utilizationRate = vehicles.length > 0
    ? Math.round((processingCount / vehicles.length) * 100)
    : (line.lineStatus === 'NORMAL' ? 0 : 0);

  // 조립 라인: 스테이션별 차량 그룹핑
  const vehiclesByStation = isAssemblyLine
    ? ASSEMBLY_STATIONS.reduce<Record<string, VehicleResponseDTO[]>>((acc, s) => {
        acc[s.name] = vehicles.filter(v => v.currentStation === s.name);
        return acc;
      }, {})
    : {};

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
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* 공정 흐름 — 모든 라인 공통 */}
            <div className="mb-8">
              <h3 className="font-bold mb-6">공정 흐름</h3>
              <div className="flex items-center justify-between px-4">
                {PROCESS_STEPS.map((step, idx) => {
                  const state = getStationState(idx);
                  return (
                    <div key={step} className="flex items-center">
                      <div className="flex flex-col items-center">
                        {state === 'completed'   && <div className="w-12 h-12 rounded-full bg-[#39D353]/10 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-[#39D353]" /></div>}
                        {state === 'in-progress' && <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Circle className="w-6 h-6 text-primary fill-primary animate-pulse" /></div>}
                        {state === 'pending'     && <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center"><Circle className="w-6 h-6 text-muted-foreground" /></div>}
                        {state === 'failed'      && <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-destructive" /></div>}
                        <p className="text-sm mt-2 font-medium">{step}</p>
                        {step === line.lineType && <p className="text-xs text-muted-foreground mt-0.5">현재</p>}
                      </div>
                      {idx < PROCESS_STEPS.length - 1 && <div className="w-12 h-px bg-border mx-2" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 조립 라인 전용: 스테이션 맵 */}
            {isAssemblyLine && (
              <div className="mb-8">
                <h3 className="font-bold mb-4">조립 스테이션 맵</h3>
                <div className="grid grid-cols-2 gap-4">
                  {ASSEMBLY_STATIONS.map(station => {
                    const stationVehicles = vehiclesByStation[station.name] ?? [];
                    return (
                      <div key={station.name} className="bg-secondary/40 border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm">{station.name}</h4>
                          {stationVehicles.length > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {stationVehicles.length}대 작업 중
                            </span>
                          )}
                        </div>
                        {/* 부품 목록 */}
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          <Package className="w-3 h-3 text-muted-foreground shrink-0" />
                          {station.parts.map(part => (
                            <span key={part} className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground">
                              {part}
                            </span>
                          ))}
                        </div>
                        {/* 해당 스테이션 차량 */}
                        {loadingVehicles ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" /> 로딩 중...
                          </div>
                        ) : stationVehicles.length === 0 ? (
                          <p className="text-xs text-muted-foreground">대기 중인 차량 없음</p>
                        ) : (
                          <ul className="space-y-1">
                            {stationVehicles.map(v => (
                              <li key={v.vehicleId} className="text-xs flex items-center justify-between">
                                <span className="font-medium">{v.vehicleNumber}</span>
                                <span className="text-muted-foreground">{v.carModel} · {calcElapsed(v.processStartedAt)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 할당 차량 테이블 */}
            <div className="mb-8">
              <h3 className="font-bold mb-4">
                할당 차량
                {!loadingVehicles && <span className="ml-2 text-sm font-normal text-muted-foreground">({vehicles.length}대)</span>}
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
                        <th className="px-4 py-3 text-left text-sm font-medium">현재 공정{isAssemblyLine ? ' / 스테이션' : ''}</th>
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
                              {v.currentProcess}{v.currentStation ? ` / ${v.currentStation}` : ''}
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

            {/* 메트릭 4개 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">현재 할당 차량</p>
                <p className="text-2xl font-bold">{vehicles.length}대</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">오늘 완료 차량</p>
                <p className="text-2xl font-bold text-[#39D353]">{completedCount}대</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">평균 사이클 타임</p>
                <p className="text-2xl font-bold text-muted-foreground">-</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">가동률</p>
                <p className={`text-2xl font-bold ${line.lineStatus === 'FAULT' ? 'text-destructive' : 'text-primary'}`}>
                  {line.lineStatus === 'FAULT' ? '0' : utilizationRate}%
                </p>
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
