import React, { useState } from 'react';
import { Copy, Check, Target, TrendingUp, Users, Award } from 'lucide-react';

export const ExecutiveBriefing: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const reportText = `[공통국어1 성취도 분포 및 5등급제 상대평가 연계 분석 보고서]
1. 분석 개요
 - 분석 대상: 공통국어1 정기고사 평가 통계
 - 평가 체계: 성취평가제(A~E, 미도달 E 통합) vs 2028 개정 5등급제(1~5등급) 비율 비교

2. 핵심 분석 지표 (비율 및 커트라인)
 - 성취도 A(90점 이상): 산출 비율 23.6% (분할기준 90점)
 - 성취도 B(80%~90%): 산출 비율 30.1% (분할기준 80점)
 - 성취도 C(70%~80%): 산출 비율 16.5% (분할기준 70점)
 - 성취도 D(60%~70%): 산출 비율 15.3% (분할기준 60점)
 - 성취도 E(60% 미만): 산출 비율 14.5% (미도달 0.3% 통합 산출)
 - 1등급 커트라인: 93.0점 (상위 10% 기준, 산출 비율 9.9%)
 - 2등급 커트라인: 87.0점 (누적 34% 기준, 산출 비율 24.1%)
 - 3등급 커트라인: 72.0점 (누적 66% 기준, 산출 비율 31.8%)
 - 4등급 커트라인: 56.0점 (누적 90% 기준, 산출 비율 24.1%)
 - 5등급 커트라인: 47.0점 (누적 100% 기준, 산출 비율 9.9%)

3. 마케팅 및 전략적 시사점 (15년차 실무 제언)
 [Point 1] 'A등급 안심 착시' 공략:
  - 성취도 A(23.6%)를 받은 집단 중 57.8%는 1등급이 아닌 2등급에 배정됩니다.
  - 마케팅 소구: "A등급이라고 방심은 금물! 93점 1등급 컷 돌파를 위한 고난도 문항 집중 케어 필요"
 [Point 2] 최다 밀집군 'B등급(30.1%)' 타깃 세그먼트:
  - B등급(80~90점) 중 87점 커트라인 바로 밑에 위치한 3등급 상위권 학생들은 3~5점 보완 시 즉시 2등급으로 점프 가능하여 학원/콘텐츠 전환율이 가장 높은 핵심 세그먼트입니다.
 [Point 3] 등급컷과 분할점수 갭 분석:
  - 1등급컷(93.0) > A분할(90.0) [+3.0점]: 상위권 변별력 고도화
  - 2등급컷(87.0) > B분할(80.0) [+7.0점]: 2등급 확보를 위한 실질 점수 허들 상향`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>15년차 마케터 시각: 성취도 vs 등급컷 전략 브리핑</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            표와 파이 차트 데이터를 실무 기획서·학부모 설명회·마케팅 캠페인에 즉시 활용할 수 있는 인사이트
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '복사 완료!' : '보고서 텍스트 복사'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Card 1 */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold mb-2">
            <Target className="w-4 h-4" />
            <span>핵심 포인트 1</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            ‘성취도 A’의 안심 착시 효과
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            성취도 A는 <strong>23.6%</strong>이지만, 1등급은 <strong>상위 9.9%(컷 93.0점)</strong>에 불과합니다. A등급 집단의 <strong>57.8%</strong>는 2등급으로 밀려나므로, 최상위권 킬러 문항 대비 소구 메시지가 강력합니다.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-sky-700 text-xs font-bold mb-2">
            <Users className="w-4 h-4" />
            <span>핵심 포인트 2</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            최대 모수 B등급(30.1%)의 등급 분기
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            B등급은 전체의 <strong>30.1%</strong>로 가장 두텁습니다. 2등급 컷(87.0점)을 넘은 34.9%만 2등급을 받고, 나머지 65.1%는 3등급으로 편입됩니다. 단 3~5점 상승으로 등급이 바뀌는 최대 잠재 고객군입니다.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>핵심 포인트 3</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            분할점수 vs 등급컷 불일치 분석
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            1등급 컷은 93.0점(+3.0점), 2등급 컷은 87.0점(+7.0점)으로 절대평가 기준보다 대폭 높습니다. 반면 4등급 컷(56.0점)과 5등급 컷(47.0점)은 기준보다 낮아, <strong>상위권 문항 변별력이 집중된 시험</strong>입니다.
          </p>
        </div>
      </div>

      {/* Quick Summary Preview Box */}
      <div className="p-3 bg-slate-100/70 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-line">
        {reportText}
      </div>
    </div>
  );
};
