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

  // 专业版 AI Prompt - 混合模式（默认通俗，带专业解释）
  const prompt = `
# 角色定位
你是一位精通子平八字命理的资深命理师，拥有40年实战经验。你的分析特点：
- 表达方式：通俗易懂，但关键处使用专业术语并附解释
- 分析深度：从命局结构、格局、十神配置等维度系统分析
- 判断依据：每个结论都要说明推导依据，让用户理解"为什么"

# 命主信息
- 姓名: ${input.name}
- 性别: ${input.gender === 'Male' ? '乾造（男）' : '坤造（女）'}
- 出生日期: ${input.birthDate}
- 出生时间: ${trueSolarTimeInfo ? `${trueSolarTimeInfo.trueSolarTime}（真太阳时，${trueSolarTimeInfo.explanation}）` : input.birthTime}
- 出生地点: ${locationString}
- 农历: ${lunarDate}
- 节气: ${solarTerm}

# 八字排盘（已精确计算）
**四柱干支：** ${baziString}
- 年柱: ${chart.year.stem}${chart.year.branch} (${chart.year.element}) | 天干十神: ${chart.year.gods.join(",")} | 藏干: ${chart.year.hiddenStems?.join(",")}
- 月柱: ${chart.month.stem}${chart.month.branch} (${chart.month.element}) | 天干十神: ${chart.month.gods.join(",")} | 藏干: ${chart.month.hiddenStems?.join(",")}
- 日柱: ${chart.day.stem}${chart.day.branch} (${chart.day.element}) | 日主 | 藏干: ${chart.day.hiddenStems?.join(",")}
- 时柱: ${chart.hour.stem}${chart.hour.branch} (${chart.hour.element}) | 天干十神: ${chart.hour.gods.join(",")} | 藏干: ${chart.hour.hiddenStems?.join(",")}

**藏干十神：**
    ${hiddenGodsStr}

**日主信息：** ${dayStem}${dayMasterElement}日主
**五行分布：** 木${fiveElements.wood}% 火${fiveElements.fire}% 土${fiveElements.earth}% 金${fiveElements.metal}% 水${fiveElements.water}%

# 格局判定（已计算）
- 主格局: ${patternInfo.mainPattern}
- 辅助格局: ${patternInfo.subPatterns.join("、") || "无"}
- 格局说明: ${patternInfo.description}

# 神煞（已计算）
${shenShaStr}

# 大运信息
- 起运年龄: ${daYunStartAge}岁起运
- ${currentDaYunStr}
- 大运轨迹: ${daYunListStr}

# 分析要求

请基于以上信息进行深入分析。注意：
1. **日主强弱**：结合月令（${chart.month.branch}月）、四柱干支综合判断
2. **喜忌用神**：根据日主强弱和格局需求，明确说明取用依据
3. **每个结论必须说明依据**：例如"因月令${chart.month.branch}为X，日主得/失令，故判断身强/弱"
4. **流年预测需具体**：2025-2028年逐年分析，结合大运和流年干支
5. **建议要实用可行**：不要笼统的"多休息"，要具体到方向/行业/时间

    请以 JSON 格式输出，结构如下：
    {
      "strength": "日主强弱判断（如：身强/身弱/中和）",
      "luckyElements": ["喜用神五行"],
      "unluckyElements": ["忌神五行"],
      "luckyColors": ["幸运颜色"],
      "luckyNumbers": ["幸运数字"],
      "luckyDirections": ["幸运方位"],
      "shenSha": {
        "year": ["年柱神煞"],
        "month": ["月柱神煞"],
        "day": ["日柱神煞"],
        "hour": ["时柱神煞"]
      },
      "analysis": {
        "personality": {
          "title": "性格分析",
          "summary": "性格概述",
          "details": ["详细分析点"],
          "advice": ["性格建议"],
          "score": 0-100分
        },
        "career": {
          "title": "事业运势",
          "summary": "事业概述",
          "details": ["详细分析点"],
          "predictions": ["2025年...", "2026年..."],
          "advice": ["事业建议"],
          "score": 0-100分
        },
        "wealth": {
          "title": "财运分析",
          "summary": "财运概述",
          "details": ["详细分析点"],
          "predictions": ["2025年...", "2026年..."],
          "advice": ["理财建议"],
          "score": 0-100分
        },
        "relationships": {
          "title": "感情婚姻",
          "summary": "感情概述",
          "details": ["详细分析点"],
          "predictions": ["2025年...", "2026年..."],
          "advice": ["感情建议"],
          "score": 0-100分
        },
        "health": {
          "title": "健康运势",
          "summary": "健康概述",
          "details": ["详细分析点"],
          "advice": ["健康建议"],
          "score": 0-100分
        },
        "globalFortune": {
          "title": "综合运势",
          "summary": "整体运势概述",
          "details": ["详细分析点"],
          "predictions": ["2025年...", "2026年...", "2027年...", "2028年..."],
          "score": 0-100分
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
            messages,
            temperature: 0.3,
            response_format: { type: "json_object" }
          })
        })
      : await fetch(ANALYZE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            temperature: 0.3,
            response_format: { type: "json_object" }
          })
        });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    const resultText = result.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error("AI 未能生成结果。");
    }

    const aiAnalysis = JSON.parse(resultText);

    // 合并精确计算的八字和 AI 分析结果
    const data: BaziResult = {
      dayMaster: dayStem,
      dayMasterElement: dayMasterElement,
      strength: aiAnalysis.strength || "待分析",
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
          shenSha: aiAnalysis.shenSha?.year || []
        },
        month: {
          ...chart.month,
          shenSha: aiAnalysis.shenSha?.month || []
        },
        day: {
          ...chart.day,
          shenSha: aiAnalysis.shenSha?.day || []
        },
        hour: {
          ...chart.hour,
          shenSha: aiAnalysis.shenSha?.hour || []
        }
      },
      fiveElements: fiveElements,
      luckyElements: aiAnalysis.luckyElements || [],
      unluckyElements: aiAnalysis.unluckyElements || [],
      luckyColors: aiAnalysis.luckyColors || [],
      luckyNumbers: aiAnalysis.luckyNumbers || [],
      luckyDirections: aiAnalysis.luckyDirections || [],
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
