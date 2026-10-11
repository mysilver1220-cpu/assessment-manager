export interface AchievementItem {
  id: string;
  grade: string; // 'A', 'B', 'C', 'D', 'E'
  scoreRange: string; // '90%이상', '80%~90%', etc.
  splitScore: number; // 분할점수기준: 90, 80, 70, 60, 50
  studentCount: number;
  ratio: number; // 산출비율
  color: string;
  colorBorder: string;
}

export interface RankGradeItem {
  id: string;
  rank: number; // 1, 2, 3, 4, 5
  rankName: string; // '1등급', '2등급', etc.
  percentileRange: string; // '10%이하', '10%~34%', etc.
  benchmarkRatio: number; // 10, 34, 66, 90, 100 (누적 기준)
  segmentRatio: number; // 구간 비율: 10, 24, 32, 24, 10
  studentCount: number;
  calculatedRatio: number; // 9.9, 24.1, 31.8, 24.1, 9.9
  cutoffScore: number; // 등급컷
  color: string;
  colorBorder: string;
}

export interface OverlapMapping {
  rankName: string;
  achievementGrade: string;
  estimatedStudents: number;
  percentageOfGrade: number;
  scoreDescription: string;
}

export interface SubjectData {
  id: string;
  name: string; // '공통국어1', '공통수학1', etc.
  category: string; // '국어', '수학', '영어', '사회', '과학', '한국사'
  semester: 1 | 2;
  academicYear?: string; // '2025학년도', '2026학년도' 등
  themeColor: string;
  totalStudents: number;
  achievements: AchievementItem[];
  ranks: RankGradeItem[];
  insights?: {
    keyMessage: string;
    gapAnalysis: string;
    targetSegment: string;
  };
}
