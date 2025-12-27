<div align="center">

# 禅 · 八字排盘

**传统命理智慧与现代 AI 的融合之作**

[![Live Demo](https://img.shields.io/badge/Live-Demo-gold?style=for-the-badge)](https://bagua.node404.fun)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-blue?style=flat-square)](https://deepseek.com/)

</div>

---

## 缘起

八字命理，源于《易经》，历经千年传承。**禅·八字排盘** 以禅意美学为设计语言，将古老的命理智慧与现代 AI 技术相融合，为你呈现一份独特的命理分析体验。

## 核心功能

**精准排盘** — 根据出生时间自动推算年柱、月柱、日柱、时柱，支持阳历/农历智能转换

**五行分析** — 可视化展示五行分布与旺衰格局，直观呈现命局特征

**AI 命理师** — 基于 DeepSeek 大模型的智能分析，提供专业的命理解读与人生建议

**禅意体验** — 水墨风格界面设计，宣纸纹理质感，沉浸式的东方美学体验

## 快速开始

```bash
# 克隆项目
git clone https://github.com/frankfika/chanbazi.git

# 安装依赖
npm install

# 配置 API Key（在 .env 文件中）
VITE_DEEPSEEK_API_KEY=your_api_key

# 启动开发服务器
npm run dev
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS |
| 农历 | lunar-javascript |
| 图表 | Recharts |
| AI | DeepSeek API |
| 部署 | Vercel Edge Functions |

## 项目结构

```
├── api/            # Vercel Edge Functions
├── components/     # React 组件
├── hooks/          # 自定义 Hooks
├── services/       # 服务层
├── utils/          # 工具函数
└── knowledge/      # 命理知识库
```

## 致谢

- [lunar-javascript](https://github.com/6tail/lunar-javascript) - 强大的农历库
- [DeepSeek](https://deepseek.com/) - AI 能力支持

---

<div align="center">

**以禅心观命理，用智慧启人生**

Made with ❤️ by [Frank](https://github.com/frankfika)

</div>
