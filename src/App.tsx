/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { allSubjectsData } from './data/allSubjectsData';
import { SubjectData, AchievementItem, RankGradeItem } from './types/data';
import { NestedDonutChart } from './components/NestedDonutChart';
import { SixSubjectsDonutGallery } from './components/SixSubjectsDonutGallery';
import { SubjectInputTable } from './components/SubjectInputTable';
import { ExcelUploadSection } from './components/ExcelUploadSection';
import {
  Share2,
  Check,
  Layers,
  Calendar,
} from 'lucide-react';

const STORAGE_KEY = 'school_achievement_grade_app_data_v1';

export default function App() {
  // Load saved state or default
  const [academicYears, setAcademicYears] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.academicYears && parsed.academicYears.length > 0) return parsed.academicYears;
      }
    } catch (e) {
      console.error(e);
    }
    return ['2025학년도'];
  });

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedAcademicYear) return parsed.selectedAcademicYear;
      }
    } catch (e) {
      console.error(e);
    }
    return '2025학년도';
  });

  const [semester, setSemester] = useState<1 | 2>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.semester) return parsed.semester;
      }
    } catch (e) {
      console.error(e);
    }
    return 1;
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedSubjectId) return parsed.selectedSubjectId;
      }
    } catch (e) {
      console.error(e);
    }
    return 'korean-1';
  });

  const [allSubjects, setAllSubjects] = useState<SubjectData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.allSubjects && parsed.allSubjects.length > 0) return parsed.allSubjects;
      }
    } catch (e) {
      console.error(e);
    }
    return allSubjectsData;
  });

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.uploadedFileName || null;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.lastUpdatedTime || null;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Save to localStorage on any state change
  useEffect(() => {
    try {
      const stateToSave = {
        academicYears,
        selectedAcademicYear,
        semester,
        selectedSubjectId,
        allSubjects,
        uploadedFileName,
        lastUpdatedTime,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [academicYears, selectedAcademicYear, semester, selectedSubjectId, allSubjects, uploadedFileName, lastUpdatedTime]);

  const [selectedSegment, setSelectedSegment] = useState<{
    type: 'rank' | 'achievement';
    id: string;
  } | null>(null);

  const [shareCopied, setShareCopied] = useState(false);

  // Filter subjects by selectedAcademicYear and semester
  const currentYearSubjects = allSubjects.filter(
    (s) => !s.academicYear || s.academicYear === selectedAcademicYear
  );

  const currentSemesterSubjects = currentYearSubjects.filter((s) => s.semester === semester);

  // Fallback if currentSemesterSubjects has items but activeSubject is not in it
  const activeSubject =
    currentSemesterSubjects.find((s) => s.id === selectedSubjectId) ||
    currentSemesterSubjects[0] ||
    allSubjects[0];

  const handleSemesterChange = (newSemester: 1 | 2) => {
    setSemester(newSemester);
    if (selectedSubjectId !== 'all') {
      const targetSub = currentYearSubjects.find(
        (s) => s.semester === newSemester && s.category === activeSubject?.category
      ) || currentYearSubjects.find((s) => s.semester === newSemester);
      if (targetSub) setSelectedSubjectId(targetSub.id);
    }
  };

  const handleAcademicYearChange = (newYear: string) => {
    setSelectedAcademicYear(newYear);
    const yearSubs = allSubjects.filter((s) => !s.academicYear || s.academicYear === newYear);
    const subInSem = yearSubs.find((s) => s.semester === semester);
    if (subInSem && selectedSubjectId !== 'all') {
      setSelectedSubjectId(subInSem.id);
    }
  };

  // Callback when Excel file is parsed
  const handleDataLoadedFromExcel = (
    newYears: string[],
    newSubjects: SubjectData[],
    defaultYear: string,
    fileName: string
  ) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Merge or replace subjects
    setAcademicYears(newYears);
    setSelectedAcademicYear(defaultYear);
    setAllSubjects(newSubjects);
    setUploadedFileName(fileName);
    setLastUpdatedTime(timeStr);

    // Pick first subject of semester 1
    const firstSub = newSubjects.find((s) => s.semester === semester) || newSubjects[0];
    if (firstSub && selectedSubjectId !== 'all') {
      setSelectedSubjectId(firstSub.id);
    }
  };

  const handleUpdateCurrentAchievements = (newAch: AchievementItem[]) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLastUpdatedTime(timeStr);

    setAllSubjects((prev) =>
      prev.map((sub) => (sub.id === activeSubject.id ? { ...sub, achievements: newAch } : sub))
    );
  };

  const handleUpdateCurrentRanks = (newRanks: RankGradeItem[]) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLastUpdatedTime(timeStr);

    setAllSubjects((prev) =>
      prev.map((sub) => (sub.id === activeSubject.id ? { ...sub, ranks: newRanks } : sub))
    );
  };

  const handleResetCurrentSubject = () => {
    const original = allSubjectsData.find((s) => s.id === activeSubject.id);
    if (!original) return;
    setAllSubjects((prev) =>
      prev.map((sub) => (sub.id === activeSubject.id ? { ...original } : sub))
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header: 단순하고 명확한 제목 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Main Title: 1. 제목 - 성취도 분포비율 vs 등급 비교 */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 whitespace-nowrap">
              성취도 분포비율 vs 등급 비교
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {shareCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">{shareCopied ? '복사됨' : '공유'}</span>
            </button>
          </div>
        </div>

        {/* 1학기/2학기 과목 구분 탭 + 과목 통합 비교 탭 & 과목 선택 탭 */}
        <div className="bg-[#FAF8F5] border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            {/* 학년도 선택 드롭다운 (학년도가 2개 이상일 때만 표시) */}
            {academicYears.length > 1 && (
              <>
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-300 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => handleAcademicYearChange(e.target.value)}
                    className="text-xs font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                  >
                    {academicYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-slate-300">|</span>
              </>
            )}

            {/* 학기 선택 탭 (1학기 vs 2학기) */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-300 shrink-0">
              <button
                onClick={() => handleSemesterChange(1)}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all cursor-pointer ${
                  semester === 1
                    ? 'bg-[#245882] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1학기
              </button>
              <button
                onClick={() => handleSemesterChange(2)}
                className={`px-3 py-1 text-xs font-black rounded-md transition-all cursor-pointer ${
                  semester === 2
                    ? 'bg-[#245882] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2학기
              </button>
            </div>

            <span className="text-slate-300">|</span>

            {/* 과목 통합 비교 탭 */}
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 shadow-2xs ${
                selectedSubjectId === 'all'
                  ? 'bg-slate-950 text-white border border-slate-950'
                  : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>{semester}학기 6개 과목 통합 비교</span>
            </button>

            <span className="text-slate-300">|</span>

            {/* 개별 과목 선택 탭 (8. 오직 과목명만 표시) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {currentSemesterSubjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-[#245882] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>



      {/* Main Workspace (부장이 한눈에 보기 쉽게 단순하고 직관적인 구성) */}
      <main id="report-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* 1, 2, 4. 엑셀 파일 업로드 영역 (지금 형태 유지하면서 1번 항목으로 위쪽에 배치) */}
        <ExcelUploadSection
          onDataLoaded={handleDataLoadedFromExcel}
          currentFileName={uploadedFileName}
          lastUpdatedTime={lastUpdatedTime}
        />

        {/* ======================================================== */}
        {/* CASE 1: 6개 과목 학기별 통합 비교 뷰 (동심원 파이 3x2 PPT 최적) */}
        {/* ======================================================== */}
        {selectedSubjectId === 'all' && (
          <SixSubjectsDonutGallery
            subjects={currentSemesterSubjects}
            onSelectSubject={setSelectedSubjectId}
            semesterTitle={`${semester}학기 6개 과목 성취도 vs 등급 통합 비교`}
          />
        )}

        {/* ======================================================== */}
        {/* CASE 2: 단일 과목 뷰 (직접 입력 표 + 동심원 파이 차트) */}
        {/* ======================================================== */}
        {selectedSubjectId !== 'all' && (
          <div className="space-y-4">
            {/* 15, 16, 17. 성취도별 비율과 등급별 컷 점수 직접 입력 표 (실시간 동시 반영) */}
            <SubjectInputTable
              subject={activeSubject}
              onUpdateAchievements={handleUpdateCurrentAchievements}
              onUpdateRanks={handleUpdateCurrentRanks}
              onReset={handleResetCurrentSubject}
            />

            {/* 6, 7, 9, 10, 11. 동심원 파이 차트 (원형 텍스트, 큰 A~E 비율, 가운데 과목명만) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <h2 className="text-base font-black text-slate-900">
                  {activeSubject.name}
                </h2>
              </div>

              <NestedDonutChart
                achievements={activeSubject.achievements}
                ranks={activeSubject.ranks}
                totalStudents={activeSubject.totalStudents}
                selectedSegment={selectedSegment}
                onSelectSegment={setSelectedSegment}
                subjectName={activeSubject.name}
                cutoffScore={activeSubject.ranks[0].cutoffScore}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
