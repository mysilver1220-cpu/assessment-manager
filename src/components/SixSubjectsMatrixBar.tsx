import React, { useState } from 'react';
import { SubjectData } from '../types/data';
import { ArrowUpDown, Sparkles, TrendingUp, ChevronRight, Award } from 'lucide-react';

interface SixSubjectsMatrixBarProps {
  subjects: SubjectData[];
  onSelectSubject: (subjectId: string) => void;
}

export const SixSubjectsMatrixBar: React.FC<SixSubjectsMatrixBarProps> = ({
  subjects,
  onSelectSubject,
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'cutoff1' | 'ratioA'>('default');

  const sortedSubjects = [...subjects].sort((a, b) => {
    if (sortBy === 'cutoff1') {
      return b.ranks[0].cutoffScore - a.ranks[0].cutoffScore; // Highest 1-cut first
    }
    if (sortBy === 'ratioA') {
      return b.achievements[0].ratio - a.achievements[0].ratio; // Highest A ratio first
    }
    return 0; // Default order
  });

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
      {/* Header & Sorting Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#245882] bg-[#EBF2F7] px-2 py-0.5 rounded border border-[#ABC0D2]">
              추천 1순위: 6과목 통합 가로 비교 차트
            </span>
            <span className="text-xs text-slate-500">모수 N = 352명 동일</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            6개 과목 성취도(A~E) ↔ 5등급제(1~5등급) 통합 누적 비교 매트릭스
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            전체 6개 과목의 0~100% 비율과 등급컷을 수평 축 상에 나란히 배치하여, <strong>과목별 난이도와 A등급 착시 현상을 한눈에 즉시 비교</strong>할 수 있는 가장 가독성 높은 차트입니다.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg shrink-0 text-xs">
          <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            정렬:
          </span>
          <button
            onClick={() => setSortBy('default')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
              sortBy === 'default' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            기본 과목순
          </button>
          <button
            onClick={() => setSortBy('cutoff1')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
              sortBy === 'cutoff1' ? 'bg-white text-[#245882] shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1등급 컷 높은순
          </button>
          <button
            onClick={() => setSortBy('ratioA')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
              sortBy === 'ratioA' ? 'bg-white text-[#245882] shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            성취도 A 많은순
          </button>
        </div>
      </div>

      {/* Axis Scale Markers (0% to 100%) */}
      <div className="relative w-full h-5 text-[11px] font-mono text-slate-400 select-none border-b border-slate-100 pb-1">
        <span className="absolute left-0 font-bold text-slate-600">0% (상위 최우수)</span>
        <span className="absolute left-[10%] -translate-x-1/2">10% (1등급 경계)</span>
        <span className="absolute left-[34%] -translate-x-1/2">34% (2등급)</span>
        <span className="absolute left-[66%] -translate-x-1/2">66% (3등급)</span>
        <span className="absolute left-[90%] -translate-x-1/2">90% (4등급)</span>
        <span className="absolute right-0 font-bold text-slate-600">100%</span>
      </div>

      {/* 6 Subjects Rows */}
      <div className="space-y-6">
        {sortedSubjects.map((sub, idx) => {
          const cut1 = sub.ranks[0].cutoffScore;
          const ratioA = sub.achievements[0].ratio;

          return (
            <div
              key={sub.id}
              className="p-4 rounded-xl border border-slate-200 bg-[#FAF9F6]/50 hover:border-slate-300 hover:shadow-xs transition-all space-y-2.5"
            >
              {/* Subject Title Strip & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-2xs"
                    style={{ backgroundColor: sub.themeColor }}
                  >
                    {sub.category}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>{sub.name}</span>
                      <span className="text-[11px] font-bold text-[#245882] bg-white px-2 py-0.5 rounded border border-[#ABC0D2]">
                        1등급 컷: {cut1.toFixed(1)}점
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        성취도 A: {ratioA.toFixed(1)}%
                      </span>
                    </h4>
                  </div>
                </div>

                {/* Drill-down Button */}
                <button
                  onClick={() => onSelectSubject(sub.id)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#245882] bg-white border border-[#ABC0D2] rounded-lg hover:bg-[#EBF2F7] transition-colors cursor-pointer shadow-2xs"
                >
                  <span>동심원 파이 상세 보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* DUAL BARS ROW */}
              <div className="space-y-1">
                {/* 1. TOP BAR: 5등급제 (얇고 연한 샴페인/펄/블러시 톤) */}
                <div className="w-full h-8 flex rounded-md overflow-hidden border border-slate-300 shadow-2xs">
                  {sub.ranks.map((rank) => {
                    const widthPct = (rank.studentCount / sub.totalStudents) * 100;
                    return (
                      <div
                        key={rank.id}
                        style={{ width: `${widthPct}%`, backgroundColor: rank.color }}
                        className="h-full flex items-center justify-center text-slate-900 p-0.5 text-center border-r border-slate-400/30 last:border-r-0 transition-opacity hover:opacity-95 relative group cursor-pointer gap-1.5"
                        title={`${sub.name} ${rank.rankName}: 컷 ${rank.cutoffScore}점`}
                      >
                        <span className="text-[11px] font-black leading-tight text-slate-950">
                          {rank.rankName}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-black text-[#FEF08A] bg-[#0A0F1D] px-1.5 py-0.2 rounded border border-[#D4AF37] tabular-nums shadow-2xs hidden sm:inline">
                          컷 {rank.cutoffScore.toFixed(1)}점
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 2. BOTTOM BAR: 성취평가제 (두껍고 선명한 샤넬 그랜드 톤) */}
                <div className="w-full h-11 flex rounded-lg overflow-hidden border border-slate-300 shadow-xs">
                  {sub.achievements.map((ach) => {
                    const widthPct = (ach.studentCount / sub.totalStudents) * 100;
                    return (
                      <div
                        key={ach.id}
                        style={{ width: `${widthPct}%`, backgroundColor: ach.color }}
                        className="h-full flex flex-col justify-center items-center text-white p-0.5 text-center border-r border-white/20 last:border-r-0 transition-opacity hover:opacity-95 relative group cursor-pointer"
                        title={`${sub.name} 성취도 ${ach.grade}: ${ach.ratio}%`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs sm:text-sm font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                            {ach.grade}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-white/95 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                            {ach.ratio}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Insight Bar */}
              <div className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                <Sparkles className="w-3.5 h-3.5 text-[#A8753B] shrink-0" />
                <span className="leading-tight">
                  <strong className="text-slate-900 font-bold">마케팅 분석:</strong> {sub.insights?.keyMessage || ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
