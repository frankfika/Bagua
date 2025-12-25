/**
 * 地支刑冲合害计算模块
 * 用于分析八字命局中的地支关系
 */

// ==================== 六合 ====================
// 子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土
export const LIUHE: Record<string, { pair: string; element: string }> = {
  "子": { pair: "丑", element: "土" },
  "丑": { pair: "子", element: "土" },
  "寅": { pair: "亥", element: "木" },
  "亥": { pair: "寅", element: "木" },
  "卯": { pair: "戌", element: "火" },
  "戌": { pair: "卯", element: "火" },
  "辰": { pair: "酉", element: "金" },
  "酉": { pair: "辰", element: "金" },
  "巳": { pair: "申", element: "水" },
  "申": { pair: "巳", element: "水" },
  "午": { pair: "未", element: "土" },
  "未": { pair: "午", element: "土" },
};

// ==================== 三合局 ====================
// 申子辰合水局、亥卯未合木局、寅午戌合火局、巳酉丑合金局
export const SANHE: { branches: string[]; element: string }[] = [
  { branches: ["申", "子", "辰"], element: "水" },
  { branches: ["亥", "卯", "未"], element: "木" },
  { branches: ["寅", "午", "戌"], element: "火" },
  { branches: ["巳", "酉", "丑"], element: "金" },
];

// ==================== 三会局 ====================
// 寅卯辰会木局、巳午未会火局、申酉戌会金局、亥子丑会水局
export const SANHUI: { branches: string[]; element: string }[] = [
  { branches: ["寅", "卯", "辰"], element: "木" },
  { branches: ["巳", "午", "未"], element: "火" },
  { branches: ["申", "酉", "戌"], element: "金" },
  { branches: ["亥", "子", "丑"], element: "水" },
];

// ==================== 六冲 ====================
// 子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲
export const LIUCHONG: Record<string, string> = {
  "子": "午", "午": "子",
  "丑": "未", "未": "丑",
  "寅": "申", "申": "寅",
  "卯": "酉", "酉": "卯",
  "辰": "戌", "戌": "辰",
  "巳": "亥", "亥": "巳",
};

// ==================== 六害 ====================
// 子未害、丑午害、寅巳害、卯辰害、申亥害、酉戌害
export const LIUHAI: Record<string, string> = {
  "子": "未", "未": "子",
  "丑": "午", "午": "丑",
  "寅": "巳", "巳": "寅",
  "卯": "辰", "辰": "卯",
  "申": "亥", "亥": "申",
  "酉": "戌", "戌": "酉",
};

// ==================== 三刑 ====================
// 寅巳申为无恩之刑、丑戌未为恃势之刑、子卯为无礼之刑、辰午酉亥为自刑
export const SANXING = {
  无恩之刑: ["寅", "巳", "申"],
  恃势之刑: ["丑", "戌", "未"],
  无礼之刑: ["子", "卯"],
  自刑: ["辰", "午", "酉", "亥"],
};

// ==================== 空亡 ====================
// 根据日柱查空亡
export const KONGWANG: Record<string, string[]> = {
  "甲子": ["戌", "亥"], "乙丑": ["戌", "亥"], "丙寅": ["戌", "亥"], "丁卯": ["戌", "亥"], "戊辰": ["戌", "亥"],
  "己巳": ["戌", "亥"], "庚午": ["戌", "亥"], "辛未": ["戌", "亥"], "壬申": ["戌", "亥"], "癸酉": ["戌", "亥"],
  "甲戌": ["申", "酉"], "乙亥": ["申", "酉"], "丙子": ["申", "酉"], "丁丑": ["申", "酉"], "戊寅": ["申", "酉"],
  "己卯": ["申", "酉"], "庚辰": ["申", "酉"], "辛巳": ["申", "酉"], "壬午": ["申", "酉"], "癸未": ["申", "酉"],
  "甲申": ["午", "未"], "乙酉": ["午", "未"], "丙戌": ["午", "未"], "丁亥": ["午", "未"], "戊子": ["午", "未"],
  "己丑": ["午", "未"], "庚寅": ["午", "未"], "辛卯": ["午", "未"], "壬辰": ["午", "未"], "癸巳": ["午", "未"],
  "甲午": ["辰", "巳"], "乙未": ["辰", "巳"], "丙申": ["辰", "巳"], "丁酉": ["辰", "巳"], "戊戌": ["辰", "巳"],
  "己亥": ["辰", "巳"], "庚子": ["辰", "巳"], "辛丑": ["辰", "巳"], "壬寅": ["辰", "巳"], "癸卯": ["辰", "巳"],
  "甲辰": ["寅", "卯"], "乙巳": ["寅", "卯"], "丙午": ["寅", "卯"], "丁未": ["寅", "卯"], "戊申": ["寅", "卯"],
  "己酉": ["寅", "卯"], "庚戌": ["寅", "卯"], "辛亥": ["寅", "卯"], "壬子": ["寅", "卯"], "癸丑": ["寅", "卯"],
  "甲寅": ["子", "丑"], "乙卯": ["子", "丑"], "丙辰": ["子", "丑"], "丁巳": ["子", "丑"], "戊午": ["子", "丑"],
  "己未": ["子", "丑"], "庚申": ["子", "丑"], "辛酉": ["子", "丑"], "壬戌": ["子", "丑"], "癸亥": ["子", "丑"],
};

// ==================== 天干五合 ====================
// 甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火
export const TIANGANHE: Record<string, { pair: string; element: string }> = {
  "甲": { pair: "己", element: "土" },
  "己": { pair: "甲", element: "土" },
  "乙": { pair: "庚", element: "金" },
  "庚": { pair: "乙", element: "金" },
  "丙": { pair: "辛", element: "水" },
  "辛": { pair: "丙", element: "水" },
  "丁": { pair: "壬", element: "木" },
  "壬": { pair: "丁", element: "木" },
  "戊": { pair: "癸", element: "火" },
  "癸": { pair: "戊", element: "火" },
};

// ==================== 天干相冲 ====================
// 甲庚冲、乙辛冲、丙壬冲、丁癸冲
export const TIANGANCHONG: Record<string, string> = {
  "甲": "庚", "庚": "甲",
  "乙": "辛", "辛": "乙",
  "丙": "壬", "壬": "丙",
  "丁": "癸", "癸": "丁",
};

export interface RelationResult {
  // 天干关系
  tianganHe: { stems: string[]; element: string; position: string }[];
  tianganChong: { stems: string[]; position: string }[];

  // 地支关系
  liuHe: { branches: string[]; element: string; position: string }[];
  sanHe: { branches: string[]; element: string; complete: boolean }[];
  sanHui: { branches: string[]; element: string; complete: boolean }[];
  liuChong: { branches: string[]; position: string }[];
  liuHai: { branches: string[]; position: string }[];
  xing: { type: string; branches: string[] }[];

  // 空亡
  kongWang: string[];
  kongWangPositions: { branch: string; position: string }[];

  // 汇总描述
  summary: string;
}

/**
 * 分析八字中的刑冲合害关系
 */
export function analyzeRelations(
  yearStem: string, yearBranch: string,
  monthStem: string, monthBranch: string,
  dayStem: string, dayBranch: string,
  hourStem: string, hourBranch: string
): RelationResult {
  const stems = [yearStem, monthStem, dayStem, hourStem];
  const branches = [yearBranch, monthBranch, dayBranch, hourBranch];
  const positions = ["年", "月", "日", "时"];
  const dayPillar = dayStem + dayBranch;

  const result: RelationResult = {
    tianganHe: [],
    tianganChong: [],
    liuHe: [],
    sanHe: [],
    sanHui: [],
    liuChong: [],
    liuHai: [],
    xing: [],
    kongWang: KONGWANG[dayPillar] || [],
    kongWangPositions: [],
    summary: "",
  };

  // 检查天干五合
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const he = TIANGANHE[stems[i]];
      if (he && he.pair === stems[j]) {
        result.tianganHe.push({
          stems: [stems[i], stems[j]],
          element: he.element,
          position: `${positions[i]}${positions[j]}`,
        });
      }
    }
  }

  // 检查天干相冲
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      if (TIANGANCHONG[stems[i]] === stems[j]) {
        result.tianganChong.push({
          stems: [stems[i], stems[j]],
          position: `${positions[i]}${positions[j]}`,
        });
      }
    }
  }

  // 检查六合
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const he = LIUHE[branches[i]];
      if (he && he.pair === branches[j]) {
        result.liuHe.push({
          branches: [branches[i], branches[j]],
          element: he.element,
          position: `${positions[i]}${positions[j]}`,
        });
      }
    }
  }

  // 检查三合局
  for (const sanhe of SANHE) {
    const found = sanhe.branches.filter(b => branches.includes(b));
    if (found.length >= 2) {
      result.sanHe.push({
        branches: found,
        element: sanhe.element,
        complete: found.length === 3,
      });
    }
  }

  // 检查三会局
  for (const sanhui of SANHUI) {
    const found = sanhui.branches.filter(b => branches.includes(b));
    if (found.length === 3) {
      result.sanHui.push({
        branches: found,
        element: sanhui.element,
        complete: true,
      });
    }
  }

  // 检查六冲
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (LIUCHONG[branches[i]] === branches[j]) {
        result.liuChong.push({
          branches: [branches[i], branches[j]],
          position: `${positions[i]}${positions[j]}`,
        });
      }
    }
  }

  // 检查六害
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (LIUHAI[branches[i]] === branches[j]) {
        result.liuHai.push({
          branches: [branches[i], branches[j]],
          position: `${positions[i]}${positions[j]}`,
        });
      }
    }
  }

  // 检查三刑
  const wuen = SANXING.无恩之刑.filter(b => branches.includes(b));
  if (wuen.length >= 2) {
    result.xing.push({ type: "无恩之刑", branches: wuen });
  }

  const shishi = SANXING.恃势之刑.filter(b => branches.includes(b));
  if (shishi.length >= 2) {
    result.xing.push({ type: "恃势之刑", branches: shishi });
  }

  const wuli = SANXING.无礼之刑.filter(b => branches.includes(b));
  if (wuli.length === 2) {
    result.xing.push({ type: "无礼之刑", branches: wuli });
  }

  // 自刑（同支相见）
  const branchCount: Record<string, number> = {};
  branches.forEach(b => {
    branchCount[b] = (branchCount[b] || 0) + 1;
  });
  const zixing = SANXING.自刑.filter(b => branchCount[b] >= 2);
  if (zixing.length > 0) {
    result.xing.push({ type: "自刑", branches: zixing });
  }

  // 检查空亡位置
  result.kongWang.forEach(kw => {
    branches.forEach((b, i) => {
      if (b === kw) {
        result.kongWangPositions.push({ branch: b, position: positions[i] });
      }
    });
  });

  // 生成汇总描述
  const summaryParts: string[] = [];

  if (result.tianganHe.length > 0) {
    summaryParts.push(`天干${result.tianganHe.map(h => `${h.stems.join("")}合${h.element}`).join("、")}`);
  }
  if (result.tianganChong.length > 0) {
    summaryParts.push(`天干${result.tianganChong.map(c => `${c.stems.join("")}冲`).join("、")}`);
  }
  if (result.liuHe.length > 0) {
    summaryParts.push(`${result.liuHe.map(h => `${h.branches.join("")}合${h.element}`).join("、")}`);
  }
  if (result.sanHe.length > 0) {
    summaryParts.push(`${result.sanHe.map(h => `${h.branches.join("")}${h.complete ? "三合" : "半合"}${h.element}局`).join("、")}`);
  }
  if (result.sanHui.length > 0) {
    summaryParts.push(`${result.sanHui.map(h => `${h.branches.join("")}三会${h.element}局`).join("、")}`);
  }
  if (result.liuChong.length > 0) {
    summaryParts.push(`${result.liuChong.map(c => `${c.branches.join("")}相冲`).join("、")}`);
  }
  if (result.liuHai.length > 0) {
    summaryParts.push(`${result.liuHai.map(h => `${h.branches.join("")}相害`).join("、")}`);
  }
  if (result.xing.length > 0) {
    summaryParts.push(`${result.xing.map(x => `${x.branches.join("")}${x.type}`).join("、")}`);
  }
  if (result.kongWangPositions.length > 0) {
    summaryParts.push(`${result.kongWangPositions.map(k => `${k.position}支${k.branch}空亡`).join("、")}`);
  }

  result.summary = summaryParts.join("；") || "命局平和，无明显刑冲合害";

  return result;
}
