# disc-analysis-history — 技术设计

## 设计版本

| 日期       | 版本 | 说明                         |
| ---------- | ---- | ---------------------------- |
| 2026-06-14 | v1   | 初始设计                     |
| 2026-06-14 | v2   | 对照 Stitch 原型补充视觉规格 |

## 项目架构

- 架构类型: Turborepo Monorepo
- 涉及层: 前端（apps/web）、localStorage

## 路由设计

```
routes/
├── detail.tsx    → /detail    (深度解析页)
└── history.tsx   → /history   (历史记录页)
```

## 功能模块设计

### 模块 1: 深度解析页 (Detail Screen)

**文件**: `apps/web/src/routes/detail.tsx`

页面通过 QuizStore（feature 1 的 Context）或 localStorage 读取当前激活的测评记录。若无结果数据则重定向 `/result`。

**静态内容数据结构** (`apps/web/src/data/disc-profiles.ts`):

```ts
type DiscProfile = {
  type: 'D' | 'I' | 'S' | 'C';
  icon: string;           // Material Symbol 图标名
  label: string;          // 中文类型名
  headline: string;       // 一句话画像
  strengths: string[];    // 核心优势（4 条）
  workplaceStyle: {
    collaboration: string;
    management: string;
    microManagement: string;
  };
  communication: {
    express: string[];    // 你的表达方式（3 条要点）
    receive: string[];    // 如何与你沟通（3 条要点）
  };
  growthHabits: {         // 成长机会矩阵（3 条）
    title: string;
    description: string;
    icon: string;
  }[];
};
```

**组件拆分:**
```
DetailPage
├── TypeOverviewHeader     # 图标 + 类型名 + 得分强度进度条
├── StrengthsCard          # 核心优势（带图标列表）
├── WorkplaceCard          # 职场表现（3 个小节）
├── CommunicationPanel     # 双栏面板（Express / Receive）
├── GrowthMatrix           # 三卡片成长矩阵
└── DownloadReportCTA      # 报告下载按钮（feature 4 hook 点）
```

`DownloadReportCTA` 在 feature 4 完成前展示为 disabled 状态，带"即将开放"或跳转支付的逻辑由 feature 4 填充。

### 模块 2: 历史记录页 (History Screen)

**文件**: `apps/web/src/routes/history.tsx`

**数据流:**
```
localStorage → useHistory hook → filter by search → render list
```

**自定义 Hook** (`apps/web/src/hooks/use-history.ts`):

```ts
export const useHistory = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const data = getHistory();
    if (data.length === 0) {
      const mock = initMockHistory();
      setRecords(mock);
    } else {
      setRecords(data);
    }
  }, []);

  const filteredRecords = useMemo(() =>
    records.filter(r => matchesSearch(r, searchQuery)),
    [records, searchQuery]
  );

  const deleteRecord = (id: string) => { /* 二次确认 → 更新 state + localStorage */ };

  return { filteredRecords, searchQuery, setSearchQuery, deleteRecord };
};
```

**搜索过滤逻辑** (`matchesSearch`):
```ts
const DISC_LABELS = { D: '支配型', I: '影响型', S: '稳健型', C: '谨慎型' };

const matchesSearch = (record: HistoryRecord, query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return (
    record.dominantType.toLowerCase().includes(q) ||
    DISC_LABELS[record.dominantType].includes(q) ||
    record.date.includes(q) ||
    record.note.toLowerCase().includes(q)
  );
};
```

**Mock 数据** (`apps/web/src/data/mock-history.ts`):

```ts
export const MOCK_HISTORY: HistoryRecord[] = [
  { id: 'mock-1', date: '2026-03-15', dominantType: 'D', scores: {D:42,I:21,S:25,C:12}, note: '季度回顾测评' },
  { id: 'mock-2', date: '2026-01-08', dominantType: 'I', scores: {D:17,I:50,S:17,C:16}, note: '年初职业规划' },
  { id: 'mock-3', date: '2025-11-22', dominantType: 'S', scores: {D:13,I:25,S:45,C:17}, note: '' },
];
```

**组件拆分:**
```
HistoryPage
├── SearchBar              # 输入框 + 清除按钮
├── HistoryList
│   ├── HistoryCard[]      # 每条记录：日期 + 类型徽章 + 分数 + 操作按钮
│   └── EmptyState         # 无匹配时的空状态
└── DeleteConfirmDialog    # 二次确认弹窗（shadcn/ui Dialog）
```

**"查看详情"逻辑**: 点击后将该条记录写入 QuizStore（或专用的 `activeRecord` Context），然后 navigate('/result') 或 navigate('/detail')。

## 接口契约

无后端 API（feature 3 接入后，登录态下的历史读写会新增 tRPC 接口，此处 Out of Scope）。

## 数据模型

无数据库变更（复用 feature 1 的 localStorage `disc_history` 格式）。

## 安全考虑

localStorage 数据为非敏感信息，无特殊安全处理需要。

---

## [v2] 原型视觉规格补充

> 来源：Stitch 原型 `/Users/yuanjunyao/Downloads/stitch_disc`，对应屏幕 `_1`, `_4`, `_7`

### v2.1 深度解析页头部 `[细化]`

顶部显示带有字母徽章的类型头部：

```
┌─────────────────────────────────┐
│        ┌───┐                    │
│        │ D │⚡  ← 图标角标       │
│        └───┘                    │
│     支配型 (D)                  │  ← headline-lg
│  PRIMARY TYPE: DOMINANCE (D)    │  ← label-caps / JetBrains Mono
│  你直接、果断且以结果为导向...    │  ← body-md
│  ████████████████░░  88%        │  ← 强度得分进度条（蓝色，pill形）
└─────────────────────────────────┘
```

- 圆圈直径：72px，深蓝渐变背景，白色字母
- 角标 icon：Material Symbol，白色，带圆形背景，绝对定位于右下角
- 进度条：pill 形（border-radius: 9999px），高度 8px，蓝色填充

### v2.2 成长机会矩阵 `[细化]`

原型展示的成长机会是带颜色的卡片式条目（非普通列表）：

```
成长机会卡片（三条，垂直排列）：
┌──────────────────────────────────┐
│ PATIENCE                         │  ← label-caps，绿色背景标签
│ 在提供解决方案之前先积极倾听...    │
├──────────────────────────────────┤
│ EMPATHY                          │  ← 黄色背景标签
│ 认可团队情感以建立更强的凝聚力...  │
├──────────────────────────────────┤
│ DETAIL                           │  ← 橙/红色背景标签
│ 在追求进展的过程中不要忽视小细节   │
└──────────────────────────────────┘
```

- 卡片背景：`surface-container-low (#f0f3ff)`，左侧 4px 色条
- 标签：JetBrains Mono，12px，全大写

### v2.3 深度解析底部 CTA `[CHANGED]`

原型中的底部行动按钮区域：

```
┌──────────────────────────────────┐
│  📷 [团队/职场插图]               │
│  解锁完整档案                     │  ← headline-md
│  获取完整的 50 页 PDF 分析...      │  ← body-sm
│  ┌──────────────────────────────┐ │
│  │      下载报告（付费解锁）      │ │  ← 蓝色主按钮
│  └──────────────────────────────┘ │
└──────────────────────────────────┘
```

文案：
- 标题：解锁完整档案
- 副文案：获取完整的 50 页 PDF 分析，包括行为盲点和团队动态。
- 按钮文字：下载报告

### v2.4 历史记录卡片视觉 `[细化]`

原型展示了两种历史卡片的数据可视化方式：

**方式 A（条形图）：** 每个维度一行
```
D  ████████████████  75%
I  ████████████      45%
S  ████████          30%
C  ████████████      50%
```

**方式 B（气泡徽章）：** 4 个圆形徽章横排
```
● 20%   ● 35%  [● 85%]  ● 40%
```
（当前最高维度显示选中框线）

> 实现时可统一用方式 A（条形图），更清晰，如需与原型完全匹配则两种都实现，按 `dominantType` 动态选择。

卡片右上角：高强度类型徽章标签，如"高支配性"（橙色）、"高稳定性"（绿色）。

**搜索栏 placeholder**：`搜索测试结果...`（与原型保持一致）

### v2.5 历史页底部加载状态

列表加载完毕时，底部展示：`已经加载全部记录`（小号灰色文字，居中）。

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| 深度报告内容 | 静态 TS 数据文件 | 报告内容固定，无需动态化 | 后端 CMS（成本过高） |
| 搜索实现 | 前端实时 filter | 数据量小（<100 条），无需防抖 | 后端搜索 API |
| 删除确认 | shadcn/ui Dialog | 项目已有 Dialog 组件 | window.confirm（不可定制） |
| 历史 Hook | 自定义 useHistory | 封装 localStorage 逻辑，便于 feature 3 扩展为云端同步 | 直接在组件内读取 |
