import React from 'react';
import { AchievementItem, RankGradeItem } from '../types/data';

interface CumulativeComparisonBarProps {
  achievements: AchievementItem[];
  ranks: RankGradeItem[];
  totalStudents: number;
}

export const CumulativeComparisonBar: React.FC<CumulativeComparisonBarProps> = ({
  achievements,
  ranks,
  totalStudents,
}) => {
  return (
    <div className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">누적 비율(백분위) 선형 비교 바</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            상위 0%에서 100%까지의 등급 및 성취도 경계 구간 정렬 (나이키 다이내믹 스포츠 테마)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-2 rounded-xs bg-[#FEF9C3] border border-[#EAB308] inline-block" />
            5등급제 (얇고 산뜻한 외곽)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded-xs bg-[#0055FE] inline-block" />
            성취평가제 (두껍고 역동적인 메인)
          </span>
        </div>
      </div>

      {/* Axis Scale Markers (0% to 100%) */}
      <div className="relative w-full h-5 mb-1 text-[11px] font-mono text-slate-400 select-none">
        <span className="absolute left-0">0% (상위)</span>
        <span className="absolute left-[10%] -translate-x-1/2">10%</span>
        <span className="absolute left-[24%] -translate-x-1/2">24%</span>
        <span className="absolute left-[34%] -translate-x-1/2">34%</span>
        <span className="absolute left-[54%] -translate-x-1/2">54%</span>
        <span className="absolute left-[66%] -translate-x-1/2">66%</span>
        <span className="absolute left-[90%] -translate-x-1/2">90%</span>
        <span className="absolute right-0">100%</span>
      </div>

      {/* TOP ROW: 5등급제 - THIN & SLEEK ATHLETIC BAR */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span>[바깥 테두리] 5등급제 (상대평가) — 얇은 슬림 바</span>
          <span className="text-[11px] text-slate-500 font-medium">등급컷 점수 고대비 강조</span>
        </div>
        <div className="w-full h-9 flex rounded-md overflow-hidden border border-slate-300 shadow-2xs">
          {ranks.map((rank) => {
            const widthPct = (rank.studentCount / totalStudents) * 100;
            return (
              <div
                key={rank.id}
                style={{ width: `${widthPct}%`, backgroundColor: rank.color }}
                className="h-full flex items-center justify-center text-slate-900 p-1 text-center border-r border-slate-400/40 last:border-r-0 transition-opacity hover:opacity-95 relative group cursor-pointer gap-2"
                title={`${rank.rankName}: ${rank.calculatedRatio}%, 등급컷 ${rank.cutoffScore}점`}
              >
                <span className="text-[13px] font-black leading-tight text-slate-950">{rank.rankName}</span>
                <span className="text-[11.5px] sm:text-[12px] font-black text-black bg-[#CCFF00] px-2 py-0.5 rounded border border-[#b8e600] tabular-nums shadow-xs">
                  컷 {rank.cutoffScore.toFixed(1)}점
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MID CONNECTOR GUIDES (Nike High-Contrast Sport Badges) */}
      <div className="relative h-6 flex items-center justify-between px-1">
        <div className="text-[10px] text-white font-black bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-700 shadow-2xs">
          ▲ 1등급(9.9%) 컷 93점 ↔ 성취도 A(23.6%) (<span className="text-[#CCFF00]">A 중 57.8%가 2등급으로 분기</span>) ▼
        </div>
        <div className="text-[10px] text-white font-black bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-700 shadow-2xs">
          ▲ 2등급 컷 87점 ↔ 성취도 B(30.1%) (<span className="text-[#CCFF00]">B 중 34.9%만 2등급 안착</span>) ▼
        </div>
      </div>

      {/* BOTTOM ROW: 성취평가제 - THICK & DYNAMIC NIKE HIGH-ENERGY COLORS */}
      <div>
        <div className="text-xs font-black text-slate-900 mb-1 flex items-center justify-between">
          <span>[안쪽 원형] 성취평가제 (절대평가, 미도달 E 통합) — 두껍고 생동감 넘치는 메인 바</span>
          <span className="text-[11px] text-slate-600 font-medium">성취도 및 산출비율</span>
        </div>
        <div className="w-full h-16 flex rounded-lg overflow-hidden border border-slate-300 shadow-xs">
          {achievements.map((ach) => {
            const widthPct = (ach.studentCount / totalStudents) * 100;
            return (
              <div
                key={ach.id}
                style={{ width: `${widthPct}%`, backgroundColor: ach.color }}
                className="h-full flex flex-col justify-center items-center text-white p-1 text-center border-r border-white/20 last:border-r-0 transition-opacity hover:opacity-95 relative group cursor-pointer"
                title={`성취도 ${ach.grade}: ${ach.ratio}%`}
              >
                <span className="text-xl font-black leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {ach.grade}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#F8F9FA] tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {ach.ratio}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
