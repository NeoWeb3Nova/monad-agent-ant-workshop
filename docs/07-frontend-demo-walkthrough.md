# AntForge 前端演示逻辑与操作讲稿

> 适用场景：3 分钟路演中的 Live Demo
>
> 目标：让评委看清「连接钱包 → 创建 Colony → Runner 自动执行 → 链上结算 → Explorer 核验」

## 一、先理解每次钱包弹窗代表什么

| 操作 | 是否签名 | 是否上链 | 是否花费 MON | 讲解口径 |
| --- | --- | --- | --- | --- |
| 点击 `Connect wallet` | 仅授权网站读取账户 | 否 | 否 | 「这里只是连接 Requester 身份，没有资金操作。」 |
| 切换到 Monad Testnet | 钱包确认网络切换 | 否 | 否 | 「现在把钱包切到 Chain ID 10143。」 |
| 点击 `Create live colony` 后确认 | **签署合约交易** | **是** | `0.003 MON + Gas` | 「这笔交易创建三个任务，并把三份奖励精确托管进合约。」 |
| Worker / Guard 后续操作 | Runner 用各角色私钥本地签署 | **是** | 各角色支付 Gas | 「后续不是浏览器代签，而是本地 Agent 钱包收到事件后自主交易。」 |

当前前端没有单独的 `personal_sign` 或 `signMessage` 步骤。不要把连接钱包说成「签名」，也不要把交易确认说成「登录签名」。

---

## 二、上台前准备

### 浏览器

1. 打开 [https://antforge-monad.vercel.app/](https://antforge-monad.vercel.app/)；
2. 确认右上角显示 `LIVE SETTLEMENT`；
3. 关闭无关标签页与通知；
4. 另开两个备用标签页：
   - [AntColony 合约](https://testnet.monadexplorer.com/address/0x028268f8fF62edc596f931E17E2Fb21015f5b0A2)
   - [已完成的 Worker 提款交易](https://testnet.monadexplorer.com/tx/0xba439f5fa3eb5b76283ae5c88eaa91779ac89bb4c6338fd482008f25fb0da2c7)

### Requester 钱包

- 网络：Monad Testnet；
- Chain ID：`10143`；
- 余额：至少 `0.003 MON + Gas`；
- 只保留演示账户，避免弹窗时展示其他敏感账户。

### 本地 Agent Runner

在上台前启动，不要在台上输入私钥或修改环境变量：

```bash
cd agents
npm run agents:live
```

看到 `runner-ready` 后保持终端运行。Repair、Color、Story、Guard、Rogue 钱包应已注册、余额充足且互不相同。

### 推荐布局

- 主屏：浏览器全屏；
- 终端放在后台，需要证明 Agent 自主执行时再切出；
- 钱包扩展提前解锁；
- 浏览器缩放保持页面一屏可见，不在路演时滚动找按钮。

---

## 三、逐步演示与口播

## Step 1｜先介绍页面，不点击

### 画面位置

- 右上：`LIVE SETTLEMENT`、合约短地址、`Connect wallet`；
- 左侧：Mission 输入区和 `0 MON` 初始托管余额；
- 中间：Queen、Repair、Color、Story、Guard、Treasury；
- 右侧：Chain evidence 和事件流；
- 底部：Goal → Split tasks → Ant agents → Verify → Settle。

### 口播

> 这是 AntForge 的 Live 界面。右上角明确显示 Live Settlement，说明当前数据源是 Monad Testnet，不是 Mock。左边由 Requester 发布目标，中间是 Agent 蚁穴，右边展示链上事件和 Explorer 证据。

### 不要说

- 不要说页面上的初始 `0/3` 已经是新任务；此时可能只是还没有加载最新 Colony；
- 不要说 Runner 状态 `unknown` 等于离线。只有任务被领取后，前端才会从链上行为推断为 `online`。

## Step 2｜点击 `Connect wallet`

### 点击

点击右上角 `Connect wallet`，在钱包中授权当前 Requester 账户。

### 口播

> 我先连接 Requester 钱包。这里只授权前端读取账户地址，不签消息、不发送交易，也不会移动资金。

### 预期画面

- 钱包按钮由 `Connect wallet` 变为短地址；
- 页面仍没有创建新 Colony；
- 如果钱包不在 Monad Testnet，后续创建时会请求切换网络。

## Step 3｜输入目标

### 点击

点击 `Mission description`，保留默认内容或输入：

```text
Restore one damaged family photograph and recover its story.
```

### 口播

> 我提交的目标是修复一张受损的家庭照片，并恢复它背后的故事。Queen 会用确定性模板把它拆成 Repair、Color 和 Story 三个任务。

### 解释

前端会基于目标分别生成三个 `inputHash`，再根据 Requester、`colonyId`、任务序号和输入哈希派生三个确定性 `taskId`。

## Step 4｜点击 `Create live colony`

### 点击

点击左侧主按钮 `Create live colony`。

### 可能出现的第一个钱包弹窗

如果当前网络不是 Monad Testnet，钱包会先请求切换网络。确认切换到 Chain ID `10143`。

### 口播

> 如果钱包不在 Monad Testnet，前端会先请求切换到 Chain ID 10143。网络切换本身不上链，也不花费 Gas。

### 交易确认弹窗

前端先使用 `simulateContract` 预检；模拟通过后才请求钱包发送 `createColony` 交易。交易中应看到：

- 合约：`0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`；
- Value：`0.003 MON`；
- 另加钱包估算的 Gas；
- 网络：Monad Testnet。

确认交易。

### 口播

> 现在钱包弹出的不是普通消息签名，而是一笔真实合约交易。它会创建三个任务，每个任务奖励 `0.001 MON`，总共把 `0.003 MON` 精确托管进 AntColony 合约。资金不是转给项目方，而是进入任务级 Escrow。

### 安全提示

如果弹窗中的网络、合约地址或 Value 与上面不一致，取消交易，不要为了演示继续确认。

## Step 5｜等待一确认回执

### 页面行为

按钮会等待交易回执。前端最多等待 120 秒，并要求 1 个确认。成功后会重新读取合约日志。

### 口播

> 前端现在等待 Monad 返回一确认回执。我们记录的是广播到回执的 inclusion latency，不把它夸大成 finality。

### 预期画面

- Queen 从 `Awaiting mission` 变为 `Goal ingested`；
- 三个 Chamber 出现新任务；
- Escrow budget 变为 `0.003 MON`；
- 事件流出现 Colony 与 Task 创建事件；
- Workflow 从 Goal 推进到 Split tasks。

若回执成功但页面没有立即更新，点击右侧 Chain evidence 标题旁的刷新按钮。

## Step 6｜解释 Runner 的自动交易

### 不需要点击

浏览器创建 Colony 后，后续操作由本地 Runner 自动完成。此时可以短暂切到终端，让评委看到交易日志，但不要暴露环境变量。

### 口播

> `TaskCreated` 就像链上的信息素。本地 Runner 收到事件后，三只独立 Worker 会根据技能自动行动。Repair、Color、Story 分别签署自己的 `claimTask` 交易，然后提交结果哈希。Guard 使用第四个钱包验证，最后三个 Worker 各自提款。

> 这些后续交易不是 Requester 钱包代签，也不是浏览器后台偷偷签名。每个 Agent 都有独立的本地测试网钱包，并支付自己的 Gas。

### 实际链上顺序

```text
Requester: createColony（浏览器钱包确认）
Repair / Color / Story: claimTask（Runner 本地签署）
Repair / Color / Story: submitResult（Runner 本地签署）
Guard: verifyResult（Runner 本地签署，按 Guard 队列处理）
Repair / Color / Story: withdrawReward（Runner 本地签署）
```

Agent 已注册且资料一致时，Runner 不会重复发送注册交易；若尚未注册，Runner 会先发送 `registerAgent`。

## Step 7｜指着状态变化讲闭环

### 画面

三个 Chamber 会经历：

```text
OPEN → CLAIMED → SUBMITTED → SETTLED
```

### 口播

> 现在可以看到三个任务从 Open 进入 Claimed，再进入 Submitted。Guard 验证后变成 Settled。Treasury 中的 Reward credited 会推进到 `3/3`，底部工作流也会走到 Settle。

> Guard 不是在链上评价照片是否好看。当前它验证任务关系、授权和结果哈希。图片与文本输出是明确标注的 deterministic mock，链上状态和 MON 结算是真实的。

### 页面细节

- Worker 字段会从 `Unclaimed` 变为 Worker 短地址；
- Output 区域会出现结果哈希摘要；
- Swarm progress 最终达到 `100%`；
- Swarm Lane 最终显示 `passed`；
- Runner 状态在检测到领取行为后显示 `online`。

## Step 8｜展示 Chain evidence

### 点击

在右侧 `Real-time pheromones` 事件流中点击一条交易短哈希。

### 口播

> 右侧不是动画日志，而是从 Monad 事件重建的证据。每条记录都带有真实交易哈希和区块。现在我打开其中一笔，Explorer 可以独立核验发送方、合约调用和回执状态。

### 推荐优先展示

1. `RewardCredited` 或 `ResultVerified`；
2. 如果列表中可见 `ColonyCreated`，展示其中的 `0.003 MON` Value；
3. 若新任务事件被后续事件挤出前 8 条，直接打开提前准备的提款交易标签页。

## Step 9｜展示合约

### 点击

点击右下角 `View contract on Explorer`。

### 口播

> 这是部署在 Monad Testnet 的 AntColony 合约，地址是 `0x0282…b0A2`。RPC 能回读到 Runtime Code，源码验证是 Sourcify `exact_match`。所以智能合约不是 Demo 装饰，前面看到的托管和结算都发生在这里。

## Step 10｜解释三个 Proof Lanes

### 重要边界

前端按钮创建的普通 Colony 会实时展示 **Swarm Lane**。`Skill Guard` 和 `Conflict Lane` 的失败证据由 `npm run agents:mock` CLI Demo 产生，Live 前端当前不会通过按钮主动制造这两种失败，因此它们可能显示 `idle`。

### 口播

> 当前这条前端流程展示的是 Swarm Lane，也就是不同 Worker 处理不同任务。旁边的 Skill Guard 和 Conflict Lane 是协议的两条失败路径：无技能 Agent 会被 `SkillMismatch` 拦截；两个 Worker 抢同一任务时，第二笔交易会以 `TaskNotOpen` 回滚。它们的真实证据已经保存在 Explorer 和仓库中，但我不会把当前的 idle 状态说成现场刚触发的结果。

---

## 四、90 秒前端演示连续口播

这段可以和 3 分钟主稿配合使用：

> 右上角显示 Live Settlement，当前连接的是 Monad Testnet。我先点击 Connect wallet。这里只授权读取 Requester 地址，不签消息，也不移动资金。
>
> 目标是修复一张受损的家庭照片。Queen 会把它拆成 Repair、Color、Story 三个任务。
>
> 现在点击 Create live colony。钱包中确认的是一笔真实合约交易，不是登录签名。它会创建三个任务，并把三份奖励共 `0.003 MON` 精确托管进 AntColony。
>
> 交易确认后，`TaskCreated` 事件会唤醒本地 Runner。三只独立 Worker 根据技能分别领取任务、提交结果哈希；Guard 用自己的钱包验证；最后 Worker 自己提款。后续交易都由各 Agent 钱包在本地签署，不需要 Requester 连续点击。
>
> 中间三个 Chamber 会从 Open 依次进入 Claimed、Submitted 和 Settled。右侧 Chain evidence 来自 Monad 的真实事件，每条都可以点击交易哈希到 Explorer 核验。
>
> 当前图片和文案输出是 deterministic mock，但钱包、技能、托管、状态机、交易回执和 MON 结算都是真实测试网行为。

---

## 五、异常处理话术

| 现场情况 | 立即动作 | 口播 |
| --- | --- | --- |
| 钱包未连接 | 点击 `Connect wallet` | 「先授权读取 Requester 地址，这一步不上链。」 |
| 网络不正确 | 确认切换 Monad Testnet | 「切换到 Chain ID 10143，本身不产生交易。」 |
| 用户取消交易 | 不重复狂点 | 「这次交易由用户取消，没有广播，也不会伪造交易哈希。」 |
| `createColony` 模拟失败 | 停止操作，打开已有证据 | 「前端在广播前预检失败，所以没有浪费 Gas。我们切到已完成的链上闭环。」 |
| 交易已广播但等待较久 | 打开钱包活动或 Explorer | 「交易已经广播，现在等待回执；我先展示已部署合约和历史结算证据。」 |
| 创建成功但任务一直 Open | Runner 可能离线 | 「Requester 的托管已经成功，但本地 Agent Runner 当前没有领取。链上状态真实保留为 Open。」 |
| 页面没有刷新 | 点击 Chain evidence 刷新按钮 | 「前端重新回放增量事件，不会回退到 Mock。」 |
| Skill / Conflict 显示 idle | 不假装已触发 | 「这两条失败路径由 CLI Demo 产生，证据在 Explorer；当前前端流程展示 Swarm Lane。」 |
| RPC 故障 | 切提前打开的 Explorer 标签页 | 「现场 RPC 不稳定，我们直接核验已完成的真实交易。」 |

---

## 六、绝对不要说错的地方

1. `Connect wallet` 是账户授权，不是消息签名，也不是链上交易；
2. 真正需要 Requester 确认的是 `createColony` 合约交易；
3. 交易 Value 是 `0.003 MON`，另加 Gas，不是只支付 Gas；
4. 后续 Agent 交易由独立本地钱包签署，不由浏览器 Requester 代签；
5. 前端当前不会现场触发 Skill Guard 和 Conflict Lane；
6. inclusion latency 不是 finality；
7. deterministic mock 指链下输出，不代表链上交易是假的；
8. 页面失败时不会静默回退到 Mock，现场也不要口头把失败说成成功。

---

## 七、推荐的最终演示顺序

```text
展示 LIVE SETTLEMENT
→ 介绍页面三区
→ Connect wallet
→ 输入 / 保留目标
→ Create live colony
→ 确认 Monad Testnet
→ 核对 0.003 MON 后确认交易
→ 指 TaskCreated / Escrow
→ Runner 自动 claim / submit / verify / withdraw
→ 指 Open → Claimed → Submitted → Settled
→ 点击事件交易哈希
→ 打开合约 Explorer
→ 说明 Mock / Live 边界
→ 收口
```
