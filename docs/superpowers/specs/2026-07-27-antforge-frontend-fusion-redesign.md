# AntForge 前端融合升级设计

> 日期：2026-07-27
>
> 状态：已获用户确认
>
> 参考前端：<https://github.com/NeoWeb3Nova/frontend>
>
> 目标仓库：<https://github.com/NeoWeb3Nova/monad-agent-ant-workshop>

## 1. 背景

AntForge 当前前端已经接通 Mock / Live 双数据源、钱包连接、Monad Testnet 合约读取、任务状态、事件与 Explorer 证据，但在路演视口中存在三个主要问题：

1. 中央 Colony Stage 的卡片、线路和标签密度过高，关键状态难以在第一眼识别；
2. 大量 5–8px 文本降低可读性，1440×900 或更低高度时尤为明显；
3. 蚁穴视觉虽与业务状态相连，但场景叙事不如新开发的参考前端直观。

参考前端的中央地下蚁穴图、三区布局和留白更强，但其中的钱包、任务统计、奖励、事件和 Agent 数量是静态展示，不能直接进入 AntForge。此次采用“融合升级”，借用其视觉构图而不复制虚假业务数据。

## 2. 目标与非目标

### 2.1 目标

- 保留 AntForge 全部真实业务功能和 Mock / Live 真实性边界；
- 使用参考前端的蚁穴主视觉重组中央 Colony Stage；
- 让观众在一屏内理解“创建 → 执行 → 验证 → 结算 → 链上证据”；
- 优先优化 1440×900、1440×1080 和 1920×1080 路演桌面视口；
- 移动端保持功能可用，允许纵向重排，不追求与桌面相同的信息密度；
- 提高字号、状态对比度、交易证据可发现性和异常反馈清晰度。

### 2.2 非目标

- 不修改合约、ABI、Agent Runner、钱包签名模型或任务状态机；
- 不新增 Priority、可编辑 Skill Marketplace、Storage Chamber 或 Scout Agent；
- 不加入全网 Active Ants、美元估值、累计奖励等无法由当前数据源验证的统计；
- 不新增后端、数据库、索引器或第三方运行时依赖；
- 不把 Live 错误静默回退成 Mock 成功；
- 不为视觉效果伪造钱包、余额、区块、交易哈希、事件或 Monad 性能数据。

## 3. 方案选择

### 3.1 评估过的方案

#### A. 换皮式优化

保留现有 DOM，仅替换背景、颜色和尺寸。

- 优点：风险低、改动小；
- 缺点：无法根治中央卡片重叠和信息密度问题，视觉提升有限。

#### B. 融合式重组（采用）

保留 `ColonyDataSource`、`ColonySnapshot`、钱包和业务方法，重新组合呈现层。中央使用参考蚁穴图作为本地背景，真实状态通过 React 覆盖层呈现。

- 优点：兼顾视觉提升、真实性和实现风险；
- 缺点：需要重新校准中央节点定位、响应式断点和背景遮罩。

#### C. 完整组件与设计系统重构

拆分全部 UI 并重建响应式设计系统。

- 优点：长期结构最好；
- 缺点：黑客松阶段改动面过大，容易影响 Live Demo 稳定性。

### 3.2 决策

采用 B。改动限定在 `web/` 的呈现层和本地视觉资产，不改变数据适配器行为，不触碰 `contracts/` 与 `agents/`。

## 4. 信息架构

页面保持“一屏控制台”，由五个区域组成。

### 4.1 顶部状态栏

左侧：

- AntForge 品牌；
- Built on Monad 标识。

中部：

- 一句简短产品定位；
- 不重复堆叠中英文大标题。

右侧：

- 持续可见的 Mock / Live 模式；
- Runner 状态；
- 合约短地址与复制操作；
- 真实钱包连接、地址和断开操作。

删除参考前端中没有真实功能的设置、通知、头像和静态钱包。

### 4.2 左侧 Mission Console

桌面目标宽度约 300px，包含：

- Mission 文本框；
- Repair、Color、Story、Verify 固定任务预览；
- 真实 Colony Escrow；
- Create live colony / Release the swarm 主操作；
- 紧凑的 Swarm progress；
- 钱包、网络、模拟和交易错误的内联反馈。

不加入 Priority、Storage、美元估值或可编辑技能标签，以免表达当前协议并不存在的功能。

### 4.3 中央 Colony Stage

中央区域占据最大空间，并以参考前端地下蚁穴图为背景。覆盖层只显示当前闭环中的真实角色：

- Queen；
- Repair；
- Color；
- Story；
- Guard；
- Treasury。

每个节点遵循渐进披露：

- 默认显示名称和状态；
- 任务存在后显示奖励和 Worker；
- 发生交易后显示真实交易入口；
- 状态变化时使用边框、状态色和信息素路线强化；
- 不长期展示与当前状态无关的解释文本。

信息素路线和动态蚂蚁仍由任务状态驱动。Rogue Gate 作为失败证据入口或紧凑状态，不持续占据主视觉的大面积空间。

### 4.4 右侧 Evidence Rail

桌面目标宽度约 300px，只展示可验证数据：

- Network；
- Tasks settled；
- Escrow budget；
- Last inclusion；
- Latest block；
- Real-time pheromone events；
- Contract Explorer 入口。

事件使用纵向时间线。交易哈希存在且 Explorer URL 有效时才显示链接。事件为空、RPC 错误和刷新失败均有明确状态。

### 4.5 底部 Workflow Strip

保留五步状态：

`Goal → Split tasks → Ant agents → Verify → Settle`

Swarm Lane、Skill Guard、Conflict Lane 作为紧凑状态条显示，不与主流程争夺视觉焦点。小屏时 Workflow 位于 Colony Stage 之后并允许纵向滚动。

## 5. 视觉系统

### 5.1 色彩

- 背景：深石墨与轻微紫色偏色，不使用纯黑；
- 主强调：Monad 紫；
- 成功：绿色，仅表示成功、Online 或 Settled；
- 资金：金色，仅表示 MON 和 Escrow；
- 错误：红色，仅表示失败、拒绝或冲突；
- 信息：中性灰与低饱和蓝紫。

减少多色霓虹、过量发光和均匀 AI 渐变。背景负责氛围，数据状态负责信息。

### 5.2 字体与数字

- 正文不低于约 12px；
- 关键状态和操作使用 13–14px 或更高；
- 大标题收紧字距，正文保持适当行高；
- 地址、哈希、区块和 MON 使用等宽字体；
- 数字启用 tabular figures；
- 删除当前 5–8px 的关键业务文字。

### 5.3 表面与动效

- 面板使用低对比边框和层级明确的深色表面；
- 发光只用于 Live、活动信息素和关键状态；
- Hover、Pressed 与 Focus 状态完整；
- 状态动画优先使用 `transform` 与 `opacity`；
- 支持 `prefers-reduced-motion`；
- 不添加与业务状态无关的持续装饰动画。

## 6. 背景资产策略

参考前端当前使用 Google 托管的远程图片。生产实现必须：

1. 将图片下载到 `web/public/colony/`；
2. 使用语义化、稳定的本地文件名；
3. 不保留对临时 Google CDN 的运行时依赖；
4. 使用暗色遮罩、渐变和响应式裁切，使 React 状态覆盖层优先；
5. 检查图片内置文字是否与真实覆盖层重叠。

如果原图内置标签无法通过裁切、遮罩或定位可靠消除，则不强行上线重复文字版本。此时以当前项目本地 `ant-colony-diorama.svg` 作为无冲突降级背景，同时保留新前端的布局和层级方案。

## 7. 组件边界

当前 `App.tsx` 集中承载多数视图。实施时进行面向本次任务的最小拆分：

- `AppHeader`：模式、Runner、合约和钱包；
- `MissionPanel`：目标、预算、主操作和错误；
- `ColonyStage`：背景、节点、信息素与任务状态；
- `TaskChamber`：单任务状态呈现；
- `EvidenceSidebar`：链上指标、事件和 Explorer；
- `WorkflowConsole`：五步流程与 Proof Lanes。

允许将以上组件移入现有 `components/` 目录以降低 `App.tsx` 复杂度，但不做无关的架构重写。

## 8. 数据流与真实性

数据流保持：

```text
MockColonyDataSource / MonadColonyDataSource
                    ↓
              ColonySnapshot
                    ↓
     App presentation components
```

实现规则：

- 不在组件中散落新的 Mock / Live 分支；
- `ColonySnapshot` 继续是页面权威视图模型；
- Mock 始终显示 Demo Mode；
- Live 始终使用 Monad Testnet RPC、回执和事件；
- Live 失败显示真实错误，不回退 Mock；
- 链下 deterministic mock 与链上真实结算分别标识；
- 没有真实哈希、区块或余额时显示空状态，不生成占位证据。

## 9. 交互状态

### 9.1 创建 Colony

保持现有真实流程：

```text
检查 Mission
→ 检查 Live 钱包
→ 必要时切换 Monad Testnet
→ simulateContract
→ 钱包确认交易
→ 等待 receipt
→ refresh snapshot
```

按钮和反馈至少区分：

- 默认；
- 需要连接钱包；
- 需要切换网络；
- 模拟中；
- 等待钱包确认；
- 等待回执；
- 成功；
- 用户取消；
- RPC / 合约错误。

若现有数据源只暴露部分中间态，呈现层不得伪造不存在的精细状态；应使用当前可靠状态并在后续独立任务中扩展视图模型。

### 9.2 任务状态

统一映射：

- `open`：中性；
- `claimed`：Monad 紫；
- `submitted`：低饱和蓝紫；
- `settled`：绿色；
- `rejected`：红色；
- `cancelled`：中性红灰。

节点、路线、Workflow 和事件时间线必须由同一 Snapshot 推导，避免出现互相矛盾的状态。

## 10. 响应式策略

### 10.1 路演桌面

在 1440×900、1440×1080 和 1920×1080：

- 顶部状态栏不换行；
- 左右栏完整可见；
- 中央六个真实节点无重叠；
- Mission 主按钮、Workflow 和关键证据无需滚动即可看到；
- 正文达到可读字号，不依赖浏览器缩放。

### 10.2 小桌面与平板

- 左右栏允许压缩或转为上下区域；
- Colony Stage 保持可理解的宽高比；
- Evidence 移到 Colony Stage 下方；
- 不通过继续缩小文字来维持三栏。

### 10.3 移动端

- 单列纵向流；
- 顶部只保留品牌、模式和钱包关键操作；
- Mission → Colony → Workflow → Evidence；
- 允许滚动；
- 所有签名、刷新和 Explorer 功能仍可操作。

## 11. 错误、空状态与可访问性

- 钱包取消：明确说明交易未广播；
- 网络错误：明确要求 Monad Testnet Chain ID 10143；
- 模拟失败：停止广播并显示错误；
- RPC 失败：显示重试，不伪造数据；
- 事件为空：显示尚未观察到事件；
- Runner Unknown 不等于 Offline，沿用当前语义；
- 所有按钮和链接有可见焦点；
- 图标按钮提供可访问名称；
- meaningful 图片提供准确 `alt`；装饰背景通过 CSS 或空替代文本处理；
- 状态不能只依靠颜色表达；
- 保持 Reduced Motion 支持。

## 12. 验证标准

### 12.1 静态检查

在 `web/` 中：

```bash
npm run lint
npm run build
```

两项必须通过。

### 12.2 功能检查

- Mock 模式可完整跑完一轮任务状态变化；
- Live 模式可读取真实合约；
- 钱包连接、网络切换和创建 Colony 入口未被破坏；
- 真实事件与 Explorer 链接可用；
- Live 错误不会回退成 Mock；
- Runner、Proof Lanes 和任务状态与 Snapshot 一致。

### 12.3 浏览器检查

检查视口：

- 1440×900；
- 1440×1080；
- 1920×1080；
- 一个移动端宽度。

每个视口验证：

- 无关键区域遮挡或重叠；
- 无不可读的关键业务文字；
- 无横向页面溢出；
- 键盘焦点可见；
- 浏览器控制台无阻断演示的错误。

### 12.4 真实性检查

最终页面不得出现：

- 静态假钱包；
- 假余额、假区块或假交易；
- 无来源的全网统计；
- 把 Mock 输出描述为真实 AI；
- `#` 死链接；
- 对参考前端 Google 临时图片 URL 的生产依赖。

## 13. 实施边界

本设计允许修改：

- `web/src/App.tsx`；
- `web/src/App.css`；
- `web/src/index.css`；
- 与本次呈现层拆分直接相关的 `web/src/components/`；
- `web/public/colony/` 下的视觉资产；
- 必要的前端测试或浏览器验证脚本。

本设计不授权修改：

- `contracts/`；
- `agents/`；
- 合约部署地址与证据；
- 钱包或私钥配置；
- Mock / Live 数据适配器的业务语义。

若实现过程中发现必须修改数据适配器接口或业务语义，应暂停并提交独立设计变更，不把它混入视觉重构。
