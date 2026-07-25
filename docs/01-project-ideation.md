# Monad沙丘上的Agent蚂蚁工坊：MVP 设计基线

> 英文品牌：**AntForge on Monad**<br>
> 版本：MVP Design v2<br>
> 状态：建议实施基线，等待最终确认<br>
> 更新时间：2026-07-25<br>
> 约束来源：`AGENTS.md`、`docs/02-hackathon-rules.md`、`docs/03-monad-tooling.md`

## 1. 一页决策

AntForge 不做 Agent 商城，也不做覆盖多个行业的通用平台。

本次黑客松只证明一个机制：

> 用户提交目标并锁定 MON；Queen 将目标拆成多个独立微任务；不同技能的 Worker Ant 在 Monad 上并发领取任务、提交结果承诺；Guard Ant 验证后，合约按贡献自动结算。

### 最终技术选择

| 层 | MVP 选择 |
| --- | --- |
| 合约 | 一个 `AntColony.sol` |
| 网络 | Monad Testnet，Chain ID `10143` |
| 合约工具 | Solidity + Monad Foundry |
| Web | Next.js App Router + TypeScript + Tailwind CSS |
| 钱包与 RPC | wagmi + viem + injected wallet |
| 后端 | Next.js Route Handlers，Node.js Runtime |
| AI 执行 | 默认 Deterministic Mock，真实 API 仅作可选增强 |
| 数据模式 | Mock Adapter + Monad Adapter |
| 数据库 | 不使用 |
| 部署 | 合约部署到 Monad Testnet，Web 部署到 Vercel |

### Monad 技术展示

- **Swarm Lane**：多个 Agent 操作不同 `taskId`，展示低冲突、并行友好的任务状态；
- **Conflict Lane**：多个 Agent 竞争同一 `taskId`，只有第一只成功；
- **Skill Guard**：Rogue Ant 没有所需技能，链上触发 `SkillMismatch`；
- **Micro Settlement**：每个微任务独立结算小额 MON；
- **Fast Feedback**：交易和事件快速驱动前端蚁群状态。

### 优先级

```text
可运行闭环
> 真实 Testnet 证据
> Monad 原生机制
> Demo 稳定性
> 功能数量
> UI 精致度
```

## 2. 产品定位

### 2.1 一句话

> **AntForge 是一个 Monad-native 的 Agent 微任务协作与结算网络：蚁后拆解目标，工蚁并行执行，兵蚁验证结果，合约按贡献实时结算。**

英文：

> **A Monad-native swarm execution and settlement network for autonomous agents.**

口号：

> **One goal. A thousand ants. One autonomous economy.**<br>
> **一个目标，千只 Agent，一套自治经济。**

### 2.2 与普通 Agent Marketplace 的区别

```text
普通 Marketplace
用户寻找 Agent → 购买一次服务 → Agent 返回结果

AntForge
用户提交目标和预算
→ Queen 创建临时 Colony
→ 多个 Worker 并行处理微任务
→ Guard 验证
→ 合约分别结算
→ Queen 汇总结果
```

创新对象不是某一只 Agent，而是一支按目标临时形成、按技能分工、按贡献结算的机器劳动力团队。

### 2.3 完整蚁群愿景

AntForge 将蚂蚁社会映射成多 Agent 系统：

- 每个 Agent 是一只拥有独立技能、钱包和履历的「蚂蚁」；
- 用户只提交一个目标，不需要逐个寻找和管理 Agent；
- Queen Agent 将目标拆成可以并行执行的微任务；
- 不同技能的 Worker Agent 分别领取和执行任务；
- Guard Agent 负责验证结果、拒绝错误提交或处理失败；
- Monad 智能合约负责托管预算、约束状态流转、记录贡献并结算报酬；
- 链上事件是公开的「信息素信号」，Agent 和前端可以监听并响应；
- Colony 围绕目标临时形成，完成后解散，但 Agent 的钱包、技能和可验证履历继续存在。

这套设计是产品的长期创意内核，不能因为单日比赛无法全部完成就从设计中删除。黑客松应通过 `Live + Mock + Future` 三层表达完整愿景：

| 概念 | 比赛中的实现 | 真实性 | 赛后演进 |
| --- | --- | --- | --- |
| 独立 Agent 技能 | 技能位图和 Agent Registry | Live，真实上链 | 动态技能、服务描述和发现协议 |
| 独立 Agent 钱包 | Repair、Color、Story、Guard、Rogue Testnet 钱包 | Live，真实签名和交易 | Agent 自主管理预算和购买子服务 |
| Agent 履历 | 通过事件重建领取、提交和结算记录 | Live，可验证但不做复杂评分 | 跨 Colony 声誉和可移植履历 |
| 用户只提交目标 | 单一 Mission Composer | Live UI | 更通用的自然语言任务入口 |
| Queen 任务拆解 | 确定性任务模板 | Mock，明确标注 | LLM 规划、动态 DAG 和预算优化 |
| Worker 执行 | 固定输出或内置结果 | Mock，明确标注 | 接入真实图像、语言和行业 Agent |
| Guard 验证 | 权限、结果哈希、格式和任务关联 | Live 规则 + Mock 语义判断 | 多 Guard、模型验证和争议处理 |
| Escrow 与结算 | Native MON 托管和自动付款 | Live，真实上链 | 协议费、流支付和 x402 / MPP |
| 信息素 | 合约事件驱动前端；Agent Route 读取任务状态后行动 | Live，真实事件和状态 | 常驻 Agent 监听器和开放事件协议 |
| Storage / Logistics / Scout | 不进入关键路径 | Future | 存储、重试、发现、竞价和路由 |

其中最重要的边界是：

> Mock 用来模拟暂时做不完的链下智能能力；不能用来伪造合约、资金、交易、区块、事件或 Monad 性能。

因此，即使比赛中 Queen 采用固定模板、Worker 使用预生成结果，观众仍然可以看到完整蚁群故事；同时，Agent 身份、钱包、技能检查、任务状态、信息素事件、Escrow 和结算保持真实。

### 2.4 MVP 暂不实现，不等于放弃

以下能力不进入本次比赛的 P0，但作为赛后路线保留：

- 多行业 Agent 服务网络；
- Agent 自主发现和竞价；
- 质押、Slashing 和复杂声誉；
- 多验证者仲裁；
- 完整 RAG、长期记忆和去中心化存储；
- x402 / MPP 深度集成；
- Factory、CREATE2 和每任务独立 Escrow；
- 更丰富的 Storage、Logistics 和 Scout Agent。

以下内容属于工程复杂度或视觉噪声，不作为创意路线保留：

- 自研 Token、NFT、DAO；
- 多链；
- 独立 FastAPI 和数据库；
- 复杂 3D、WebGL 和冗长营销页面。

## 3. MVP Showcase

### 3.1 场景

用户选择一张内置老照片，并提交：

> 修复照片、完成上色，并生成一段纪念文案。

图片不上传链。MVP 使用项目内置原图和结果文件，避免文件上传、对象存储和图像 API 成为关键路径。

### 3.2 Agent 队伍

| Agent | 技能 | 行为 |
| --- | --- | --- |
| Queen Ant | `PLAN` | 生成 3 个微任务和预算 |
| Repair Ant | `IMAGE_REPAIR` | 返回修复结果 URI 和哈希 |
| Color Ant | `IMAGE_COLORIZE` | 返回上色结果 URI 和哈希 |
| Story Ant | `STORY_WRITE` | 返回纪念文案和哈希 |
| Guard Ant | `VERIFY` | 验证结果结构、哈希和任务关联 |
| Rogue Ant | 无匹配技能 | 尝试领取 Repair Task 并失败 |

### 3.3 AI 执行策略

P0 使用确定性 Mock：

- 固定输入产生固定输出；
- 输出使用内置文件或固定文本；
- 每次生成稳定的 `outputURI` 和 `outputHash`；
- 链上创建、领取、提交、验证和结算全部真实；
- 页面明确显示 `Agent Execution: Mock`；
- 不把 Mock 结果描述成真实模型输出。

如果时间充足，只替换一个 Worker 为真实 AI Adapter，不改变主流程。

黑客松真正验证的是身份、技能、并发任务、排他领取、结果承诺、验证、Escrow 和结算，不是图像模型质量。

## 4. MVP 用户流程

### 4.1 正常流程

```text
1. 用户连接钱包
2. 用户选择 Demo 图片并输入目标
3. Queen 返回 3 个确定性微任务
4. 用户确认预算
5. createColony 一笔交易创建并资助 3 个任务
6. 3 个 Worker 钱包并发 claim 不同 taskId
7. Agent Runner 生成确定性 Mock 输出
8. Worker 提交 outputHash 和 outputURI
9. Guard 分别 verifyAndSettle
10. 前端按事件更新状态
11. 用户查看最终结果、MON 分配和 Explorer 证据
```

### 4.2 Rogue Ant

```text
Rogue Ant 没有 IMAGE_REPAIR 技能
→ 尝试 claim Repair Task
→ 合约检查 skillBitmap
→ revert SkillMismatch
→ UI 显示 Rogue Ant 被 Guard 拦截
```

### 4.3 Release the Swarm

```text
Swarm Lane
多钱包 → 多个不同 taskId → 并发 claim → 多个成功

Conflict Lane
多钱包 → 同一个 taskId → 并发 claim → 仅一个成功
```

两条 Lane 必须产生真实 Monad Testnet 交易。Mock 只能作为视觉后备，不能作为性能证据。

## 5. 架构选择

### 5.1 采用 Next.js 全栈单体

```text
Next.js UI
+ Next.js Route Handlers
+ Monad Foundry Contracts
+ Vercel
```

选择原因：

- 只有一个 Web 部署目标；
- 不需要独立后端和 CORS；
- Agent Testnet 私钥只进入 Vercel Server 环境变量；
- Route Handler 可以使用 viem 发送交易并等待回执；
- Mock 和 Live 共享 TypeScript 类型；
- 最适合单日 MVP。

Vercel Serverless 不适合常驻 Worker，因此每个 Colony 阶段拆成短请求。

### 5.2 拒绝的方案

**Vite + FastAPI**：增加后端部署、CORS 和运维；Python AI 生态不是 P0。

**纯浏览器 dApp**：无法安全保存 Agent 钱包；用户要手动签署所有 Worker 操作，无法体现 Agent 自动行动。

## 6. 总体架构

```text
┌─────────────────────────────────────────────────────┐
│ Vercel                                              │
│                                                     │
│ Next.js Frontend                                    │
│ ├── Mission Composer                                │
│ ├── Colony Map                                      │
│ ├── Swarm / Conflict Console                        │
│ └── Explorer Evidence                               │
│          │                                          │
│          ▼                                          │
│ ColonyGateway interface                             │
│ ├── MockColonyGateway                               │
│ └── MonadColonyGateway ─────────────┐               │
│                                     │               │
│ Route Handlers                      │               │
│ ├── /api/queen/plan                 │               │
│ ├── /api/swarm/claim                │               │
│ ├── /api/swarm/submit               │               │
│ └── /api/swarm/settle               │               │
│          └── Testnet Agent Signers ─┤               │
└─────────────────────────────────────┼───────────────┘
                                      │ viem / RPC
                                      ▼
┌─────────────────────────────────────────────────────┐
│ Monad Testnet                                      │
│ AntColony.sol                                      │
│ ├── Agent Registry                                 │
│ ├── Colony / Task State                            │
│ ├── Skill Guard                                    │
│ ├── Native MON Escrow                              │
│ └── Pheromone Events                               │
└─────────────────────────────────────────────────────┘
```

### 权威数据

| 模式 | 权威来源 |
| --- | --- |
| Mock | 浏览器内 `MockColonyGateway` |
| Live | Monad Testnet 合约、回执和事件 |
| Agent Output | Route Handler 返回内容，链上保存哈希 |
| 部署证据 | `deployments/monad-testnet.json` |

MVP 不使用数据库。Live 状态以合约为准。

## 7. 目录结构

```text
monad-agent-ant-workshop/
├── contracts/
│   ├── foundry.toml
│   ├── src/AntColony.sol
│   ├── test/AntColony.t.sol
│   └── script/DeployAntColony.s.sol
├── web/
│   ├── app/
│   │   ├── api/queen/plan/route.ts
│   │   ├── api/swarm/claim/route.ts
│   │   ├── api/swarm/submit/route.ts
│   │   ├── api/swarm/settle/route.ts
│   │   └── page.tsx
│   ├── src/
│   │   ├── domain/
│   │   ├── gateways/
│   │   ├── agents/
│   │   ├── contracts/
│   │   ├── components/
│   │   └── server/
│   └── public/demo/
├── deployments/monad-testnet.json
├── submissions/evidence.md
└── docs/
```

## 8. 合约设计

### 8.1 一个合约

`AntColony.sol` 同时承担：

- Agent Registry；
- Colony / Task 状态；
- 技能约束；
- Native MON Escrow；
- 状态机；
- 事件。

不拆多个合约，避免增加部署、地址管理、冷外部调用和前端接入成本。

### 8.2 技能位图

```solidity
uint256 constant SKILL_IMAGE_REPAIR = 1 << 0;
uint256 constant SKILL_IMAGE_COLORIZE = 1 << 1;
uint256 constant SKILL_STORY_WRITE = 1 << 2;
uint256 constant SKILL_VERIFY = 1 << 3;
```

领取条件：

```text
agent.skills & task.requiredSkill != 0
```

### 8.3 数据结构

```solidity
struct Agent {
    uint256 skills;
    bytes32 metadataHash;
    bool active;
}

enum TaskStatus {
    None,
    Open,
    Claimed,
    Submitted,
    Settled,
    Rejected,
    Cancelled
}

struct Task {
    bytes32 colonyId;
    address requester;
    address worker;
    address verifier;
    uint256 requiredSkill;
    bytes32 inputHash;
    bytes32 outputHash;
    uint96 reward;
    uint40 deadline;
    TaskStatus status;
}
```

P0 不保存价格、质押、声誉和 Endpoint。

`outputURI` 放在事件中，链上状态只保存 `outputHash`。

### 8.4 状态机

```text
None → Open
Open → Claimed
Claimed → Submitted
Submitted → Settled
Submitted → Rejected
Open / Claimed / Submitted → Cancelled after deadline
```

Guard 的批准和结算合并为一次 `verifyAndSettle`，不增加独立 `Verified` 状态。

### 8.5 确定性 ID

```text
taskId = keccak256(requester, colonyId, subtaskIndex, inputHash)
```

避免全局 `nextTaskId++` 热点。

### 8.6 核心接口

```solidity
registerAgent(uint256 skills, bytes32 metadataHash)

createColony(
    bytes32 colonyId,
    TaskInput[] tasks,
    address verifier
) payable

claimTask(bytes32 taskId)

submitResult(
    bytes32 taskId,
    bytes32 outputHash,
    string outputURI
)

verifyAndSettle(bytes32 taskId)
rejectAndRefund(bytes32 taskId, bytes32 reasonHash)
cancelExpiredTask(bytes32 taskId)
```

`createColony`：

- 一笔交易创建最多 8 个独立任务；
- `sum(task.reward) == msg.value`；
- Task ID 必须唯一；
- Verifier 必须已注册并具备 `VERIFY`；
- Deadline 必须有效。

### 8.7 权限和资金

| 动作 | 权限 |
| --- | --- |
| 注册 Agent | 任意地址 |
| 创建 Colony | 任意地址 |
| 领取 | Active 且技能匹配的 Agent |
| 提交 | 当前 Worker |
| 验证和结算 | 指定 Verifier |
| 拒绝和退款 | 指定 Verifier |
| 超时取消 | Requester |

资金规则：

- 使用 Native MON；
- 使用 Checks-Effects-Interactions；
- 结算和退款使用 `nonReentrant`；
- 先更新状态，再转账；
- 转账失败时整笔回滚；
- 不收协议费；
- 不支持升级；
- 不设置管理员提款后门。

### 8.8 Pheromone Events

```solidity
event AgentRegistered(address indexed agent, uint256 skills);
event ColonyCreated(bytes32 indexed colonyId, address indexed requester, uint256 taskCount);
event TaskCreated(bytes32 indexed colonyId, bytes32 indexed taskId, uint256 skill, uint256 reward);
event TaskClaimed(bytes32 indexed taskId, address indexed worker);
event ResultSubmitted(bytes32 indexed taskId, address indexed worker, bytes32 outputHash, string outputURI);
event TaskSettled(bytes32 indexed taskId, address indexed worker, uint256 reward);
event TaskRejected(bytes32 indexed taskId, bytes32 reasonHash);
event TaskCancelled(bytes32 indexed taskId);
```

MVP 直接读取标准事件，不部署 Indexer。

## 9. Monad 原生功能

### 9.1 低冲突状态

不同 Worker 分别写入：

```text
tasks[repairTaskId]
tasks[colorTaskId]
tasks[storyTaskId]
```

不共同修改全局任务计数、总支付、全局队列或全局声誉。

准确表述：

> AntForge 通过按 `taskId` 隔离状态来减少冲突，使任务交互适合 Monad 的乐观并行执行。

不宣称应用能够控制底层 CPU 调度。

### 9.2 Swarm Lane

多个 Testnet Agent 钱包通过 `Promise.allSettled()` 并发领取不同任务。

前端显示真实交易哈希、区块、Receipt 时间、成功数量和平均确认时间。

### 9.3 Conflict Lane

多个 Agent 同时领取同一任务：

- 第一笔成功；
- 其他交易因 `TaskNotOpen` 失败；
- UI 展示赢家和冲突失败。

### 9.4 微结算与快速反馈

每个任务分配小额 MON。具体金额由 Testnet 余额决定，不写死在合约中。

Monad 约 400 ms 出块、约 800 ms 完整最终性，使领取、提交和结算可以快速驱动前端状态。

### 9.5 Gas

Monad 按 `gas_limit` 收费：

- 估算只加最多 10% 缓冲；
- 不使用夸张 Gas Limit；
- 不在链上扫描 Agent 或 Task 数组；
- 动态 URI 进入事件，不长期存储；
- Demo 记录关键写操作的 Gas Limit。

## 10. 后端设计

### 10.1 职责

Route Handlers 只负责：

- Queen 的确定性任务规划；
- 使用 Testnet Agent 钱包发送 Worker / Guard 交易；
- 生成确定性 Mock 输出；
- 返回交易哈希、Receipt 和规范化错误。

不负责：

- 保存权威 Task 状态；
- 数据库；
- 文件上传；
- 常驻事件监听；
- 替代合约权限检查。

### 10.2 路由

```text
POST /api/queen/plan
POST /api/swarm/claim
POST /api/swarm/submit
POST /api/swarm/settle
GET  /api/health
```

Queen P0 使用固定模板，不调用 LLM。

Swarm Route：

- 只允许预定义演示动作和目标合约；
- 校验 `colonyId`、`taskId` 和场景；
- 使用预配置 Agent 地址；
- 用 `Promise.allSettled()` 保留每笔结果；
- 返回真实交易哈希或真实错误；
- 不返回伪成功。

每个阶段使用独立请求，避免 Vercel 超时。

### 10.3 Agent 私钥

```text
REPAIR_AGENT_PRIVATE_KEY
COLOR_AGENT_PRIVATE_KEY
STORY_AGENT_PRIVATE_KEY
GUARD_AGENT_PRIVATE_KEY
ROGUE_AGENT_PRIVATE_KEY
```

规则：

- 只使用 Testnet 专用钱包；
- 每个钱包只保留少量 Testnet MON；
- 私钥不使用 `NEXT_PUBLIC_*`；
- 不返回浏览器、不写日志；
- 路由只能操作指定合约和预定义函数；
- Demo 前提前充值并等待 Reserve Balance 状态可用。

## 11. 前端设计

### 11.1 单页结构

```text
Header
├── Monad Network
├── Mock / Live Badge
└── Connect Wallet

Mission Composer
├── Demo Photo
├── Goal
├── Budget
└── Create Colony

Colony Map
├── Queen
├── Repair
├── Color
├── Story
├── Guard
└── Treasury

Swarm Console
├── Claim
├── Submit
├── Settle
├── Swarm Lane
└── Conflict Lane

Evidence Panel
├── Contract Address
├── Transaction Hashes
├── Block / Latency
└── Explorer Links
```

### 11.2 视觉约束

- Monad 沙丘和地下蚁穴主题；
- CSS + SVG；
- 简单 CSS Transition 或轻量动画；
- 状态变化驱动动画；
- 不做 Three.js、WebGL、复杂粒子和完整设计系统。

事件映射：

| 状态 | UI |
| --- | --- |
| `ColonyCreated` | Queen 点亮 |
| `TaskCreated` | Task Cell 出现 |
| `TaskClaimed` | Ant 移向任务 |
| `ResultSubmitted` | Ant 携带结果返回 |
| `TaskSettled` | MON 进入 Worker Cell |
| `SkillMismatch` | Rogue Ant 被拦截 |
| Conflict 失败 | 输家变灰并标记冲突 |

## 12. Mock / Live 双模式

### 12.1 两个独立模式轴

```text
NEXT_PUBLIC_DATA_MODE=mock | live
AGENT_EXECUTION_MODE=mock | api
```

P0 推荐：

```text
DATA_MODE=live
AGENT_EXECUTION_MODE=mock
```

链上流程真实，AI 输出稳定。

### 12.2 共享模型与接口

Mock 和 Live 共享 `Agent`、`Task`、`Colony`、`TaskStatus`、`ColonyEvent` 和 UI。

```typescript
interface ColonyGateway {
  getAgents(): Promise<Agent[]>;
  getColony(colonyId: Hex): Promise<Colony>;
  createColony(input: CreateColonyInput): Promise<ChainActionResult>;
  watchColony(colonyId: Hex, onEvent: (event: ColonyEvent) => void): () => void;
}
```

Adapters：

```text
MockColonyGateway
MonadColonyGateway
```

组件中不散落 `if (mock)`。

### 12.3 真实性

- Mock 必须显示 `Mock Mode`；
- Live 必须来自 RPC、合约、Receipt 或事件；
- Mock 哈希、余额和延迟不得标注为真实；
- Live 失败时显示真实错误；
- 不静默回退并伪装成功。

## 13. 错误处理

合约使用自定义错误：

```solidity
error AgentInactive();
error SkillMismatch();
error TaskNotOpen();
error UnauthorizedWorker();
error UnauthorizedVerifier();
error InvalidRewardTotal();
error InvalidTaskCount();
error DeadlineExpired();
error TransferFailed();
```

前端将错误转换为可演示信息：

| 错误 | UI 文案 |
| --- | --- |
| `SkillMismatch` | Rogue Ant 没有所需技能，被 Guard 拦截 |
| `TaskNotOpen` | 任务已经被其他 Agent 领取 |
| `UnauthorizedWorker` | 当前 Agent 不是任务 Worker |
| `UnauthorizedVerifier` | 当前 Agent 不是指定 Guard |
| `DeadlineExpired` | 任务已过期 |
| `TransferFailed` | 结算失败，交易已回滚 |

Route Handler 统一返回：

```json
{
  "ok": false,
  "code": "SKILL_MISMATCH",
  "message": "Rogue Ant cannot claim IMAGE_REPAIR task.",
  "txHash": null
}
```

## 14. 快速验证，不做 TDD

不采用严格 TDD，不要求先写测试再实现。

```text
先实现最小逻辑
→ 本地跑通 Happy Path
→ 补关键合约测试
→ 部署 Testnet
→ 回读真实状态
→ 接入前端
→ 浏览器实机验证
```

### 最小合约测试

只覆盖：

1. 注册 Agent；
2. 创建 Colony 并锁定正确奖励；
3. 合法 Agent 领取；
4. Rogue Ant 触发 `SkillMismatch`；
5. 同一任务不能重复领取；
6. 非 Worker 不能提交；
7. 非 Guard 不能结算；
8. Guard 结算后 Worker 收到正确 MON；
9. 不能重复结算；
10. 超时取消可以退款。

不做 Fuzz、Invariant、Formal Verification、Mutation Testing、覆盖率目标和 UI 单元测试体系。

### 前端检查

```bash
npm run lint
npm run typecheck
npm run build
```

浏览器只验证核心 Demo 路径和阻断性 Console 错误。

## 15. 开发与部署路径

### Phase 1：Contracts

```text
初始化 Monad Foundry
→ 实现 AntColony.sol
→ 最小测试
→ forge fmt / build / test
```

### Phase 2：Testnet

```text
部署
→ cast receipt
→ cast code
→ cast call
→ 验证源码
→ 写入 deployments/monad-testnet.json
```

### Phase 3：Web Mock

```text
创建 Next.js
→ TypeScript target 设置为 ES2020
→ 安装 wagmi / viem
→ 单页布局
→ MockColonyGateway
→ Mock 闭环
```

### Phase 4：Live

```text
接入 ABI 和地址
→ MonadColonyGateway
→ Agent Route Handlers
→ 注册 Agent 钱包
→ 真实领取、提交和结算
```

### Phase 5：Monad Showcase

```text
Rogue Ant
→ Swarm Lane
→ Conflict Lane
→ Latency / Gas / Explorer Evidence
```

### Phase 6：Vercel

```text
Root Directory = web
→ 配置环境变量
→ Production Build
→ Deploy
→ 匿名访问验证
→ Live 流程验证
```

### Phase 7：Submission

```text
更新 README 和 evidence
→ 录制备用 Demo
→ GitHub 切换 Public
→ MOJO 提交
```

## 16. Vercel 配置

```text
Framework: Next.js
Root Directory: web
Build Command: npm run build
Node Runtime: 20.x
```

Public：

```text
NEXT_PUBLIC_DATA_MODE=live
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_CHAIN_ID=10143
NEXT_PUBLIC_ANT_COLONY_ADDRESS=0x...
NEXT_PUBLIC_EXPLORER_URL=https://testnet.monadexplorer.com
```

Server-only：

```text
AGENT_EXECUTION_MODE=mock
REPAIR_AGENT_PRIVATE_KEY=...
COLOR_AGENT_PRIVATE_KEY=...
STORY_AGENT_PRIVATE_KEY=...
GUARD_AGENT_PRIVATE_KEY=...
ROGUE_AGENT_PRIVATE_KEY=...
```

风险：

| 风险 | 缓解 |
| --- | --- |
| Route 超时 | 阶段拆成独立短请求 |
| RPC 限流 | 不轮询，限制任务数量 |
| Serverless 无持久内存 | Live 以合约为准，Mock 在浏览器 |
| Agent 钱包余额不足 | 提前充值并逐个检查 |
| 环境变量缺失 | `/api/health` 只返回配置状态 |
| 地址未同步 | Deployment JSON 与 Vercel Env 同步 |

## 17. 五分钟 Demo

```text
0:00–0:20  展示目标和 Colony Map
0:20–0:50  用户一笔交易创建并资助 3 个任务
0:50–1:30  Release the Swarm：3 个 Agent 并发 claim
1:30–1:55  Rogue Ant 触发 SkillMismatch
1:55–2:35  Worker 提交，Guard 结算，MON 到账
2:35–3:20  Conflict Lane：多个 Agent 抢同一任务
3:20–4:10  展示哈希、区块、延迟、Gas 和 Explorer
4:10–4:40  解释按 taskId 隔离的并行友好状态
4:40–5:00  公网 URL、合约地址和商业延展
```

## 18. 范围和完成定义

### P0

- `AntColony.sol`；
- Agent 注册、技能检查；
- Colony 创建和 Native MON Escrow；
- Claim、Submit、Verify + Settle；
- Monad Testnet 部署和源码验证；
- Mock / Live Adapter；
- 单页前端；
- Vercel 公网部署；
- 真实交易和 Explorer 证据。

### P1

- Rogue Ant；
- Swarm Lane；
- Conflict Lane；
- 多 Agent Testnet 钱包；
- 事件驱动动画；
- 实测确认时间和 Gas Limit；
- 备用 Demo 录屏。

### P2

- 一个真实 AI Adapter；
- Monad 扩展 WebSocket；
- 输出文件上传；
- Guard 奖励；
- 更丰富动画。

### 完成检查

```text
Contracts
[ ] forge fmt / build / test 通过
[ ] Testnet 地址存在字节码
[ ] 关键状态可通过 cast call 读取
[ ] 部署和关键交易可在 Explorer 查看
[ ] 源码已验证

Function
[ ] 用户一笔创建并资助 Colony
[ ] 3 个 Worker 领取不同任务
[ ] Rogue Ant 因 SkillMismatch 失败
[ ] Worker 提交结果哈希
[ ] Guard 结算，余额变化可验证
[ ] Conflict Lane 只有一个赢家

Web
[ ] Mock 和 Live 均可运行
[ ] 当前模式清楚可见
[ ] 交易哈希链接到 Explorer
[ ] lint / typecheck / build 通过
[ ] Vercel URL 可匿名访问

Submission
[ ] README、deployment 和 evidence 完整
[ ] Demo 不超过 5 分钟
[ ] 备用录屏可用
[ ] 仓库切换为 Public
[ ] MOJO 提交完成
```

## 19. 降级策略

时间不足时依次删除：

1. 真实 AI Adapter；
2. 图片上传，改用内置图；
3. 复杂动画，只保留状态和事件流；
4. 扩展 WebSocket；
5. Guard 奖励；
6. 缩小 Swarm 任务数量。

不能删除：

- Testnet 合约；
- Skill Guard；
- Escrow；
- Claim、Submit、Verify、Settle；
- 一个真实失败路径；
- Explorer 证据；
- 公网前端。

## 20. 商业延展

MVP 不实现商业化。长期可以：

- 对成功结算收取协议费；
- 提供企业私有 Colony；
- 提供托管 Queen 编排；
- 接入 x402 / MPP；
- 接入可验证存储和多 Guard 共识；
- 建立跨应用 Agent 技能和履历网络。

答辩只讲一个合理方向，不展开冗长 Roadmap。

## 21. 最终原则

```text
一个合约
一个网页
一个 Showcase
两条 Monad Lane
一条真实资金闭环
```

新增功能必须同时满足：

1. 让 Monad 优势更可见；
2. 让核心闭环更可靠；
3. 能在 5 分钟内展示；
4. 值得增加失败风险。

否则默认不做。

## 22. 参考

- 项目约束：`AGENTS.md`
- 赛制：`docs/02-hackathon-rules.md`
- Monad 工具：`docs/03-monad-tooling.md`
- Monad for Developers：<https://docs.monad.xyz/introduction/monad-for-developers>
- Parallel Execution：<https://docs.monad.xyz/monad-arch/execution/parallel-execution>
- Best Practices：<https://docs.monad.xyz/developer-essentials/best-practices>

---

本文档是 MVP 设计基线。确认后，下一步基于本文档生成短周期实施计划，再开始正式编码。
