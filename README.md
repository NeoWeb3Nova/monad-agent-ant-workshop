# AntForge on Monad

**Monad 沙丘上的 Agent 蚂蚁工坊**

> 面向自治 Agent 的 Monad 原生蚁群执行与结算网络。
>
> **一个目标，千只 Agent，一套自治经济。**

| | |
| --- | --- |
| **网络** | Monad Testnet · Chain ID `10143` |
| **合约** | [`AntColony`](https://testnet.monadexplorer.com/address/0x028268f8fF62edc596f931E17E2Fb21015f5b0A2) |
| **源码验证** | Sourcify `exact_match` |
| **仓库** | [NeoWeb3Nova/monad-agent-ant-workshop](https://github.com/NeoWeb3Nova/monad-agent-ant-workshop) |
| **公网 Demo** | [antforge-monad.vercel.app](https://antforge-monad.vercel.app/) |

---

## 项目是什么

AntForge **不是** Agent 商城。

用户提交目标并锁定原生 **MON**；蚁后（Queen）将目标拆成彼此独立的微任务；具备匹配技能的工蚁（Worker）在 Monad 上**领取、执行并提交结果承诺**；兵蚁（Guard）验证后按 Worker 记账，Worker 再**提取真实 MON**。

```text
目标 + MON 托管
  → Queen 规划隔离的 taskId
  → Worker 并行领取 / 提交
  → Guard 验证
  → claimableRewards → withdrawReward
  → Explorer 可核验证据
```

**演示任务：** 修复一张损坏的家庭照片——修复、上色、撰写纪念文案——三只工蚁、三个钱包、一个 Colony。

---

## 为什么选 Monad

| 机制 | 评委看到什么 | 为什么需要 Monad |
| --- | --- | --- |
| **Swarm Lane（群峰通道）** | 不同 Agent 写入不同 `taskId` | 并行友好状态；跨任务低冲突 |
| **Conflict Lane（冲突通道）** | 两只有技能的 Agent 抢同一任务 | 有意排他；只有第一只领取成功 |
| **Skill Guard（技能守卫）** | 流氓蚁缺少技能而失败 | 链上 `SkillMismatch`，避免无效工作 |
| **Pull 结算** | Guard 记账，Worker 自行提款 | 奖励隔离记账，真实原生 MON |
| **信息素事件** | 前端与 Runner 响应链上日志 | 快速确认 → 实时蚁群反馈 |

我们不是把 Monad 当成「更快、更便宜的 L1」讲故事。产品表面是：**大量彼此独立的 Agent 微操作**、**低冲突状态结构**、**高频状态更新** 与 **微结算**——串行、高延迟链难以同样干净地演示。

---

## 系统架构

```text
┌─────────────────────────────────────────────────────────────┐
│  web/   React + Vite + wagmi + viem                         │
│         MockColonyDataSource  │  MonadColonyDataSource      │
│         蚁穴地图 · 证明通道 · 事件流 · Explorer               │
└───────────────────────────┬─────────────────────────────────┘
                            │ 公共 RPC + 钱包（Requester）
┌───────────────────────────▼─────────────────────────────────┐
│  AntColony.sol  （Monad Testnet）                           │
│  agents · tasks · colonyRequesters · claimableRewards       │
│  注册 → 创建 Colony → 领取 → 提交 → 验证 → 提款              │
└───────────────────────────┬─────────────────────────────────┘
                            │ 事件 + 私钥（仅本地）
┌───────────────────────────▼─────────────────────────────────┐
│  agents/  Node.js 事件驱动 Runner                           │
│  Repair · Color · Story · Guard · Rogue（独立钱包）         │
│  可恢复交易 journal · 技能模拟 · 群峰 / 冲突演示             │
└─────────────────────────────────────────────────────────────┘
```

| 层 | 技术栈 | 职责 |
| --- | --- | --- |
| 合约 | Solidity · Monad Foundry · OZ ReentrancyGuard | 托管、技能、状态机、结算 |
| 前端 | React · Vite · TypeScript · Tailwind · wagmi/viem | Mock/Live UI、蚁穴看板、证明通道 |
| Agent | Node 20 · TypeScript · viem | 事件驱动领取 / 提交 / 验证 / 提款 |
| 网络 | Monad Testnet `10143` | 真实字节码、回执、余额 |

**Mock 与 Live（诚实边界）**

| | Mock | Live |
| --- | --- | --- |
| UI / 状态机 | 共用 | 共用 |
| Agent 输出（图/文） | 确定性 Mock | 确定性 Mock（P0） |
| 签名、交易、托管、MON | 模拟 / 明确标注 | **真实 Testnet** |
| 失败处理 | 可控 | 真实错误（禁止静默伪造成功） |

界面始终标明 **Demo Mode** 或 **LIVE SETTLEMENT**。Mock 不得伪装为链上事实。

---

## 核心流程（P0 闭环）

```text
registerAgent
  → createColony（精确托管奖励总和）
  → claimTask          （技能位图 + Open 状态）
  → submitResult       （outputHash + outputURI）
  → verifyResult       （Guard → claimableRewards）
  → withdrawReward     （Worker 提取原生 MON）
```

任务 ID 使用**确定性哈希**，而不是全局 `nextTaskId++`。不同任务避免共享热计数器，使 Swarm Lane 保持并行友好；Conflict Lane 则有意让多方竞争同一 `taskId`。

**Agent 角色**

| 角色 | 技能 | 链上行为 |
| --- | --- | --- |
| Queen | 规划（浏览器模板） | 确定性三任务任务包 |
| Repair / Color / Story | 对应技能位 | 领取 → 提交哈希 |
| Guard | `VERIFY` | 验证 + 记账 |
| Rogue | 技能不匹配 | 被拦截（`SkillMismatch`） |

---

## Monad Testnet 链上证据

完整索引：[`docs/04-monad-testnet-evidence.md`](docs/04-monad-testnet-evidence.md)  
机器可读记录：[`deployments/monad-testnet.json`](deployments/monad-testnet.json)

| 项目 | 值 |
| --- | --- |
| 合约 | [`0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`](https://testnet.monadexplorer.com/address/0x028268f8fF62edc596f931E17E2Fb21015f5b0A2) |
| 部署交易 | [`0xf0567983…a00c`](https://testnet.monadexplorer.com/tx/0xf0567983d07c3a5811d603612defb71b188856b44db840b895e164e4f941a00c) |
| 部署区块 | `47924433` |
| 源码验证 | MonadVision Sourcify **exact_match** |
| Runtime 代码 | `5388` 字节（RPC 回读） |

**群峰结算（以 Repair 任务为纵向切片）**

| 步骤 | Explorer |
| --- | --- |
| 创建 Colony 并托管 | [交易](https://testnet.monadexplorer.com/tx/0xd7b5690c0781520d8750d50aac3b6733735a98a7f091bac1232669f940574763) |
| 领取任务 | [交易](https://testnet.monadexplorer.com/tx/0xf0c11cffbb2ea79b713d7b1fb6bd757361fa1622a4ba2ebe363a0b2c29c57f9a) |
| 提交结果 | [交易](https://testnet.monadexplorer.com/tx/0x2687798b5e875ccf3abc26cb1469d4fb1d798e7e39a3ccbb14158697730f433c) |
| Guard 验证 | [交易](https://testnet.monadexplorer.com/tx/0xc6c8d6401ed2e6374660b5e6d1235cd441536cbe17dbacdaa8c5b671dc42987e) |
| 提取 MON | [交易](https://testnet.monadexplorer.com/tx/0xba439f5fa3eb5b76283ae5c88eaa91779ac89bb4c6338fd482008f25fb0da2c7) |

结算后 RPC 回读：任务状态 `Settled`，Worker `claimableRewards = 0`，合约余额 `0`。

**Conflict Lane：** 赢家 [领取](https://testnet.monadexplorer.com/tx/0x1d632ec74a9e8e61748bf7912d2744ab72e128f53e9219ccc77fbe5f8c3743d1) · 输家 [回执失败](https://testnet.monadexplorer.com/tx/0x5c8f5070a5db880178220027a4eeb6d3f6e725be2888cae745996643cb9b4061)（`TaskNotOpen`）。

**Skill Guard：** Rogue 广播前模拟 → `SkillMismatch`（不伪造失败交易哈希）。

> `blockchainSettlement = live` · `agentExecution = deterministic-mock`  
> 包含延迟指广播到回执的 inclusion latency，**不**宣称 Monad finality。

---

## 快速开始

### 环境要求

- Node.js 20+
- [Monad Foundry](https://docs.monad.xyz)（优先 `forge` / `cast` 1.7.1-monad）
- MetaMask / Rabby，已切换到 Monad Testnet（Live 模式）
- 部署者 / Requester / 各 Agent 钱包的 Testnet MON

### 一键校验（CI 友好）

```bash
git clone https://github.com/NeoWeb3Nova/monad-agent-ant-workshop.git
cd monad-agent-ant-workshop
git submodule update --init

cd contracts && forge build --sizes && forge test -vv && cd ..
cd agents && npm install && npm run typecheck && npm run build && cd ..
cd web && npm install && npm run build && cd ..
```

### 前端（Mock — 离线演示）

```bash
cp .env.example .env   # 保持 VITE_DATA_MODE=mock
cd web && npm install && npm run dev
# http://localhost:5173
```

### 前端（Live — 真实读取 Testnet）

在仓库根目录 `.env` 中配置（参考 `.env.example`）：

```bash
VITE_DATA_MODE=live
VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
VITE_CHAIN_ID=10143
VITE_ANT_COLONY_ADDRESS=0x028268f8fF62edc596f931E17E2Fb21015f5b0A2
VITE_GUARD_ADDRESS=0xD6BFA77F707662A74CdA7C21dBb04e1a6cfddBc5
VITE_EXPLORER_URL=https://testnet.monadexplorer.com
VITE_DEPLOYMENT_BLOCK=47924433
```

```bash
cd web && npm run dev
```

### Agent Runner（仅本地 — 切勿把私钥放到 Vercel）

```bash
# 根目录 .env：ANT_COLONY_ADDRESS、六个角色私钥、RUNNER_FROM_BLOCK=47924433
cd agents && npm install
npm run agents:mock   # 一次性群峰 / 技能守卫 / 冲突 / 结算演示
npm run agents:live   # 持久监听 TaskCreated
```

私钥只放在未提交的 `.env` / `agents/.env`。**严禁**把任何秘密放进 `VITE_*` 变量。

### 合约

```bash
cd contracts
cp .env.example .env   # DEPLOYER_PRIVATE_KEY、MONAD_RPC_URL
forge test -vv
forge script script/DeployAntColony.s.sol:DeployAntColony \
  --rpc-url "$MONAD_RPC_URL" --broadcast -vvvv
# 记录地址前务必用 cast code + Explorer 回读验证
```

### Vercel（静态前端托管）

| 配置项 | 值 |
| --- | --- |
| Framework | Vite |
| Root Directory | `web` |
| Build | `npm run build` |
| Output | `dist` |
| 环境变量 | 仅公开的 `VITE_*`（见上） |

> 说明：Vercel 托管的是**网页前端**；链上结算仍发生在 **Monad Testnet**。公网 Demo URL 确认后再写入本文顶部。

---

## 仓库结构

```text
contracts/     AntColony.sol · Foundry 测试 · 部署脚本
agents/        事件驱动多钱包 Runner
web/           蚁穴看板（Mock / Live 适配器）
deployments/   机器可读 Testnet 证据
docs/          选题 · 赛制 · 工具链 · 链上证据
AGENTS.md      项目级工程约束
```

子模块说明：[contracts](contracts/README.md) · [agents](agents/README.md) · [web](web/README.md)

---

## 5 分钟 Demo 讲稿

1. **开场（20s）** — 一个目标，多只蚂蚁，在 Monad 上用原生 MON 结算。
2. **Mock 路径（60s）** — `Release the Swarm`：Queen → 三个工坊 → 结算 → 证明通道。
3. **Live 路径（150s）** — `LIVE SETTLEMENT` 标识 · 钱包创建 Colony · Runner 领取/提交 · Guard 结算 · 提款 · 打开 Explorer。
4. **机制（40s）** — Swarm vs Conflict · Skill Guard · Pull 奖励 / 并行友好存储。
5. **收尾（20s）** — 合约 + Sourcify + 证据文档 ·「Monad 上的蚁群劳动力市场」。

备用材料：本文证据表 + 录屏。备用**不能**替代真实部署。

---

## 安全与已知限制

**已做到**

- 精确托管奖励总和；禁止无关直接打款路径（合约约束）
- 技能位图 + 领取/验证角色检查
- 资金路径使用 ReentrancyGuard
- 每个 Agent 角色独立钱包；广播前可恢复交易 journal

**诚实不宣称（MVP）**

- 链上直接判断语义级 AI 质量（Guard 查结构/哈希/授权，不判断「照片好不好看」）
- 完整 LLM 蚁后规划（P0 使用确定性模板）
- 多验证者争议仲裁、质押、DAO、NFT、多链
- 公网托管 Agent Runner（私钥留在演示电脑）

**运维注意**

- Monad 公共 RPC 的 `eth_getLogs` 单次范围上限为 **100 个区块**（适配器已分页）
- Monad 按 `gas_limit` 收费——估算时只加小幅缓冲
- 仓库不含私钥；不伪造 Explorer 哈希

---

## 项目文档

| 文档 | 内容 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 范围、Mock/Live 规则、MVP 顺序 |
| [docs/01-project-ideation.md](docs/01-project-ideation.md) | 设计基线 |
| [docs/02-hackathon-rules.md](docs/02-hackathon-rules.md) | Monad Blitz 赛制约束 |
| [docs/03-monad-tooling.md](docs/03-monad-tooling.md) | 工具链参考 |
| [docs/04-monad-testnet-evidence.md](docs/04-monad-testnet-evidence.md) | 完整链上证据 |

---

## 许可证

MIT（黑客松原型）。请仅使用专用 Testnet 私钥；切勿用主网资产为 Agent 钱包充值。

---

**AntForge** — 临时形成的蚁群、可延续的技能、在 **Monad** 上真实结算的 MON。
