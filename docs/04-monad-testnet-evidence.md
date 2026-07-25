# Monad Testnet 链上证据

## 状态

AntForge Phase 4 已在 Monad Testnet（Chain ID `10143`）完成真实链上闭环。链下输出生成仍是明确标注的 deterministic mock；合约状态、钱包签名、交易广播、回执、Escrow、奖励记账和原生 MON 提款均为真实测试网行为。Skill Guard 和 Conflict Lane 属于 Phase 5 的预备证据，本页记录其已发生的交易，但不据此宣称 Phase 5 已完成。

机器可读记录：[`deployments/monad-testnet.json`](../deployments/monad-testnet.json)

## 合约部署

- 合约：`AntColony`
- 地址：`0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`
- 部署区块：`47924433`
- 部署交易：[`0xf056...a00c`](https://testnet.monadexplorer.com/tx/0xf0567983d07c3a5811d603612defb71b188856b44db840b895e164e4f941a00c)
- 合约页面：[`0x0282...b0A2`](https://testnet.monadexplorer.com/address/0x028268f8fF62edc596f931E17E2Fb21015f5b0A2)
- RPC 回读 runtime code：`5388` bytes
- Runtime code hash：`0xda7d09914c8130c292a1d74ee95078b24d61355fa55ffd511a06eace8c800f57`
- `MAX_TASKS_PER_COLONY()` 回读：`8`
- Sourcify：`exact_match`
- 验证任务：[`d9838f06...`](https://sourcify-api-monad.blockvision.org/v2/verify/d9838f06-ca52-4fa5-9f82-db4d4d83a7c9)

## Agent 注册

五个 Agent 角色使用独立测试网钱包注册，代表性 `AgentRegistered` 交易：

- Repair：[`0xe0dd...acb7`](https://testnet.monadexplorer.com/tx/0xe0dd7cf3bfae41f4c3294c3797de12fe8b3e4557f6388db66b95ca7f2b77acb7)
- Color：[`0x9d4a...5537`](https://testnet.monadexplorer.com/tx/0x9d4a1a49a948b990636230d8effe16a387e29f3eb411733aebee892cb1f65537)
- Story：[`0x5ee8...3cd3`](https://testnet.monadexplorer.com/tx/0x5ee84e1f6d4afabda015752a1dc36ccc04a15027ea99837281b7740d701b3cd3)
- Guard：[`0xe631...e7ac`](https://testnet.monadexplorer.com/tx/0xe6317513c033e6114038718c6c2e30db48bd8ff112343187e6630e508a60e7ac)
- Rogue：[`0x105d...b124`](https://testnet.monadexplorer.com/tx/0x105d3252f77949004d422f198eb0068db8aae1fc572feba5a01d437af90cb124)

## Swarm 主闭环

三只独立 Worker 钱包分别完成不同任务。以下以 Repair Task 为纵向证据：

1. 创建 Colony 并锁定三份 `0.001 MON` 奖励：[`0xd7b5...4763`](https://testnet.monadexplorer.com/tx/0xd7b5690c0781520d8750d50aac3b6733735a98a7f091bac1232669f940574763)
2. Repair Worker 领取任务：[`0xf0c1...7f9a`](https://testnet.monadexplorer.com/tx/0xf0c11cffbb2ea79b713d7b1fb6bd757361fa1622a4ba2ebe363a0b2c29c57f9a)
3. Worker 提交 output hash：[`0x2687...433c`](https://testnet.monadexplorer.com/tx/0x2687798b5e875ccf3abc26cb1469d4fb1d798e7e39a3ccbb14158697730f433c)
4. Guard 验证并记入奖励：[`0xc6c8...987e`](https://testnet.monadexplorer.com/tx/0xc6c8d6401ed2e6374660b5e6d1235cd441536cbe17dbacdaa8c5b671dc42987e)
5. Worker 提取真实 MON：[`0xba43...a2c7`](https://testnet.monadexplorer.com/tx/0xba439f5fa3eb5b76283ae5c88eaa91779ac89bb4c6338fd482008f25fb0da2c7)
6. RPC 最终回读：任务状态 `Settled`，Repair / Color / Story 的 `claimableRewards` 均为 `0`，合约余额为 `0`。

## Skill Guard

Rogue Ant 使用独立钱包尝试领取 Repair Task。Runner 在广播前执行 `eth_call` 模拟，合约返回自定义错误 `SkillMismatch`，因此没有浪费测试网 Gas，也没有伪造失败交易哈希。

- Task ID：`0x94073fd15251fb8fafffb1cae65b1259a46ce5492831a6a4bd36ec7aa1319e0e`
- Rogue：`0x773553207D850CdB45f255B610C6E4155Bd7C96d`
- 结果：`blocked-before-broadcast`

## Conflict Lane

两个具有 Repair Skill 的独立钱包竞争同一个 Task：

- Conflict Colony：[`0xe3c6...cc1b`](https://testnet.monadexplorer.com/tx/0xe3c6673447874a22ed9a51dc699d4f23aec000e8980bf738e889860d6325cc1b)
- 成功领取：[`0x1d63...43d1`](https://testnet.monadexplorer.com/tx/0x1d632ec74a9e8e61748bf7912d2744ab72e128f53e9219ccc77fbe5f8c3743d1)
- 冲突失败回执：[`0x5c8f...4061`](https://testnet.monadexplorer.com/tx/0x5c8f5070a5db880178220027a4eeb6d3f6e725be2888cae745996643cb9b4061)
- 失败状态：`reverted`
- 状态回读：赢家与链上 `task.worker` 一致，失败方再次模拟返回 `TaskNotOpen`，最终任务状态为 `Settled`。

## 真实性边界

- `blockchainSettlement = live`
- `agentExecution = deterministic-mock`
- 延迟字段使用单调时钟，表示调用广播 RPC 到检测到一确认回执的 inclusion latency，不宣称 Monad finality。
- Runner 使用单调时钟计算耗时，避免 WSL/宿主时钟校正产生负延迟。
- 根目录 `.env`、角色私钥、交易 journal 和 Foundry cache/broadcast 不提交到 Git。

## Live 浏览器验证

使用生产构建和以下公开配置进行本地浏览器验证：

- `VITE_DATA_MODE=live`
- `VITE_CHAIN_ID=10143`
- `VITE_ANT_COLONY_ADDRESS=0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`
- `VITE_DEPLOYMENT_BLOCK=47924433`

验证结果：

- 页面明确显示 `LIVE SETTLEMENT` 与 Monad Testnet；
- 从 RPC 重建最新 Colony，显示 `1/1` settled、`0.001 MON` Escrow 和区块 `47925206`；
- 页面展示 `TaskCreated → TaskClaimed → ResultSubmitted → ResultVerified → RewardCredited` 事件及 Explorer 链接；
- 浏览器 Console 为 `0` errors，页面无错误横幅或阻断性布局问题；
- Monad 公共 RPC 的 `eth_getLogs` 单次范围限制为 100 个区块。Live Adapter 和 Agent Runner 均按 100-block 分页，浏览器在首次回放后缓存日志，后续刷新只读取新增区块。

## Event-driven Runner 验证

- 从部署区块回放时，Runner 达到 `runner-ready` 并识别 `4` 个历史 Task；
- 已注册且资料一致的 Agent 输出 `agent-ready / already-current`，重启时不重复发送注册交易；
- 使用增量游标跨越超过 100 个新区块持续轮询，没有再次出现 `eth_getLogs is limited to a 100 range`；
- 验证结束后通过 `SIGTERM` 正常停止本地 Runner。
