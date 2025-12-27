import { UserInput, BaziResult, Pillar, BaziChartData, DaYunInfo, LiuNianInfo } from "../types";
// @ts-ignore
import { Solar, Lunar, EightChar } from "lunar-javascript";
import { calculateTrueSolarTime, checkShichenBoundary, TrueSolarTimeResult } from "../utils/trueSolarTime";
import {
  TIANYI_GUIREN, TAIJI_GUIREN, TIANDE, YUEDE, WENCHANG, GUOYIN, JINYU,
  TIANGUAN, FUXING, LUSHEN, YIMA, HUAGAI, JIANGXING, YANGREN, TAOHUA,
  HONGYAN, JIESHA, ZAISHA, WANGSHEN, GUCHEN, GUASU, TIANLUO, DIWANG,
  getShenShaInfo
} from "../knowledge/shensha";
import { determinePattern, judgeDayMasterStrength } from "../utils/pattern";
import { analyzeRelations, RelationResult } from "../utils/relations";

// API 端点 - 生产环境使用 Vercel Edge Function，开发环境可直接调用
const API_BASE_URL = import.meta.env.PROD ? '' : '';
const ANALYZE_API_URL = `${API_BASE_URL}/api/analyze`;
const CHAT_API_URL = `${API_BASE_URL}/api/chat`;

// 开发环境备用 (如果需要本地测试可使用)
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || "";
const USE_DIRECT_API = !import.meta.env.PROD && DEEPSEEK_API_KEY; // 开发时直接调用

// Store chat history for follow-up conversations
let chatHistory: Array<{ role: string; content: string }> = [];
let currentAnalysisData: BaziResult | null = null;

// 天干五行对应
const STEM_ELEMENTS: Record<string, string> = {
  "甲": "木", "乙": "木",
  "丙": "火", "丁": "火",
  "戊": "土", "己": "土",
  "庚": "金", "辛": "金",
  "壬": "水", "癸": "水"
};

// 地支五行对应
const BRANCH_ELEMENTS: Record<string, string> = {
  "子": "水", "丑": "土", "寅": "木", "卯": "木",
  "辰": "土", "巳": "火", "午": "火", "未": "土",
  "申": "金", "酉": "金", "戌": "土", "亥": "水"
};

// 地支藏干
const HIDDEN_STEMS: Record<string, string[]> = {
  "子": ["癸"],
  "丑": ["己", "癸", "辛"],
  "寅": ["甲", "丙", "戊"],
  "卯": ["乙"],
  "辰": ["戊", "乙", "癸"],
  "巳": ["丙", "庚", "戊"],
  "午": ["丁", "己"],
  "未": ["己", "丁", "乙"],
  "申": ["庚", "壬", "戊"],
  "酉": ["辛"],
  "戌": ["戊", "辛", "丁"],
  "亥": ["壬", "甲"]
};

// ==================== 神煞计算 (使用扩展知识库) ====================

// 计算神煞 - 扩展版 (20+种神煞)
function calculateShenSha(
  dayStem: string,
  dayBranch: string,
  yearBranch: string,
  monthBranch: string,
  allBranches: string[],
  gender: 'Male' | 'Female' = 'Male'
): {
  yearShenSha: string[];
  monthShenSha: string[];
  dayShenSha: string[];
  hourShenSha: string[];
} {
  const yearShenSha: string[] = [];
  const monthShenSha: string[] = [];
  const dayShenSha: string[] = [];
  const hourShenSha: string[] = [];

  const [yBranch, mBranch, dBranch, hBranch] = allBranches;

  // 检查每个地支的神煞
  allBranches.forEach((branch, index) => {
    const shenShaList: string[] = [];

    // ===== 吉神 =====

    // 天乙贵人（按日干查）
    if (TIANYI_GUIREN[dayStem]?.includes(branch)) {
      shenShaList.push("天乙贵人");
    }

    // 太极贵人（按日干查）
    if (TAIJI_GUIREN[dayStem]?.includes(branch)) {
      shenShaList.push("太极贵人");
    }

    // 文昌贵人（按日干查）
    if (WENCHANG[dayStem] === branch) {
      shenShaList.push("文昌");
    }

    // 国印贵人（按日干查）
    if (GUOYIN[dayStem] === branch) {
      shenShaList.push("国印");
    }

    // 金舆（按日干查）
    if (JINYU[dayStem] === branch) {
      shenShaList.push("金舆");
    }

    // 天官贵人（按日干查）
    if (TIANGUAN[dayStem] === branch) {
      shenShaList.push("天官");
    }

    // 福星贵人（按日干查）
    if (FUXING[dayStem] === branch) {
      shenShaList.push("福星");
    }

    // 禄神（按日干查）
    if (LUSHEN[dayStem] === branch) {
      shenShaList.push("禄神");
    }

    // 驿马（按年支或日支查）
    if (YIMA[yearBranch] === branch || YIMA[dayBranch] === branch) {
      shenShaList.push("驿马");
    }

    // 华盖（按年支或日支查）
    if (HUAGAI[yearBranch] === branch || HUAGAI[dayBranch] === branch) {
      shenShaList.push("华盖");
    }

    // 将星（按年支或日支查）
    if (JIANGXING[yearBranch] === branch || JIANGXING[dayBranch] === branch) {
      shenShaList.push("将星");
    }

    // ===== 凶神 =====

    // 羊刃（按日干查，阳干才有）
    if (YANGREN[dayStem] === branch) {
      shenShaList.push("羊刃");
    }

    // 桃花（按年支或日支查）
    if (TAOHUA[yearBranch] === branch || TAOHUA[dayBranch] === branch) {
      shenShaList.push("桃花");
    }

    // 红艳煞（按日干查）
    if (HONGYAN[dayStem] === branch) {
      shenShaList.push("红艳");
    }

    // 劫煞（按年支或日支查）
    if (JIESHA[yearBranch] === branch || JIESHA[dayBranch] === branch) {
      shenShaList.push("劫煞");
    }

    // 灾煞（按年支或日支查）
    if (ZAISHA[yearBranch] === branch || ZAISHA[dayBranch] === branch) {
      shenShaList.push("灾煞");
    }

    // 亡神（按年支或日支查）
    if (WANGSHEN[yearBranch] === branch || WANGSHEN[dayBranch] === branch) {
      shenShaList.push("亡神");
    }

    // 孤辰（按年支查）
    if (GUCHEN[yearBranch] === branch) {
      shenShaList.push("孤辰");
    }

    // 寡宿（按年支查）
    if (GUASU[yearBranch] === branch) {
      shenShaList.push("寡宿");
    }

    // 天罗（按日支查，主男命）
    if (index === 2 && TIANLUO[branch] && gender === 'Male') {
      shenShaList.push("天罗");
    }

    // 地网（按日支查，主女命）
    if (index === 2 && DIWANG[branch] && gender === 'Female') {
      shenShaList.push("地网");
    }

    // 分配到对应柱
    switch(index) {
      case 0: yearShenSha.push(...shenShaList); break;
      case 1: monthShenSha.push(...shenShaList); break;
      case 2: dayShenSha.push(...shenShaList); break;
      case 3: hourShenSha.push(...shenShaList); break;
    }
  });

  // 检查天德月德（按月支查，看是否在四柱中有对应天干）
  // 这些特殊神煞需要天干匹配，暂简化处理

  return { yearShenSha, monthShenSha, dayShenSha, hourShenSha };
}

// 计算地支藏干的十神
function getHiddenStemTenGods(dayStem: string, branch: string): string[] {
  const hiddenStems = HIDDEN_STEMS[branch] || [];
  return hiddenStems.map(stem => getTenGod(dayStem, stem)).filter(Boolean);
}

// 计算十神
function getTenGod(dayStem: string, targetStem: string): string {
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const dayIndex = stems.indexOf(dayStem);
  const targetIndex = stems.indexOf(targetStem);

  if (dayIndex === -1 || targetIndex === -1) return "";

  const dayYinYang = dayIndex % 2; // 0 = 阳, 1 = 阴
  const targetYinYang = targetIndex % 2;
  const sameYinYang = dayYinYang === targetYinYang;

  const dayElement = Math.floor(dayIndex / 2); // 0=木, 1=火, 2=土, 3=金, 4=水
  const targetElement = Math.floor(targetIndex / 2);

  // 计算五行关系
  // 生我: (target + 1) % 5 === day
  // 我生: (day + 1) % 5 === target
  // 克我: (target + 2) % 5 === day
  // 我克: (day + 2) % 5 === target
  // 同我: day === target

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

// 计算大运流年
function calculateDaYunLiuNian(
  solar: any,
  gender: 'Male' | 'Female',
  birthYear: number
): {
  daYunStartAge: number;
  daYun: DaYunInfo[];
  currentDaYun: DaYunInfo | null;
} {
  try {
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    // gender: 1=男, 0=女
    const genderNum = gender === 'Male' ? 1 : 0;
    // sect: 起运宗法 (2=按年干阴阳判断顺逆)
    const yun = eightChar.getYun(genderNum, 2);

    const startAge = yun.getStartYear();
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - birthYear + 1; // 虚岁

    // 获取10个大运
    const daYunList = yun.getDaYun();
    const daYunInfoList: DaYunInfo[] = [];
    let currentDaYun: DaYunInfo | null = null;

    for (let i = 0; i < Math.min(daYunList.length, 10); i++) {
      const dy = daYunList[i];
      const dyStartAge = dy.getStartAge();
      const dyEndAge = dy.getEndAge();
      const dyStartYear = birthYear + dyStartAge - 1;
      const dyEndYear = birthYear + dyEndAge - 1;

      // 获取该大运内的流年
      const liuNianList = dy.getLiuNian();
      const liuNianInfoList: LiuNianInfo[] = [];

      for (let j = 0; j < liuNianList.length; j++) {
        const ln = liuNianList[j];
        liuNianInfoList.push({
          year: ln.getYear(),
          age: ln.getAge(),
          ganZhi: ln.getGanZhi()
        });
      }

      const daYunInfo: DaYunInfo = {
        ganZhi: dy.getGanZhi(),
        startAge: dyStartAge,
        endAge: dyEndAge,
        startYear: dyStartYear,
        endYear: dyEndYear,
        liuNian: liuNianInfoList
      };

      daYunInfoList.push(daYunInfo);

      // 判断是否是当前大运
      if (currentAge >= dyStartAge && currentAge <= dyEndAge) {
        currentDaYun = daYunInfo;
      }
    }

    return {
      daYunStartAge: startAge,
      daYun: daYunInfoList,
      currentDaYun
    };
  } catch (error) {
    console.error('大运计算错误:', error);
    return {
      daYunStartAge: 0,
      daYun: [],
      currentDaYun: null
    };
  }
}

// 计算五行分布
function calculateFiveElements(chart: BaziChartData): {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
} {
  const counts: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };

  const pillars = [chart.year, chart.month, chart.day, chart.hour];
  for (const pillar of pillars) {
    if (pillar.stem && STEM_ELEMENTS[pillar.stem]) {
      counts[STEM_ELEMENTS[pillar.stem]]++;
    }
    if (pillar.branch && BRANCH_ELEMENTS[pillar.branch]) {
      counts[BRANCH_ELEMENTS[pillar.branch]]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return {
    wood: Math.round((counts["木"] / total) * 100),
    fire: Math.round((counts["火"] / total) * 100),
    earth: Math.round((counts["土"] / total) * 100),
    metal: Math.round((counts["金"] / total) * 100),
    water: Math.round((counts["水"] / total) * 100)
  };
}

// 使用 lunar-javascript 精确计算八字
function calculateBaziChart(birthDate: string, birthTime: string, longitude?: number): {
  chart: BaziChartData;
  dayStem: string;
  solarTerm: string;
  lunarDate: string;
  trueSolarTimeInfo: TrueSolarTimeResult | null;
  shichenWarning: string | null;
} {
  const [year, month, day] = birthDate.split("-").map(Number);
  let [hour, minute] = birthTime.split(":").map(Number);

  // 真太阳时计算
  let trueSolarTimeInfo: TrueSolarTimeResult | null = null;
  let shichenWarning: string | null = null;
  let actualTime = birthTime;

  if (longitude !== undefined && longitude !== null) {
    const birthDateObj = new Date(year, month - 1, day);
    trueSolarTimeInfo = calculateTrueSolarTime(birthTime, longitude, birthDateObj);
    actualTime = trueSolarTimeInfo.trueSolarTime;
    shichenWarning = checkShichenBoundary(birthTime, actualTime);

    // 使用真太阳时
    [hour, minute] = actualTime.split(":").map(Number);
  }

  // 创建阳历对象 (使用真太阳时)
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);

  // 获取八字
  const eightChar = solar.getLunar().getEightChar();

  // 获取四柱
  const yearGanZhi = eightChar.getYear();
  const monthGanZhi = eightChar.getMonth();
  const dayGanZhi = eightChar.getDay();
  const hourGanZhi = eightChar.getTime();

  const yearStem = eightChar.getYearGan();
  const yearBranch = eightChar.getYearZhi();
  const monthStem = eightChar.getMonthGan();
  const monthBranch = eightChar.getMonthZhi();
  const dayStem = eightChar.getDayGan();
  const dayBranch = eightChar.getDayZhi();
  const hourStem = eightChar.getTimeGan();
  const hourBranch = eightChar.getTimeZhi();

  // 获取纳音
  const yearNaYin = eightChar.getYearNaYin();
  const monthNaYin = eightChar.getMonthNaYin();
  const dayNaYin = eightChar.getDayNaYin();
  const hourNaYin = eightChar.getTimeNaYin();

  // 获取节气
  const lunar = solar.getLunar();
  const jieQi = lunar.getPrevJieQi();
  const solarTerm = jieQi ? `${jieQi.getName()}` : "";

  // 计算神煞 (使用扩展神煞库)
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
  const { yearShenSha, monthShenSha, dayShenSha, hourShenSha } = calculateShenSha(
    dayStem, dayBranch, yearBranch, monthBranch, allBranches
  );

  // 构建四柱 (含藏干十神)
  const chart: BaziChartData = {
    year: {
      stem: yearStem,
      branch: yearBranch,
      element: yearNaYin,
      gods: [getTenGod(dayStem, yearStem)].filter(Boolean),
      hiddenStems: HIDDEN_STEMS[yearBranch] || [],
      hiddenStemGods: getHiddenStemTenGods(dayStem, yearBranch),
      shenSha: yearShenSha
    },
    month: {
      stem: monthStem,
      branch: monthBranch,
      element: monthNaYin,
      gods: [getTenGod(dayStem, monthStem)].filter(Boolean),
      hiddenStems: HIDDEN_STEMS[monthBranch] || [],
      hiddenStemGods: getHiddenStemTenGods(dayStem, monthBranch),
      shenSha: monthShenSha
    },
    day: {
      stem: dayStem,
      branch: dayBranch,
      element: dayNaYin,
      gods: ["日主"],
      hiddenStems: HIDDEN_STEMS[dayBranch] || [],
      hiddenStemGods: getHiddenStemTenGods(dayStem, dayBranch),
      shenSha: dayShenSha
    },
    hour: {
      stem: hourStem,
      branch: hourBranch,
      element: hourNaYin,
      gods: [getTenGod(dayStem, hourStem)].filter(Boolean),
      hiddenStems: HIDDEN_STEMS[hourBranch] || [],
      hiddenStemGods: getHiddenStemTenGods(dayStem, hourBranch),
      shenSha: hourShenSha
    }
  };

  return {
    chart,
    dayStem,
    solarTerm,
    lunarDate: lunar.toString(),
    trueSolarTimeInfo,
    shichenWarning
  };
}

export const generateBaziAnalysis = async (input: UserInput): Promise<BaziResult> => {
  // 使用 lunar-javascript 精确计算八字
  const { chart, dayStem, solarTerm, lunarDate, trueSolarTimeInfo, shichenWarning } = calculateBaziChart(
    input.birthDate,
    input.birthTime,
    input.longitude
  );

  const fiveElements = calculateFiveElements(chart);
  const dayMasterElement = STEM_ELEMENTS[dayStem] || "未知";

  // 计算大运流年
  const [birthYear] = input.birthDate.split("-").map(Number);
  const solar = Solar.fromYmdHms(
    birthYear,
    parseInt(input.birthDate.split("-")[1]),
    parseInt(input.birthDate.split("-")[2]),
    parseInt((trueSolarTimeInfo?.trueSolarTime || input.birthTime).split(":")[0]),
    parseInt((trueSolarTimeInfo?.trueSolarTime || input.birthTime).split(":")[1]),
    0
  );
  const { daYunStartAge, daYun, currentDaYun } = calculateDaYunLiuNian(solar, input.gender, birthYear);

  // 计算格局
  const patternInfo = determinePattern(dayStem, chart);

  // 构建八字字符串用于 AI 分析
  const baziString = `${chart.year.stem}${chart.year.branch} ${chart.month.stem}${chart.month.branch} ${chart.day.stem}${chart.day.branch} ${chart.hour.stem}${chart.hour.branch}`;

  const locationString = input.latitude && input.longitude
    ? `${input.birthLocation} (经度: ${input.longitude})`
    : input.birthLocation;

  // 构建大运信息字符串
  const currentDaYunStr = currentDaYun
    ? `当前大运: ${currentDaYun.ganZhi} (${currentDaYun.startAge}-${currentDaYun.endAge}岁)`
    : "";
  const daYunListStr = daYun.slice(0, 5).map(d =>
    `${d.ganZhi}(${d.startAge}-${d.endAge}岁)`
  ).join(" → ");

  // 构建藏干十神信息
  const hiddenGodsStr = [
    `年支藏干十神: ${chart.year.hiddenStemGods?.join(",") || "无"}`,
    `月支藏干十神: ${chart.month.hiddenStemGods?.join(",") || "无"}`,
    `日支藏干十神: ${chart.day.hiddenStemGods?.join(",") || "无"}`,
    `时支藏干十神: ${chart.hour.hiddenStemGods?.join(",") || "无"}`
  ].join("\n    ");

  // 构建神煞信息
  const allShenSha = [
    ...chart.year.shenSha || [],
    ...chart.month.shenSha || [],
    ...chart.day.shenSha || [],
    ...chart.hour.shenSha || []
  ];
  const shenShaStr = [...new Set(allShenSha)].join("、") || "无明显神煞";

  // 计算刑冲合害
  const relations = analyzeRelations(
    chart.year.stem, chart.year.branch,
    chart.month.stem, chart.month.branch,
    chart.day.stem, chart.day.branch,
    chart.hour.stem, chart.hour.branch
  );

  // 构建十神配置分析
  const allGods = [
    ...chart.year.gods,
    ...chart.month.gods,
    ...chart.hour.gods,
    ...(chart.year.hiddenStemGods || []),
    ...(chart.month.hiddenStemGods || []),
    ...(chart.day.hiddenStemGods || []),
    ...(chart.hour.hiddenStemGods || [])
  ].filter(g => g && g !== "日主");

  const godCount: Record<string, number> = {};
  allGods.forEach(g => { godCount[g] = (godCount[g] || 0) + 1; });
  const godDistribution = Object.entries(godCount)
    .sort((a, b) => b[1] - a[1])
    .map(([god, count]) => `${god}×${count}`)
    .join("、");

  // 专业版 AI Prompt - 深度命理分析
  const prompt = `
# 角色定位
你是一位精通子平八字命理的资深命理师，师承盲派与传统子平两大流派，拥有40年实战经验。
你的分析特点：
- 严谨专业：每个结论必须有明确的命理依据，引用具体的干支组合
- 层次分明：先定格局、再论喜忌、后断吉凶
- 细致入微：关注藏干透出、十神配置、刑冲合害的微妙作用
- 实用可行：建议要具体到行业、方位、时间节点

# 命主基本信息
- 姓名: ${input.name}
- 性别: ${input.gender === 'Male' ? '乾造（男命）' : '坤造（女命）'}
- 出生: ${input.birthDate} ${trueSolarTimeInfo ? trueSolarTimeInfo.trueSolarTime : input.birthTime}
- 真太阳时: ${trueSolarTimeInfo ? `已校正（${trueSolarTimeInfo.explanation}）` : "未校正"}
- 出生地: ${locationString}
- 农历: ${lunarDate}
- 节气: ${solarTerm}（月令以节气为准）

# 八字命盘（已精确计算）

## 四柱排盘
\`\`\`
        年柱      月柱      日柱      时柱
天干    ${chart.year.stem}        ${chart.month.stem}        ${chart.day.stem}        ${chart.hour.stem}
地支    ${chart.year.branch}        ${chart.month.branch}        ${chart.day.branch}        ${chart.hour.branch}
纳音    ${chart.year.element}    ${chart.month.element}    ${chart.day.element}    ${chart.hour.element}
\`\`\`

## 十神配置
- 年干 ${chart.year.stem}: ${chart.year.gods.join("") || "—"}
- 月干 ${chart.month.stem}: ${chart.month.gods.join("") || "—"}（月令提纲）
- 日干 ${chart.day.stem}: 日主
- 时干 ${chart.hour.stem}: ${chart.hour.gods.join("") || "—"}

## 藏干与藏干十神
- 年支 ${chart.year.branch} 藏: ${chart.year.hiddenStems?.join("、") || "—"} → 十神: ${chart.year.hiddenStemGods?.join("、") || "—"}
- 月支 ${chart.month.branch} 藏: ${chart.month.hiddenStems?.join("、") || "—"} → 十神: ${chart.month.hiddenStemGods?.join("、") || "—"}（月令藏干最重要）
- 日支 ${chart.day.branch} 藏: ${chart.day.hiddenStems?.join("、") || "—"} → 十神: ${chart.day.hiddenStemGods?.join("、") || "—"}（日支为夫妻宫）
- 时支 ${chart.hour.branch} 藏: ${chart.hour.hiddenStems?.join("、") || "—"} → 十神: ${chart.hour.hiddenStemGods?.join("、") || "—"}

## 十神分布统计
${godDistribution || "需分析"}

## 五行力量分布
木 ${fiveElements.wood}% | 火 ${fiveElements.fire}% | 土 ${fiveElements.earth}% | 金 ${fiveElements.metal}% | 水 ${fiveElements.water}%

# 命局结构分析（已计算）

## 格局判定
- **主格局**: ${patternInfo.mainPattern}
- **辅格局**: ${patternInfo.subPatterns.join("、") || "无"}
- **格局说明**: ${patternInfo.description}
- **格局层次**: ${patternInfo.level === 'high' ? '上格（贵格）' : patternInfo.level === 'medium' ? '中格' : '普通格局'}

## 刑冲合害关系
${relations.summary}
${relations.tianganHe.length > 0 ? `- 天干合: ${relations.tianganHe.map(h => `${h.stems.join("")}合化${h.element}（${h.position}柱）`).join("、")}` : ""}
${relations.liuHe.length > 0 ? `- 地支六合: ${relations.liuHe.map(h => `${h.branches.join("")}合${h.element}（${h.position}柱）`).join("、")}` : ""}
${relations.sanHe.length > 0 ? `- 三合局: ${relations.sanHe.map(h => `${h.branches.join("")}${h.complete ? "三合" : "半合"}${h.element}局`).join("、")}` : ""}
${relations.sanHui.length > 0 ? `- 三会局: ${relations.sanHui.map(h => `${h.branches.join("")}三会${h.element}局`).join("、")}` : ""}
${relations.liuChong.length > 0 ? `- 六冲: ${relations.liuChong.map(c => `${c.branches.join("")}冲（${c.position}柱）`).join("、")}` : ""}
${relations.liuHai.length > 0 ? `- 六害: ${relations.liuHai.map(h => `${h.branches.join("")}害（${h.position}柱）`).join("、")}` : ""}
${relations.xing.length > 0 ? `- 刑: ${relations.xing.map(x => `${x.branches.join("")}${x.type}`).join("、")}` : ""}

## 空亡
- 日柱空亡: ${relations.kongWang.join("、") || "无"}
${relations.kongWangPositions.length > 0 ? `- 命中空亡: ${relations.kongWangPositions.map(k => `${k.position}支${k.branch}落空亡`).join("、")}` : ""}

## 神煞
- 年柱: ${chart.year.shenSha?.join("、") || "无"}
- 月柱: ${chart.month.shenSha?.join("、") || "无"}
- 日柱: ${chart.day.shenSha?.join("、") || "无"}
- 时柱: ${chart.hour.shenSha?.join("、") || "无"}

# 大运信息
- 起运: ${daYunStartAge}岁
- ${currentDaYunStr}
- 大运序列: ${daYunListStr}
${daYun.slice(0, 8).map((d, i) => `  ${i + 1}. ${d.ganZhi}运 (${d.startAge}-${d.endAge}岁, ${d.startYear}-${d.endYear}年)`).join("\n")}

# 分析要求（重要！）

请按照以下框架进行**严谨、专业、深入**的分析：

## 第一步：定日主强弱
1. 月令（${chart.month.branch}）对日主${dayStem}${dayMasterElement}的作用（得令/失令/平和）
2. 四柱干支对日主的生扶克泄情况
3. 地支藏干的根气分析
4. 综合判断：身强/身弱/中和/从格

## 第二步：定喜忌用神
1. 根据日主强弱和格局需求确定喜用神
2. 说明取用依据（扶抑/通关/调候/从势）
3. 明确忌神和仇神

## 第三步：十神组合分析
分析命局中重要的十神组合及其含义：
- 食伤生财：有无此组合？对财运的影响
- 官印相生：有无此组合？对事业的影响
- 伤官见官：有无此组合？如何化解
- 财官印的配置：是否得当

## 第四步：刑冲合害的具体影响
${relations.summary ? `针对命局中存在的 "${relations.summary}"，分析其对命主各方面的具体影响` : "命局较为平和"}

## 第五步：神煞的实际应用
结合命局喜忌分析神煞的实际作用（吉神逢生为吉，凶神逢制为吉）

## 第六步：大运流年预测
- 2025乙巳年：详细分析（结合当前大运${currentDaYun?.ganZhi || ""}）
- 2026丙午年：详细分析
- 2027丁未年：详细分析
- 2028戊申年：详细分析

## 输出要求
每个分析点必须引用具体的干支组合作为依据，不要空泛议论。
例如："月令${chart.month.branch}为日主${dayStem}的X地，日主失令；但年干${chart.year.stem}为X，时支${chart.hour.branch}藏X，日主得X帮扶，综合判断身X偏X。"

请以 JSON 格式输出，结构如下：
{
  "strength": "身强/身弱/中和/从X格",
  "strengthAnalysis": "日主强弱的详细分析依据（引用具体干支）",
  "luckyElements": ["喜神五行"],
  "usefulElements": ["用神五行"],
  "unluckyElements": ["忌神五行"],
  "enemyElements": ["仇神五行"],
  "elementAnalysis": "喜忌用神的取用依据",
  "luckyColors": ["幸运颜色及原因"],
  "luckyNumbers": ["幸运数字及原因"],
  "luckyDirections": ["幸运方位及原因"],
  "tenGodAnalysis": {
    "mainCombination": "主要十神组合（如食伤生财、官印相生）",
    "characteristics": ["十神配置特点分析"],
    "advantages": ["十神组合带来的优势"],
    "disadvantages": ["十神组合的不足"]
  },
  "relationsAnalysis": {
    "summary": "刑冲合害总体评价",
    "details": ["各组刑冲合害的具体影响"]
  },
  "analysis": {
    "personality": {
      "title": "性格命理分析",
      "summary": "性格特点概述（基于日主和十神）",
      "details": ["详细分析点（每点需有命理依据）"],
      "strengths": ["性格优势"],
      "weaknesses": ["性格弱点"],
      "advice": ["针对性的改善建议"],
      "score": 75
    },
    "career": {
      "title": "事业官运分析",
      "summary": "事业格局概述",
      "details": ["详细分析点（分析官星、印星配置）"],
      "suitableIndustries": ["适合的行业（基于喜用神五行）"],
      "unsuitableIndustries": ["不适合的行业"],
      "predictions": ["2025年事业...", "2026年事业...", "2027年...", "2028年..."],
      "advice": ["事业发展建议"],
      "score": 70
    },
    "wealth": {
      "title": "财运分析",
      "summary": "财运格局概述（正财偏财配置）",
      "details": ["详细分析点（分析财星与日主关系）"],
      "wealthType": "正财型/偏财型/财官双美型",
      "predictions": ["2025年财运...", "2026年财运...", "2027年...", "2028年..."],
      "advice": ["理财投资建议"],
      "score": 68
    },
    "relationships": {
      "title": "感情婚姻分析",
      "summary": "婚姻宫位分析（日支为夫妻宫）",
      "details": ["详细分析点（分析配偶星和婚姻宫）"],
      "spouseCharacteristics": ["配偶特征推断"],
      "marriageTiming": "适婚年龄段",
      "predictions": ["2025年感情...", "2026年感情...", "2027年...", "2028年..."],
      "advice": ["感情婚姻建议"],
      "score": 72
    },
    "health": {
      "title": "健康分析",
      "summary": "健康总体评价（基于五行偏枯）",
      "details": ["详细分析点（五行过旺或不及对应的脏腑）"],
      "weakOrgans": ["易出问题的脏腑器官"],
      "preventionAdvice": ["养生保健建议"],
      "advice": ["健康调理建议"],
      "score": 65
    },
    "globalFortune": {
      "title": "大运流年综合预测",
      "summary": "整体命运走势概述",
      "details": ["命局层次分析", "一生运势起伏规律"],
      "currentLuckPillar": "当前大运${currentDaYun?.ganZhi || ""}分析",
      "predictions": [
        "2025乙巳年：（蛇年，天干乙木，地支巳火）...",
        "2026丙午年：（马年，天干丙火，地支午火）...",
        "2027丁未年：（羊年，天干丁火，地支未土）...",
        "2028戊申年：（猴年，天干戊土，地支申金）..."
      ],
      "keyYears": ["人生关键转折年份"],
      "score": 70
    }
  }
}
`;

  try {
    const messages = [
      {
        role: "system",
        content: "你是一位专业的八字命理大师，精通传统命理学。请只输出 JSON 格式，不要包含 markdown 代码块标记。"
      },
      {
        role: "user",
        content: prompt
      }
    ];

    // 使用流式请求避免超时
    const response = USE_DIRECT_API
      ? await fetch(DEEPSEEK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages,
            temperature: 0.3,
            stream: true
          })
        })
      : await fetch(ANALYZE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            temperature: 0.3,
            stream: true
          })
        });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API response error:", response.status, errorData);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let resultText = "";
    let buffer = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 保留不完整的行

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                resultText += content;
              }
            } catch (e) {
              // 忽略解析错误，可能是不完整的 JSON
            }
          }
        }
      }
    }

    if (!resultText) {
      console.error("No result text received from API");
      throw new Error("AI 未能生成结果。");
    }

    // 尝试提取 JSON（AI 可能返回带有其他文本的响应）
    let aiAnalysis;
    try {
      // 先尝试直接解析
      aiAnalysis = JSON.parse(resultText);
    } catch (e) {
      // 尝试提取 JSON 部分
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error("Failed to parse JSON:", resultText.substring(0, 500));
          throw new Error("AI 返回的格式无法解析");
        }
      } else {
        console.error("No JSON found in response:", resultText.substring(0, 500));
        throw new Error("AI 返回的格式无法解析");
      }
    }

    // 合并精确计算的八字和 AI 分析结果
    const data: BaziResult = {
      dayMaster: dayStem,
      dayMasterElement: dayMasterElement,
      strength: aiAnalysis.strength || "待分析",
      strengthAnalysis: aiAnalysis.strengthAnalysis || "",
      solarTimeAdjusted: trueSolarTimeInfo?.trueSolarTime || input.birthTime,
      solarTerm: solarTerm,
      // 真太阳时信息
      trueSolarTimeInfo: trueSolarTimeInfo ? {
        trueSolarTime: trueSolarTimeInfo.trueSolarTime,
        originalTime: trueSolarTimeInfo.originalTime,
        totalCorrection: trueSolarTimeInfo.totalCorrection,
        longitudeCorrection: trueSolarTimeInfo.longitudeCorrection,
        equationOfTime: trueSolarTimeInfo.equationOfTime,
        explanation: trueSolarTimeInfo.explanation
      } : undefined,
      shichenWarning: shichenWarning || undefined,
      chart: {
        year: {
          ...chart.year,
          shenSha: chart.year.shenSha || []
        },
        month: {
          ...chart.month,
          shenSha: chart.month.shenSha || []
        },
        day: {
          ...chart.day,
          shenSha: chart.day.shenSha || []
        },
        hour: {
          ...chart.hour,
          shenSha: chart.hour.shenSha || []
        }
      },
      fiveElements: fiveElements,
      // 喜忌用神
      luckyElements: aiAnalysis.luckyElements || [],
      usefulElements: aiAnalysis.usefulElements || [],
      unluckyElements: aiAnalysis.unluckyElements || [],
      enemyElements: aiAnalysis.enemyElements || [],
      elementAnalysis: aiAnalysis.elementAnalysis || "",
      luckyColors: aiAnalysis.luckyColors || [],
      luckyNumbers: aiAnalysis.luckyNumbers || [],
      luckyDirections: aiAnalysis.luckyDirections || [],
      // 十神组合分析
      tenGodAnalysis: aiAnalysis.tenGodAnalysis || undefined,
      // 刑冲合害分析
      relationsAnalysis: aiAnalysis.relationsAnalysis || {
        summary: relations.summary,
        details: []
      },
      analysis: aiAnalysis.analysis || {},
      // 大运流年信息
      daYunStartAge,
      daYun,
      currentDaYun: currentDaYun || undefined,
      // 格局信息
      pattern: patternInfo
    };

    // Store for chat session
    currentAnalysisData = data;
    chatHistory = [
      {
        role: "system",
        content: `你是一位八字命理大师。你已经分析了这个命盘: ${JSON.stringify(data)}.
            用户姓名: ${input.name}.
            请用简体中文回答。
            回答要专业、具体、有建设性。关注五行的相互作用。`
      }
    ];

    return data;
  } catch (error) {
    console.error("Bazi Analysis Error:", error);
    throw error;
  }
};

export const chatWithMaster = async (message: string): Promise<string> => {
  if (!currentAnalysisData || chatHistory.length === 0) {
    return "请先完成八字排盘分析，贫道方能为您解惑。";
  }

  chatHistory.push({
    role: "user",
    content: message
  });

  try {
    // 根据环境选择 API 调用方式
    const response = USE_DIRECT_API
      ? await fetch(DEEPSEEK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: chatHistory,
            temperature: 0.7
          })
        })
      : await fetch(CHAT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatHistory })
        });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    const assistantMessage = result.choices?.[0]?.message?.content || "天机暂不可泄露。";

    chatHistory.push({
      role: "assistant",
      content: assistantMessage
    });

    return assistantMessage;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};
