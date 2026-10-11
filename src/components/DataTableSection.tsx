import React, { useState } from 'react';
import { AchievementItem, RankGradeItem } from '../types/data';
import { RotateCcw, Edit2, Check, Download, Table as TableIcon } from 'lucide-react';

interface DataTableSectionProps {
  achievements: AchievementItem[];
  ranks: RankGradeItem[];
  totalStudents: number;
  onUpdateAchievements: (newData: AchievementItem[]) => void;
  onUpdateRanks: (newData: RankGradeItem[]) => void;
  onResetData: () => void;
  selectedSegment: { type: 'rank' | 'achievement'; id: string } | null;
  onSelectSegment: (segment: { type: 'rank' | 'achievement'; id: string } | null) => void;
}

export const DataTableSection: React.FC<DataTableSectionProps> = ({
  achievements,
  ranks,
  totalStudents,
  onUpdateAchievements,
  onUpdateRanks,
  onResetData,
  selectedSegment,
  onSelectSegment,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Totals calculation
  const totalAchCount = achievements.reduce((acc, cur) => acc + cur.studentCount, 0);
  const totalAchRatio = achievements.reduce((acc, cur) => acc + cur.ratio, 0);
  const totalRankCount = ranks.reduce((acc, cur) => acc + cur.studentCount, 0);

  const handleAchStudentChange = (id: string, count: number) => {
    const next = achievements.map((item) => {
      if (item.id === id) {
        const newCount = Math.max(0, count);
        return {
          ...item,
          studentCount: newCount,
          ratio: Number(((newCount / (totalAchCount || 1)) * 100).toFixed(1)),
        };
      }
      return item;
    });
    // Recalculate ratios
    const sum = next.reduce((acc, cur) => acc + cur.studentCount, 0);
    const finalized = next.map((item) => ({
      ...item,
      ratio: Number(((item.studentCount / (sum || 1)) * 100).toFixed(1)),
    }));
    onUpdateAchievements(finalized);
  };

  const handleRankStudentChange = (id: string, count: number) => {
    const next = ranks.map((item) => {
      if (item.id === id) {
        const newCount = Math.max(0, count);
        return {
          ...item,
          studentCount: newCount,
          calculatedRatio: Number(((newCount / (totalRankCount || 1)) * 100).toFixed(1)),
        };
      }
      return item;
    });
    const sum = next.reduce((acc, cur) => acc + cur.studentCount, 0);
    const finalized = next.map((item) => ({
      ...item,
      calculatedRatio: Number(((item.studentCount / (sum || 1)) * 100).toFixed(1)),
    }));
    onUpdateRanks(finalized);
  };

  const handleRankCutoffChange = (id: string, cutoff: number) => {
    const next = ranks.map((item) => (item.id === id ? { ...item, cutoffScore: cutoff } : item));
    onUpdateRanks(next);
  };

  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '[성취평가제 통계] [1,2,3학년] (5단계)\n';
    csvContent += '성취도,비율구간,분할점수기준,인원,산출비율(%)\n';
    achievements.forEach((a) => {
      csvContent += `${a.grade},${a.scoreRange},${a.splitScore},${a.studentCount},${a.ratio}%\n`;
    });
    csvContent += `계,,,${totalAchCount},${totalAchRatio.toFixed(1)}%\n\n`;

    csvContent += '[5등급제 통계] [1학년]\n';
    csvContent += '등급,점수구간,기준비율,인원,산출비율(%),등급컷\n';
    ranks.forEach((r) => {
      csvContent += `${r.rankName},${r.percentileRange},${r.benchmarkRatio},${r.studentCount},${r.calculatedRatio}%,${r.cutoffScore}\n`;
    });
    csvContent += `계,,,${totalRankCount},100.0%,\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '공통국어1_성취도_및_5등급제_통계표.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-slate-900 text-sm">
            기초 원본 데이터 통계표 (이미지 데이터 정밀 연계)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            총 인원: {totalStudents}명
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isEditing
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
            {isEditing ? '수정 완료' : '데이터 직접 수정'}
          </button>

          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="초기 이미지 원본 데이터로 되돌리기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV 내보내기
          </button>
        </div>
      </div>

      {/* Grid of Two Tables */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TABLE 1: [성취평가제 통계] [1,2,3학년] (5단계) */}
        <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-xs tracking-tight">
              <span className="text-red-600">[성취평가제 통계]</span>{' '}
              <span className="text-blue-700">[1,2,3학년]</span>{' '}
              <span className="text-slate-700">(5단계)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              안쪽 원형 차트 대응
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3 text-center w-16">성취도</th>
                  <th className="py-2.5 px-3 text-center">비율구간</th>
                  <th className="py-2.5 px-3 text-center bg-amber-100 text-amber-900 border-x border-amber-200">
                    분할점수기준
                  </th>
                  <th className="py-2.5 px-3 text-right">인원(명)</th>
                  <th className="py-2.5 px-3 text-right">산출비율(%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {achievements.map((item) => {
                  const isSelected = selectedSegment?.type === 'achievement' && selectedSegment.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() =>
                        onSelectSegment(
                          isSelected ? null : { type: 'achievement', id: item.id }
                        )
                      }
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 font-semibold text-blue-900'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-bold">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md text-white font-bold text-xs"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600 font-medium">
                        {item.scoreRange}
                      </td>
                      <td className="py-2 px-3 text-center font-bold bg-amber-50/70 border-x border-amber-100 text-slate-900 tabular-nums">
                        {item.splitScore}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.studentCount}
                            onChange={(e) => handleAchStudentChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 text-right border border-indigo-300 rounded font-mono"
                          />
                        ) : (
                          `${item.studentCount}`
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {item.ratio.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                  <td className="py-2.5 px-3 text-center" colSpan={3}>
                    계
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-700 font-mono tabular-nums">
                    {totalAchCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {totalAchRatio.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* TABLE 2: [5등급제 통계] [1학년] */}
        <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
          <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-xs tracking-tight">
              <span className="text-red-600">[5등급제 통계]</span>{' '}
              <span className="text-blue-700">[1학년]</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              바깥 테두리 차트 대응 (등급컷)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3 text-center w-16">등급</th>
                  <th className="py-2.5 px-3 text-center">점수구간</th>
                  <th className="py-2.5 px-3 text-center">기준비율</th>
                  <th className="py-2.5 px-3 text-right">인원(명)</th>
                  <th className="py-2.5 px-3 text-right bg-indigo-50/70 border-x border-indigo-200 text-indigo-950 font-bold">
                    등급컷(점)
                  </th>
                  <th className="py-2.5 px-3 text-right">산출비율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ranks.map((item) => {
                  const isSelected = selectedSegment?.type === 'rank' && selectedSegment.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() =>
                        onSelectSegment(
                          isSelected ? null : { type: 'rank', id: item.id }
                        )
                      }
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 font-semibold text-indigo-900'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-bold">
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md text-white font-bold text-xs"
                          style={{ backgroundColor: item.color }}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600 font-medium">
                        {item.percentileRange}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600 tabular-nums">
                        {item.benchmarkRatio}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.studentCount}
                            onChange={(e) => handleRankStudentChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 text-right border border-indigo-300 rounded font-mono"
                          />
                        ) : (
                          `${item.studentCount}`
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-extrabold text-indigo-700 bg-indigo-50/50 border-x border-indigo-100 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={item.cutoffScore}
                            onChange={(e) => handleRankCutoffChange(item.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 text-right border border-indigo-300 rounded font-mono"
                          />
                        ) : (
                          `${item.cutoffScore.toFixed(1)}`
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {item.calculatedRatio.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                  <td className="py-2.5 px-3 text-center" colSpan={3}>
                    계
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-700 font-mono tabular-nums">
                    {totalRankCount}
                  </td>
                  <td className="py-2.5 px-3 text-center bg-indigo-50/30 border-x border-indigo-100 text-slate-400">
                    -
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    100.0%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
