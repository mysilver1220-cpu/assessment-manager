import jsPDF from 'jspdf';
import { AchievementItem, RankGradeItem } from '../types/data';

export interface ChartExportOptions {
  subjectName: string;
  cutoffScore: number;
  containerElement?: HTMLElement | null;
  achievements?: AchievementItem[];
  ranks?: RankGradeItem[];
}

/**
 * Robustly clone and rasterize an SVG element with all computed styles preserved
 */
async function rasterizeSvgToImage(svgElement: SVGSVGElement, width = 700, height = 700): Promise<HTMLImageElement> {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  // Inline default font typography
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = `
    text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard", "Apple SD Gothic Neo", sans-serif;
    }
  `;
  clone.insertBefore(styleEl, clone.firstChild);

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URLObj = window.URL || window.webkitURL || window;
  const blobURL = URLObj.createObjectURL(svgBlob);

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      URLObj.revokeObjectURL(blobURL);
      reject(new Error('SVG image render timeout'));
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      URLObj.revokeObjectURL(blobURL);
      resolve(img);
    };

    img.onerror = (e) => {
      clearTimeout(timeout);
      URLObj.revokeObjectURL(blobURL);
      reject(e);
    };

    img.src = blobURL;
  });
}

/**
 * Capture an SVG chart and export as a crisp A4 PDF preserving exact screen colors
 */
export async function exportChartToPDF(
  svgElement: SVGSVGElement,
  fileName: string,
  options: ChartExportOptions
): Promise<void> {
  const { subjectName, achievements, ranks } = options;
  const chartImg = await rasterizeSvgToImage(svgElement, 700, 700);

  // A4 Canvas (Portrait 1400 x 1980, 2x Retina)
  const a4Canvas = document.createElement('canvas');
  const a4Width = 1400;
  const a4Height = 1980;
  a4Canvas.width = a4Width;
  a4Canvas.height = a4Height;
  const ctx = a4Canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // Exact UI Background: #FAF9F6
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, a4Width, a4Height);

  // Top Accent Bar (Navy #245882)
  ctx.fillStyle = '#245882';
  ctx.fillRect(0, 0, a4Width, 14);

  const padX = 80;
  let curY = 75;

  // Header: 과목명 및 제목
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(`${subjectName} 성취도 분포비율 vs 등급 비교`, padX, curY);

  curY += 34;
  ctx.fillStyle = '#475569';
  ctx.font = '600 17px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('안쪽: 성취평가제(A~E) 비율  |  바깥쪽: 상대평가 5등급제 및 등급컷 점수', padX, curY);

  curY += 28;
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, curY);
  ctx.lineTo(a4Width - padX, curY);
  ctx.stroke();

  curY += 40;

  // Chart Container Card (Exact Screen White & Soft Border)
  const cardWidth = a4Width - padX * 2;
  const cardHeight = 900;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E2D7C5';
  ctx.lineWidth = 2;
  ctx.strokeRect(padX, curY, cardWidth, cardHeight);
  ctx.fillRect(padX, curY, cardWidth, cardHeight);

  // Draw Chart image inside card
  const chartSize = 820;
  const chartX = padX + (cardWidth - chartSize) / 2;
  const chartY = curY + (cardHeight - chartSize) / 2;
  ctx.drawImage(chartImg, chartX, chartY, chartSize, chartSize);

  curY += cardHeight + 40;

  // Summary Table: 성취도 A~E 비율 및 등급컷 1~5등급
  if (achievements && ranks) {
    const tableWidth = cardWidth;
    const tableHeight = 240;
    ctx.fillStyle = '#FAF9F6';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padX, curY, tableWidth, tableHeight);
    ctx.fillRect(padX, curY, tableWidth, tableHeight);

    // Section 1: 성취도
    ctx.fillStyle = '#245882';
    ctx.font = '900 18px Pretendard, -apple-system, sans-serif';
    ctx.fillText('● 성취도별 비율 (%)', padX + 30, curY + 45);

    const achStep = (tableWidth - 60) / achievements.length;
    achievements.forEach((ach, i) => {
      const itemX = padX + 30 + i * achStep;
      ctx.fillStyle = ach.color;
      ctx.fillRect(itemX, curY + 65, 34, 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 16px Pretendard, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ach.grade, itemX + 17, curY + 83);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#0F172A';
      ctx.font = '900 17px Pretendard, -apple-system, sans-serif';
      ctx.fillText(`${ach.ratio}%`, itemX + 44, curY + 84);
    });

    // Section 2: 5등급제 등급컷
    ctx.fillStyle = '#922B48';
    ctx.font = '900 18px Pretendard, -apple-system, sans-serif';
    ctx.fillText('● 등급별 컷 점수 (점)', padX + 30, curY + 145);

    const rankStep = (tableWidth - 60) / ranks.length;
    ranks.forEach((rnk, i) => {
      const itemX = padX + 30 + i * rankStep;
      ctx.fillStyle = rnk.color;
      ctx.strokeStyle = rnk.colorBorder;
      ctx.lineWidth = 1.5;
      ctx.fillRect(itemX, curY + 165, 52, 26);
      ctx.strokeRect(itemX, curY + 165, 52, 26);

      ctx.fillStyle = '#0F172A';
      ctx.font = '900 14px Pretendard, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(rnk.rankName, itemX + 26, curY + 183);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#791E38';
      ctx.font = '900 17px Pretendard, -apple-system, sans-serif';
      ctx.fillText(`${rnk.cutoffScore.toFixed(1)}점`, itemX + 60, curY + 184);
    });
  }

  // Convert Canvas to PDF
  const imgData = a4Canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  pdf.save(safeFileName);
}

/**
 * Capture full document view or gallery and download as a high-quality A4 PDF
 * Extracts all native SVGs and composite them directly onto PDF canvas to prevent color fading
 */
export async function exportElementToPDF(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const svgs = Array.from(element.querySelectorAll('svg'));

  // If this contains 6 subject charts (Gallery view)
  if (svgs.length >= 6) {
    const images = await Promise.all(
      svgs.slice(0, 6).map((svg) => rasterizeSvgToImage(svg, 700, 700))
    );

    // Landscape A4 (297 x 210 mm -> 1980 x 1400 px)
    const a4Canvas = document.createElement('canvas');
    a4Canvas.width = 1980;
    a4Canvas.height = 1400;
    const ctx = a4Canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('6개 과목 성취도 분포비율 vs 등급 비교', 70, 65);

    // Divider
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(70, 95);
    ctx.lineTo(1910, 95);
    ctx.stroke();

    // 2 rows x 3 columns
    const startX = 70;
    const startY = 125;
    const cardW = 590;
    const cardH = 590;
    const gapX = 35;
    const gapY = 30;

    images.forEach((img, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      ctx.fillStyle = '#FAF9F6';
      ctx.strokeStyle = '#E2D7C5';
      ctx.lineWidth = 1.5;
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeRect(x, y, cardW, cardH);

      const chartSize = 540;
      const cx = x + (cardW - chartSize) / 2;
      const cy = y + (cardH - chartSize) / 2;
      ctx.drawImage(img, cx, cy, chartSize, chartSize);
    });

    const imgData = a4Canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    return;
  }

  // Single chart view
  if (svgs.length > 0) {
    const mainSvg = svgs[0];
    const chartImg = await rasterizeSvgToImage(mainSvg, 700, 700);

    const a4Canvas = document.createElement('canvas');
    a4Canvas.width = 1400;
    a4Canvas.height = 1980;
    const ctx = a4Canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

    ctx.fillStyle = '#245882';
    ctx.fillRect(0, 0, a4Canvas.width, 14);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('성취도 분포비율 vs 등급 비교 리포트', 80, 75);

    const chartSize = 950;
    const cx = (a4Canvas.width - chartSize) / 2;
    const cy = 160;
    ctx.drawImage(chartImg, cx, cy, chartSize, chartSize);

    const imgData = a4Canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    return;
  }

  // Fallback
  const pdf = new jsPDF();
  pdf.text('Report Export', 10, 10);
  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}
