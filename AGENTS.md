# AGENTS.md

## 1. 项目身份

- 项目名称：`Monad沙丘上的Agent蚂蚁工坊`
- 英文品牌：`AntForge on Monad`
- GitHub：`https://github.com/NeoWeb3Nova/monad-agent-ant-workshop`
- 项目根目录：`/home/neo/workspace/projects/monad-agent-ant-workshop`
- 目标网络：Monad Testnet，Chain ID `10143`
- 选题讨论基线：`docs/01-project-ideation.md`

所有开发、测试、部署、提交和文档操作必须在本仓库中完成。开始写入、提交或部署前，必须检查：

```bash
pwd
git rev-parse --show-toplevel
git remote -v
git status --short --branch --untracked-files=all
```

## 2. 黑客松目标

这是一个限时黑客松项目。优先级从高到低为：

1. 跑通完整、可验证的 MVP 闭环；
2. 展示新颖机制和 Monad 原生技术价值；
3. 形成稳定、可重复的现场 Demo；
4. 保留真实链上证据；
5. 改善必要的可用性；
6. 最后才是视觉打磨和扩展功能。

项目必须回答：

> 我们在 Monad 上解决了什么新问题，或者如何用一种全新的方式解决旧问题？

不要把「更快、更便宜」当成唯一的 Monad 叙事。重点展示：

- 大量彼此独立的 Agent 微任务；
- 面向 Monad 并行执行设计的低冲突状态结构；
- 高频任务状态更新和微结算；
- 快速确认带来的实时蚁群体验；
- Swarm Lane 与 Conflict Lane 的机制差异。

## 3. MVP 原则

先完成以下主链路：

```text
注册 Agent
→ 创建任务并锁定 MON
→ 验证技能
→ 领取任务
→ 提交结果哈希
→ Guard 验证
→ 奖励记入 claimableRewards
→ Worker 提取真实 MON
→ 前端展示交易与 Explorer 证据
```

优先完成一条真实、可演示的纵向闭环，不要同时开发大量横向功能。

### P0

- Agent 注册与技能；
- 任务创建与 MON 托管；
- 技能匹配和任务领取；
- 输出哈希提交；
- Guard 验证；
- 独立奖励记账与 Worker 提款；
- 本地事件驱动 Agent Runner；
- Monad Testnet 部署；
- 前端可查看任务状态、交易哈希和 Explorer 链接；
- 公网部署。

### P1

- Queen 任务拆解；
- 3～4 只演示 Agent；
- Rogue Ant 越权领取失败；
- `Release the Swarm`；
- Swarm Lane 与 Conflict Lane；
- 事件驱动的蚁穴任务可视化。

### 默认不做

除非 P0 已完成并经过真实验证，否则不要开发：

- 多行业 Agent 商城；
- DAO、治理和蚁后选举；
- 自研 Token 或 Agent NFT；
- 多链支持；
- 复杂竞价市场；
- 多验证者争议仲裁；
- 完整 RAG 和长期记忆；
- 复杂去中心化存储；
- x402 或 MPP 深度集成；
- Factory、CREATE2 和每任务独立 Escrow；
- 与核心机制无关的 UI 动效和页面。

## 4. Mock 与 Monad Testnet 双模式

产品必须同时支持两种数据模式：

```text
mock    —— 稳定、快速、可离线演示的完整流程
live    —— Monad Testnet 上的真实合约、交易、事件和余额
```

### 4.1 统一业务模型

Mock 与 Live 不得维护两套不同的页面逻辑。应共享：

- `Agent`、`Task`、`TaskStatus` 和事件类型；
- 同一套页面组件；
- 同一套任务状态机；
- 同一套演示流程。

通过数据适配层切换实现：

```text
UI / Use Cases
      ↓
ColonyDataSource interface
      ├── MockColonyDataSource
      └── MonadColonyDataSource
```

环境变量建议：

```bash
VITE_DATA_MODE=mock
VITE_DATA_MODE=live
```

不要在组件中散落 `if (mock)`。模式判断集中在适配器装配处。

### 4.2 真实性规则

- Mock 数据必须在 UI 中明确标注为 `Demo Mode` 或 `Mock Mode`；
- Live 数据必须来自 Monad Testnet RPC、合约读取、交易回执或事件；
- 不得把 Mock 交易哈希、余额、区块高度或确认时间标注为真实链上数据；
- Live 模式失败时应显示真实错误，不得静默回退并伪装成链上成功；
- Demo 可以主动切换到 Mock，但必须让观众看见当前模式；
- 合约地址、部署交易和关键交互交易必须保留在项目文档中。

### 4.3 演示策略

- Mock 模式保证完整故事和视觉流程不会因外部服务失败而中断；
- Live 模式证明智能合约不是装饰；
- 核心演示至少包含一次真实 Testnet 写入和一次 Explorer 验证；
- 准备截图或录屏作为网络故障时的后备证据，但不能替代真实部署。

## 5. Monad 合约约束

### 5.1 工具链

合约开发使用 Monad 推荐的 Monad Foundry：

```text
forge 1.7.1-monad-v1.0.0
cast 1.7.1-monad-v1.0.0
anvil 1.7.1-monad-v1.0.0
```

优先目录结构：

```text
contracts/   Foundry 合约、脚本和测试
web/         React + Vite 静态前端
agents/      本地 Node.js 事件驱动 Agent Runner
```

使用 OpenZeppelin 提供的成熟安全组件，不要重新实现标准权限、防重入或签名工具。

### 5.2 并行友好的状态设计

优先按任务隔离状态：

```solidity
mapping(bytes32 taskId => Task) tasks;
mapping(address agent => Agent) agents;
mapping(address worker => uint256 amount) claimableRewards;
```

避免让所有任务频繁修改同一个全局计数器、全局队列、总金额或全局评分。任务 ID 优先使用确定性哈希，而不是依赖 `nextTaskId++`。

同一任务的排他领取是有意冲突；不同任务的领取、提交、验证和奖励记账应尽量互不写入相同状态。资金提款会改变共享合约余额，不作为并行性能证明。

### 5.3 链上边界

上链：

- Agent 地址和技能；
- 任务标识和状态；
- 输入、输出哈希；
- 验证授权与结果；
- 托管资金、奖励记账和提款；
- 可用于前端实时响应的事件。

不上链：

- 完整图片和大段文本；
- Prompt 和模型推理过程；
- API Key；
- 用户隐私数据；
- 可频繁变化且不涉及信任的 UI 配置。

### 5.4 Gas 规则

Monad 按 `gas_limit` 而不是实际 `gas_used` 收费：

- 使用 `eth_estimateGas` 时只加小幅缓冲，默认不超过 10%；
- 固定成本操作设置紧凑、明确的 Gas Limit；
- 不使用随意放大的 Gas Limit；
- 前端展示的预计费用按 Gas Limit 计算；
- 注意冷账户和冷存储访问在 Monad 上费用更高；
- 合约测试应记录关键写操作的 Gas。

### 5.5 部署和验证

- 先部署并验证核心合约，再把地址接入 Live 前端；
- 目标网络固定为 Monad Testnet，Chain ID `10143`；
- 私钥、助记词、RPC 密钥和 API Key 只放在未提交的环境变量中；
- 部署后必须记录合约地址、部署交易哈希和关键交互交易哈希；
- 合约源码必须在 Explorer 验证；
- 不得仅凭脚本输出宣称部署成功，必须使用 RPC 或 Explorer 回读验证。

## 6. Agent 与 AI 执行约束

- Queen、Worker 和 Guard 的行为优先保持可解释和可重复；
- Queen P0 使用 Vite 前端内的确定性模板；
- Worker 和 Guard 通过比赛电脑上的 Node.js Agent Runner 监听链上事件并行动；
- Agent 私钥只保存在未提交的 `agents/.env`，不得进入 Vercel 或浏览器；
- AI 推理属于链下执行，链上只保存必要承诺和结算状态；
- 外部 AI API 不是 P0 的前置条件；
- 如果真实模型影响稳定性，先使用固定 Mock 输出跑通链上闭环；
- Guard 不得宣称智能合约直接判断了图片或文本的语义质量；
- Guard 可以验证文件存在、哈希、格式、授权签名和任务关联；
- 所有 Mock Agent 的执行延迟、结果和失败都应可控，便于重复 Demo。

## 7. 前端约束

UI/UX 以清楚展示机制为目标，不追求产品级完美。

优先展示：

- 当前是 Mock 还是 Live；
- Agent Runner 是 Online、Offline 还是 Unknown；
- Agent、技能和钱包；
- 任务状态机；
- MON 奖励；
- 交易状态和哈希；
- Monad Explorer 链接；
- Swarm Lane 与 Conflict Lane；
- Rogue Ant 被拒绝的失败路径。

视觉风格围绕「Monad 沙丘上的地下蚁穴」，但每个重要动画都应对应真实业务状态或链上事件。不要为了动画推迟合约闭环、Testnet 部署或公网部署。

不要投入时间制作：

- 冗长营销页面；
- 大量无功能页面；
- 复杂 3D 场景；
- 精致但不可交互的演示稿；
- 与核心机制无关的设计系统。

## 8. 开发节奏

默认顺序：

1. 锁定最小数据模型和状态机；
2. 初始化 Monad Foundry；
3. 实现并测试核心合约；
4. 部署和验证 Testnet 合约；
5. 创建统一 Mock / Live 数据接口；
6. 实现 React + Vite 最小前端闭环；
7. 接入真实合约；
8. 实现本地事件驱动 Agent Runner；
9. 加入 Rogue Ant 失败路径；
10. 加入 `Release the Swarm`；
11. 将静态前端部署到 Vercel；
12. 记录链上证据；
13. 最后做必要的视觉优化。

这是黑客松项目，不使用严格 TDD。先快速实现可运行的最小逻辑，再补充覆盖核心状态机、资金安全和失败路径的测试。不能为了追求测试形式而阻塞 MVP，但不能跳过合约资金和权限测试。

## 9. 完成标准

任何「已完成」「已修复」「部署成功」的声明都必须附带真实验证结果。

### 合约

- `forge build` 通过；
- `forge test` 通过；
- 核心状态机和资金路径有测试；
- 奖励记账与 Worker 提款路径有测试；
- Testnet 合约地址可通过 RPC 读取代码；
- Explorer 可以查看部署和关键交易；
- 源码已验证。

### 前端

- 类型检查通过；
- 构建通过；
- Mock 和 Live 模式均可启动；
- 页面明确显示当前模式；
- Live 模式能够读取真实合约；
- 公网 URL 可访问；
- 浏览器没有阻断演示的错误。

### Git

提交前必须：

```bash
git status --short --branch --untracked-files=all
git diff --check
git diff --cached --check
```

只暂存本任务明确涉及的文件，不使用不加区分的 `git add -A`。提交后推送到 `origin/main`，并确认本地 SHA 与远程 SHA 一致。

## 10. 安全与诚实

- 不提交 `.env`、私钥、助记词、API Key 或真实用户数据；
- 不伪造 Monad 交易、区块、余额、确认时间或 Explorer 证据；
- Mock 与真实 Testnet 数据必须清楚区分；
- 不把未验证的性能推断写成实测结论；
- 不为了演示绕过资金和权限检查；
- 发现会影响核心闭环的问题时，优先修复，不用视觉效果掩盖。

## 11. 决策原则

遇到范围冲突时，依次选择：

```text
可运行闭环 > 真实链上证据 > 新颖机制 > 演示稳定性 > 功能数量 > UI 精致度
```

遇到实现分歧时，优先采用：

- 更小的改动；
- 更少的依赖；
- 更短的关键路径；
- 更清楚的 Mock / Live 边界；
- 更容易在 5 分钟内解释的机制；
- 更容易用真实交易验证的方案。
