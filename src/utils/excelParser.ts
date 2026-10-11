import * as XLSX from 'xlsx';
import { SubjectData } from '../types/data';
import { createAchievements, createRanks } from '../data/allSubjectsData';

export interface ParsedExcelResult {
  academicYears: string[];
  subjects: SubjectData[];
  defaultAcademicYear: string;
}

// Map subject names to categories and theme colors
function getSubjectCategoryAndTheme(name: string): { category: string; themeColor: string; semester: 1 | 2 } {
  const clean = name.trim();
  const isSem2 = clean.includes('2') || clean.includes('2학기');
  const semester: 1 | 2 = isSem2 ? 2 : 1;

  if (clean.includes('국어')) {
    return { category: '국어', themeColor: '#245882', semester };
  } else if (clean.includes('수학')) {
    return { category: '수학', themeColor: '#1E3A8A', semester };
  } else if (clean.includes('영어')) {
    return { category: '영어', themeColor: '#0F766E', semester };
  } else if (clean.includes('사회') || clean.includes('역사') || clean.includes('지리') || clean.includes('도덕') || clean.includes('윤리')) {
    return { category: '사회', themeColor: '#B45309', semester };
  } else if (clean.includes('과학') || clean.includes('물리') || clean.includes('화학') || clean.includes('생명') || clean.includes('지구')) {
    return { category: '과학', themeColor: '#4338CA', semester };
  } else if (clean.includes('한국사')) {
    return { category: '한국사', themeColor: '#9333EA', semester };
  }
  return { category: '일반', themeColor: '#334155', semester };
}

function cleanNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const str = String(val).replace(/[%점\s,]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

/**
 * Universal parser for school score Excel files:
 * Supports:
 * - Direct row columns (과목명, A, B, C, D, E, 1등급컷, 2등급컷, ...)
 * - Multi-row subheaders (성취도분포비율 row followed by A B C D E row)
 * - NEIS / School standardized score exports
 */
export function parseExcelFile(arrayBuffer: ArrayBuffer, currentYearDefault = '2025학년도'): ParsedExcelResult {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const subjects: SubjectData[] = [];
  const detectedYears = new Set<string>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length < 2) continue;

    // Search up to top 15 rows for header patterns
    let headerRowIdx = -1;
    let colMap: Record<string, number> = {};

    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const curRow = rows[r].map((cell) => String(cell || '').trim());
      const nextRow = r + 1 < rows.length ? rows[r + 1].map((cell) => String(cell || '').trim()) : [];

      const hasSubject = curRow.some((c) => /과목|교과|과목명|교과목/i.test(c));
      const hasAch = curRow.some((c) => /성취도|성취율|[A-E]\s*비율|^[A-E]$/i.test(c)) ||
                     nextRow.some((c) => /^[A-E]$|^[A-E]\s*\(?%?\)?$/i.test(c));
      const hasRank = curRow.some((c) => /등급|등급컷|1컷/i.test(c)) ||
                      nextRow.some((c) => /^[1-5]등급|[1-5]컷/i.test(c));

      if (hasSubject || (hasAch && hasRank)) {
        headerRowIdx = r;
        
        // Scan curRow and nextRow combined for column locations
        curRow.forEach((colName, cIdx) => {
          const upper = colName.toUpperCase();
          const subCol = (nextRow[cIdx] || '').trim().toUpperCase();

          if (/학년도|연도|년도/i.test(colName) || /학년도|연도|년도/i.test(subCol)) colMap['year'] = cIdx;
          if (/학기/i.test(colName) || /학기/i.test(subCol)) colMap['semester'] = cIdx;
          if (/과목|과목명|교과|교과목/i.test(colName) || /과목|과목명|교과|교과목/i.test(subCol)) colMap['subject'] = cIdx;
          if (/학생수|수강자|수강자수|총원|인원/i.test(colName) || /학생수|수강자|수강자수/i.test(subCol)) colMap['students'] = cIdx;

          // Achievement Ratios (A, B, C, D, E)
          if (upper === 'A' || /A\s*\(?%?\)?/i.test(colName) || /A비율|성취도\s*A/i.test(colName) || subCol === 'A' || /A\s*\(?%?\)?/i.test(subCol)) {
            if (colMap['achA'] === undefined) colMap['achA'] = cIdx;
          }
          if (upper === 'B' || /B\s*\(?%?\)?/i.test(colName) || /B비율|성취도\s*B/i.test(colName) || subCol === 'B' || /B\s*\(?%?\)?/i.test(subCol)) {
            if (colMap['achB'] === undefined) colMap['achB'] = cIdx;
          }
          if (upper === 'C' || /C\s*\(?%?\)?/i.test(colName) || /C비율|성취도\s*C/i.test(colName) || subCol === 'C' || /C\s*\(?%?\)?/i.test(subCol)) {
            if (colMap['achC'] === undefined) colMap['achC'] = cIdx;
          }
          if (upper === 'D' || /D\s*\(?%?\)?/i.test(colName) || /D비율|성취도\s*D/i.test(colName) || subCol === 'D' || /D\s*\(?%?\)?/i.test(subCol)) {
            if (colMap['achD'] === undefined) colMap['achD'] = cIdx;
          }
          if (upper === 'E' || /E\s*\(?%?\)?/i.test(colName) || /E비율|성취도\s*E/i.test(colName) || subCol === 'E' || /E\s*\(?%?\)?/i.test(subCol)) {
            if (colMap['achE'] === undefined) colMap['achE'] = cIdx;
          }

          // Rank Cutoffs (1, 2, 3, 4, 5)
          if (/1등급|1컷/i.test(colName) || /1등급|1컷/i.test(subCol)) {
            if (colMap['rank1'] === undefined) colMap['rank1'] = cIdx;
          }
          if (/2등급|2컷/i.test(colName) || /2등급|2컷/i.test(subCol)) {
            if (colMap['rank2'] === undefined) colMap['rank2'] = cIdx;
          }
          if (/3등급|3컷/i.test(colName) || /3등급|3컷/i.test(subCol)) {
            if (colMap['rank3'] === undefined) colMap['rank3'] = cIdx;
          }
          if (/4등급|4컷/i.test(colName) || /4등급|4컷/i.test(subCol)) {
            if (colMap['rank4'] === undefined) colMap['rank4'] = cIdx;
          }
          if (/5등급|5컷/i.test(colName) || /5등급|5컷/i.test(subCol)) {
            if (colMap['rank5'] === undefined) colMap['rank5'] = cIdx;
          }
        });

        // If nextRow had subheadings like A, B, C, D, E, advance header row index
        if (nextRow.some((c) => /^[A-E]$/i.test(c))) {
          headerRowIdx = r + 1;
        }
        break;
      }
    }

    // Fallback: If no explicit header found, but row has subject text at column 0 or 2
    if (headerRowIdx === -1 || colMap['subject'] === undefined) {
      continue;
    }

    // Process all data rows
    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const subNameRaw = String(row[colMap['subject']] || '').trim();
      if (!subNameRaw || /합계|평균|소계|전체|비고/i.test(subNameRaw)) continue;

      // Extract Year
      let year = currentYearDefault;
      if (colMap['year'] !== undefined && row[colMap['year']]) {
        const yVal = String(row[colMap['year']]).trim();
        year = yVal.includes('학년도') ? yVal : `${yVal.replace(/[^0-9]/g, '')}학년도`;
      }
      if (year && year.trim()) {
        detectedYears.add(year);
      }

      // Extract Semester
      const meta = getSubjectCategoryAndTheme(subNameRaw);
      let semester: 1 | 2 = meta.semester;
      if (colMap['semester'] !== undefined && row[colMap['semester']]) {
        const sVal = String(row[colMap['semester']]);
        if (sVal.includes('2')) semester = 2;
        else if (sVal.includes('1')) semester = 1;
      }

      // Total Students
      const totalStudents = colMap['students'] !== undefined ? cleanNumber(row[colMap['students']], 350) : 350;

      // Ratios (with robust defaults if omitted)
      const achA = colMap['achA'] !== undefined ? cleanNumber(row[colMap['achA']], 20) : 20;
      const achB = colMap['achB'] !== undefined ? cleanNumber(row[colMap['achB']], 25) : 25;
      const achC = colMap['achC'] !== undefined ? cleanNumber(row[colMap['achC']], 25) : 25;
      const achD = colMap['achD'] !== undefined ? cleanNumber(row[colMap['achD']], 15) : 15;
      const achE = colMap['achE'] !== undefined ? cleanNumber(row[colMap['achE']], 15) : 15;

      // Cutoffs
      const rank1 = colMap['rank1'] !== undefined ? cleanNumber(row[colMap['rank1']], 90) : 90;
      const rank2 = colMap['rank2'] !== undefined ? cleanNumber(row[colMap['rank2']], 80) : 80;
      const rank3 = colMap['rank3'] !== undefined ? cleanNumber(row[colMap['rank3']], 70) : 70;
      const rank4 = colMap['rank4'] !== undefined ? cleanNumber(row[colMap['rank4']], 55) : 55;
      const rank5 = colMap['rank5'] !== undefined ? cleanNumber(row[colMap['rank5']], 40) : 40;

      // Clean ID ensuring safe uniqueness across subjects and semesters
      const cleanSubKey = subNameRaw.replace(/[^a-zA-Z0-9가-힣]/g, '');
      const subId = `excel-${year.replace(/[^0-9]/g, '')}-${cleanSubKey}-${semester}-${r}`;

      const subjectData: SubjectData = {
        id: subId,
        name: subNameRaw,
        category: meta.category,
        semester,
        academicYear: year,
        themeColor: meta.themeColor,
        totalStudents: totalStudents || 350,
        achievements: createAchievements(
          [achA, achB, achC, achD, achE],
          [
            Math.round(((achA || 20) / 100) * (totalStudents || 350)),
            Math.round(((achB || 25) / 100) * (totalStudents || 350)),
            Math.round(((achC || 25) / 100) * (totalStudents || 350)),
            Math.round(((achD || 15) / 100) * (totalStudents || 350)),
            Math.round(((achE || 15) / 100) * (totalStudents || 350)),
          ]
        ),
        ranks: createRanks([rank1, rank2, rank3, rank4, rank5]),
      };

      subjects.push(subjectData);
    }
  }

  const yearList = Array.from(detectedYears);
  if (yearList.length === 0) {
    yearList.push(currentYearDefault);
  }

  return {
    academicYears: yearList,
    subjects,
    defaultAcademicYear: yearList[0] || currentYearDefault,
  };
}

/**
 * Generate a downloadable standard template Excel file
 */
export function downloadExcelTemplate() {
  const headers = [
    '학년도',
    '학기',
    '과목명',
    '학생수',
    '성취도A(%)',
    '성취도B(%)',
    '성취도C(%)',
    '성취도D(%)',
    '성취도E(%)',
    '1등급컷(점)',
    '2등급컷(점)',
    '3등급컷(점)',
    '4등급컷(점)',
    '5등급컷(점)',
  ];

  const sampleRows = [
    ['2025학년도', '1학기', '공통국어1', 352, 23.6, 30.1, 16.5, 15.3, 14.5, 93.0, 87.0, 72.0, 56.0, 47.0],
    ['2025학년도', '1학기', '공통수학1', 352, 18.2, 22.4, 19.3, 17.6, 22.5, 88.5, 78.0, 62.0, 46.0, 35.0],
    ['2025학년도', '1학기', '공통영어1', 352, 28.4, 29.5, 18.2, 13.6, 10.3, 96.0, 91.0, 78.5, 63.0, 51.0],
    ['2025학년도', '1학기', '통합사회1', 352, 31.2, 27.8, 17.0, 13.1, 10.9, 94.0, 88.0, 75.0, 58.0, 45.0],
    ['2025학년도', '1학기', '통합과학1', 352, 21.0, 24.1, 20.5, 18.2, 16.2, 91.5, 83.5, 67.0, 50.5, 39.0],
    ['2025학년도', '1학기', '한국사1', 352, 34.5, 28.0, 15.1, 12.0, 10.4, 95.0, 89.0, 76.0, 60.0, 48.0],
    ['2025학년도', '2학기', '공통국어2', 352, 24.2, 29.8, 17.1, 14.8, 14.1, 93.5, 87.5, 73.0, 57.0, 48.0],
    ['2025학년도', '2학기', '공통수학2', 352, 17.5, 21.9, 20.1, 18.2, 22.3, 89.0, 79.0, 63.5, 47.0, 36.5],
    ['2025학년도', '2학기', '공통영어2', 352, 29.0, 30.1, 17.8, 13.2, 9.9, 96.5, 91.5, 79.0, 64.0, 52.0],
    ['2025학년도', '2학기', '통합사회2', 352, 30.5, 28.2, 17.5, 13.0, 10.8, 94.5, 88.5, 76.0, 59.0, 46.0],
    ['2025학년도', '2학기', '통합과학2', 352, 20.5, 23.8, 21.0, 18.5, 16.2, 92.0, 84.0, 68.0, 51.5, 40.0],
    ['2025학년도', '2학기', '한국사2', 352, 33.8, 28.5, 15.6, 11.9, 10.2, 95.5, 89.5, 77.0, 61.0, 49.0],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '성취도_등급컷_데이터');

  XLSX.writeFile(wb, '성취도분포비율_등급컷_표준양식.xlsx');
}
