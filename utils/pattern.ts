/**
 * 格局判定模块
 * 根据八字命局判断格局类型
 */

import { BaziChartData, PatternInfo } from "../types";

// 天干列表
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// 天干五行
const STEM_ELEMENTS: Record<string, string> = {
  "甲": "木", "乙": "木",
  "丙": "火", "丁": "火",
  "戊": "土", "己": "土",
  "庚": "金", "辛": "金",
  "壬": "水", "癸": "水"
};

// 地支五行
const BRANCH_ELEMENTS: Record<string, string> = {
  "子": "水", "丑": "土", "寅": "木", "卯": "木",
  "辰": "土", "巳": "火", "午": "火", "未": "土",
  "申": "金", "酉": "金", "戌": "土", "亥": "水"
};

// 地支藏干（本气）
const HIDDEN_MAIN_STEM: Record<string, string> = {
  "子": "癸", "丑": "己", "寅": "甲", "卯": "乙",
  "辰": "戊", "巳": "丙", "午": "丁", "未": "己",
  "申": "庚", "酉": "辛", "戌": "戊", "亥": "壬"
};

// 禄神表
const LUSHEN: Record<string, string> = {
  "甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳",
  "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子"
};

// 羊刃表
const YANGREN: Record<string, string> = {
  "甲": "卯", "丙": "午", "戊": "午",
  "庚": "酉", "壬": "子"
};

// 月令旺相休囚死判断
const MONTH_POWER: Record<string, Record<string, number>> = {
  // 寅卯月 - 木旺
  "寅": { "木": 5, "火": 4, "水": 3, "金": 2, "土": 1 },
  "卯": { "木": 5, "火": 4, "水": 3, "金": 2, "土": 1 },
  // 巳午月 - 火旺
  "巳": { "火": 5, "土": 4, "木": 3, "水": 2, "金": 1 },
  "午": { "火": 5, "土": 4, "木": 3, "水": 2, "金": 1 },
  // 申酉月 - 金旺
  "申": { "金": 5, "水": 4, "土": 3, "火": 2, "木": 1 },
  "酉": { "金": 5, "水": 4, "土": 3, "火": 2, "木": 1 },
  // 亥子月 - 水旺
  "亥": { "水": 5, "金": 4, "木": 3, "土": 2, "火": 1 },
  "子": { "水": 5, "金": 4, "木": 3, "土": 2, "火": 1 },
  // 辰戌丑未月 - 土旺
  "辰": { "土": 5, "火": 4, "金": 3, "木": 2, "水": 1 },
  "戌": { "土": 5, "火": 4, "金": 3, "木": 2, "水": 1 },
  "丑": { "土": 5, "金": 4, "水": 3, "木": 2, "火": 1 },
  "未": { "土": 5, "火": 4, "木": 3, "水": 2, "金": 1 }
};

/**
 * 计算十神
 */
function getTenGod(dayStem: string, targetStem: string): string {
  const dayIndex = STEMS.indexOf(dayStem);
  const targetIndex = STEMS.indexOf(targetStem);

  if (dayIndex === -1 || targetIndex === -1) return "";

  const dayYinYang = dayIndex % 2;
  const targetYinYang = targetIndex % 2;
  const sameYinYang = dayYinYang === targetYinYang;

  const dayElement = Math.floor(dayIndex / 2);
  const targetElement = Math.floor(targetIndex / 2);

  if (dayElement === targetElement) {
    return sameYinYang ? "比肩" : "劫财";
  } else if ((targetElement + 1) % 5 === dayElement) {
    return sameYinYang ? "偏印" : "正印";
  } else if ((dayElement + 1) % 5 === targetElement) {
    return sameYinYang ? "食神" : "伤官";
  } else if ((targetElement + 2) % 5 === dayElement) {
    return sameYinYang ? "七杀" : "正官";
  } else if ((dayElement + 2) % 5 === targetElement) {
    return sameYinYang ? "偏财" : "正财";
  }

  return "";
}

/**
 * 判断日主强弱
 */
export function judgeDayMasterStrength(
  dayStem: string,
  chart: BaziChartData
): 'strong' | 'weak' | 'balanced' {
  const dayElement = STEM_ELEMENTS[dayStem];
  const monthBranch = chart.month.branch;

  // 月令力量
  const monthPower = MONTH_POWER[monthBranch]?.[dayElement] || 3;

  // 统计帮身力量
  let helpPower = 0;
  let drainPower = 0;

  const allStems = [chart.year.stem, chart.month.stem, chart.hour.stem];
  const allBranches = [chart.year.branch, chart.month.branch, chart.day.branch, chart.hour.branch];

  // 天干分析
  for (const stem of allStems) {
    const tenGod = getTenGod(dayStem, stem);
    if (["比肩", "劫财", "正印", "偏印"].includes(tenGod)) {
      helpPower += 1;
    } else {
      drainPower += 1;
    }
  }

  // 地支分析（看本气）
  for (const branch of allBranches) {
    const mainStem = HIDDEN_MAIN_STEM[branch];
    const tenGod = getTenGod(dayStem, mainStem);
    if (["比肩", "劫财", "正印", "偏印"].includes(tenGod)) {
      helpPower += 0.7;
    } else {
      drainPower += 0.7;
    }
  }

  // 综合判断
  const totalHelp = helpPower + (monthPower >= 4 ? 2 : 0);
  const totalDrain = drainPower + (monthPower <= 2 ? 2 : 0);

  if (totalHelp > totalDrain + 1.5) {
    return 'strong';
  } else if (totalDrain > totalHelp + 1.5) {
    return 'weak';
  } else {
    return 'balanced';
  }
}

/**
 * 判断格局
 */
export function determinePattern(
  dayStem: string,
  chart: BaziChartData
): PatternInfo {
  const monthBranch = chart.month.branch;
  const monthMainStem = HIDDEN_MAIN_STEM[monthBranch];
  const monthTenGod = getTenGod(dayStem, monthMainStem);

  const patterns: string[] = [];
  let mainPattern = "普通格局";
  let description = "";
  let level: 'high' | 'medium' | 'low' = 'medium';

  // 判断日主强弱
  const strength = judgeDayMasterStrength(dayStem, chart);

  // ========== 正格判断 ==========

  // 正官格
  if (monthTenGod === "正官") {
    patterns.push("正官格");
    description = "月令正官，主人正直有威望，适合从政或管理工作。";
  }

  // 七杀格
  if (monthTenGod === "七杀") {
    patterns.push("七杀格");
    description = "月令七杀，主人有魄力决断力，适合军警法律或开拓性工作。";
  }

  // 正印格
  if (monthTenGod === "正印") {
    patterns.push("正印格");
    description = "月令正印，主人聪慧有学问，适合教育文化或学术研究。";
  }

  // 偏印格
  if (monthTenGod === "偏印") {
    patterns.push("偏印格");
    description = "月令偏印，主人思维独特，适合技术研发或艺术创作。";
  }

  // 食神格
  if (monthTenGod === "食神") {
    patterns.push("食神格");
    description = "月令食神，主人温和有才华，适合餐饮、艺术或服务业。";
  }

  // 伤官格
  if (monthTenGod === "伤官") {
    patterns.push("伤官格");
    description = "月令伤官，主人聪明机智，适合律师、技术或创新行业。";
  }

  // 正财格
  if (monthTenGod === "正财") {
    patterns.push("正财格");
    description = "月令正财，主人务实勤恳，适合财务、商业或实业。";
  }

  // 偏财格
  if (monthTenGod === "偏财") {
    patterns.push("偏财格");
    description = "月令偏财，主人灵活善于交际，适合贸易、投资或公关。";
  }

  // ========== 特殊格局 ==========

  // 建禄格
  if (LUSHEN[dayStem] === monthBranch) {
    patterns.push("建禄格");
    description = "月令建禄，日主得禄，自立自强，一生衣食无忧。";
    level = 'high';
  }

  // 阳刃格
  if (YANGREN[dayStem] === monthBranch) {
    patterns.push("阳刃格");
    description = "月令羊刃，日主极强，性格刚烈，需要七杀制衡。";
    level = 'high';
  }

  // 比肩/劫财格（月令比劫）
  if (monthTenGod === "比肩" || monthTenGod === "劫财") {
    patterns.push("比劫格");
    description = "月令比劫，日主得助，性格独立，宜自主创业。";
  }

  // ========== 从格判断 ==========

  if (strength === 'weak') {
    // 检查是否可以成从格
    const allTenGods = getAllTenGods(dayStem, chart);
    const hasNoHelp = !allTenGods.some(g => ["比肩", "劫财", "正印", "偏印"].includes(g));

    if (hasNoHelp) {
      // 从财格
      if (allTenGods.filter(g => ["正财", "偏财"].includes(g)).length >= 3) {
        patterns.unshift("从财格");
        description = "日主极弱无根，从财格，主人善于理财，财运亨通。";
        level = 'high';
      }
      // 从杀格
      else if (allTenGods.filter(g => ["七杀", "正官"].includes(g)).length >= 3) {
        patterns.unshift("从杀格");
        description = "日主极弱无根，从杀格，主人有权势，适合从政或管理。";
        level = 'high';
      }
      // 从儿格
      else if (allTenGods.filter(g => ["食神", "伤官"].includes(g)).length >= 3) {
        patterns.unshift("从儿格");
        description = "日主极弱无根，从儿格，主人才华横溢，艺术造诣高。";
        level = 'high';
      }
    }
  }

  // ========== 专旺格判断 ==========

  if (strength === 'strong') {
    const dayElement = STEM_ELEMENTS[dayStem];
    const allElements = getAllElements(chart);
    const sameElementCount = allElements.filter(e => e === dayElement).length;

    // 专旺格（一行独旺）
    if (sameElementCount >= 6) {
      const wangNames: Record<string, string> = {
        "木": "曲直格", "火": "炎上格", "土": "稼穑格",
        "金": "从革格", "水": "润下格"
      };
      patterns.unshift(wangNames[dayElement] || "专旺格");
      description = `日主极强，${dayElement}气专旺，格局高贵，一生成就非凡。`;
      level = 'high';
    }
  }

  // 确定主格局
  if (patterns.length > 0) {
    mainPattern = patterns[0];
  }

  // 如果没有特殊格局，根据月令十神确定
  if (patterns.length === 0 && monthTenGod) {
    mainPattern = `${monthTenGod}格`;
    description = `月令${monthTenGod}，格局中等，发展稳健。`;
  }

  return {
    mainPattern,
    subPatterns: patterns.slice(1),
    description,
    level
  };
}

/**
 * 获取所有十神
 */
function getAllTenGods(dayStem: string, chart: BaziChartData): string[] {
  const gods: string[] = [];
  const stems = [chart.year.stem, chart.month.stem, chart.hour.stem];

  for (const stem of stems) {
    const god = getTenGod(dayStem, stem);
    if (god) gods.push(god);
  }

  const branches = [chart.year.branch, chart.month.branch, chart.day.branch, chart.hour.branch];
  for (const branch of branches) {
    const mainStem = HIDDEN_MAIN_STEM[branch];
    const god = getTenGod(dayStem, mainStem);
    if (god) gods.push(god);
  }

  return gods;
}

/**
 * 获取所有五行
 */
function getAllElements(chart: BaziChartData): string[] {
  const elements: string[] = [];

  const stems = [chart.year.stem, chart.month.stem, chart.day.stem, chart.hour.stem];
  const branches = [chart.year.branch, chart.month.branch, chart.day.branch, chart.hour.branch];

  for (const stem of stems) {
    elements.push(STEM_ELEMENTS[stem]);
  }

  for (const branch of branches) {
    elements.push(BRANCH_ELEMENTS[branch]);
  }

  return elements;
}

/**
 * 格局解释库
 */
export const PATTERN_DESCRIPTIONS: Record<string, {
  meaning: string;
  career: string[];
  personality: string;
  advice: string;
}> = {
  "正官格": {
    meaning: "官星得令，主人正直有威望",
    career: ["政府机关", "企业管理", "公务员", "法官"],
    personality: "为人正直，有责任感，重视规则",
    advice: "适合从事管理或行政工作，可考虑公职"
  },
  "七杀格": {
    meaning: "杀星得令，主人有魄力决断力",
    career: ["军警", "律师", "外科医生", "运动员"],
    personality: "果断有魄力，敢于冒险，有领导力",
    advice: "适合开拓性工作，需注意控制脾气"
  },
  "正印格": {
    meaning: "印星得令，主人聪慧有学问",
    career: ["教师", "学者", "作家", "顾问"],
    personality: "仁慈善良，好学深思，有耐心",
    advice: "适合教育文化领域，可往学术方向发展"
  },
  "偏印格": {
    meaning: "枭印得令，主人思维独特",
    career: ["技术研发", "医药", "宗教", "艺术"],
    personality: "独立思考，创意丰富，有悟性",
    advice: "适合专业技术领域，可发展特长"
  },
  "食神格": {
    meaning: "食神得令，主人温和有才华",
    career: ["餐饮", "艺术", "娱乐", "教育"],
    personality: "温和乐观，有艺术天赋，享受生活",
    advice: "适合服务业或创意行业，保持乐观心态"
  },
  "伤官格": {
    meaning: "伤官得令，主人聪明机智",
    career: ["律师", "记者", "技术", "创业"],
    personality: "聪明伶俐，口才好，有创新精神",
    advice: "适合需要创新的行业，注意人际关系"
  },
  "正财格": {
    meaning: "财星得令，主人务实勤恳",
    career: ["财务", "银行", "商业", "房地产"],
    personality: "务实稳重，勤俭持家，有理财能力",
    advice: "适合财务商业领域，可稳步积累财富"
  },
  "偏财格": {
    meaning: "偏财得令，主人灵活善交际",
    career: ["贸易", "投资", "公关", "销售"],
    personality: "灵活机变，人脉广泛，善于交际",
    advice: "适合需要人际交往的行业，可尝试投资"
  },
  "建禄格": {
    meaning: "月令建禄，日主得禄自强",
    career: ["自主创业", "专业技术", "自由职业"],
    personality: "独立自主，自力更生，不依赖他人",
    advice: "适合自主创业或专业工作，靠自己打拼"
  },
  "阳刃格": {
    meaning: "月令羊刃，日主极强刚烈",
    career: ["军警", "外科", "竞技体育", "金融"],
    personality: "性格刚烈，意志坚定，有冲劲",
    advice: "需要有杀制刃，适合需要魄力的工作"
  }
};
