import React from 'react';
import { ArrowRight, AlertCircle, TrendingUp } from 'lucide-react';

export const FlowMatrix: React.FC = () => {
  const mappingRows = [
    {
      ach: 'A',
      achRatio: '23.6%',
      split: '90점 이상',
      achColor: 'bg-[#16382C]',
      ranks: [
        { rank: '1등급 (상위 10%)', pctOfAch: '42.2%', cutoff: '93.0점 이상', rankColor: 'text-slate-900 bg-[#E8DCCB] border-[#C8B69F]' },
        { rank: '2등급 (누적 34%)', pctOfAch: '57.8%', cutoff: '87.0점 ~ 92.9점', rankColor: 'text-slate-900 bg-[#DCE4EA] border-[#B5C4CF]' },
      ],
      insight: '성취도 A 집단 중 과반수인 57.8%는 1등급이 아닌 2등급으로 분기 배정됨 (A등급 인플레이션 착시)',
    },
    {
      ach: 'B',
      achRatio: '30.1%',
      split: '80점 ~ 90점',
      achColor: 'bg-[#1B314B]',
      ranks: [
        { rank: '2등급', pctOfAch: '34.9%', cutoff: '87.0점 ~ 89.9점', rankColor: 'text-slate-900 bg-[#DCE4EA] border-[#B5C4CF]' },
        { rank: '3등급', pctOfAch: '65.1%', cutoff: '80.0점 ~ 86.9점', rankColor: 'text-slate-900 bg-[#D4DFDB] border-[#AEC2BA]' },
      ],
      insight: 'B등급 집단은 87점 등급컷을 기점으로 2등급(34.9%)과 3등급(65.1%)으로 극명하게 갈림',
    },
    {
      ach: 'C',
      achRatio: '16.5%',
      split: '70점 ~ 80점',
      achColor: 'bg-[#764121]',
      ranks: [
        { rank: '3등급', pctOfAch: '74.1%', cutoff: '72.0점 ~ 79.9점', rankColor: 'text-slate-900 bg-[#D4DFDB] border-[#AEC2BA]' },
        { rank: '4등급', pctOfAch: '25.9%', cutoff: '70.0점 ~ 71.9점', rankColor: 'text-slate-900 bg-[#EBE2D3] border-[#C9BDA6]' },
      ],
      insight: '72점 등급컷으로 인해 C등급 상위 74.1%는 3등급 유지, 하위 25.9%는 4등급으로 하락',
    },
    {
      ach: 'D',
      achRatio: '15.3%',
      split: '60점 ~ 70점',
      achColor: 'bg-[#5C3825]',
      ranks: [
        { rank: '4등급', pctOfAch: '100.0%', cutoff: '60.0점 ~ 69.9점', rankColor: 'text-slate-900 bg-[#EBE2D3] border-[#C9BDA6]' },
      ],
      insight: 'D등급 전원(100.0%)이 4등급 구간(56.0~72.0점) 내에 온전히 안착',
    },
    {
      ach: 'E',
      achRatio: '14.5%',
      split: '60점 미만 (미도달 통합)',
      achColor: 'bg-[#461E29]',
      ranks: [
        { rank: '4등급', pctOfAch: '31.4%', cutoff: '56.0점 ~ 59.9점', rankColor: 'text-slate-900 bg-[#EBE2D3] border-[#C9BDA6]' },
        { rank: '5등급', pctOfAch: '68.6%', cutoff: '56.0점 미만 (47.0점 컷)', rankColor: 'text-slate-900 bg-[#DFD4D8] border-[#BEAEB3]' },
      ],
      insight: 'E등급(14.5%, 미도달 통합) 중 56점 이상은 4등급 턱걸이 수혜, 55점 이하는 5등급 배정',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>성취도(원점수 분할) ↔ 5등급제(등급컷) 상호 연계 매핑표</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            원점수 분포비율과 등급컷(93.0 / 87.0 / 72.0 / 56.0 / 47.0)에 따른 실제 등급 이동 분석 (미도달 E 통합, 벤틀리 테마)
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#16382C] bg-[#F4EFE6] px-2.5 py-1 rounded-md font-bold border border-[#D5C6B1]">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>정밀 비율 연계 분석</span>
        </div>
      </div>

      <div className="space-y-3">
        {mappingRows.map((row) => (
          <div
            key={row.ach}
            className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Left: Achievement Badge & Info */}
              <div className="flex items-center gap-3 min-w-[210px]">
                <div
                  className={`w-9 h-9 rounded-lg text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs ${row.achColor}`}
                >
                  {row.ach}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">성취도 {row.ach}</span>
                    <span className="text-xs font-semibold text-slate-600 tabular-nums">
                      비율 {row.achRatio}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    분할기준: <span className="font-medium text-slate-700">{row.split}</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Middle: Rank destinations */}
              <div className="flex-1 flex flex-wrap gap-2">
                {row.ranks.map((r, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-2 shadow-2xs ${r.rankColor}`}
                  >
                    <span className="font-bold">{r.rank}</span>
                    <span className="text-[11px] font-mono tabular-nums font-bold">
                      점유율 {r.pctOfAch}
                    </span>
                    <span className="text-[10px] opacity-75 hidden sm:inline">
                      [{r.cutoff}]
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Insight Note */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center gap-2 text-xs text-slate-600">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{row.insight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
