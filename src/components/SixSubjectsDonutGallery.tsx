import React, { useRef, useState, useId } from 'react';
import { SubjectData } from '../types/data';
import html2canvas from 'html2canvas';
import { Download, Copy, Check, Presentation } from 'lucide-react';

interface SixSubjectsDonutGalleryProps {
  subjects: SubjectData[];
  onSelectSubject: (subjectId: string) => void;
  semesterTitle?: string;
}

// Convert polar coordinates to Cartesian
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const sweep = endAngle - startAngle;
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

// Curved text arc
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

  if (midAngle >= 90 && midAngle <= 270) {
    const pEnd = polarToCartesian(cx, cy, r, endAngle - 0.2);
    const pStart = polarToCartesian(cx, cy, r, startAngle + 0.2);
    return `M ${pEnd.x} ${pEnd.y} A ${r} ${r} 0 ${largeArc} 0 ${pStart.x} ${pStart.y}`;
  } else {
    const pStart = polarToCartesian(cx, cy, r, startAngle + 0.2);
    const pEnd = polarToCartesian(cx, cy, r, endAngle - 0.2);
    return `M ${pStart.x} ${pStart.y} A ${r} ${r} 0 ${largeArc} 1 ${pEnd.x} ${pEnd.y}`;
  }
}

// Helper to draw rounded rectangle on 2D canvas safely across all browsers
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export const SixSubjectsDonutGallery: React.FC<SixSubjectsDonutGalleryProps> = ({
  subjects,
  onSelectSubject,
  semesterTitle = '1학기 6개 과목 통합 비교',
}) => {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const baseId = useId().replace(/:/g, '_');

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${semesterTitle.replace(/\s+/g, '_')}_PPT용_비교차트.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    showFeedback('PPT용 이미지 다운로드 완료! (다운로드 폴더 저장)');
  };

  // Generate a crystal-clear 16:9 Presentation Canvas using native browser vector rendering
  const generatePPTCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!galleryRef.current) return null;

    const svgElements = galleryRef.current.querySelectorAll('svg');
    if (!svgElements || svgElements.length === 0) return null;

    // Convert each subject donut SVG into a raster image via Blob
    const imagePromises = Array.from(svgElements).map((svg) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        try {
          const clone = svg.cloneNode(true) as SVGSVGElement;
          clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
          clone.setAttribute('width', '700');
          clone.setAttribute('height', '700');

          // Inline style for typography
          const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
          styleEl.textContent = `
            text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", sans-serif; font-weight: 900; }
          `;
          clone.insertBefore(styleEl, clone.firstChild);

          const svgString = new XMLSerializer().serializeToString(clone);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const blobURL = URL.createObjectURL(svgBlob);

          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(blobURL);
            resolve(img);
          };
          img.onerror = () => {
            URL.revokeObjectURL(blobURL);
            reject(new Error('SVG rasterization failed'));
          };
          img.src = blobURL;
        } catch (e) {
          reject(e);
        }
      });
    });

    const images = await Promise.all(imagePromises);

    // 16:9 Slide Canvas (1920x1080 Full HD)
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clean background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title & Header Bar
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${semesterTitle} (성취도 분포비율 vs 등급 비교)`, 60, 52);

    // Legend items on Top Right
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.textAlign = 'left';

    // Legend 1: Achievement
    ctx.fillStyle = '#245882';
    drawRoundedRect(ctx, 1370, 43, 18, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#1E293B';
    ctx.fillText('안쪽: 성취도 비율 (A~E)', 1396, 52);

    // Legend 2: Rank
    ctx.fillStyle = '#F8EED9';
    drawRoundedRect(ctx, 1630, 43, 18, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#D9B45C';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#1E293B';
    ctx.fillText('바깥: 5등급제 & 등급컷', 1656, 52);

    // Divider
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 85);
    ctx.lineTo(1860, 85);
    ctx.stroke();

    // 2 Rows x 3 Columns Grid for the 6 subjects
    const startX = 60;
    const startY = 110;
    const colWidth = 580;
    const rowHeight = 455;
    const gapX = 30;
    const gapY = 24;

    subjects.forEach((sub, idx) => {
      if (idx >= images.length) return;
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const boxX = startX + col * (colWidth + gapX);
      const boxY = startY + row * (rowHeight + gapY);

      // Card container
      ctx.fillStyle = '#FAF9F6';
      drawRoundedRect(ctx, boxX, boxY, colWidth, rowHeight, 16);
      ctx.fill();
      ctx.strokeStyle = '#E2D7C5';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Subject Title
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sub.name, boxX + colWidth / 2, boxY + 36);

      // Donut Chart Image
      const donutSize = 370;
      const donutX = boxX + (colWidth - donutSize) / 2;
      const donutY = boxY + 58;
      ctx.drawImage(images[idx], donutX, donutY, donutSize, donutSize);
    });

    return canvas;
  };

  // PPT-optimized high resolution PNG export
  const handleDownloadPPTImage = async () => {
    if (!galleryRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await generatePPTCanvas();
      if (!canvas) throw new Error('캔버스 렌더링에 실패했습니다.');

      canvas.toBlob((blob) => {
        if (!blob) {
          showFeedback('이미지 생성에 실패했습니다.');
          setIsExporting(false);
          return;
        }
        triggerDownload(blob);
        setIsExporting(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('PPT image download failed', err);
      // Fallback with html2canvas if available
      try {
        const h2cCanvas = await html2canvas(galleryRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#FFFFFF',
          logging: false,
        });
        h2cCanvas.toBlob((blob) => {
          if (blob) triggerDownload(blob);
          setIsExporting(false);
        });
      } catch {
        showFeedback('이미지 다운로드 처리 중 오류가 발생했습니다.');
        setIsExporting(false);
      }
    }
  };

  // 1-Click Clipboard Image Copy for direct PPT paste (Ctrl + V)
  const handleCopyPPTImage = async () => {
    if (!galleryRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await generatePPTCanvas();
      if (!canvas) throw new Error('캔버스 렌더링에 실패했습니다.');

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }
        try {
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setIsCopied(true);
            showFeedback('클립보드에 복사되었습니다! PPT에서 Ctrl+V로 바로 붙여넣기 하세요.');
            setTimeout(() => setIsCopied(false), 3500);
          } else {
            triggerDownload(blob);
          }
        } catch {
          // If browser clipboard policy blocks iframe, trigger direct download
          triggerDownload(blob);
        } finally {
          setIsExporting(false);
        }
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Clipboard copy failed', err);
      showFeedback('복사 중 오류가 발생했습니다. 직접 다운로드를 시도합니다.');
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* PPT Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-[#245882]" />
          <span className="font-black text-slate-900 text-sm sm:text-base">
            {semesterTitle}
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            (PPT 16:9 슬라이드 1장에 알맞은 3×2 동심원 파이 배치)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {feedbackMsg && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300 animate-fade-in">
              ✓ {feedbackMsg}
            </span>
          )}

          <button
            onClick={handleCopyPPTImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            title="PPT에 바로 Ctrl+V로 붙여넣기 할 수 있게 이미지 복사"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? '복사됨!' : 'PPT 복사'}</span>
          </button>

          <button
            onClick={handleDownloadPPTImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#245882] hover:bg-[#1A4468] border border-[#1A4468] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            title="PPT 화면에 1장으로 들어가는 고해상도 PNG 이미지 파일 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>{isExporting ? '이미지 생성 중...' : 'PPT용 이미지 다운로드'}</span>
          </button>
        </div>
      </div>

      {/* The 6-Subject PPT Ready Container (3 columns x 2 rows) */}
      <div
        ref={galleryRef}
        className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-2xs"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub, sIdx) => {
            const cx = 175;
            const cy = 175;
            // Thicker outer rank ring band (thickness = 40px)
            const rOuterIn = 129;
            const rOuterOut = 169;
            const rInnerIn = 52;
            const rInnerOut = 122;
            const rMid = (rOuterIn + rOuterOut) / 2; // 149px

            // Rank arcs
            const totalRank = sub.ranks.reduce((sum, r) => sum + r.segmentRatio, 0) || 100;
            let curRankAngle = 0;
            const rankArcs = sub.ranks.map((r) => {
              const sweep = (r.segmentRatio / totalRank) * 360;
              const startAngle = curRankAngle;
              const endAngle = curRankAngle + sweep;
              const midAngle = startAngle + sweep / 2;
              curRankAngle = endAngle;
              return { ...r, startAngle, endAngle, midAngle, sweep };
            });

            // Ach arcs
            const totalAch = sub.achievements.reduce((sum, a) => sum + (a.ratio || 0), 0) || 100;
            let curAchAngle = 0;
            const achArcs = sub.achievements.map((a) => {
              const sweep = ((a.ratio || 0) / totalAch) * 360;
              const startAngle = curAchAngle;
              const endAngle = curAchAngle + sweep;
              const midAngle = startAngle + sweep / 2;
              curAchAngle = endAngle;
              return { ...a, startAngle, endAngle, midAngle, sweep };
            });

            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubject(sub.id)}
                className="group bg-[#FAF9F6]/60 border border-slate-200 hover:border-[#245882] rounded-xl p-3.5 transition-all cursor-pointer flex flex-col items-center hover:shadow-xs"
              >
                {/* Clean Header: 과목명만 표시 */}
                <div className="w-full text-center pb-1">
                  <h4 className="text-base font-black text-slate-900 group-hover:text-[#245882] transition-colors">
                    {sub.name}
                  </h4>
                </div>

                {/* Donut Chart */}
                <div className="relative w-full aspect-square max-w-[280px] mx-auto select-none">
                  <svg viewBox="0 0 350 350" className="w-full h-full overflow-visible drop-shadow-sm">
                    <defs>
                      {rankArcs.map((r) => {
                        const arcD = describeCircularTextArc(
                          cx,
                          cy,
                          rMid,
                          r.startAngle,
                          r.endAngle
                        );
                        // Outer sub-track (for 2-line display: rank name)
                        const arcDOuter = describeCircularTextArc(
                          cx,
                          cy,
                          rMid + 9,
                          r.startAngle,
                          r.endAngle
                        );
                        // Inner sub-track (for 2-line display: cutoff score)
                        const arcDInner = describeCircularTextArc(
                          cx,
                          cy,
                          rMid - 9,
                          r.startAngle,
                          r.endAngle
                        );
                        return (
                          <React.Fragment key={`gal-frag-${sIdx}-${r.id}`}>
                            <path
                              id={`gal-arc-${baseId}-${sIdx}-${r.id}`}
                              d={arcD}
                              fill="none"
                            />
                            <path
                              id={`gal-arc-outer-${baseId}-${sIdx}-${r.id}`}
                              d={arcDOuter}
                              fill="none"
                            />
                            <path
                              id={`gal-arc-inner-${baseId}-${sIdx}-${r.id}`}
                              d={arcDInner}
                              fill="none"
                            />
                          </React.Fragment>
                        );
                      })}
                    </defs>

                    {/* Subtle Framing Circles */}
                    <circle cx={cx} cy={cy} r={rOuterOut + 2} fill="none" stroke="#E2D7C5" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx={cx} cy={cy} r={rOuterIn} fill="none" stroke="#D1C3AD" strokeWidth="1" />
                    <circle cx={cx} cy={cy} r={rInnerOut + 2} fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx={cx} cy={cy} r={rInnerIn} fill="none" stroke="#E2D7C5" strokeWidth="1" />

                    {/* Outer Ring: 5등급제 (두꺼워진 띠와 더 커진 글씨) */}
                    {rankArcs.map((rank) => {
                      const pathD = describeDonutSlice(
                        cx,
                        cy,
                        rOuterIn,
                        rOuterOut,
                        rank.startAngle + 0.35,
                        rank.endAngle - 0.35
                      );

                      return (
                        <g key={rank.id}>
                          <path
                            d={pathD}
                            fill={rank.color}
                            stroke={rank.colorBorder || '#D4AF37'}
                            strokeWidth="1.2"
                          />
                          {rank.sweep > 8 && (
                            rank.sweep < 35 ? (
                              // 2줄 배치 (1등급, 5등급 등 칸이 좁은 경우: 글씨를 키우고 2줄로 위아래 배치하여 잘림 방지)
                              <>
                                <text
                                  fill="#020617"
                                  fontSize="12.5"
                                  fontWeight="900"
                                  letterSpacing="-0.3px"
                                  className="fill-slate-950 font-black text-[12px] sm:text-[13px] select-none"
                                  pointerEvents="none"
                                >
                                  <textPath
                                    href={`#gal-arc-outer-${baseId}-${sIdx}-${rank.id}`}
                                    startOffset="50%"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                  >
                                    {rank.rankName}
                                  </textPath>
                                </text>
                                <text
                                  fill="#791E38"
                                  fontSize="12.5"
                                  fontWeight="900"
                                  letterSpacing="-0.3px"
                                  className="fill-[#791E38] font-black text-[12px] sm:text-[13px] select-none"
                                  pointerEvents="none"
                                >
                                  <textPath
                                    href={`#gal-arc-inner-${baseId}-${sIdx}-${rank.id}`}
                                    startOffset="50%"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                  >
                                    컷 {rank.cutoffScore > 0 ? (rank.cutoffScore % 1 === 0 ? rank.cutoffScore.toFixed(0) : rank.cutoffScore.toFixed(1)) : '0'}
                                  </textPath>
                                </text>
                              </>
                            ) : (
                              // 1줄 배치 (2등급, 3등급, 4등급 등 칸이 넓은 경우: 시원하게 큰 글씨로 1줄 배치)
                              <text
                                fill="#020617"
                                fontSize="13.5"
                                fontWeight="900"
                                letterSpacing="-0.3px"
                                className="fill-slate-950 font-black text-[13px] sm:text-[14px] select-none"
                                pointerEvents="none"
                              >
                                <textPath
                                  href={`#gal-arc-${baseId}-${sIdx}-${rank.id}`}
                                  startOffset="50%"
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                >
                                  {rank.rankName} 컷 {rank.cutoffScore > 0 ? (rank.cutoffScore % 1 === 0 ? rank.cutoffScore.toFixed(0) : rank.cutoffScore.toFixed(1)) : '0'}
                                </textPath>
                              </text>
                            )
                          )}
                        </g>
                      );
                    })}

                    {/* Inner Ring: 성취도 A~E (두껍고 큰 글씨) */}
                    {achArcs.map((ach) => {
                      const pathD = describeDonutSlice(
                        cx,
                        cy,
                        rInnerIn,
                        rInnerOut,
                        ach.startAngle + 0.35,
                        ach.endAngle - 0.35
                      );
                      const labelPos = polarToCartesian(cx, cy, (rInnerIn + rInnerOut) / 2, ach.midAngle);

                      return (
                        <g key={ach.id}>
                          <path
                            d={pathD}
                            fill={ach.color}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                          {ach.sweep > 14 && (
                            <g transform={`translate(${labelPos.x}, ${labelPos.y})`} className="pointer-events-none">
                              <text
                                y={-10}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#FFFFFF"
                                fontSize="24"
                                fontWeight="900"
                                className="fill-white font-black text-2xl select-none drop-shadow-xs"
                              >
                                {ach.grade}
                              </text>
                              <text
                                y={12}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#FEF3C7"
                                fontSize="15"
                                fontWeight="900"
                                className="fill-amber-100 font-black text-sm sm:text-base select-none drop-shadow-xs"
                              >
                                {ach.ratio}%
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Center Hub: 오직 과목명만 표시 (글씨 확대) */}
                    <circle cx={cx} cy={cy} r={rInnerIn - 3} fill="#FFFFFF" stroke="#D1C3AD" strokeWidth="2" className="drop-shadow-2xs" />
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="18"
                      className="fill-black font-black text-base sm:text-[18px] select-none tracking-tight"
                    >
                      {sub.name}
                    </text>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
