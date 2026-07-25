# AntForge 路演口播稿

> 适用：Monad Blitz / 项目结束后路演  
> 总时长：**5 分钟**（硬切）  
> 受众：开发者评委（机制 > 叙事 > 愿景）  
> 原则：先讲清问题 → 立刻真机 → 再讲 Monad 必要性 → 亮证据 → 一句话收口  
> 英文品牌：**AntForge on Monad** · 中文：**沙丘上的 Agent 蚂蚁工坊**

---

## 0. 上台前 60 秒检查清单

| 项 | 目标状态 |
| --- | --- |
| 前端 | 公网页或本地 `live` 已打开，标签页预热完成 |
| 模式标识 | 页面可见 **LIVE SETTLEMENT** / Monad Testnet |
| 钱包 | 已切到 Chain ID `10143`，Requester 有少量 MON |
| Agent Runner | 本机 `agents:live` 在线（或提前跑完 mock demo 仅展示结果） |
| 备用 | Mock 模式标签页、录屏、Explorer 证据页、合约地址页各开好 |
| 禁止 | 现场改 `.env`、现场部署合约、现场解释私钥 |

**开场默认路径：** Live 为主，Mock 只作网络故障备份。  
若现场 RPC 卡顿：先讲已完成闭环 + 打开 Explorer 交易，再用 Mock 补全视觉流程。

---

## 1. 五分钟主口播（照着讲）

### 【0:00–0:25】开场：一句话 + 差异

**画面：** 全屏产品首页（Live），不要先翻 PPT。

**口播：**

> 大家好，我们是 **AntForge**，中文名 **Monad 沙丘上的 Agent 蚂蚁工坊**。
>
> 一句话：用户只提交一个目标并锁定 **MON**，蚁后拆任务，多只工蚁并行干活，兵蚁验证，合约按贡献把 **真实 MON** 结算给 Worker。
>
> 它不是 Agent 商城——不是用户去挑一只 Agent 买一次服务；而是围绕目标临时组成一支机器劳动力团队，做完就散，但技能和钱包履历留下。

**动作：** 手指点一下页面上的 Live / Testnet 标识，让评委看见「不是假数据」。

---

### 【0:25–1:25】Mock 或加速视觉：讲清故事（约 60s）

> 若 Live 已热、Runner 在线，可压缩本段到 30s，把时间留给真链操作。  
> 若更稳妥：用 Mock 完整走一遍状态机，再切 Live 证据。

**画面：** `Release the Swarm` / 蚁穴地图 / 三个工坊。

**口播：**

> Demo 场景很简单：修复一张老照片——修复、上色、写一段纪念文案。
>
> 蚁后把目标拆成 **三个独立 taskId**：Repair、Color、Story。  
> 三只工蚁用 **三个独立钱包** 领取、提交结果哈希；兵蚁验证后记账；Worker 再提款。
>
> 请注意：链下图片和文案在 P0 用 **确定性 Mock**，我们诚实标注；  
> 但身份、技能、托管、领取、提交、验证、提款，全部走链上状态机。

**动作：** 点一次 Swarm，让任务从 Open → Claimed → Submitted → Settled 动起来；指一下事件流。

---

### 【1:25–3:40】Live 真机（核心 2 分 15 秒）

**画面：** Live 模式 + 钱包 + Explorer 备用标签。

**口播（边操作边说）：**

> 现在切到 **Monad Testnet 真机**。
>
> 第一步：Requester 钱包调用 `createColony`，一笔交易创建多个任务，并按奖励总和 **精确托管 MON**——钱进合约，不进我们中心化账户。
>
> 第二步：本机 Agent Runner 监听 `TaskCreated` 等事件——这是链上「信息素」。  
> Repair、Color、Story 各自 claim **不同** taskId，再提交 `outputHash`。
>
> 第三步：Guard 调用 `verifyResult`，把奖励记入每个 Worker 的 `claimableRewards`。  
> 最后 Worker 自己 `withdrawReward`，提取 **原生 MON**。

**动作节奏建议：**

1. 确认 Live 标识（5s）  
2. 创建 Colony / 或展示刚完成的 Colony 状态（30–45s）  
3. 指任务状态与事件：`TaskClaimed` → `ResultSubmitted` → `ResultVerified` → `RewardCredited`（40s）  
4. 打开一笔 Explorer 交易（提款或验证）（20–30s）  
5. 念出合约短地址或展示已验证标识（10s）

**可插入的“证据句”（任选一句，别堆）：**

> 合约地址在 Testnet Explorer 可查，Sourcify 是 **exact_match**。  
> 我们跑通了注册、三 Worker 任务、Guard 结算和真实提款，结算后合约余额回到 0。

---

### 【3:40–4:25】机制亮点：为什么是 Monad（约 45s）

**画面：** Proof Lanes（Swarm / Skill Guard / Conflict），或口头讲不切页。

**口播：**

> 我们想证明的不是「换条链也能做托管」，而是 **Monad 适合海量 Agent 微任务**。
>
> 第一，**Swarm Lane**：任务状态按 `taskId` 隔离，不同蚂蚁写不同槽位，低冲突、并行友好——不靠一个全局队列硬串行。
>
> 第二，**Conflict Lane**：两只有技能的蚂蚁抢 **同一个** task，只有第一只成功，第二只链上失败——排他是有意设计。
>
> 第三，**Skill Guard**：流氓蚁没有技能位图权限，会直接 `SkillMismatch`，权限在合约层，不靠前端拦。
>
> 结算用 **Pull 模式**：Guard 只记账，Worker 自己提款，奖励账户彼此隔离，适合高频微结算。  
> Monad 的快速确认，让前端蚁群状态能「跟得上」事件，而不是等很久才刷新。

---

### 【4:25–4:50】技术挑战 + 诚实边界（约 25s）

**口播：**

> 工程上我们卡过几个真问题：公共 RPC 的 `eth_getLogs` 只有 100 区块窗口，前端和 Runner 都做了分页回放；  
> 交易广播用 journal 保证可恢复，避免同一业务动作双花；  
> Monad 按 gas_limit 计费，前端估算不能乱放大 limit。
>
> 我们也不吹：Guard **不**在链上判断「照片好不好看」，只验证授权、哈希和任务关联；  
> 蚁后规划 P0 是确定性模板。黑客松验证的是 **协作与结算机制**，不是模型画质。

---

### 【4:50–5:00】收口（10s，背熟）

**口播：**

> 总结：AntForge 把「一个目标」变成「一支可结算的 Agent 蚁群」——  
> **临时 Colony、持久技能、真实 MON、Monad 原生并行任务结构**。  
> 欢迎提问。谢谢！

**动作：** 定格在 Explorer 合约页或 Live 看板；停，微笑，等提问。

---

## 2. 节奏卡（提词板，可打印）

```text
0:00  一句话定位 + 不是商城
0:25  老照片三任务故事（Mock/动画）
1:25  LIVE：创建 → 领取 → 提交 → 验证 → 提款
3:40  Swarm / Conflict / Skill / Pull
4:25  工程坑 + 诚实边界
4:50  收口 + 谢谢
5:00  停
```

**宁可砍视觉，也不要砍：Live 标识 + 一笔 Explorer 交易 + 为什么 Monad 三句话。**

---

## 3. 30 秒电梯版（饭局 / 投票前）

> AntForge 是 Monad 上的 Agent 蚁群结算网。  
> 你交目标和 MON，蚁后拆微任务，多只工蚁并行执行，兵蚁验证，合约按贡献发真实 MON。  
> 我们强调任务级状态隔离和 Pull 结算，适配 Monad 并行与快速确认——  
> 不是做一个更漂亮的 Agent 商城，而是一支可验证的机器劳动力团队。

---

## 4. 60 秒无 Demo 版（网络全挂）

> 我们在 Monad Testnet 部署了 `AntColony`，源码 Sourcify exact_match。  
> 已完成：Agent 注册、Colony 托管、三 Worker 独立任务、Guard 验证、原生 MON 提款；  
> 另有 Conflict 抢单失败回执、Rogue 技能不匹配拦截。  
> 链下输出是确定性 Mock，链上资金与状态是真的。  
> 机制关键词：Swarm 低冲突、Conflict 排他、Skill Guard、Pull 结算。  
> 证据在仓库 `docs/04-monad-testnet-evidence.md` 和 Explorer。请投我们。谢谢。

---

## 5. 评委可能追问 · 标准答法

### Q：和 Agent 市场有什么区别？

> 市场是「找一只 Agent 买服务」。  
> 我们是「交一个目标 → 临时组队 → 并行微任务 → 按贡献结算 → 队散履历留」。  
> 创新对象是协作与结算协议，不是某一个模型。

### Q：为什么必须用 Monad？

> Agent 协作会产生大量 **彼此独立** 的领取、提交、验证微交易。  
> 我们用 per-task 状态和 per-worker 奖励槽，主动降低跨任务写冲突；  
> 再配合快速确认，让 UI 和事件驱动 Runner 能实时响应。  
> 串行高延迟链也能写合约，但「蚁群体感」和高频微结算演示会塌。

### Q：AI 是真的吗？

> P0 诚实使用确定性 Mock 输出，页面会标注。  
> 真的是：钱包、技能、托管、状态机、事件、MON 进出。  
> 黑客松优先验证结算与协调；模型可替换，协议不变。

### Q：Guard 怎么防作弊？

> 链上：只有授权 verifier、任务状态、哈希与关联。  
> 不做链上语义评分。  
> 赛后路线才是多 Guard / 争议；今天不夸大。

### Q：商业模式？

> 协议层可收托管或结算手续费；  
> 企业侧卖「目标 → 临时 Agent 团队」的编排；  
> Agent 开发者靠技能接微任务赚 MON。  
> 今天交付的是可运行协议 MVP，不是完整平台。

### Q：安全吗？钱会不会锁死？

> 奖励精确托管；验证通过后进 claimable 再由 Worker 提取；  
> 拒绝/超时取消有退款路径；资金路径有重入保护。  
> 测试网原型，主网前还要审计。

### Q：合约地址？

> `0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`（Testnet）  
> 部署区块 `47924433`，Explorer 与仓库 evidence 文档可核对。

---

## 6. 英文 45 秒版（若有国际评委）

> AntForge is a Monad-native swarm execution and settlement network.  
> You post one goal and escrow MON. A Queen splits work into isolated micro-tasks.  
> Skill-matched workers claim and commit results in parallel. A Guard verifies. Workers withdraw real MON.  
> We showcase Swarm vs Conflict lanes, on-chain skill checks, and pull-based rewards—built for many low-conflict agent actions on Monad.  
> Off-chain outputs are mock; on-chain settlement is live on testnet. Thank you.

---

## 7. 分工建议（1–3 人）

| 角色 | 职责 |
| --- | --- |
| 主讲 A | 口播 + 时间控制，绝不超时 |
| 操作 B | 只点提前演练过的按钮；失败立刻切备用页 |
| 机动 C | 负责切 Explorer / 录屏 / 回答技术追问 |

单人时：主讲自己操作，**所有点击路径事先练 3 遍**，失败 5 秒内切 Explorer。

---

## 8. 禁止话术（容易扣分）

| 别说 | 改说 |
| --- | --- |
| 「我们很快很便宜」当唯一卖点 | 「低冲突微任务 + 实时蚁群体验」 |
| 「合约能判断图片质量」 | 「验证哈希、权限与任务关联」 |
| 「已经完全去中心化 AI」 | 「结算在链上，推理在链下」 |
| 「测了 finality / TPS 世界第一」 | 「展示 inclusion 与事件驱动反馈，不作未验证性能结论」 |
| 超时还在讲愿景 | 到 4:50 必须收口 |

---

## 9. 现场故障话术（背两句就够）

**RPC / 创建交易卡住：**

> 现场网络不稳，我们切到已上链证据。这笔是 Guard 验证 / Worker 提款交易，状态可在 Explorer 回读；同时用 Mock 把完整状态机演示给大家。

**Runner 离线：**

> Runner 私钥只在本机，今天展示链上已完成的 Colony 与事件回放；本地 Runner 负责监听信息素并自动 claim/submit。

**钱包弹窗失败：**

> 不影响已部署合约。我们直接打开合约页和结算交易哈希。

---

## 10. 结束姿势

1. 最后一页/最后一屏停留在：**Live 看板 或 Explorer 合约页**  
2. 说完「谢谢」后 **闭嘴**，把时间留给提问  
3. 提问先重复评委问题半句，再答，单题控制在 30–45 秒  

---

**口号收尾（可选，勿重复两遍）：**

> One goal. A thousand ants. One autonomous economy.  
> 一个目标，千只 Agent，一套自治经济。
