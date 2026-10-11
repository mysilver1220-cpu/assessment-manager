import React, { useState } from 'react';
import { SubjectData } from '../types/data';
import { Copy, Check, Award, Lightbulb, BarChart3, PieChart, Compass, Target } from 'lucide-react';

interface SubjectComparisonReportProps {
  subjects: SubjectData[];
}

export const SubjectComparisonReport: React.FC<SubjectComparisonReportProps> = ({ subjects }) => {
  const [copied, setCopied] = useState(false);

  const reportCopyText = `[2028 개정 고1 6대 핵심 과목 성취도(A~E) vs 5등급제 상대평가 통합 비교 분석 리포트]

1. 15년차 마케터 추천 최적 시각화 차트
 [추천 1위] 6과목 통합 듀얼-스트립 누적 비교 바 (Stacked Dual-Bar Comparison)
  - 가독성 최우수: 6개 과목의 0~100% 비율과 등급컷을 수평 동일 축에 정렬하여 단 1장의 슬라이드에서 1컷과 A비율 편차를 직관적 파악 가능.
 [추천 2위] 6과목 이중 동심원 파이 갤러리 (Small Multiples Donut)
  - 시각적 임팩트 최우수: 최고급 샤넬 그랜드 룩을 6개 과목으로 확장하여 학부모 설명회 브로슈어에 가장 고급스러운 비주얼 제공.

2. 6개 과목 핵심 통계 및 난이도 분석 요약 (동일 모수 N=352명 기준)
 · 공통국어1: A비율 23.6% | 1컷 93.0점 | A 중 1등급 진입 42.2% | A등급 착시 대표 과목
 · 공통수학1: A비율 18.2% | 1컷 88.5점 | A 중 1등급 진입 54.7% | 킬러 문항 변별력 최고, 하위 양극화(E 22.5%)
 · 공통영어1: A비율 28.4% | 1컷 96.0점 | A 중 1등급 진입 35.0% | 상위권 극단적 과밀, 1문항 실수도 2등급 탈락
 · 통합사회1: A비율 26.1% | 1컷 95.0점 | A 중 1등급 진입 38.0% | 평균 상향, 서술형 감점 방지 싸움
 · 통합과학1: A비율 21.6% | 1컷 91.5점 | A 중 1등급 진입 46.1% | 자연계열 표준 정규분포형 안정 변별
 · 한국사1:   A비율 24.7% | 1컷 94.0점 | A 중 1등급 진입 40.2% | 방대한 암기량, 지엽적 선지 1컷 94점

3. 마케팅 캠페인 소구 포인트
 - 수학: "1컷 88.5점이 증명하는 킬러 문항 극복 전략!"
 - 영어: "1컷 96.0점! A등급을 받고도 65%가 2등급으로 탈락하는 영어, 만점 전략 필수!"
 - 국어: "A등급 23.6%의 착시를 뚫는 1등급(9.9%) 93점 돌파반!"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportCopyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-[#245882]" />
            <span>15년차 마케터 제언: 6개 과목 최적 비교 차트 추천 & 전략 리포트</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            6개 과목(국·수·영·통사·통과·한국사)의 성취도와 5등급제를 한눈에 비교하기 가장 효과적인 차트 유형과 실무 브리핑
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#EBF2F7] text-[#245882] hover:bg-[#D6E4EE] border border-[#ABC0D2] transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '복사 완료!' : '6과목 비교 요약문 복사'}</span>
        </button>
      </div>

      {/* 3 Chart Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rec 1 */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border-2 border-[#245882]/40 relative">
          <div className="absolute -top-2.5 left-4 bg-[#245882] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
            1순위 강력 추천 (가독성 최우수)
          </div>
          <div className="flex items-center gap-2 text-[#245882] font-black text-sm mt-1 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span>듀얼-스트립 누적 비교 바</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>선정 사유:</strong> 6개 과목을 세로로 나란히 놓고 가로 0~100% 동일 눈금 축에서 <strong>1등급 컷과 A등급 비율을 수평 비교</strong>할 때 가장 눈에 편안하며 오독이 없습니다. PPT 보고서 및 경영진 브리핑 1-Page Summary에 최적입니다.
          </p>
        </div>

        {/* Rec 2 */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-slate-200">
          <div className="text-[10px] font-bold text-[#A8753B] mb-1">
            2순위 추천 (브랜드 비주얼 임팩트)
          </div>
          <div className="flex items-center gap-2 text-[#A8753B] font-black text-sm mb-2">
            <PieChart className="w-4 h-4" />
            <span>이중 동심원 파이 갤러리</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>선정 사유:</strong> 샤넬 그랜드 룩의 기품 있는 원형 차트를 2×3 그리드로 배열하여, 학부모 설명회 발표 자료나 카탈로그 표지 등 <strong>심미적 고급스러움과 비주얼 집중도</strong>를 극대화해야 할 때 최고의 효과를 냅니다.
          </p>
        </div>

        {/* Rec 3 */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-slate-200">
          <div className="text-[10px] font-bold text-[#2B7563] mb-1">
            3순위 보조 (세그먼트 포지셔닝)
          </div>
          <div className="flex items-center gap-2 text-[#2B7563] font-black text-sm mb-2">
            <Compass className="w-4 h-4" />
            <span>난이도-착시 2축 매트릭스</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>선정 사유:</strong> X축을 A등급 비율(착시 규모), Y축을 1등급 컷(시험 난이도)으로 배치하여 <strong>수학(킬러형) vs 영어(과밀형) vs 국어(착시형)</strong>의 과목별 수강생 마케팅 타깃 포지셔닝을 도출하기에 적합합니다.
          </p>
        </div>
      </div>

      {/* 6 Subjects Comprehensive Data Comparison Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-[#FAF8F5] px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <span className="font-black text-xs text-slate-900">
            6개 과목 성취도 및 등급컷 정밀 비교 총괄표 (동일 모수 N=352명)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">단위: 비율(%), 등급컷(점)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-2.5 px-3">과목명</th>
                <th className="py-2.5 px-3 text-right">성취도 A 비율</th>
                <th className="py-2.5 px-3 text-right bg-[#FEF9C3]/50 border-x border-[#FDE047]/60 text-slate-900">
                  1등급 컷
                </th>
                <th className="py-2.5 px-3 text-right">2등급 컷</th>
                <th className="py-2.5 px-3 text-right">3등급 컷</th>
                <th className="py-2.5 px-3 text-right">A 중 1컷 진입률</th>
                <th className="py-2.5 px-3">마케팅 핵심 시사점</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub) => {
                const cut1 = sub.ranks[0].cutoffScore;
                const cut2 = sub.ranks[1].cutoffScore;
                const cut3 = sub.ranks[2].cutoffScore;
                const ratioA = sub.achievements[0].ratio;
                // Estimated entry rate: 35 / (ratioA * 352 / 100) * 100
                const aCount = sub.achievements[0].studentCount;
                const entryRate = ((35 / aCount) * 100).toFixed(1);

                return (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: sub.themeColor }}
                      />
                      <span>{sub.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-[#245882] tabular-nums">
                      {ratioA.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-950 bg-[#FEF9C3]/40 border-x border-[#FDE047]/60 tabular-nums">
                      {cut1.toFixed(1)}점
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-700 tabular-nums">
                      {cut2.toFixed(1)}점
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600 tabular-nums">
                      {cut3.toFixed(1)}점
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800 tabular-nums">
                      {entryRate}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {sub.insights?.keyMessage || ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
