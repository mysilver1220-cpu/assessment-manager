import React from 'react';
import { AchievementItem, RankGradeItem, SubjectData } from '../types/data';
import { RotateCcw } from 'lucide-react';

interface SubjectInputTableProps {
  subject: SubjectData;
  onUpdateAchievements: (achievements: AchievementItem[]) => void;
  onUpdateRanks: (ranks: RankGradeItem[]) => void;
  onReset: () => void;
}

export const SubjectInputTable: React.FC<SubjectInputTableProps> = ({
  subject,
  onUpdateAchievements,
  onUpdateRanks,
  onReset,
}) => {
  const handleRatioChange = (index: number, val: number) => {
    const updated = subject.achievements.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          ratio: isNaN(val) ? 0 : val,
          studentCount: Math.round(((isNaN(val) ? 0 : val) / 100) * subject.totalStudents),
        };
      }
      return item;
    });
    onUpdateAchievements(updated);
  };

  const handleCutoffChange = (index: number, val: number) => {
    const updated = subject.ranks.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          cutoffScore: isNaN(val) ? 0 : val,
        };
      }
      return item;
    });
    onUpdateRanks(updated);
  };

  const totalRatio = subject.achievements.reduce((sum, a) => sum + (a.ratio || 0), 0);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-950 text-sm sm:text-base">
            {subject.name} 성취도 비율 & 등급컷 표
          </span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          title="과목 초기 데이터로 복원"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>초기값 리셋</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. 성취도 비율 입력 표 */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-[#245882]">
              ● 성취도별 비율 (%) 입력
            </span>
            <span
              className={`text-[11px] font-bold ${
                Math.abs(totalRatio - 100) < 0.1 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              합계: {totalRatio.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {subject.achievements.map((ach, idx) => (
              <div key={ach.id} className="flex flex-col items-center bg-white p-2 rounded border border-slate-200">
                <span
                  className="w-full text-center text-xs font-black text-white py-0.5 rounded-sm mb-1.5"
                  style={{ backgroundColor: ach.color }}
                >
                  {ach.grade}
                </span>
                <div className="flex items-center gap-0.5 w-full">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={ach.ratio === 0 ? '0' : ach.ratio || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleRatioChange(idx, isNaN(val) ? 0 : val);
                    }}
                    className="w-full text-center text-xs sm:text-sm font-black text-slate-900 border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-[#245882] bg-white"
                  />
                  <span className="text-[11px] text-slate-500 font-bold shrink-0">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 5등급제 등급컷 점수 입력 표 */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-[#922B48]">
              ● 등급별 컷 점수 (점) 입력
            </span>
            <span className="text-[11px] text-slate-500">
              외곽 원형 글씨 실시간 변경
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {subject.ranks.map((rank, idx) => (
              <div key={rank.id} className="flex flex-col items-center bg-white p-2 rounded border border-slate-200">
                <span
                  className="w-full text-center text-xs font-black text-slate-900 py-0.5 rounded-sm mb-1.5 border"
                  style={{ backgroundColor: rank.color, borderColor: rank.colorBorder }}
                >
                  {rank.rankName}
                </span>
                <div className="flex items-center gap-0.5 w-full">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={rank.cutoffScore === 0 ? '0' : rank.cutoffScore || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      handleCutoffChange(idx, isNaN(val) ? 0 : val);
                    }}
                    className="w-full text-center text-xs sm:text-sm font-black text-[#791E38] border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-[#922B48] bg-white"
                  />
                  <span className="text-[11px] text-slate-500 font-bold shrink-0">점</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
