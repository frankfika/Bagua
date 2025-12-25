/**
 * 真太阳时计算模块
 *
 * 真太阳时 = 地方平太阳时 + 均时差
 * 地方平太阳时 = 北京时间 + (本地经度 - 120°) × 4分钟/度
 *
 * 均时差 (Equation of Time) 是真太阳时和平太阳时的差值，
 * 由地球公转轨道的椭圆性和黄赤交角共同引起。
 */

export interface TrueSolarTimeResult {
  /** 真太阳时 (HH:mm 格式) */
  trueSolarTime: string;
  /** 原始输入时间 */
  originalTime: string;
  /** 总修正分钟数 */
  totalCorrection: number;
  /** 经度修正分钟数 */
  longitudeCorrection: number;
  /** 均时差修正分钟数 */
  equationOfTime: number;
  /** 计算说明 */
  explanation: string;
}

/**
 * 获取一年中的第几天 (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * 计算均时差 (Equation of Time)
 * 使用简化公式，精度约±30秒
 *
 * @param dayOfYear 一年中的第几天
 * @returns 均时差（分钟），正值表示真太阳时快于平太阳时
 */
function calculateEquationOfTime(dayOfYear: number): number {
  // B = 360/365 * (dayOfYear - 81) 弧度
  const B = (2 * Math.PI / 365) * (dayOfYear - 81);

  // 均时差公式 (分钟)
  // EoT = 9.87 * sin(2B) - 7.53 * cos(B) - 1.5 * sin(B)
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  return eot;
}

/**
 * 将分钟数转换为 HH:mm 格式
 */
function minutesToTimeString(totalMinutes: number): string {
  // 处理跨天情况
  let normalizedMinutes = totalMinutes;
  while (normalizedMinutes < 0) {
    normalizedMinutes += 24 * 60;
  }
  while (normalizedMinutes >= 24 * 60) {
    normalizedMinutes -= 24 * 60;
  }

  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = Math.round(normalizedMinutes % 60);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 解析时间字符串为分钟数
 */
function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 计算真太阳时
 *
 * @param localTime 当地时间 (HH:mm 格式，通常为北京时间)
 * @param longitude 出生地经度 (东经为正)
 * @param birthDate 出生日期 (用于计算均时差)
 * @returns 真太阳时计算结果
 */
export function calculateTrueSolarTime(
  localTime: string,
  longitude: number,
  birthDate: Date
): TrueSolarTimeResult {
  const dayOfYear = getDayOfYear(birthDate);

  // 1. 经度时差计算
  // 北京时间基准经度为东经120度
  // 每度对应4分钟时差
  // 经度 > 120°：比北京时间快
  // 经度 < 120°：比北京时间慢
  const longitudeCorrection = (longitude - 120) * 4;

  // 2. 均时差计算
  const equationOfTime = calculateEquationOfTime(dayOfYear);

  // 3. 总修正
  const totalCorrection = longitudeCorrection + equationOfTime;

  // 4. 应用修正
  const originalMinutes = timeStringToMinutes(localTime);
  const correctedMinutes = originalMinutes + totalCorrection;
  const trueSolarTime = minutesToTimeString(correctedMinutes);

  // 5. 生成说明
  const longitudeDir = longitudeCorrection >= 0 ? '+' : '';
  const eotDir = equationOfTime >= 0 ? '+' : '';
  const explanation = `经度修正 ${longitudeDir}${longitudeCorrection.toFixed(1)}分 (${longitude.toFixed(2)}°E)，均时差 ${eotDir}${equationOfTime.toFixed(1)}分，总修正 ${totalCorrection >= 0 ? '+' : ''}${totalCorrection.toFixed(1)}分`;

  return {
    trueSolarTime,
    originalTime: localTime,
    totalCorrection: Math.round(totalCorrection),
    longitudeCorrection: Math.round(longitudeCorrection),
    equationOfTime: Math.round(equationOfTime * 10) / 10,
    explanation
  };
}

/**
 * 检查时辰是否可能受时间修正影响
 * 如果修正后的时间跨越了时辰边界，返回警告信息
 *
 * @param originalTime 原始时间
 * @param trueSolarTime 真太阳时
 * @returns 警告信息，如果无警告则返回 null
 */
export function checkShichenBoundary(originalTime: string, trueSolarTime: string): string | null {
  const shichenBoundaries = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];

  const originalHour = parseInt(originalTime.split(':')[0]);
  const trueSolarHour = parseInt(trueSolarTime.split(':')[0]);

  const getShichen = (hour: number) => {
    const adjustedHour = hour === 23 ? 0 : hour + 1;
    return Math.floor(adjustedHour / 2);
  };

  const originalShichen = getShichen(originalHour);
  const trueSolarShichen = getShichen(trueSolarHour);

  if (originalShichen !== trueSolarShichen) {
    const shichenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    return `时辰从${shichenNames[originalShichen]}时变为${shichenNames[trueSolarShichen]}时`;
  }

  return null;
}

/**
 * 中国主要城市经度参考表
 */
export const CITY_LONGITUDES: Record<string, number> = {
  // 直辖市
  '北京': 116.41,
  '上海': 121.47,
  '天津': 117.20,
  '重庆': 106.55,

  // 省会城市
  '石家庄': 114.48,
  '太原': 112.55,
  '呼和浩特': 111.75,
  '沈阳': 123.43,
  '长春': 125.32,
  '哈尔滨': 126.63,
  '南京': 118.78,
  '杭州': 120.15,
  '合肥': 117.28,
  '福州': 119.30,
  '南昌': 115.89,
  '济南': 116.99,
  '郑州': 113.65,
  '武汉': 114.30,
  '长沙': 112.94,
  '广州': 113.26,
  '南宁': 108.37,
  '海口': 110.35,
  '成都': 104.07,
  '贵阳': 106.71,
  '昆明': 102.71,
  '拉萨': 91.11,
  '西安': 108.95,
  '兰州': 103.83,
  '西宁': 101.78,
  '银川': 106.27,
  '乌鲁木齐': 87.62,

  // 特别行政区
  '香港': 114.17,
  '澳门': 113.55,

  // 台湾
  '台北': 121.52,
  '高雄': 120.31,
};
