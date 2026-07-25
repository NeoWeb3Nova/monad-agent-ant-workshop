# AntForge 五页项目路演设计

## 目标

为 AntForge on Monad 制作一套 5 页、3 分钟、现场演讲优先的动画 HTML 演示稿。演示稿用于让开发者评委快速理解项目定位、多 Agent 协作闭环、Monad 原生状态设计与真实测试网证据。

## 交付物

- 单文件、自包含的 HTML 演示稿；
- 固定 1920×1080、16:9 舞台，按视口等比缩放；
- 键盘、滚轮、按钮与触控翻页；
- 支持减少动态效果偏好；
- 支持按 `E` 进入浏览器内文字编辑模式；
- 总计且仅有 5 页；
- 适合 3 分钟现场口播，采用低密度、强视觉表达。

## 叙事方向

采用“蚁穴作战图”方向。视觉重点不是装饰性蚂蚁主题，而是把链上任务、技能、事件和结算关系画成一张可理解的地下协作网络。

叙事顺序：

1. 一个目标如何唤醒一支蚁群；
2. 为什么单 Agent 生成能力无法解决可信协作；
3. 一笔 Requester 交易如何触发多钱包自治闭环；
4. Monad 上应并行的任务与必须排他的冲突如何共存；
5. 用合约、回执和最终状态证明项目真实完成。

## 页面设计

### 第 1 页：一个目标，唤醒一支蚁群

- Queen 核心作为主视觉；
- 三条任务隧道连接 Worker 与 Guard；
- 主标题：`AntForge` / `一个目标，唤醒一支蚁群`；
- 副句：`Queen 拆解 · Worker 执行 · Guard 验证 · 真实 MON 结算`；
- 目的：10 秒内建立品牌、角色与价值主张。

### 第 2 页：会生成，不等于会协作

- 对照传统“选择一只 Agent”的工具模式与 AntForge 的临时团队模式；
- 聚焦三个协议问题：谁执行、谁验证、谁拿钱；
- 明确定位：不是 Agent 商城，而是临时机器劳动力的协作与结算协议。

### 第 3 页：一笔交易，唤醒整座蚁穴

- 地下路径展示：`Goal + 0.003 MON → 3 taskIds → Workers → Guard → Pull Settlement`；
- 三个 Worker 分别处理 Repair、Color、Story；
- 展示 `Open → Claimed → Submitted → Settled`；
- 明确边界：链下图片与文本输出为 deterministic mock；链上身份、托管、状态、回执和 MON 结算为 live。

### 第 4 页：Swarm Lane 与 Conflict Lane

- Swarm Lane：三个独立 `taskId` 写入独立状态槽；
- Conflict Lane：两个有技能的 Worker 竞争同一任务，第二笔以 `TaskNotOpen` 回滚；
- Skill Guard：Rogue Ant 因 `SkillMismatch` 在广播前被拦截；
- 核心句：`把可并行的任务分开，把必须排他的冲突留下。`

### 第 5 页：不是承诺，是链上回执

- 网络：Monad Testnet，Chain ID `10143`；
- 合约：`0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`；
- 源码：Sourcify `exact_match`；
- 真实五步交易：创建、领取、提交、验证、提款；
- 最终回读：任务 `Settled`、`claimableRewards = 0`、合约余额 `0`；
- 收口：`One goal. A thousand ants. One autonomous economy.`

## 视觉系统

- 背景：深沙褐与黑曜石；
- 任务、隧道与结构线：沙金；
- Monad 事件与链上脉冲：Monad 紫；
- 成功结算：克制的绿色；
- 冲突与拒绝：红色，仅用于失败路径；
- 中文使用清晰、宽松的标题行高，避免拉丁字体的过紧字距；
- 使用仓库现有 Queen、Worker、Guard、Rogue 与蚁穴素材；
- 避免通用卡片看板、霓虹赛博朋克和无业务含义的粒子动画。

## 动效规则

- 封面：Queen 核心亮起，任务隧道依次出现；
- 闭环页：信息素脉冲沿任务路径移动，状态节点按业务顺序揭示；
- Monad 页：Swarm 路径并行推进，Conflict 路径在第二个竞争者处停止；
- 证据页：交易轨迹依次点亮，最终状态统一收束；
- 动画仅辅助讲解业务状态，不影响静态阅读，不制造未经验证的性能暗示。

## 真实性与内容约束

- Mock 与 Live 必须明确区分；
- 不把 inclusion latency 表述为 finality；
- 不宣称 Guard 在链上判断图片或文本的语义质量；
- 不伪造交易哈希、区块、余额或 Explorer 状态；
- 所有链上数字和地址以仓库 README、`docs/04-monad-testnet-evidence.md` 与部署记录为准。

## 技术结构

- 单个 HTML 文件，CSS 与 JavaScript 内联；
- 使用完整固定舞台基础样式；
- `.slide` 通过 `visibility`、`opacity`、`pointer-events` 和活动类切换；
- 页面内不依赖 npm、构建工具或运行时框架；
- 项目素材嵌入为 Data URL，保证单文件可携带；
- Google Fonts 作为联网字体，并提供安全的 CJK 字体回退；
- 每个主要 CSS/JS 区块带清晰注释。

## 验收标准

- DOM 中恰好存在 5 个 `.slide`；
- 所有页面保持 1920×1080 固定画布并等比缩放；
- 1280×720 与手机视口均不重排、不溢出；
- 主要面板无视觉重叠，文字无裁切；
- 键盘方向键、空格、滚轮、按钮和触控导航可用；
- `prefers-reduced-motion` 生效；
- 编辑模式可开启、编辑并保存文字；
- 浏览器控制台无阻断错误；
- 所有链上事实与现有证据文档一致。

## 非目标

- 不制作可编辑 `.pptx`；
- 不部署公网 URL；
- 不输出 PDF；
- 不修改合约、Agent Runner 或 Web App；
- 不加入超过 5 页的附录或商业计划页。
