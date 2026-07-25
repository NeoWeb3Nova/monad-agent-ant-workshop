# AntForge 3 分钟路演口播稿

> 主线：问题 → Live 闭环 → Monad 机制 → 证据与边界
>
> 前端逐步操作见 [`07-frontend-demo-walkthrough.md`](07-frontend-demo-walkthrough.md)

## 0:00–0:25｜定位

【画面：AntForge 首页，指向右上角 `LIVE SETTLEMENT`】

大家好，我带来的项目叫 **AntForge**，中文名是「Monad 沙丘上的 Agent 蚂蚁工坊」。

用户提交一个目标并锁定 MON，Queen 把目标拆成微任务，Worker 分别执行，Guard 验证结果，合约再把 MON 结算给完成任务的 Worker。

它不是一个 Agent 商城，而是一套多 Agent 协作与结算协议。

## 0:25–0:55｜Demo 场景

【画面：指向 Mission、Repair、Color、Story 和 Guard Chamber】

今天的目标是修复一张受损的家庭照片。Queen 会把它拆成 Repair、Color、Story 三个独立任务，由三只拥有不同技能、使用不同钱包的 Worker 领取。

真正要解决的问题不是「谁会生成图片」，而是多只 Agent 怎样可信地分工、提交、验证和分钱。

## 0:55–1:50｜Live 闭环

【动作：连接钱包，点击 `Create live colony`，在钱包中确认交易】

现在我创建一个真实的 Colony。

Requester 调用 `createColony`，一笔交易创建三个 `taskId`，并把 `0.003 MON` 精确托管进合约。

交易确认后，本地 Agent Runner 收到 `TaskCreated` 事件。三只 Worker 根据技能自动领取任务、在链下生成确定性结果，再把结果哈希提交到链上。Guard 验证任务关系和结果哈希，把奖励记入每个 Worker 的 `claimableRewards`。最后，Worker 自己调用 `withdrawReward` 提取原生 MON。

【画面：指向任务状态、Chain evidence 和事件流】

页面会从 Monad Testnet 的事件和合约状态重建 Colony。这里看到的任务状态、交易哈希和区块都可以在 Explorer 核验，不是前端伪造的数据。

## 1:50–2:30｜为什么是 Monad

【画面：指向 Swarm Lane、Skill Guard、Conflict Lane】

多 Agent 协作会产生大量短小、频繁、彼此独立的链上操作。

在 **Swarm Lane** 中，不同 Worker 写入不同 `taskId`，任务状态彼此隔离，不依赖全局自增计数器，状态结构是低冲突、并行友好的。

在 **Conflict Lane** 中，两只 Worker 抢同一个任务，只有第一只成功，第二笔交易会以 `TaskNotOpen` 回滚。没有对应技能的 Rogue Ant 则会被合约以 `SkillMismatch` 拦截。

当前前端流程实时展示 Swarm Lane；Skill Guard 和 Conflict Lane 的失败证据由 CLI Demo 产生，并已保存在 Explorer。它们不会被这个按钮现场触发。

这就是 AntForge 与 Monad 的结合点：任务级低冲突状态、频繁事件和微结算。

## 2:30–2:50｜证据与边界

【动作：点击事件交易哈希或 `View contract on Explorer`】

合约已经部署到 Monad Testnet，地址是 `0x0282…b0A2`，源码验证为 Sourcify `exact_match`。仓库中保存了创建、领取、提交、验证、提款和冲突失败的完整交易证据。

我也明确说明：Queen 的规划模板和图片、文本输出目前是 deterministic mock；真实的是钱包、技能、托管、状态机、交易回执和 MON 结算。

## 2:50–3:00｜收口

【画面：停在 Live 看板或 Explorer】

AntForge 把一个目标变成一支可以分工、可以验证、可以结算的 Agent 蚁群。

一个目标，多只 Agent，真实 MON。谢谢大家。

---

## 8 句提词卡

```text
1. 一个目标 + MON → Queen 拆解 → Worker 执行 → Guard 验证 → Worker 提款
2. 不是 Agent 商城，是多 Agent 协作与结算协议
3. Repair / Color / Story，三个 taskId，三个独立 Worker 钱包
4. 连接钱包 → Create live colony → 确认 0.003 MON 交易
5. Runner 自动 claim → submit → verify → withdraw
6. Swarm 低冲突；Conflict 有意排他；Skill Guard 合约拦截
7. 输出是 deterministic mock，链上状态和 MON 结算是真实的
8. 一个目标，多只 Agent，真实 MON
```

## 超时删减顺序

如果现场钱包或 RPC 较慢，按以下顺序删减：

1. 删除 Demo 场景的第二段；
2. Monad 机制只讲 Swarm Lane 和 Conflict Lane；
3. 不念合约地址，直接打开 Explorer；
4. 保留真实性边界和最后一句收口。

## 60 秒无网络备用稿

大家好，我带来的项目叫 AntForge，它是一套部署在 Monad 上的多 Agent 协作与结算协议。

用户提交目标并托管 MON，Queen 把目标拆成独立任务。具备匹配技能的 Worker 领取任务、提交结果哈希，Guard 验证后记账，Worker 最后提取原生 MON。

不同任务按 `taskId` 隔离，形成低冲突的 Swarm Lane；多个 Worker 抢同一任务时，第二笔交易会以 `TaskNotOpen` 回滚；没有技能的 Rogue Ant 会被 `SkillMismatch` 拦截。

合约已经部署到 Monad Testnet，源码为 Sourcify `exact_match`，Explorer 中保留了完整闭环和冲突失败证据。链下输出目前是 deterministic mock，链上身份、托管、交易和 MON 结算是真实的。

这就是 AntForge：一个目标，多只 Agent，真实 MON。