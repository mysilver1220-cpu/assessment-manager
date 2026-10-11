import React, { useState, useId, useRef } from 'react';
import { AchievementItem, RankGradeItem } from '../types/data';
import { exportChartToPDF } from '../utils/pdfGenerator';
import { Eye, FileText, CheckCircle2 } from 'lucide-react';

interface NestedDonutChartProps {
  achievements: AchievementItem[];
  ranks: RankGradeItem[];
  totalStudents: number;
  selectedSegment: { type: 'rank' | 'achievement'; id: string } | null;
  onSelectSegment: (segment: { type: 'rank' | 'achievement'; id: string } | null) => void;
  subjectName?: string;
  cutoffScore?: number;
}

// Convert polar coordinates to Cartesian
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Generate donut slice SVG path
function describeDonutSlice(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const sweep = endAngle - startAngle;
  if (sweep >= 359.999) {
    return `M ${cx - rOuter} ${cy}
            A ${rOuter} ${rOuter} 0 1 0 ${cx + rOuter} ${cy}
            A ${rOuter} ${rOuter} 0 1 0 ${cx - rOuter} ${cy}
            M ${cx - rInner} ${cy}
            A ${rInner} ${rInner} 0 1 1 ${cx + rInner} ${cy}
            A ${rInner} ${rInner} 0 1 1 ${cx - rInner} ${cy} Z`;
  }

  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);

  const largeArcFlag = sweep > 180 ? 1 : 0;

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

// Generate circular arc path specifically for textPath following the circle contour
function describeCircularTextArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const sweep = endAngle - startAngle;
  const midAngle = startAngle + sweep / 2;
  const largeArc = sweep > 180 ? 1 : 0;

  // Upper hemisphere: Clockwise for natural reading direction
  // Lower hemisphere (90° <= midAngle <= 270°): Counter-clockwise so text remains upright
  if (midAngle >= 90 && midAngle <= 270) {
    const pEnd = polarToCartesian(cx, cy, r, endAngle - 1);
    const pStart = polarToCartesian(cx, cy, r, startAngle + 1);
    return `M ${pEnd.x} ${pEnd.y} A ${r} ${r} 0 ${largeArc} 0 ${pStart.x} ${pStart.y}`;
  } else {
    const pStart = polarToCartesian(cx, cy, r, startAngle + 1);
    const pEnd = polarToCartesian(cx, cy, r, endAngle - 1);
    return `M ${pStart.x} ${pStart.y} A ${r} ${r} 0 ${largeArc} 1 ${pEnd.x} ${pEnd.y}`;
  }
}

export const NestedDonutChart: React.FC<NestedDonutChartProps> = ({
  achievements,
  ranks,
  totalStudents,
  selectedSegment,
  onSelectSegment,
  subjectName = '공통국어1',
  cutoffScore,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<{
    type: 'rank' | 'achievement';
    id: string;
  } | null>(null);

  const [showRays, setShowRays] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const filterId = useId().replace(/:/g, '_');

  const cx = 350;
  const cy = 350;

  // Geometry:
  // Inner Achievement ring is thick (rInnerIn=95 to rInnerOut=252, thickness = 157px)
  // Outer Rank ring is significantly thicker as requested (rOuterIn=262 to rOuterOut=328, thickness = 66px)
  const rOuterIn = 262;
  const rOuterOut = 328;
  const rInnerIn = 95;
  const rInnerOut = 252;
  const rRankMid = (rOuterIn + rOuterOut) / 2; // 295px

  // Cumulative angles for Ranks (Outer Ring)
  const rankTotalCount = ranks.reduce((sum, r) => sum + r.segmentRatio, 0) || 100;
  let currentRankAngle = 0;
  const rankArcs = ranks.map((rank) => {
    const sweep = (rank.segmentRatio / rankTotalCount) * 360;
    const startAngle = currentRankAngle;
    const endAngle = currentRankAngle + sweep;
    const midAngle = startAngle + sweep / 2;
    currentRankAngle = endAngle;
    return {
      ...rank,
      startAngle,
      endAngle,
      midAngle,
      sweep,
    };
  });

  // Cumulative angles for Achievements (Inner Ring - real-time ratios)
  const achRatioSum = achievements.reduce((sum, a) => sum + (a.ratio || 0), 0) || 100;
  let currentAchAngle = 0;
  const achArcs = achievements.map((ach) => {
    const sweep = ((ach.ratio || 0) / achRatioSum) * 360;
    const startAngle = currentAchAngle;
    const endAngle = currentAchAngle + sweep;
    const midAngle = startAngle + sweep / 2;
    currentAchAngle = endAngle;
    return {
      ...ach,
      startAngle,
      endAngle,
      midAngle,
      sweep,
    };
  });

  const activeSegment = hoveredSegment || selectedSegment;

  const showSuccessFeedback = (msg: string) => {
    setDownloadSuccessMessage(msg);
    setTimeout(() => setDownloadSuccessMessage(null), 5000);
  };

  // PDF Download Function
  const handleDownloadPDF = async () => {
    if (!svgRef.current) return;
    setIsExporting(true);
    try {
      const activeCutoff = cutoffScore ?? (ranks[0]?.cutoffScore ?? 93.0);
      const targetFileName = `${subjectName}_성취도분포비율_차트.pdf`;
      await exportChartToPDF(
        svgRef.current,
        targetFileName,
        {
          subjectName,
          cutoffScore: activeCutoff,
          containerElement: containerRef.current,
          achievements,
          ranks,
        }
      );
      showSuccessFeedback(`'${targetFileName}' PC 다운로드 폴더에 저장 완료!`);
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center w-full">
      {/* Top Controls & Action Strip */}
      <div className="w-full flex flex-wrap items-center justify-between px-2 mb-3 gap-2 text-xs">
        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-3.5 rounded-sm bg-[#245882] border border-[#1A4468]" />
            <span className="font-bold text-slate-900">안쪽: 성취도 비율 (A~E)</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-2 rounded-xs bg-[#F8EED9] border border-[#D9B45C]" />
            <span className="font-semibold text-slate-700">바깥: 5등급제 & 등급컷</span>
          </div>
        </div>

        {/* Buttons: Guide toggle & Download actions */}
        <div className="flex items-center gap-2">
          {downloadSuccessMessage && (
            <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-md animate-fade-in border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

          <button
            onClick={() => setShowRays((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${
              showRays
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="경계선 가이드라인 토글"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>경계선 가이드 {showRays ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-900/30 bg-[#922B48] text-[#F8F9FA] hover:bg-[#791E38] text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            title="고화질 A4 규격 PDF 다운로드"
          >
            <FileText className="w-3.5 h-3.5 text-amber-200" />
            <span>{isExporting ? 'PDF 변환 중...' : '차트 PDF 저장'}</span>
          </button>
        </div>
      </div>

      {/* Main SVG Chart Canvas */}
      <div className="relative w-full max-w-[640px] aspect-square select-none">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="700"
          height="700"
          viewBox="0 0 700 700"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          <defs>
            <filter id={`shadow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodOpacity="0.22" />
            </filter>
            {/* Chanel Grand Luminous Center Dial Gradient */}
            <radialGradient id={`chanelHubGradient-${filterId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#FAF8F5" />
              <stop offset="100%" stopColor="#F5EFE6" />
            </radialGradient>

            {/* Circular Arc Paths for curved text along the outer rank ring */}
            {rankArcs.map((rank) => {
              const arcD = describeCircularTextArc(
                cx,
                cy,
                rRankMid,
                rank.startAngle,
                rank.endAngle
              );
              return (
                <path
                  key={`textpath-def-${rank.id}`}
                  id={`rank-arc-path-${filterId}-${rank.id}`}
                  d={arcD}
                  fill="none"
                />
              );
            })}
          </defs>

          {/* Luxury Metallic Accent Circular Framing */}
          <circle cx={cx} cy={cy} r={rOuterOut + 4} fill="none" stroke="#E2D7C5" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={rOuterIn} fill="none" stroke="#D1C3AD" strokeWidth="1.2" />
          <circle cx={cx} cy={cy} r={rInnerOut + 2} fill="none" stroke="#FFFFFF" strokeWidth="3.5" />
          <circle cx={cx} cy={cy} r={rInnerIn} fill="none" stroke="#E2D7C5" strokeWidth="1.5" />

          {/* 진한 경계선 가이드 라인 */}
          {showRays && (
            <g className="transition-opacity duration-300">
              {/* Outer Rank Rays */}
              {rankArcs.map((r) => {
                const pStart = polarToCartesian(cx, cy, rInnerIn - 6, r.startAngle);
                const pEnd = polarToCartesian(cx, cy, rOuterOut + 14, r.startAngle);
                return (
                  <line
                    key={`rank-ray-${r.id}`}
                    x1={pStart.x}
                    y1={pStart.y}
                    x2={pEnd.x}
                    y2={pEnd.y}
                    stroke="#1E293B"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                    opacity="0.88"
                  />
                );
              })}
              {/* Inner Achievement Rays */}
              {achArcs.map((a) => {
                const pStart = polarToCartesian(cx, cy, rInnerIn, a.startAngle);
                const pEnd = polarToCartesian(cx, cy, rInnerOut, a.startAngle);
                return (
                  <line
                    key={`ach-ray-${a.id}`}
                    x1={pStart.x}
                    y1={pStart.y}
                    x2={pEnd.x}
                    y2={pEnd.y}
                    stroke="#000000"
                    strokeWidth="2.2"
                    opacity="0.95"
                  />
                );
              })}
            </g>
          )}

          {/* 1. OUTER RING: 5등급제 (Thinner, Chanel Pastel Ivory/Champagne Palette) */}
          <g>
            {rankArcs.map((rank) => {
              const isSelected = selectedSegment?.type === 'rank' && selectedSegment.id === rank.id;
              const isHovered = hoveredSegment?.type === 'rank' && hoveredSegment.id === rank.id;
              const isDimmed = activeSegment && !(activeSegment.type === 'rank' && activeSegment.id === rank.id);

              const pathData = describeDonutSlice(
                cx,
                cy,
                rOuterIn,
                rOuterOut,
                rank.startAngle,
                rank.endAngle
              );

              return (
                <g
                  key={rank.id}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredSegment({ type: 'rank', id: rank.id })}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() =>
                    onSelectSegment(
                      selectedSegment?.id === rank.id && selectedSegment.type === 'rank'
                        ? null
                        : { type: 'rank', id: rank.id }
                    )
                  }
                >
                  <path
                    d={pathData}
                    fill={rank.color}
                    stroke={isSelected ? '#0F172A' : '#D1C3AD'}
                    strokeWidth={isSelected ? 3 : 1.2}
                    opacity={isDimmed ? 0.35 : 1}
                    className="transition-all duration-200"
                  />

                  {/* Circular Arc Text: 등급명과 컷 점수를 원형을 따라 배치 (더 크고 굵은 글씨) */}
                  {rank.sweep > 12 && (
                    <text
                      opacity={isDimmed ? 0.4 : 1}
                      pointerEvents="none"
                      fill="#020617"
                      fontSize="22"
                      fontWeight="900"
                      className="fill-slate-950 font-black text-[20px] sm:text-[22px] tracking-tight select-none"
                    >
                      <textPath
                        href={`#rank-arc-path-${filterId}-${rank.id}`}
                        startOffset="50%"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {rank.rankName} 컷 {rank.cutoffScore > 0 ? `${rank.cutoffScore.toFixed(1)}점` : '0점'}
                      </textPath>
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. INNER RING: 성취도 A~E (Thick Band, Big Bold Letter & Ratio) */}
          <g>
            {achArcs.map((ach) => {
              const isSelected = selectedSegment?.type === 'achievement' && selectedSegment.id === ach.id;
              const isHovered = hoveredSegment?.type === 'achievement' && hoveredSegment.id === ach.id;
              const isDimmed = activeSegment && !(activeSegment.type === 'achievement' && activeSegment.id === ach.id);

              const pathData = describeDonutSlice(
                cx,
                cy,
                rInnerIn,
                rInnerOut,
                ach.startAngle,
                ach.endAngle
              );

              // Center point of the thick band
              const labelPos = polarToCartesian(cx, cy, (rInnerIn + rInnerOut) / 2, ach.midAngle);

              return (
                <g
                  key={ach.id}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredSegment({ type: 'achievement', id: ach.id })}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() =>
                    onSelectSegment(
                      selectedSegment?.id === ach.id && selectedSegment.type === 'achievement'
                        ? null
                        : { type: 'achievement', id: ach.id }
                    )
                  }
                >
                  <path
                    d={pathData}
                    fill={ach.color}
                    stroke={isSelected ? '#0F172A' : '#FFFFFF'}
                    strokeWidth={isSelected ? 3.5 : 2}
                    opacity={isDimmed ? 0.35 : 1}
                    className="transition-all duration-200"
                  />

                  {/* Inner Ring Labels: 성취도 ABCDE와 비율을 훨씬 더 크고 굵게 표시 */}
                  {ach.sweep > 10 && (
                    <g
                      transform={`translate(${labelPos.x}, ${labelPos.y})`}
                      opacity={isDimmed ? 0.4 : 1}
                      pointerEvents="none"
                    >
                      {/* 성취도 알파벳 (화면 그대로 흰색) */}
                      <text
                        x={0}
                        y={-20}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#FFFFFF"
                        fontSize="38"
                        fontWeight="900"
                        className="fill-white font-black text-3xl sm:text-[38px] tracking-tight select-none drop-shadow-sm"
                      >
                        {ach.grade}
                      </text>
                      {/* 비율 표시 (화면 그대로 밝은 베이지/골드 #FEF3C7) */}
                      <text
                        x={0}
                        y={20}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#FEF3C7"
                        fontSize="26"
                        fontWeight="900"
                        className="fill-amber-100 font-black text-2xl sm:text-[26px] tracking-tight select-none drop-shadow-xs"
                      >
                        {ach.ratio}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 3. CENTER HUB: 가운데 원 안에는 오직 과목명만 표시 */}
          <g transform={`translate(${cx}, ${cy})`}>
            {/* Luminous Ivory Disc */}
            <circle
              r={rInnerIn - 5}
              fill={`url(#chanelHubGradient-${filterId})`}
              stroke="#D1C3AD"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            {/* Thin inner gold ring detail */}
            <circle
              r={rInnerIn - 10}
              fill="none"
              stroke="#E2D7C5"
              strokeWidth="0.8"
            />

            {/* 과목명만 명확하게 표시 (가운데 과목명 글씨를 더 크게 확대) */}
            <text
              y={0}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#000000"
              fontSize="36"
              fontWeight="900"
              className="fill-black font-black text-[32px] sm:text-[36px] tracking-tight select-none"
            >
              {subjectName || '공통국어1'}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
