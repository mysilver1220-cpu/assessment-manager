import React, { useState } from 'react';
import { Calculator, Sparkles, CheckCircle2 } from 'lucide-react';
import { AchievementItem, RankGradeItem } from '../types/data';

interface ScoreSimulatorProps {
  achievements: AchievementItem[];
  ranks: RankGradeItem[];
}

export const ScoreSimulator: React.FC<ScoreSimulatorProps> = ({ achievements, ranks }) => {
  const [testScore, setTestScore] = useState<number>(88);

  // Evaluate Achievement based on split scores
  // A >= 90, B >= 80, C >= 70, D >= 60, E < 60 (미도달 통합)
  const evaluatedAch = (() => {
    if (testScore >= 90) return { grade: 'A', text: '성취도 A (90% 이상)', color: 'bg-[#16382C]', textColor: 'text-[#16382C]' };
    if (testScore >= 80) return { grade: 'B', text: '성취도 B (80%~90%)', color: 'bg-[#1B314B]', textColor: 'text-[#1B314B]' };
    if (testScore >= 70) return { grade: 'C', text: '성취도 C (70%~80%)', color: 'bg-[#764121]', textColor: 'text-[#764121]' };
    if (testScore >= 60) return { grade: 'D', text: '성취도 D (60%~70%)', color: 'bg-[#5C3825]', textColor: 'text-[#5C3825]' };
    return { grade: 'E', text: '성취도 E (60% 미만, 미도달 통합)', color: 'bg-[#461E29]', textColor: 'text-[#461E29]' };
  })();

  // Evaluate 5-tier Rank based on cutoffs
  // 1등급 >= 93.0, 2등급 >= 87.0, 3등급 >= 72.0, 4등급 >= 56.0, 5등급 < 56.0
  const evaluatedRank = (() => {
    if (testScore >= 93.0) {
      return {
        rank: '1등급',
        color: 'bg-[#0F172A]',
        textColor: 'text-slate-900',
        range: '상위 10% 이내 (산출 비율 9.9%)',
        comment: '1등급 컷(93.0점) 충족! 최상위권 안정권',
      };
    }
    if (testScore >= 87.0) {
      return {
        rank: '2등급',
        color: 'bg-[#1E293B]',
        textColor: 'text-slate-900',
        range: '누적 10%~34% (산출 비율 24.1%)',
        comment: `1등급 컷(93.0점)까지 ${(93.0 - testScore).toFixed(1)}점 부족`,
      };
    }
    if (testScore >= 72.0) {
      return {
        rank: '3등급',
        color: 'bg-teal-600',
        textColor: 'text-teal-700',
        range: '누적 34%~66% (산출 비율 31.8%)',
        comment: `2등급 컷(87.0점)까지 ${(87.0 - testScore).toFixed(1)}점 부족`,
      };
    }
    if (testScore >= 56.0) {
      return {
        rank: '4등급',
        color: 'bg-amber-600',
        textColor: 'text-amber-700',
        range: '누적 66%~90% (산출 비율 24.1%)',
        comment: `3등급 컷(72.0점)까지 ${(72.0 - testScore).toFixed(1)}점 부족`,
      };
    }
    return {
      rank: '5등급',
      color: 'bg-rose-600',
      textColor: 'text-rose-700',
      range: '하위 10% (산출 비율 9.9%)',
      comment: `4등급 컷(56.0점)까지 ${(56.0 - testScore).toFixed(1)}점 부족`,
    };
  })();

  const presetScores = [95, 91, 88, 82, 75, 68, 58, 45];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>원점수별 성취도 & 5등급제 즉시 시뮬레이터</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            학생의 공통국어1 원점수를 입력하면 절대평가 성취도와 상대평가 5등급제 결과를 실시간 대조합니다.
          </p>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500">예시 점수:</span>
          {presetScores.map((score) => (
            <button
              key={score}
              onClick={() => setTestScore(score)}
              className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors cursor-pointer ${
                testScore === score
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {score}점
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Input column */}
        <div className="md:col-span-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            공통국어1 원점수 입력 (0 ~ 100점)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={testScore}
              onChange={(e) => setTestScore(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              className="w-full text-2xl font-extrabold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
            />
            <span className="text-base font-bold text-slate-600">점</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={testScore}
            onChange={(e) => setTestScore(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Result comparison column */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Achievement Result Card */}
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/40">
            <div className="text-[11px] font-semibold text-blue-700 mb-1">
              [안쪽 원형] 성취평가제 (절대평가)
            </div>
            <div className="flex items-center gap-2.5 my-1">
              <span className={`w-8 h-8 rounded-md text-white font-black text-sm flex items-center justify-center ${evaluatedAch.color}`}>
                {evaluatedAch.grade}
              </span>
              <div>
                <div className="text-base font-extrabold text-slate-900">
                  {evaluatedAch.grade}등급
                </div>
                <div className="text-[11px] text-slate-600">
                  {evaluatedAch.text}
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 border-t border-blue-100 pt-1.5">
              분할점수 기준: {evaluatedAch.grade === 'A' ? '90점 이상' : evaluatedAch.grade === 'B' ? '80점 이상' : '기준치 충족'}
            </div>
          </div>

          {/* Rank Result Card */}
          <div className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/40">
            <div className="text-[11px] font-semibold text-indigo-700 mb-1">
              [바깥 테두리] 5등급제 (상대평가)
            </div>
            <div className="flex items-center gap-2.5 my-1">
              <span className={`w-8 h-8 rounded-md text-white font-black text-sm flex items-center justify-center ${evaluatedRank.color}`}>
                {evaluatedRank.rank.replace('등급', '')}
              </span>
              <div>
                <div className="text-base font-extrabold text-slate-900">
                  {evaluatedRank.rank}
                </div>
                <div className="text-[11px] text-slate-600">
                  {evaluatedRank.range}
                </div>
              </div>
            </div>
            <div className="text-[11px] font-medium text-indigo-900 mt-2 border-t border-indigo-100 pt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>{evaluatedRank.comment}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
