# Monad沙丘上的Agent蚂蚁工坊：选题与设计讨论基线

> 英文品牌：**AntForge on Monad**<br>
> 文档状态：赛场选题讨论稿，尚未成为最终实施规格<br>
> 创建时间：2026-07-25<br>
> 用途：沉淀项目灵感、技术判断、范围取舍和待确认事项，为后续正式设计与开发提供共同上下文。

## 1. 项目起点

项目灵感来自真实蚂蚁社会的分工与群体协作：蚂蚁个体能力有限，但通过角色分工、信息素和大量并行活动，可以完成远超单一个体能力的复杂目标。

我们希望把这种结构映射到多 Agent 系统：

- 每个 Agent 是一只拥有独立技能、钱包和履历的「蚂蚁」；
- 用户只提交一个目标，不需要逐个寻找和管理 Agent；
- 蚁后 Agent 将目标拆成可以并行执行的微任务；
- 不同技能的工蚁 Agent 分别领取和执行任务；
- 兵蚁 Agent 负责验证结果或处理失败；
- Monad 智能合约负责托管预算、约束状态流转、记录贡献并结算报酬；
- 链上事件成为公开的「信息素」，驱动 Agent 响应和前端动画。

原始设想覆盖图像、语言、教育、法律、存储和后勤等多个领域。考虑到比赛时间有限，第一版不能同时实现所有能力，而应证明一个最关键的闭环。

## 2. 核心定位

### 2.1 推荐定位

> **AntForge 是一个构建在 Monad 上的 Agent 微任务协作与结算网络：蚁后拆解目标，工蚁并行执行，兵蚁验证结果，合约按贡献实时结算。**

英文定位：

> **A Monad-native swarm execution and settlement network for autonomous agents.**

口号候选：

> **One goal. A thousand ants. One autonomous economy.**<br>
> **一个目标，千只 Agent，一套自治经济。**

### 2.2 它不应该是什么

项目不应退化为：

- 披着蚂蚁视觉皮肤的 Agent 应用商店；
- 用户选择一个 Agent、支付一次费用、获得一次结果的普通 Marketplace；
- 只在最后加入一笔链上付款的中心化 AI 应用；
- 同时覆盖十几个行业、但没有一个完整闭环的 Agent 大杂烩；
- 依靠自研 Token、NFT 或 DAO 包装的概念项目。

普通 Marketplace 的流程是：

```text
用户寻找 Agent
→ 购买服务
→ Agent 返回结果
```

AntForge 的目标流程是：

```text
用户提交复杂目标
→ Queen 拆解微任务和预算
→ 多个 Worker 组成临时蚁群
→ Worker 并行执行
→ Guard 验证结果
→ 合约分别结算
→ Queen 汇总最终交付物
```

项目真正独特的对象不是某一只 Agent，而是：

> 一支围绕具体目标临时形成、按贡献结算、任务完成后自动解散的机器劳动力团队。

## 3. 产品价值

### 3.1 对任务发布者

- 只需描述目标和预算；
- 不需要理解每个 Agent 的接口和能力；
- 不需要分别寻找、支付和管理多个服务；
- 可以追踪谁领取了任务、提交了什么结果、获得了多少报酬；
- 可以通过链上证据验证关键协作与结算记录。

### 3.2 对 Agent 服务提供者

- 可以只提供一种狭窄但专业的能力；
- 不需要成为全能 Agent；
- 能够被其他 Agent 自动发现和雇佣；
- 每次贡献都可以形成可验证的履历和收入记录；
- 可以通过技能、价格、成功记录和响应速度参与任务匹配。

### 3.3 长期商业模式

黑客松 MVP 不实现完整商业化，但项目可以演进为：

- 从任务结算中收取协议费；
- 托管版 Queen Orchestrator 收取编排服务费；
- 为企业提供私有 Colony 和按任务量计费的部署；
- 为 Agent 提供者提供专业验证、托管和服务发现能力。

第一版不引入自研 Token、Agent NFT 或 DAO。

## 4. 蚂蚁角色与 Agent 角色

| 蚂蚁角色 | Agent 定位 | 主要职责 | MVP 优先级 |
| --- | --- | --- | --- |
| 蚁后 Queen | Orchestrator | 理解目标、拆解任务、分配预算、汇总结果 | P0 |
| 工蚁 Worker | Executor | 执行图像、文字或工具微任务 | P0 |
| 兵蚁 Guard | Verifier | 检查结果、批准或拒绝、触发重试 | P0 |
| 流浪蚁 Rogue | Unauthorized Agent | 尝试越权领取任务，用于证明合约防护有效 | P1，推荐进入 Demo |
| 侦察蚁 Scout | Discovery / Bidding | 搜索 Agent、询价和选择执行者 | P2 |
| 储粮蚁 Storage | Storage | 保存文件、CID、数据集和历史结果 | P1，可简化 |
| 后勤蚁 Logistics | Recovery | 超时、重试和任务重新分配 | P2 |

### 4.1 信息素机制

链上事件是公开的「信息素信号」：

```solidity
event TaskCreated(bytes32 indexed taskId, bytes32 skill, uint256 reward);
event TaskClaimed(bytes32 indexed taskId, address indexed worker);
event ResultSubmitted(bytes32 indexed taskId, bytes32 outputHash);
event ResultVerified(bytes32 indexed taskId, address indexed verifier);
event RewardReleased(bytes32 indexed taskId, address indexed worker, uint256 amount);
event TaskRejected(bytes32 indexed taskId, bytes32 reasonHash);
```

技术表达必须保持准确：

> Event 本身不是完整的 Agent 通信协议，而是 Agent 可以监听并响应的公开链上信号。

前端根据这些事件驱动蚂蚁移动、任务节点变化和奖励动画，使视觉效果与真实链上状态保持一致。

## 5. 为什么选择 Monad

### 5.1 当前官方技术参数

截至本讨论稿创建时，Monad 官方文档公开表述为：

- 约 10,000 TPS；
- 400 ms 出块频率；
- 400 ms 投机性最终性；
- 800 ms 完整最终性；
- EVM Fusaka 字节码兼容；
- Ethereum RPC 兼容。

此前讨论材料中出现过「300 ms 出块、600 ms 最终性」的表述。答辩和 README 应统一使用当前官方文档中的 400 ms / 800 ms，除非活动现场官方给出更新数据。

### 5.2 不能只说「Monad 更快、更便宜」

项目更强的 Monad 原生性论证是：

> 一个复杂目标会被拆成大量彼此独立、细粒度、高频的状态更新与微结算。AntForge 刻意减少共享写入，使多个 Agent 对不同任务的交互适合 Monad 的乐观并行执行模型。

### 5.3 并行执行与状态设计

Monad 的并行执行仍然保持区块和交易的线性顺序。节点会乐观并行执行交易，跟踪读取集合和写入结果；如果后序交易读取了已经被前序交易修改的状态，则重新执行相关交易，最终结果与串行 EVM 一致。

因此，合约应减少所有任务共同修改的热点状态，例如：

```solidity
nextTaskId++;
totalTasks++;
totalPaid++;
globalAgentScore++;
```

推荐使用按任务隔离的状态：

```solidity
mapping(bytes32 taskId => Task) public tasks;
mapping(address agent => Agent) public agents;
mapping(bytes32 taskId => mapping(address verifier => bool)) public votes;
```

`taskId` 可以由链下确定性计算：

```text
keccak256(requester, rootTaskId, subtaskIndex, salt)
```

多个 Agent 操作不同 `taskId` 时，访问的是不同任务状态。多个 Agent 竞争同一个任务时，则会形成有意的状态冲突，只有一只 Agent 可以成功领取。

### 5.4 不过度设计

为每个微任务部署一个独立 Escrow 合约，理论上可以进一步隔离状态，但对一天黑客松可能过度设计。

MVP 推荐使用一个结构清晰的核心合约，通过 `mapping(taskId => Task)` 隔离任务。只有在团队人数和现场时间充足时，才考虑 Factory、CREATE2 和 Minimal Proxy。

### 5.5 并发演示需要注意的事实

- 同一个钱包发送的交易受 nonce 顺序约束；
- 前端使用 `Promise.all()` 不代表交易一定在不同 CPU 核心上执行；
- 多个 Agent 抢同一个任务会产生状态冲突；
- 多个 Agent 钱包分别操作不同任务，更符合无冲突并发模型；
- 项目可以证明自身状态结构适合并行执行，但不应声称已经证明每笔交易在底层使用了不同 CPU 核心。

## 6. 链上和链下边界

智能合约不能直接判断：

- 图片是否修得漂亮；
- 文案是否感人；
- 法律意见是否专业；
- 模型推理过程是否具有语义质量。

合约应验证：

- Agent 是否已注册；
- Agent 是否具备任务要求的技能；
- 赏金是否已托管；
- 谁获得了任务执行权；
- 是否在截止时间内提交；
- 输出哈希是否已经确定；
- 验证者是否获得授权；
- 验证签名是否对应指定结果；
- 状态是否按照规则迁移；
- 奖励是否已经结算；
- 是否发生重复领取或重复付款。

推荐边界：

| 链下 | 链上 |
| --- | --- |
| AI 推理 | Agent 身份与技能 |
| 图像处理 | 任务状态机 |
| 目标拆解 | 输入、输出哈希 |
| 语义质量判断 | 验证授权与记录 |
| 文件和大段文本存储 | Escrow 与付款 |
| API Key 和隐私数据 | 贡献记录与事件 |

合约提供的核心价值是：

> 多个互不信任的 Agent 之间可验证的协作状态机与结算规则。

## 7. 合约概念模型

以下是讨论阶段的推荐概念，尚未锁定为最终接口。

### 7.1 Agent

```solidity
struct Agent {
    address owner;
    uint256 skillBitmap;
    bytes32 metadataHash;
    uint96 basePrice;
    uint32 completedTasks;
    uint32 reputation;
    bool active;
}
```

### 7.2 Task

```solidity
enum TaskStatus {
    Open,
    Claimed,
    Submitted,
    Verified,
    Settled,
    Rejected,
    Cancelled
}

struct Task {
    address requester;
    address worker;
    address verifier;
    bytes32 requiredSkill;
    bytes32 inputHash;
    bytes32 outputHash;
    uint96 reward;
    uint40 deadline;
    TaskStatus status;
}
```

### 7.3 核心动作

```text
registerAgent
createTask
claimTask
submitResult
verifyResult
settleTask
cancelExpiredTask
```

完整图片、Prompt、大段文本、模型推理过程、API Key 和隐私数据不写入链上。

## 8. 推荐 MVP Showcase：老照片复原蚁群

### 8.1 用户目标

用户上传一张老照片，并提交：

> 修复照片、完成上色，并生成一段纪念文案。

### 8.2 最小 Agent 队伍

- **Queen Ant**：接收目标，生成微任务并分配预算；
- **Repair Ant**：执行图像增强或修复；
- **Story Ant**：生成照片说明或纪念文案；
- **Guard Ant**：验证文件存在、哈希匹配、格式和任务关联；
- **Rogue Ant**：没有图像修复技能，却尝试领取 Repair 任务。

### 8.3 必须真实上链的闭环

```text
注册 Agent
→ 创建任务并锁定 MON
→ 检查技能
→ 领取任务
→ 提交结果哈希
→ Guard 验证
→ 自动结算
→ Explorer 验证
```

AI 执行可以为了稳定性适度简化，但链上身份、技能约束、状态迁移、Escrow、付款和交易证据必须真实。

### 8.4 Showcase 与协议的关系

```text
AntForge：通用 Agent 蚁群协作与结算协议
老照片复原：第一个易理解、易展示的 Showcase
```

不能让评委最终只记住「这是一个 AI 修图工具」。

## 9. Release the Swarm 技术演示

建议加入一个高冲击力按钮：

> **Release the Swarm｜释放蚁群**

演示分为两条通道：

### 9.1 Swarm Lane

```text
多个 Agent 钱包
→ 同时操作多个不同 taskId
→ 并发提交 claim / submit / settle
→ 前端实时展示交易和区块信息
```

用于展示大量独立任务状态更新和微结算。

### 9.2 Conflict Lane

```text
多个 Agent 同时竞争同一个 taskId
→ 第一只成功领取
→ 其他交易因状态变化失败
```

用于展示任务排他性、状态冲突和合约防止重复领取的能力。

页面可以展示：

```text
Active Ants
Tasks Created
Tasks Settled
Unauthorized Claims Blocked
Onchain Actions
Average Confirmation Latency
Total Rewards
Network: Monad
```

## 10. 前端视觉方向

前端不做传统 SaaS Dashboard 加静态蚂蚁图片，而是做一张动态的「Monad 沙丘蚁穴剖面图」。

核心空间：

```text
Queen Chamber
├── Repair Chamber
├── Story Chamber
├── Guard Chamber
└── Treasury Chamber
```

视觉映射：

| 链上事件 | 前端表现 |
| --- | --- |
| RootTaskCreated | 蚁后房间点亮 |
| TaskCreated | 新任务卵生成 |
| TaskClaimed | 工蚁沿通道前往任务室 |
| ResultSubmitted | 工蚁携带数据晶体返回 |
| ResultRejected | 通道变红，任务重新开放 |
| RewardReleased | MON 粒子进入工蚁粮仓 |
| UnauthorizedClaim | Rogue Ant 被兵蚁拦截 |

重点是事件驱动，而不是复杂 3D。SVG、CSS Animation、Canvas 或 React Flow 都可以实现。每一个重要动画应对应真实任务状态或链上事件。

## 11. 比赛约束

根据赛前整理的官方规则：

- 项目必须在正式比赛期间开始实现；
- 允许赛前头脑风暴和规划；
- 团队最多 3 人；
- 项目仓库必须公开；
- 前端必须部署到公网并长期可访问；
- 项目应在 Monad 测试网上实际运行；
- 提交截止时间为 18:30；
- 每队 Demo 时间为 5 分钟；
- 主要受众是开发者；
- 评审关注核心要求、完成度和商业模式；
- 实机演示和真实链上证据是核心。

比赛正式项目已使用全新仓库：

- GitHub：<https://github.com/NeoWeb3Nova/monad-agent-ant-workshop>
- 本地：`/home/neo/workspace/projects/monad-agent-ant-workshop`

## 12. 范围优先级

### P0：必须完成

1. Agent 注册；
2. 创建任务并锁定 MON；
3. 技能检查；
4. 领取任务；
5. 提交输出哈希；
6. Guard 验证；
7. 自动付款；
8. 前端显示任务状态、交易哈希和 Explorer 链接；
9. 合约部署到 Monad 测试网；
10. 前端部署到公网。

### P1：决定 Demo 效果

1. Queen 任务拆解；
2. 3～4 只可演示 Agent；
3. Monad 沙丘蚁穴动态地图；
4. Rogue Ant 的 `SkillMismatch` 失败路径；
5. `Release the Swarm` 并发任务演示；
6. 真实 Monad 区块和确认时间展示。

### P2：有余力再做

1. Agent 竞价；
2. 多验证者投票；
3. 质押和惩罚；
4. x402 或 MPP；
5. 自动发现协议；
6. 去中心化存储；
7. 复杂争议仲裁；
8. Factory、CREATE2 和每任务独立 Escrow。

### 明确砍掉

- 多行业 Agent 商城；
- Agent NFT；
- DAO 和蚁后选举；
- 自研 Token；
- 多链；
- 十几个真实 AI Agent；
- 复杂 RAG 和长期记忆系统。

## 13. 主要风险与缓解策略

### 13.1 Agent 赛道拥挤

风险：多 Agent、链上支付和声誉已经很常见，蚂蚁叙事本身不是技术差异化。

缓解：突出「冲突感知的并行微任务状态结构、实时事件驱动协作、技能约束和按任务结算」。

### 13.2 范围过大

风险：原始设想同时包含市场、编排、存储、验证、竞价、声誉、x402、图像处理和动态前端。

缓解：只保证 P0 闭环，P1 按时间逐项加入，P2 不作为交付承诺。

### 13.3 AI 功能抢走链上主体

风险：大量时间用于图像 API，最后智能合约只剩简单付款。

缓解：AI 负责让 Demo 易理解，真正的技术主体是身份、技能、状态机、验证、Escrow 和结算。

### 13.4 过度宣称并行性能

风险：前端并发发送交易不能直接证明底层 CPU 调度。

缓解：准确表述为「状态结构减少冲突并适合并行执行」，并通过 Swarm Lane 和 Conflict Lane 展示应用层差异。

### 13.5 外部服务不稳定

风险：图像模型、RPC、存储或 API 在现场失败。

缓解：准备稳定的简化执行路径、预生成结果、截图和录屏；真实链上状态机不能被 Mock 替代。

## 14. 五分钟 Demo 草案

```text
0:00–0:20  直接展示用户目标：修复照片、上色、生成纪念文案
0:20–0:50  Queen 拆解任务，任务卵进入不同工坊
0:50–1:40  多只工蚁领取并执行不同任务
1:40–2:10  Rogue Ant 越权领取，被 SkillMismatch 拒绝
2:10–2:50  工蚁提交结果，Guard 验证
2:50–3:30  多个任务自动结算，奖励进入粮仓
3:30–4:20  Release the Swarm：Swarm Lane 与 Conflict Lane
4:20–4:50  打开 Explorer，展示合约地址和真实交易
4:50–5:00  总结为什么必须使用 Monad
```

核心答辩表达：

> 现有 Agent 平台通常让一个 Agent 完成一个任务，但复杂现实工作需要规划者、执行者、验证者和支付系统协同工作。AntForge 把一个复杂目标拆成大量独立微任务，让不同专业 Agent 像蚁群一样并行协作、提交证明，并通过 Monad 智能合约实时完成验证和结算。

为什么是 Monad：

> 蚁群经济不是每天发生几笔大交易，而是持续产生大量细粒度、高频、彼此独立的任务状态更新和微结算。AntForge 通过按任务隔离状态、减少共享写入，使这种协作模式能够受益于 Monad 的并行 EVM、快速最终性和 EVM 兼容性。

## 15. 已确定与待确认事项

### 已确定

- 中文项目名：`Monad沙丘上的Agent蚂蚁工坊`；
- 英文品牌：`AntForge on Monad`；
- 使用全新公开 GitHub 仓库；
- 项目必须基于 Monad 并包含真实上链智能合约；
- 核心叙事是 Agent 蚁群协作，而不是 Agent 商城；
- 正式比赛已经开始，可以进入项目实现阶段。

### 讨论形成的推荐方向，尚待最终锁定

- 以「通用 Agent 微任务协作与结算协议」为核心；
- 以「老照片复原蚁群」为 Showcase；
- 以「Release the Swarm」作为 Monad 技术加分项；
- MVP 使用单一核心合约加按 `taskId` 隔离的状态；
- AI 推理保持链下，身份、状态、验证和结算上链。

### 开发前仍需确认

1. 现场实际团队人数和成员技能；
2. 最终 Showcase 是否确定为老照片复原；
3. P0 合约是单一合约还是 Registry + Colony 两个合约；
4. AI 执行采用真实 API、本地处理还是稳定 Mock；
5. 前端采用 Vite 还是 Next.js；
6. 部署平台和 Monad 测试网钱包是否已经准备完毕。

## 16. 官方参考资料

- Monad for Developers：<https://docs.monad.xyz/introduction/monad-for-developers>
- Parallel Execution：<https://docs.monad.xyz/monad-arch/execution/parallel-execution>
- Best Practices for High Performance Apps：<https://docs.monad.xyz/developer-essentials/best-practices>
- Agentic Payments：<https://docs.monad.xyz/tooling-and-infra/agentic-payments>

---

本文件记录的是选题阶段形成的共同上下文。后续应在确认 MVP 方向后，另行编写实施规格和开发计划，不应直接把所有讨论项同时纳入实现范围。
