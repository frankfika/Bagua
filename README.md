# 禅·八字排盘

一款专业的八字命理分析应用，结合传统命理学与现代 AI 技术，提供精准的八字排盘与命理解读服务。

## 功能特性

- 精准八字排盘：根据出生时间自动计算四柱八字
- 五行分析：详细的五行旺衰分析与图表展示
- AI 命理解读：基于 DeepSeek 大模型的专业命理分析
- 农历转换：支持阳历/农历日期转换

## 本地运行

**环境要求：** Node.js 18+

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置环境变量：
   在 `.env` 文件中设置 DeepSeek API Key：
   ```
   VITE_DEEPSEEK_API_KEY=your_api_key
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 技术栈

- React 19
- Vite
- TypeScript
- lunar-javascript（农历计算）
- Recharts（图表展示）
- DeepSeek API（AI 分析）

## 构建部署

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署至任意静态托管服务。
