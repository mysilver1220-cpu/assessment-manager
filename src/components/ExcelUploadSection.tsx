import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { parseExcelFile, downloadExcelTemplate } from '../utils/excelParser';
import { SubjectData } from '../types/data';

interface ExcelUploadSectionProps {
  onDataLoaded: (academicYears: string[], subjects: SubjectData[], activeYear: string, fileName: string) => void;
  currentFileName?: string | null;
  lastUpdatedTime?: string | null;
}

export const ExcelUploadSection: React.FC<ExcelUploadSectionProps> = ({
  onDataLoaded,
  currentFileName,
  lastUpdatedTime,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setStatusMessage({ type: 'error', text: '엑셀 파일(.xlsx, .xls) 또는 .csv 파일만 업로드할 수 있습니다.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer);

      if (result.subjects.length === 0) {
        setStatusMessage({
          type: 'error',
          text: '엑셀 파일에서 과목 및 성취도/등급컷 데이터를 찾지 못했습니다. 표준 서식 템플릿을 다운로드하여 확인해주세요.',
        });
        setIsLoading(false);
        return;
      }

      onDataLoaded(result.academicYears, result.subjects, result.defaultAcademicYear, file.name);

      setStatusMessage({
        type: 'success',
        text: `'${file.name}' 업로드 성공! (${result.subjects.length}개 과목 데이터가 차트 및 통합비교에 자동 반영되었습니다.)`,
      });
    } catch (err) {
      console.error('Excel parse error:', err);
      setStatusMessage({
        type: 'error',
        text: '엑셀 파일을 읽는 도중 오류가 발생했습니다. 파일 형식을 다시 확인해주세요.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-5">
      {/* 엑셀 파일 업로드 헤더 (1 숫자 삭제, 설명 삭제, 표준 엑셀 서식 삭제) */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <h2 className="font-black text-slate-950 text-sm sm:text-base">
            엑셀 파일 업로드
          </h2>
        </div>
      </div>

      {/* Dropzone Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-600 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black text-slate-900">
              {isLoading ? '엑셀 데이터 분석 중...' : '클릭하여 엑셀 파일 선택 또는 여기에 파일 끌어다 놓기'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              .xlsx, .xls, .csv 파일 지원
            </p>
          </div>
        </div>
      </div>

      {/* 상태 메시지 및 마지막 파일 정보 */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs gap-2">
        {statusMessage ? (
          <div
            className={`flex items-center gap-1.5 font-bold ${
              statusMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        ) : currentFileName ? (
          <div className="text-[11px] flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            현재 적용 파일: <strong className="text-emerald-800">{currentFileName}</strong>
            {lastUpdatedTime && <span className="text-slate-400 font-normal">({lastUpdatedTime})</span>}
          </div>
        ) : null}
      </div>
    </div>
  );
};
