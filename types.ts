export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export interface Pillar {
  stem: string; // Heavenly Stem (e.g., 甲)
  branch: string; // Earthly Branch (e.g., 子)
  element: string; // Na Yin (e.g., 海中金)
  gods: string[]; // Ten Gods associated (e.g., 比肩)
  hiddenStems?: string[]; // Cang Gan in the branch
  hiddenStemGods?: string[]; // Ten Gods of hidden stems (藏干十神)
  shenSha?: string[]; // Symbolic Stars (e.g., 桃花, 驿马, 天乙贵人)
}

export interface BaziChartData {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface AnalysisSection {
  title: string;
  summary: string; // A high-level overview
  details: string[]; // Detailed bullet points of analysis
  predictions?: string[]; // Specific future predictions (used in Fortune/Career)
  advice?: string[]; // Actionable advice
  score?: number; // 0-100 score for this aspect
  // 扩展字段（可选）
  strengths?: string[];
  weaknesses?: string[];
  suitableIndustries?: string[];
  unsuitableIndustries?: string[];
  wealthType?: string;
  spouseCharacteristics?: string[];
  marriageTiming?: string;
  weakOrgans?: string[];
  preventionAdvice?: string[];
  currentLuckPillar?: string;
  keyYears?: string[];
}

// 十神组合分析
export interface TenGodAnalysis {
  mainCombination: string;
  characteristics: string[];
  advantages: string[];
  disadvantages: string[];
}

// 刑冲合害分析
export interface RelationsAnalysis {
  summary: string;
  details: string[];
}

// 流年信息
export interface LiuNianInfo {
  year: number;          // 公历年份
  age: number;           // 虚岁
  ganZhi: string;        // 干支 (如 "甲子")
}

// 大运信息
export interface DaYunInfo {
  ganZhi: string;        // 大运干支
  startAge: number;      // 起运虚岁
  endAge: number;        // 结束虚岁
  startYear: number;     // 起运公历年
  endYear: number;       // 结束公历年
  liuNian: LiuNianInfo[]; // 该大运内的流年
}

// 真太阳时信息
export interface TrueSolarTimeInfo {
  trueSolarTime: string;     // 真太阳时 HH:mm
  originalTime: string;      // 原始输入时间
  totalCorrection: number;   // 总修正分钟数
  longitudeCorrection: number; // 经度修正
  equationOfTime: number;    // 均时差
  explanation: string;       // 说明
}

// 格局信息
export interface PatternInfo {
  mainPattern: string;       // 主格局
  subPatterns: string[];     // 辅助格局
  description: string;       // 格局说明
  level: 'high' | 'medium' | 'low'; // 格局层次
}

export interface BaziResult {
  dayMaster: string; // The Day Stem
  dayMasterElement: string; // Wood, Fire, Earth, Metal, Water
  strength: string; // Weak, Strong, Balanced, etc.
  strengthAnalysis?: string; // 日主强弱详细分析
  chart: BaziChartData;
  solarTimeAdjusted: string; // The time actually used after adjustment
  solarTerm: string; // The Solar Term (Jie Qi) referencing the month
  fiveElements: {
    wood: number; // Percentage
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  analysis: {
    personality: AnalysisSection;
    career: AnalysisSection;
    wealth: AnalysisSection;
    relationships: AnalysisSection;
    health: AnalysisSection;
    globalFortune: AnalysisSection; // Replaced currentYearFortune with broader outlook
  };
  luckyElements: string[]; // Elements that help the chart (喜神)
  usefulElements?: string[]; // 用神
  unluckyElements: string[]; // 忌神
  enemyElements?: string[]; // 仇神
  elementAnalysis?: string; // 喜忌用神取用依据
  luckyColors: string[];
  luckyNumbers: string[];
  luckyDirections: string[];

  // 十神组合分析
  tenGodAnalysis?: TenGodAnalysis;

  // 刑冲合害分析
  relationsAnalysis?: RelationsAnalysis;

  // 新增字段
  trueSolarTimeInfo?: TrueSolarTimeInfo; // 真太阳时详情
  shichenWarning?: string;    // 时辰变化警告
  daYun?: DaYunInfo[];        // 大运信息 (10个大运)
  daYunStartAge?: number;     // 起运年龄
  currentDaYun?: DaYunInfo;   // 当前大运
  pattern?: PatternInfo;      // 格局信息
}

export interface UserInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthLocation: string; // City, Country for Solar Time
  latitude?: number; // Optional precise coords
  longitude?: number;
  gender: Gender;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}