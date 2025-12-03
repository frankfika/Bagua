/**
 * 八字排盘测试脚本 - 使用 lunar-javascript 精确计算
 */

// @ts-ignore
import { Solar } from "lunar-javascript";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY || "";

interface TestCase {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  gender: "Male" | "Female";
  latitude?: number;
  longitude?: number;
  expectedBazi?: string;
  description?: string;
}

// 测试数据集
const testCases: TestCase[] = [
  {
    name: "鲁迅",
    birthDate: "1881-09-25",
    birthTime: "04:00",
    birthLocation: "浙江绍兴",
    gender: "Male",
    longitude: 120.58,
    latitude: 30.00,
    expectedBazi: "辛巳 丁酉 壬戌 壬寅",
    description: "著名文学家"
  },
  {
    name: "孙中山",
    birthDate: "1866-11-12",
    birthTime: "04:00",
    birthLocation: "广东中山",
    gender: "Male",
    longitude: 113.38,
    latitude: 22.52,
    expectedBazi: "丙寅 己亥 辛卯 庚寅",
    description: "国父"
  },
  {
    name: "测试用户1",
    birthDate: "1990-05-15",
    birthTime: "08:30",
    birthLocation: "北京",
    gender: "Male",
    longitude: 116.40,
    latitude: 39.90,
    description: "普通测试案例"
  },
  {
    name: "测试用户2",
    birthDate: "1985-12-21",
    birthTime: "23:30",
    birthLocation: "上海",
    gender: "Female",
    longitude: 121.47,
    latitude: 31.23,
    description: "测试子时（23:00后）"
  },
  {
    name: "测试用户3",
    birthDate: "2000-02-04",
    birthTime: "12:00",
    birthLocation: "成都",
    gender: "Male",
    longitude: 104.07,
    latitude: 30.67,
    description: "测试立春交接"
  },
  {
    name: "测试用户4",
    birthDate: "1988-08-08",
    birthTime: "08:08",
    birthLocation: "香港",
    gender: "Male",
    longitude: 114.17,
    latitude: 22.28,
    description: "1988年8月8日"
  }
];

// 使用 lunar-javascript 计算八字
function calculateBazi(birthDate: string, birthTime: string): {
  bazi: string;
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  lunarDate: string;
  solarTerm: string;
} {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearPillar = `${eightChar.getYearGan()}${eightChar.getYearZhi()}`;
  const monthPillar = `${eightChar.getMonthGan()}${eightChar.getMonthZhi()}`;
  const dayPillar = `${eightChar.getDayGan()}${eightChar.getDayZhi()}`;
  const hourPillar = `${eightChar.getTimeGan()}${eightChar.getTimeZhi()}`;

  const jieQi = lunar.getPrevJieQi();

  return {
    bazi: `${yearPillar} ${monthPillar} ${dayPillar} ${hourPillar}`,
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    lunarDate: lunar.toString(),
    solarTerm: jieQi ? jieQi.getName() : ""
  };
}

async function testBaziCalculation(testCase: TestCase): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`测试案例: ${testCase.name}`);
  console.log(`出生日期: ${testCase.birthDate} ${testCase.birthTime}`);
  console.log(`出生地点: ${testCase.birthLocation}`);
  if (testCase.expectedBazi) {
    console.log(`预期八字: ${testCase.expectedBazi}`);
  }
  if (testCase.description) {
    console.log(`说明: ${testCase.description}`);
  }
  console.log("-".repeat(60));

  // 使用 lunar-javascript 计算
  const result = calculateBazi(testCase.birthDate, testCase.birthTime);

  console.log("\n【精确排盘结果 (lunar-javascript)】");
  console.log(`农历: ${result.lunarDate}`);
  console.log(`节气: ${result.solarTerm}`);
  console.log(`年柱: ${result.yearPillar}`);
  console.log(`月柱: ${result.monthPillar}`);
  console.log(`日柱: ${result.dayPillar}`);
  console.log(`时柱: ${result.hourPillar}`);
  console.log(`完整八字: ${result.bazi}`);

  // 验证预期八字
  if (testCase.expectedBazi) {
    if (result.bazi === testCase.expectedBazi) {
      console.log(`✅ 八字排盘正确！`);
    } else {
      console.log(`⚠️ 八字有差异`);
      console.log(`   预期: ${testCase.expectedBazi}`);
      console.log(`   实际: ${result.bazi}`);
    }
  }

  console.log(`\n✅ 本地排盘完成: ${testCase.name}`);
}

async function testDeepSeekAnalysis(testCase: TestCase): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`DeepSeek AI 分析测试: ${testCase.name}`);
  console.log("-".repeat(60));

  // 先获取精确的八字
  const baziResult = calculateBazi(testCase.birthDate, testCase.birthTime);

  const prompt = `
    你是一位资深的八字命理大师。以下是精确计算的八字，请进行简要分析。

    - 姓名: ${testCase.name}
    - 性别: ${testCase.gender === 'Male' ? '男' : '女'}
    - 八字: ${baziResult.bazi}
    - 农历: ${baziResult.lunarDate}
    - 节气: ${baziResult.solarTerm}

    请简要分析：
    1. 日主强弱
    2. 喜用神
    3. 性格特点

    请用 JSON 格式输出：
    {
      "strength": "日主强弱",
      "luckyElements": ["喜用神"],
      "personality": "性格简述"
    }
  `;

  try {
    const startTime = Date.now();

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是八字命理专家，只输出JSON格式。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    const endTime = Date.now();
    console.log(`API 响应时间: ${endTime - startTime}ms`);

    if (!response.ok) {
      console.error(`❌ API 错误: ${response.status}`);
      return;
    }

    const result = await response.json();
    const analysis = JSON.parse(result.choices?.[0]?.message?.content || "{}");

    console.log(`\n【AI 分析结果】`);
    console.log(`八字: ${baziResult.bazi}`);
    console.log(`日主强弱: ${analysis.strength}`);
    console.log(`喜用神: ${analysis.luckyElements?.join(", ")}`);
    console.log(`性格: ${analysis.personality}`);

    console.log(`\n✅ AI 分析完成: ${testCase.name}`);

  } catch (error) {
    console.error(`❌ 测试失败: ${error}`);
  }
}

async function runAllTests(): Promise<void> {
  console.log("🔮 八字排盘精确测试开始");
  console.log(`使用 lunar-javascript 进行精确计算`);
  console.log(`共 ${testCases.length} 个测试案例\n`);

  // 第一部分：测试本地精确排盘
  console.log("\n" + "█".repeat(60));
  console.log("第一部分：本地精确排盘测试 (lunar-javascript)");
  console.log("█".repeat(60));

  for (const testCase of testCases) {
    await testBaziCalculation(testCase);
  }

  // 第二部分：测试 DeepSeek AI 分析
  console.log("\n" + "█".repeat(60));
  console.log("第二部分：DeepSeek AI 命理分析测试");
  console.log("█".repeat(60));

  // 只测试2个案例以节省时间
  await testDeepSeekAnalysis(testCases[0]); // 鲁迅
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testDeepSeekAnalysis(testCases[2]); // 测试用户1

  console.log("\n" + "=".repeat(60));
  console.log("🎉 所有测试完成！");
  console.log("\n总结：");
  console.log("1. lunar-javascript 提供精确的八字排盘计算");
  console.log("2. DeepSeek API 负责命理分析和解读");
  console.log("3. 两者结合可实现专业级八字分析");
}

runAllTests().catch(console.error);
