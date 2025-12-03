import { UserInput, BaziResult, Pillar, BaziChartData } from "../types";
// @ts-ignore
import { Solar, Lunar, EightChar } from "lunar-javascript";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || "";

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

// ==================== 神煞计算 ====================

// 天乙贵人表（按日干查）
const TIANYI_GUIREN: Record<string, string[]> = {
  "甲": ["丑", "未"], "戊": ["丑", "未"],
  "乙": ["子", "申"], "己": ["子", "申"],
  "丙": ["亥", "酉"], "丁": ["亥", "酉"],
  "庚": ["丑", "未"],
  "辛": ["寅", "午"],
  "壬": ["卯", "巳"], "癸": ["卯", "巳"]
};

// 文昌贵人表（按日干查）
const WENCHANG: Record<string, string> = {
  "甲": "巳", "乙": "午", "丙": "申", "丁": "酉", "戊": "申",
  "己": "酉", "庚": "亥", "辛": "子", "壬": "寅", "癸": "卯"
};

// 驿马表（按年支/日支查）
const YIMA: Record<string, string> = {
  "寅": "申", "午": "申", "戌": "申",  // 寅午戌见申为驿马
  "申": "寅", "子": "寅", "辰": "寅",  // 申子辰见寅为驿马
  "巳": "亥", "酉": "亥", "丑": "亥",  // 巳酉丑见亥为驿马
  "亥": "巳", "卯": "巳", "未": "巳"   // 亥卯未见巳为驿马
};

// 桃花表（按年支/日支查）
const TAOHUA: Record<string, string> = {
  "寅": "卯", "午": "卯", "戌": "卯",  // 寅午戌见卯为桃花
  "申": "酉", "子": "酉", "辰": "酉",  // 申子辰见酉为桃花
  "巳": "午", "酉": "午", "丑": "午",  // 巳酉丑见午为桃花
  "亥": "子", "卯": "子", "未": "子"   // 亥卯未见子为桃花
};

// 华盖表（按年支/日支查）
const HUAGAI: Record<string, string> = {
  "寅": "戌", "午": "戌", "戌": "戌",
  "申": "辰", "子": "辰", "辰": "辰",
  "巳": "丑", "酉": "丑", "丑": "丑",
  "亥": "未", "卯": "未", "未": "未"
};

// 羊刃表（按日干查）
const YANGREN: Record<string, string> = {
  "甲": "卯", "丙": "午", "戊": "午",
  "庚": "酉", "壬": "子"
};

// 禄神表（按日干查）
const LUSHEN: Record<string, string> = {
  "甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳",
  "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子"
};

// 计算神煞
function calculateShenSha(dayStem: string, dayBranch: string, yearBranch: string, allBranches: string[]): {
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

    // 天乙贵人
    if (TIANYI_GUIREN[dayStem]?.includes(branch)) {
      shenShaList.push("天乙贵人");
    }

    // 文昌
    if (WENCHANG[dayStem] === branch) {
      shenShaList.push("文昌");
    }

    // 驿马（按年支或日支查）
    if (YIMA[yearBranch] === branch || YIMA[dayBranch] === branch) {
      shenShaList.push("驿马");
    }

    // 桃花（按年支或日支查）
    if (TAOHUA[yearBranch] === branch || TAOHUA[dayBranch] === branch) {
      shenShaList.push("桃花");
    }

    // 华盖（按年支或日支查）
    if (HUAGAI[yearBranch] === branch || HUAGAI[dayBranch] === branch) {
      shenShaList.push("华盖");
    }

    // 羊刃
    if (YANGREN[dayStem] === branch) {
      shenShaList.push("羊刃");
    }

    // 禄神
    if (LUSHEN[dayStem] === branch) {
      shenShaList.push("禄神");
    }

    // 分配到对应柱
    switch(index) {
      case 0: yearShenSha.push(...shenShaList); break;
      case 1: monthShenSha.push(...shenShaList); break;
      case 2: dayShenSha.push(...shenShaList); break;
      case 3: hourShenSha.push(...shenShaList); break;
    }
  });

  return { yearShenSha, monthShenSha, dayShenSha, hourShenSha };
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

// 计算五行分布
function calculateFiveElements(chart: BaziChartData): Record<string, number> {
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
} {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);

  // 创建阳历对象
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

  // 计算神煞
  const allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
  const { yearShenSha, monthShenSha, dayShenSha, hourShenSha } = calculateShenSha(
    dayStem, dayBranch, yearBranch, allBranches
  );

  // 构建四柱
  const chart: BaziChartData = {
    year: {
      stem: yearStem,
      branch: yearBranch,
      element: yearNaYin,
      gods: [getTenGod(dayStem, yearStem)].filter(Boolean),
      hiddenStems: HIDDEN_STEMS[yearBranch] || [],
      shenSha: yearShenSha
    },
    month: {
      stem: monthStem,
      branch: monthBranch,
      element: monthNaYin,
      gods: [getTenGod(dayStem, monthStem)].filter(Boolean),
      hiddenStems: HIDDEN_STEMS[monthBranch] || [],
      shenSha: monthShenSha
    },
    day: {
      stem: dayStem,
      branch: dayBranch,
      element: dayNaYin,
      gods: ["日主"],
      hiddenStems: HIDDEN_STEMS[dayBranch] || [],
      shenSha: dayShenSha
    },
    hour: {
      stem: hourStem,
      branch: hourBranch,
      element: hourNaYin,
      gods: [getTenGod(dayStem, hourStem)].filter(Boolean),
      hiddenStems: HIDDEN_STEMS[hourBranch] || [],
      shenSha: hourShenSha
    }
  };

  return {
    chart,
    dayStem,
    solarTerm,
    lunarDate: lunar.toString()
  };
}

export const generateBaziAnalysis = async (input: UserInput): Promise<BaziResult> => {
  // 使用 lunar-javascript 精确计算八字
  const { chart, dayStem, solarTerm, lunarDate } = calculateBaziChart(
    input.birthDate,
    input.birthTime,
    input.longitude
  );

  const fiveElements = calculateFiveElements(chart);
  const dayMasterElement = STEM_ELEMENTS[dayStem] || "未知";

  // 构建八字字符串用于 AI 分析
  const baziString = `${chart.year.stem}${chart.year.branch} ${chart.month.stem}${chart.month.branch} ${chart.day.stem}${chart.day.branch} ${chart.hour.stem}${chart.hour.branch}`;

  const locationString = input.latitude && input.longitude
    ? `${input.birthLocation} (经度: ${input.longitude})`
    : input.birthLocation;

  // 让 AI 只做解读分析，不计算八字
  const prompt = `
    你是一位资深的八字命理大师。以下是已经通过专业排盘软件计算出的八字信息，请你进行深入的命理分析和解读。

    **用户信息：**
    - 姓名: ${input.name}
    - 性别: ${input.gender === 'Male' ? '男' : '女'}
    - 出生日期: ${input.birthDate}
    - 出生时间: ${input.birthTime}
    - 出生地点: ${locationString}
    - 农历: ${lunarDate}
    - 节气: ${solarTerm}

    **八字排盘结果（已精确计算）：**
    - 完整八字: ${baziString}
    - 年柱: ${chart.year.stem}${chart.year.branch} (${chart.year.element}) - 十神: ${chart.year.gods.join(",")}
    - 月柱: ${chart.month.stem}${chart.month.branch} (${chart.month.element}) - 十神: ${chart.month.gods.join(",")}
    - 日柱: ${chart.day.stem}${chart.day.branch} (${chart.day.element}) - 日主
    - 时柱: ${chart.hour.stem}${chart.hour.branch} (${chart.hour.element}) - 十神: ${chart.hour.gods.join(",")}
    - 日主: ${dayStem} (${dayMasterElement})
    - 五行分布: 木${fiveElements.wood}% 火${fiveElements.fire}% 土${fiveElements.earth}% 金${fiveElements.metal}% 水${fiveElements.water}%

    **请分析以下内容，全部使用简体中文输出：**

    1. **日主强弱判断**：根据月令、四柱干支分析日主的强弱
    2. **喜用神和忌神**：判断命局的喜用神和忌神
    3. **神煞分析**：计算主要的神煞（天乙贵人、文昌、驿马、桃花、华盖等）
    4. **性格分析**：根据日主和格局分析性格特点
    5. **事业分析**：分析适合的事业方向和发展建议
    6. **财运分析**：分析财运特点和理财建议
    7. **感情分析**：分析感情婚姻运势
    8. **健康分析**：根据五行分析需要注意的健康问题
    9. **未来运势**：2025-2028年的流年运势预测
    10. **开运建议**：幸运颜色、幸运数字、幸运方位

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
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一位专业的八字命理大师，精通传统命理学。请只输出 JSON 格式，不要包含 markdown 代码块标记。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
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
      solarTimeAdjusted: input.birthTime,
      solarTerm: solarTerm,
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
      analysis: aiAnalysis.analysis || {}
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
    const response = await fetch(DEEPSEEK_API_URL, {
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
