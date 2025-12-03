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
}

export interface BaziResult {
  dayMaster: string; // The Day Stem
  dayMasterElement: string; // Wood, Fire, Earth, Metal, Water
  strength: string; // Weak, Strong, Balanced, etc.
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
  luckyElements: string[]; // Elements that help the chart
  unluckyElements: string[];
  luckyColors: string[];
  luckyNumbers: string[];
  luckyDirections: string[];
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