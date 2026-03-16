import { X, CheckCircle2, Circle } from 'lucide-react';
import { ProductionLine } from '../utils/api';

interface LineDetailModalProps {
  line: ProductionLine;
  onClose: () => void;
}

const STATIONS = [
  { id: 1, name: '프레임', key: 'frame' },
  { id: 2, name: '용접', key: 'welding' },
  { id: 3, name: '차체', key: 'body' },
  { id: 4, name: '조립', key: 'assembly' },
  { id: 5, name: '검사', key: 'inspection' },
];

// Mock data for assigned vehicles and completed count
const mockAssignedVehicles = [
  { carId: 'CAR-001', model: '소나타 N라인', station: '용접', elapsed: '23분' },
  { carId: 'CAR-003', model: '투싼 하이브리드', station: '조립', elapsed: '45분' },
  { carId: 'CAR-005', model: '아이오닉6', station: '검사', elapsed: '12분' },
];

const mockWeeklyCompletion = [12, 15, 14, 18, 16, 20, 19]; // Last 7 days

export function LineDetailModal({ line, onClose }: LineDetailModalProps) {
  const completedToday = Math.floor(Math.random() * 15) + 10;
  const avgCycleTime = Math.floor(Math.random() * 30) + 120; // 120-150 minutes
  const utilizationRate = line.status === 'NORMAL' ? 92 : line.status === 'FAILURE' ? 45 : 0;

  // Determine station states (for demo purposes)
  const stationStates = STATIONS.map((station, index) => {
    if (line.status === 'FAILURE' && index === 2) {
      return 'failed';
    }
    if (index < 3) return 'completed';
    if (index === 3) return 'in-progress';
    return 'pending';
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-[modalFadeIn_0.2s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{line.name}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  line.status === 'NORMAL' ? 'bg-[#39D353]/10 text-[#39D353]' :
                  line.status === 'FAILURE' ? 'bg-destructive/10 text-destructive' :
                  'bg-[#FFA500]/10 text-[#FFA500]'
                }`}>
                  {line.status === 'NORMAL' ? '정상' : line.status === 'FAILURE' ? '장애' : '점검중'}
                </span>
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
            {/* Station Map */}
            <div className="mb-8">
              <h3 className="font-bold mb-6">스테이션 맵</h3>
              <div className="flex items-center justify-between px-8">
                {STATIONS.map((station, index) => {
                  const state = stationStates[index];
                  return (
                    <div key={station.id} className="flex items-center">
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
                            <Circle className="w-6 h-6 text-destructive" />
                          </div>
                        )}
                        <p className="text-sm mt-2 font-medium">{station.name}</p>
                      </div>
                      
                      {index < STATIONS.length - 1 && (
                        <div className="w-16 h-px bg-border mx-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned Vehicles */}
            <div className="mb-8">
              <h3 className="font-bold mb-4">현재 할당 차량</h3>
              <div className="bg-secondary/50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">차량번호</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">차종</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">현재 스테이션</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">경과시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAssignedVehicles.map((vehicle) => (
                      <tr key={vehicle.carId} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{vehicle.carId}</td>
                        <td className="px-4 py-3">{vehicle.model}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {vehicle.station}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{vehicle.elapsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">오늘 완료 차량</p>
                <p className="text-2xl font-bold">{completedToday}대</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">평균 사이클 타임</p>
                <p className="text-2xl font-bold">{avgCycleTime}분</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">가동률</p>
                <p className="text-2xl font-bold">{utilizationRate}%</p>
              </div>
            </div>

            {/* Weekly Utilization Chart */}
            <div>
              <h3 className="font-bold mb-4">가동률 추이 (최근 7일)</h3>
              <div className="flex items-end gap-2 h-32">
                {mockWeeklyCompletion.map((count, index) => {
                  const maxCount = Math.max(...mockWeeklyCompletion);
                  const heightPercent = (count / maxCount) * 100;
                  const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-secondary rounded-t relative" style={{ height: `${heightPercent}%` }}>
                        <div className="absolute inset-0 bg-primary rounded-t"></div>
                      </div>
                      <p className="text-xs text-muted-foreground">{dayLabels[index]}</p>
                    </div>
                  );
                })}
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
