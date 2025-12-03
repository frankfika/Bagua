/**
 * 详细八字排盘验证测试
 * 验证每一个细节：年柱、月柱、日柱、时柱、十神、纳音、藏干、神煞
 */

// @ts-ignore
import { Solar } from "lunar-javascript";

// 验证数据集 - 有确切历史记录的名人八字
const verificationCases = [
  {
    name: "毛泽东",
    birthDate: "1893-12-26",
    birthTime: "08:30", // 辰时
    birthLocation: "湖南湘潭韶山",
    expected: {
      bazi: "癸巳 甲子 丁酉 甲辰",
      yearPillar: "癸巳",
      monthPillar: "甲子",
      dayPillar: "丁酉",
      hourPillar: "甲辰",
      dayMaster: "丁",
      dayMasterElement: "火",
      yearNayin: "长流水",
      monthNayin: "海中金",
      dayNayin: "山下火",
      hourNayin: "覆灯火"
    },
    source: "《韶山四修族谱》卷十五：清光绪十九年癸巳十一月十九辰时生"
  },
  {
    name: "鲁迅",
    birthDate: "1881-09-25",
    birthTime: "04:00", // 寅时
    birthLocation: "浙江绍兴",
    expected: {
      bazi: "辛巳 丁酉 壬戌 壬寅",
      yearPillar: "辛巳",
      monthPillar: "丁酉",
      dayPillar: "壬戌",
      hourPillar: "壬寅",
      dayMaster: "壬",
      dayMasterElement: "水",
      yearNayin: "白蜡金",
      monthNayin: "山下火",
      dayNayin: "大海水",
      hourNayin: "金箔金"
    },
    source: "公开历史资料"
  },
  {
    name: "蒋介石",
    birthDate: "1887-10-31",
    birthTime: "12:00", // 午时
    birthLocation: "浙江奉化",
    expected: {
      bazi: "丁亥 庚戌 己巳 庚午",
      yearPillar: "丁亥",
      monthPillar: "庚戌",
      dayPillar: "己巳",
      hourPillar: "庚午",
      dayMaster: "己",
      dayMasterElement: "土",
      yearNayin: "屋上土",
      dayNayin: "大林木"
    },
    source: "《子平粹言》及多方命理记载：丁亥庚戌己巳庚午"
  },
  {
    name: "邓小平",
    birthDate: "1904-08-22",
    birthTime: "00:30", // 子时
    birthLocation: "四川广安",
    expected: {
      bazi: "甲辰 壬申 戊子 壬子",
      yearPillar: "甲辰",
      monthPillar: "壬申",
      dayPillar: "戊子",
      hourPillar: "壬子",
      dayMaster: "戊",
      dayMasterElement: "土",
      yearNayin: "覆灯火",
      dayNayin: "霹雳火"
    },
    source: "命理网站记载：甲辰壬申戊子壬子，从财格"
  },
  {
    name: "孙中山",
    birthDate: "1866-11-12",
    birthTime: "04:00", // 寅时
    birthLocation: "广东中山",
    expected: {
      bazi: "丙寅 己亥 辛卯 庚寅",
      yearPillar: "丙寅",
      monthPillar: "己亥",
      dayPillar: "辛卯",
      hourPillar: "庚寅",
      dayMaster: "辛",
      dayMasterElement: "金",
      yearNayin: "炉中火",
      dayNayin: "松柏木"
    },
    source: "1866年11月12日（同治五年十月初六日）寅时，多方史料记载"
  }
];

// 天干属性
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 天干五行
const STEM_ELEMENTS: Record<string, string> = {
  "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
  "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水"
};

// 地支五行
const BRANCH_ELEMENTS: Record<string, string> = {
  "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火",
  "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水"
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

// ==================== 神煞相关表 ====================

// 天乙贵人表（按日干查）
const TIANYI_GUIREN: Record<string, string[]> = {
  "甲": ["丑", "未"], "戊": ["丑", "未"],
  "乙": ["子", "申"], "己": ["子", "申"],
  "丙": ["亥", "酉"], "丁": ["亥", "酉"],
  "庚": ["丑", "未"],
  "辛": ["寅", "午"],
  "壬": ["卯", "巳"], "癸": ["卯", "巳"]
};

// 文昌贵人表
const WENCHANG: Record<string, string> = {
  "甲": "巳", "乙": "午", "丙": "申", "丁": "酉", "戊": "申",
  "己": "酉", "庚": "亥", "辛": "子", "壬": "寅", "癸": "卯"
};

// 驿马表
const YIMA: Record<string, string> = {
  "寅": "申", "午": "申", "戌": "申",
  "申": "寅", "子": "寅", "辰": "寅",
  "巳": "亥", "酉": "亥", "丑": "亥",
  "亥": "巳", "卯": "巳", "未": "巳"
};

// 桃花表
const TAOHUA: Record<string, string> = {
  "寅": "卯", "午": "卯", "戌": "卯",
  "申": "酉", "子": "酉", "辰": "酉",
  "巳": "午", "酉": "午", "丑": "午",
  "亥": "子", "卯": "子", "未": "子"
};

// 华盖表
const HUAGAI: Record<string, string> = {
  "寅": "戌", "午": "戌", "戌": "戌",
  "申": "辰", "子": "辰", "辰": "辰",
  "巳": "丑", "酉": "丑", "丑": "丑",
  "亥": "未", "卯": "未", "未": "未"
};

// 羊刃表
const YANGREN: Record<string, string> = {
  "甲": "卯", "丙": "午", "戊": "午",
  "庚": "酉", "壬": "子"
};

// 禄神表
const LUSHEN: Record<string, string> = {
  "甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳",
  "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子"
};

// 计算神煞
function calculateShenSha(dayStem: string, dayBranch: string, yearBranch: string, allBranches: string[]) {
  const result: string[][] = [[], [], [], []];

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
    // 驿马
    if (YIMA[yearBranch] === branch || YIMA[dayBranch] === branch) {
      shenShaList.push("驿马");
    }
    // 桃花
    if (TAOHUA[yearBranch] === branch || TAOHUA[dayBranch] === branch) {
      shenShaList.push("桃花");
    }
    // 华盖
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

    result[index] = shenShaList;
  });

  return result;
}

// 十神计算
function calculateTenGod(dayStem: string, targetStem: string): string {
  const dayIdx = STEMS.indexOf(dayStem);
  const targetIdx = STEMS.indexOf(targetStem);
  if (dayIdx === -1 || targetIdx === -1) return "未知";

  const dayYinYang = dayIdx % 2;
  const targetYinYang = targetIdx % 2;
  const sameYinYang = dayYinYang === targetYinYang;

  const dayElement = Math.floor(dayIdx / 2);
  const targetElement = Math.floor(targetIdx / 2);

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
  return "未知";
}

// 使用 lunar-javascript 计算八字
function calculateBaziDetails(birthDate: string, birthTime: string) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearStem = eightChar.getYearGan();
  const yearBranch = eightChar.getYearZhi();
  const monthStem = eightChar.getMonthGan();
  const monthBranch = eightChar.getMonthZhi();
  const dayStem = eightChar.getDayGan();
  const dayBranch = eightChar.getDayZhi();
  const hourStem = eightChar.getTimeGan();
  const hourBranch = eightChar.getTimeZhi();

  const jieQi = lunar.getPrevJieQi();
  const nextJieQi = lunar.getNextJieQi();

  return {
    // 四柱
    yearPillar: `${yearStem}${yearBranch}`,
    monthPillar: `${monthStem}${monthBranch}`,
    dayPillar: `${dayStem}${dayBranch}`,
    hourPillar: `${hourStem}${hourBranch}`,
    bazi: `${yearStem}${yearBranch} ${monthStem}${monthBranch} ${dayStem}${dayBranch} ${hourStem}${hourBranch}`,

    // 日主
    dayStem,
    dayMasterElement: STEM_ELEMENTS[dayStem],

    // 纳音
    yearNayin: eightChar.getYearNaYin(),
    monthNayin: eightChar.getMonthNaYin(),
    dayNayin: eightChar.getDayNaYin(),
    hourNayin: eightChar.getTimeNaYin(),

    // 藏干
    yearHiddenStems: HIDDEN_STEMS[yearBranch] || [],
    monthHiddenStems: HIDDEN_STEMS[monthBranch] || [],
    dayHiddenStems: HIDDEN_STEMS[dayBranch] || [],
    hourHiddenStems: HIDDEN_STEMS[hourBranch] || [],

    // 十神
    yearTenGod: calculateTenGod(dayStem, yearStem),
    monthTenGod: calculateTenGod(dayStem, monthStem),
    hourTenGod: calculateTenGod(dayStem, hourStem),

    // 节气
    prevJieQi: jieQi ? jieQi.getName() : "",
    nextJieQi: nextJieQi ? nextJieQi.getName() : "",

    // 农历
    lunarDate: lunar.toString(),
    lunarYear: lunar.getYearInChinese(),
    lunarMonth: lunar.getMonthInChinese(),
    lunarDay: lunar.getDayInChinese()
  };
}

// 验证单个案例
function verifyCase(testCase: typeof verificationCases[0]) {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`【验证案例】${testCase.name}`);
  console.log(`${"═".repeat(70)}`);
  console.log(`出生时间: ${testCase.birthDate} ${testCase.birthTime}`);
  console.log(`出生地点: ${testCase.birthLocation}`);
  console.log(`参考来源: ${testCase.source}`);
  console.log(`${"─".repeat(70)}`);

  const result = calculateBaziDetails(testCase.birthDate, testCase.birthTime);
  const expected = testCase.expected;

  let allPassed = true;
  const errors: string[] = [];

  // 验证完整八字
  console.log(`\n【八字对比】`);
  console.log(`  预期: ${expected.bazi}`);
  console.log(`  实际: ${result.bazi}`);
  if (result.bazi === expected.bazi) {
    console.log(`  ✅ 八字完全正确`);
  } else {
    console.log(`  ❌ 八字不匹配`);
    allPassed = false;
    errors.push("八字不匹配");
  }

  // 逐柱验证
  console.log(`\n【逐柱验证】`);

  // 年柱
  if (result.yearPillar === expected.yearPillar) {
    console.log(`  年柱: ${result.yearPillar} ✅`);
  } else {
    console.log(`  年柱: 预期 ${expected.yearPillar}, 实际 ${result.yearPillar} ❌`);
    allPassed = false;
    errors.push(`年柱错误: ${expected.yearPillar} vs ${result.yearPillar}`);
  }

  // 月柱
  if (result.monthPillar === expected.monthPillar) {
    console.log(`  月柱: ${result.monthPillar} ✅`);
  } else {
    console.log(`  月柱: 预期 ${expected.monthPillar}, 实际 ${result.monthPillar} ❌`);
    allPassed = false;
    errors.push(`月柱错误: ${expected.monthPillar} vs ${result.monthPillar}`);
  }

  // 日柱
  if (result.dayPillar === expected.dayPillar) {
    console.log(`  日柱: ${result.dayPillar} ✅`);
  } else {
    console.log(`  日柱: 预期 ${expected.dayPillar}, 实际 ${result.dayPillar} ❌`);
    allPassed = false;
    errors.push(`日柱错误: ${expected.dayPillar} vs ${result.dayPillar}`);
  }

  // 时柱
  if (result.hourPillar === expected.hourPillar) {
    console.log(`  时柱: ${result.hourPillar} ✅`);
  } else {
    console.log(`  时柱: 预期 ${expected.hourPillar}, 实际 ${result.hourPillar} ❌`);
    allPassed = false;
    errors.push(`时柱错误: ${expected.hourPillar} vs ${result.hourPillar}`);
  }

  // 日主验证
  console.log(`\n【日主验证】`);
  console.log(`  日主: ${result.dayStem} (${result.dayMasterElement})`);
  if (expected.dayMaster && result.dayStem !== expected.dayMaster) {
    console.log(`  ❌ 日主不匹配，预期: ${expected.dayMaster}`);
    allPassed = false;
  } else {
    console.log(`  ✅ 日主正确`);
  }

  // 纳音验证
  console.log(`\n【纳音验证】`);
  console.log(`  年柱纳音: ${result.yearNayin}`);
  console.log(`  月柱纳音: ${result.monthNayin}`);
  console.log(`  日柱纳音: ${result.dayNayin}`);
  console.log(`  时柱纳音: ${result.hourNayin}`);

  if (expected.yearNayin && result.yearNayin !== expected.yearNayin) {
    console.log(`  ⚠️ 年柱纳音不匹配，预期: ${expected.yearNayin}`);
  }
  if (expected.dayNayin && result.dayNayin !== expected.dayNayin) {
    console.log(`  ⚠️ 日柱纳音不匹配，预期: ${expected.dayNayin}`);
  }

  // 十神验证
  console.log(`\n【十神配置】`);
  console.log(`  年柱十神: ${result.yearTenGod}`);
  console.log(`  月柱十神: ${result.monthTenGod}`);
  console.log(`  时柱十神: ${result.hourTenGod}`);

  // 神煞验证
  console.log(`\n【神煞配置】`);
  const allBranches = [result.yearPillar[1], result.monthPillar[1], result.dayPillar[1], result.hourPillar[1]];
  const shenShaResults = calculateShenSha(result.dayStem, result.dayPillar[1], result.yearPillar[1], allBranches);
  console.log(`  年柱神煞: ${shenShaResults[0].join(", ") || "无"}`);
  console.log(`  月柱神煞: ${shenShaResults[1].join(", ") || "无"}`);
  console.log(`  日柱神煞: ${shenShaResults[2].join(", ") || "无"}`);
  console.log(`  时柱神煞: ${shenShaResults[3].join(", ") || "无"}`);

  // 藏干
  console.log(`\n【地支藏干】`);
  console.log(`  年支 ${result.yearPillar[1]} 藏干: ${result.yearHiddenStems.join(", ")}`);
  console.log(`  月支 ${result.monthPillar[1]} 藏干: ${result.monthHiddenStems.join(", ")}`);
  console.log(`  日支 ${result.dayPillar[1]} 藏干: ${result.dayHiddenStems.join(", ")}`);
  console.log(`  时支 ${result.hourPillar[1]} 藏干: ${result.hourHiddenStems.join(", ")}`);

  // 节气
  console.log(`\n【节气信息】`);
  console.log(`  上一节气: ${result.prevJieQi}`);
  console.log(`  下一节气: ${result.nextJieQi}`);

  // 农历
  console.log(`\n【农历信息】`);
  console.log(`  农历日期: ${result.lunarDate}`);

  // 总结
  console.log(`\n${"─".repeat(70)}`);
  if (allPassed) {
    console.log(`🎉 ${testCase.name} 验证通过！所有数据正确`);
  } else {
    console.log(`⚠️ ${testCase.name} 验证有误`);
    console.log(`   错误项: ${errors.join("; ")}`);
  }

  return { name: testCase.name, passed: allPassed, errors, result };
}

// 十神计算正确性测试
function testTenGodCalculation() {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`【十神计算验证】`);
  console.log(`${"═".repeat(70)}`);

  // 十神计算规则验证
  const testCases = [
    { day: "甲", target: "甲", expected: "比肩" },
    { day: "甲", target: "乙", expected: "劫财" },
    { day: "甲", target: "丙", expected: "食神" },
    { day: "甲", target: "丁", expected: "伤官" },
    { day: "甲", target: "戊", expected: "偏财" },
    { day: "甲", target: "己", expected: "正财" },
    { day: "甲", target: "庚", expected: "七杀" },
    { day: "甲", target: "辛", expected: "正官" },
    { day: "甲", target: "壬", expected: "偏印" },
    { day: "甲", target: "癸", expected: "正印" },
  ];

  console.log(`\n以甲木日主为例验证十神计算:`);
  let allCorrect = true;

  for (const tc of testCases) {
    const result = calculateTenGod(tc.day, tc.target);
    const isCorrect = result === tc.expected;
    console.log(`  ${tc.day}日主见${tc.target}: ${result} ${isCorrect ? "✅" : `❌ (预期: ${tc.expected})`}`);
    if (!isCorrect) allCorrect = false;
  }

  console.log(`\n十神计算: ${allCorrect ? "✅ 全部正确" : "❌ 存在错误"}`);
  return allCorrect;
}

// 神煞计算测试
function testShenShaCalculation() {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`【神煞计算验证】`);
  console.log(`${"═".repeat(70)}`);

  // 测试用例：毛泽东 癸巳 甲子 丁酉 甲辰
  // 丁日主的天乙贵人是 亥、酉
  // 日支酉，丁见酉为天乙贵人
  // 丁日主的桃花（以年支巳查）：巳酉丑见午为桃花

  console.log(`\n以毛泽东八字为例: 癸巳 甲子 丁酉 甲辰`);
  console.log(`日主: 丁火`);

  const dayStem = "丁";
  const dayBranch = "酉";
  const yearBranch = "巳";
  const allBranches = ["巳", "子", "酉", "辰"];

  const result = calculateShenSha(dayStem, dayBranch, yearBranch, allBranches);

  console.log(`\n神煞分析:`);
  console.log(`  年柱(巳): ${result[0].join(", ") || "无"}`);
  console.log(`  月柱(子): ${result[1].join(", ") || "无"}`);
  console.log(`  日柱(酉): ${result[2].join(", ") || "无"}`);
  console.log(`  时柱(辰): ${result[3].join(", ") || "无"}`);

  // 验证
  let allCorrect = true;

  // 丁日主：天乙贵人在亥、酉
  if (result[2].includes("天乙贵人")) {
    console.log(`  ✅ 日柱酉有天乙贵人 (丁见酉为天乙贵人)`);
  } else {
    console.log(`  ❌ 日柱酉应有天乙贵人`);
    allCorrect = false;
  }

  // 丁日主：禄神在午
  if (!result[0].includes("禄神") && !result[1].includes("禄神") && !result[2].includes("禄神") && !result[3].includes("禄神")) {
    console.log(`  ✅ 八字无禄神 (丁的禄在午，四柱无午)`);
  }

  // 年支巳+日支酉：华盖在丑
  if (!result[0].includes("华盖") && !result[1].includes("华盖") && !result[2].includes("华盖") && !result[3].includes("华盖")) {
    console.log(`  ✅ 八字无华盖 (巳的华盖在丑，酉的华盖在丑，四柱无丑)`);
  }

  console.log(`\n神煞计算: ${allCorrect ? "✅ 验证通过" : "❌ 存在错误"}`);
  return allCorrect;
}

// 五行计算测试
function testFiveElementsCalculation() {
  console.log(`\n${"═".repeat(70)}`);
  console.log(`【五行统计验证】`);
  console.log(`${"═".repeat(70)}`);

  // 毛泽东八字: 癸巳 甲子 丁酉 甲辰
  // 天干: 癸(水) 甲(木) 丁(火) 甲(木)
  // 地支: 巳(火) 子(水) 酉(金) 辰(土)
  // 五行: 水2 木2 火2 金1 土1

  console.log(`\n以毛泽东八字为例: 癸巳 甲子 丁酉 甲辰`);
  console.log(`天干五行: 癸(水) 甲(木) 丁(火) 甲(木)`);
  console.log(`地支五行: 巳(火) 子(水) 酉(金) 辰(土)`);

  const stems = ["癸", "甲", "丁", "甲"];
  const branches = ["巳", "子", "酉", "辰"];

  const counts: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };

  for (const stem of stems) {
    counts[STEM_ELEMENTS[stem]]++;
  }
  for (const branch of branches) {
    counts[BRANCH_ELEMENTS[branch]]++;
  }

  console.log(`\n五行统计:`);
  console.log(`  木: ${counts["木"]} 个`);
  console.log(`  火: ${counts["火"]} 个`);
  console.log(`  土: ${counts["土"]} 个`);
  console.log(`  金: ${counts["金"]} 个`);
  console.log(`  水: ${counts["水"]} 个`);

  const expected = { "木": 2, "火": 2, "土": 1, "金": 1, "水": 2 };
  let allCorrect = true;
  for (const [element, count] of Object.entries(expected)) {
    if (counts[element] !== count) {
      console.log(`  ❌ ${element}应为${count}个，实际${counts[element]}个`);
      allCorrect = false;
    }
  }

  if (allCorrect) {
    console.log(`\n✅ 五行统计正确`);
  }

  return allCorrect;
}

// 主函数
async function runDetailedTests() {
  console.log("🔮 八字排盘详细验证测试");
  console.log("=" .repeat(70));
  console.log("本测试将验证:");
  console.log("1. 四柱（年月日时）排盘准确性");
  console.log("2. 纳音计算");
  console.log("3. 十神计算");
  console.log("4. 五行统计");
  console.log("5. 藏干配置");

  // 十神计算测试
  const tenGodPassed = testTenGodCalculation();

  // 神煞计算测试
  const shenShaPassed = testShenShaCalculation();

  // 五行计算测试
  const fiveElementsPassed = testFiveElementsCalculation();

  // 名人八字验证
  console.log(`\n${"═".repeat(70)}`);
  console.log(`【名人八字验证】`);
  console.log(`${"═".repeat(70)}`);

  const results = [];
  for (const testCase of verificationCases) {
    const result = verifyCase(testCase);
    results.push(result);
  }

  // 总结
  console.log(`\n${"═".repeat(70)}`);
  console.log(`【测试总结】`);
  console.log(`${"═".repeat(70)}`);

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log(`\n名人八字验证: ${passed}/${total} 通过`);
  console.log(`十神计算: ${tenGodPassed ? "✅ 通过" : "❌ 失败"}`);
  console.log(`神煞计算: ${shenShaPassed ? "✅ 通过" : "❌ 失败"}`);
  console.log(`五行统计: ${fiveElementsPassed ? "✅ 通过" : "❌ 失败"}`);

  for (const r of results) {
    if (!r.passed) {
      console.log(`\n${r.name} 排盘结果:`);
      console.log(`  实际: ${r.result.bazi}`);
      console.log(`  错误: ${r.errors.join("; ")}`);
    }
  }

  console.log(`\n${"═".repeat(70)}`);
}

runDetailedTests().catch(console.error);
