import { AchievementItem, RankGradeItem } from '../types/data';

export const TOTAL_STUDENTS = 352;

// [성취평가제 통계] - 나이키(Nike) 다이내믹 & 하이-에너지 볼트 & 레이서 팔레트
// 미도달(1명, 0.3%)은 성취도 E에 완전 통합 (E: 51명, 14.5%)
export const initialAchievementData: AchievementItem[] = [
  {
    id: 'ach-a',
    grade: 'A',
    scoreRange: '90%이상',
    splitScore: 90,
    studentCount: 83,
    ratio: 23.6,
    color: '#0055FE', // Nike Electric Racer Blue (폭발적인 활력의 레이서 블루)
    colorBorder: '#003ECC',
  },
  {
    id: 'ach-b',
    grade: 'B',
    scoreRange: '80%~90%',
    splitScore: 80,
    studentCount: 106,
    ratio: 30.1,
    color: '#00C896', // Nike Cyber Volt Teal (스포티하고 생동감 넘치는 사이버 틸)
    colorBorder: '#009E75',
  },
  {
    id: 'ach-c',
    grade: 'C',
    scoreRange: '70%~80%',
    splitScore: 70,
    studentCount: 58,
    ratio: 16.5,
    color: '#FF9900', // Nike Laser Speed Orange (선명하고 역동적인 레이저 오렌지)
    colorBorder: '#E68A00',
  },
  {
    id: 'ach-d',
    grade: 'D',
    scoreRange: '60%~70%',
    splitScore: 60,
    studentCount: 54,
    ratio: 15.3,
    color: '#FF4D26', // Nike Total Infrared Crimson (강렬한 토탈 인프라레드 크림슨)
    colorBorder: '#E03611',
  },
  {
    id: 'ach-e',
    grade: 'E',
    scoreRange: '60%미만 (미도달 포함)',
    splitScore: 50,
    studentCount: 51, // 50명 + 미도달 1명 = 51명
    ratio: 14.5, // 14.2% + 0.3% = 14.5%
    color: '#9B2CFF', // Nike Hyper Violet (활동적이고 엣지 있는 하이퍼 바이올렛)
    colorBorder: '#7E1ED9',
  },
];

// [5등급제 통계] [1학년] - 나이키 에어 아이스 & 글로우 틴트의 가볍고 선명한 외곽 링
export const initialRankData: RankGradeItem[] = [
  {
    id: 'rank-1',
    rank: 1,
    rankName: '1등급',
    percentileRange: '10%이하',
    benchmarkRatio: 10,
    segmentRatio: 10,
    studentCount: 35,
    calculatedRatio: 9.9,
    cutoffScore: 93.0,
    color: '#FEF9C3', // Nike Electric Glow (라이트 볼트 옐로우)
    colorBorder: '#EAB308',
  },
  {
    id: 'rank-2',
    rank: 2,
    rankName: '2등급',
    percentileRange: '10%~34%',
    benchmarkRatio: 34,
    segmentRatio: 24,
    studentCount: 85,
    calculatedRatio: 24.1,
    cutoffScore: 87.0,
    color: '#E0F2FE', // Nike Air Ice Blue (아이스 블루)
    colorBorder: '#7DD3FC',
  },
  {
    id: 'rank-3',
    rank: 3,
    rankName: '3등급',
    percentileRange: '34%~66%',
    benchmarkRatio: 66,
    segmentRatio: 32,
    studentCount: 112,
    calculatedRatio: 31.8,
    cutoffScore: 72.0,
    color: '#DCFCE7', // Nike Cyber Field Mint (필드 민트)
    colorBorder: '#86EFAC',
  },
  {
    id: 'rank-4',
    rank: 4,
    rankName: '4등급',
    percentileRange: '66%~90%',
    benchmarkRatio: 90,
    segmentRatio: 24,
    studentCount: 85,
    calculatedRatio: 24.1,
    cutoffScore: 56.0,
    color: '#FFEDD5', // Nike Sunset Peach (선셋 피치)
    colorBorder: '#FDBA74',
  },
  {
    id: 'rank-5',
    rank: 5,
    rankName: '5등급',
    percentileRange: '90%~100%',
    benchmarkRatio: 100,
    segmentRatio: 10,
    studentCount: 35,
    calculatedRatio: 9.9,
    cutoffScore: 47.0,
    color: '#F3E8FF', // Nike Air Iris Tint (아이리스 틴트)
    colorBorder: '#D8B4FE',
  },
];
