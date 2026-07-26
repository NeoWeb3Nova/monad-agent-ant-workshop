# AntForge 双语 README 专业化设计

> 日期：2026-07-26
>
> 状态：已获用户确认，等待书面规格复核
>
> 范围：仅优化项目 README 文档，不修改产品、合约、Agent Runtime 或前端功能

## 1. 目标

将 AntForge 的仓库入口从“信息完整的黑客松验证文档”升级为“面向潜在合作方的专业产品与协议主页”，同时保留所有可复核的 Monad Testnet 证据、工程边界和开发者复现路径。

主要读者是潜在合作方，包括 Agent framework 团队、结果验证服务、Monad 生态参与者和 Design Partner。README 仍需服务技术评审和开发者，但首要说服链调整为：

```text
产品愿景
→ 可运行产品
→ 真实链上证据
→ Monad 原生机制
→ 创始人可信度
→ 长期商业愿景
→ 合作入口
```

## 2. 已确认方向

采用 **Founder × Product** 方向：AntForge 保持独立协议品牌，Neo.Yun 的个人品牌作为项目持续交付能力的背书，而不是把个人 GitHub Profile 整段复制到项目 README。

不采用：

- 纯黑客松评委验证页：技术证据强，但合作价值与作者可信度表达不足；
- 个人 Venture Studio 主页：合作入口强，但会稀释 AntForge 的独立产品定位；
- 单文件逐节中英对照：篇幅过长，降低 GitHub 浏览效率。

## 3. 文件与语言策略

### 3.1 文件

- `README.md`：英文主版本，GitHub 默认展示；
- `README.zh-CN.md`：完整中文版本；
- 两个版本顶部使用 GitHub 兼容的语言切换徽章，并互相链接；
- 继续使用 `docs/assets/antforge-product-hero.webp`，不新增无必要的装饰性素材。

### 3.2 双语一致性

两个版本必须保持：

- 相同事实与证据；
- 相同章节顺序；
- 相同部署地址、交易和外部链接；
- 相同 Mock / Live / Future 边界；
- 相同作者履历与合作入口；
- 相同安全限制与许可证状态。

英文版使用自然、专业的国际开源项目表达，不做中文逐字直译。中文版不是英文版的删减摘要。

## 4. 信息架构

### 4.1 Hero

首屏包含：

- `AntForge on Monad`；
- 英文产品定位：`A settlement layer for autonomous agent swarms.`；
- 价值说明：一个 Mission 形成临时、按技能匹配、可验证并由 Monad 结算的机器劳动力团队；
- Public Demo、Explorer、Contract、语言切换入口；
- 现有产品主视觉；
- 少量真实技术徽章，不堆叠低价值或不可核验指标。

### 4.2 Product Thesis

先解释商业与协议问题：现有 Agent 产品主要帮助用户选择或调用单个 Agent，而 AntForge 解决围绕一个目标临时组建多 Agent 团队后的任务拆分、技能匹配、结果承诺、验证和结算。

明确 AntForge 不是普通 Agent Marketplace。创新对象是可验证的协作与结算协议，而不是某个模型或单一 Agent。

### 4.3 Live Product

用紧凑流程展示：

```text
Mission + MON escrow
→ Queen plans isolated tasks
→ skill-matched Workers claim and execute
→ Workers commit outputs
→ Guard verifies
→ rewards are credited
→ Workers withdraw native MON
```

保留当前老照片修复、上色、纪念文案的 Demo 场景，但避免让场景细节盖过协议定位。

### 4.4 Why AntForge / Why Monad

通过表格说明：

- Swarm Lane：不同任务写入不同状态槽；
- Conflict Lane：同一任务的排他领取是有意冲突；
- Skill Guard：技能位图在合约层约束领取；
- Deterministic Task IDs：不依赖全局自增计数器；
- Pull Settlement：Guard 记账，Worker 独立提款；
- Pheromone Events：链上事件驱动前端与 Runner。

只声明“并行友好的状态结构”，不声称未经实测的 TPS、finality 或并行性能。

### 4.5 Verifiable Proof

把合作方最关心的可信证据放在前半部分：

- Monad Testnet，Chain ID `10143`；
- `AntColony` 合约 `0x028268f8fF62edc596f931E17E2Fb21015f5b0A2`；
- 部署交易与部署区块；
- MonadVision Sourcify `exact_match`；
- 注册、托管、领取、提交、验证、提款完整纵向切片；
- Conflict Lane 成功与回滚交易；
- Rogue Ant 的 `SkillMismatch` 是广播前模拟，无伪造交易哈希；
- Public Demo 与证据文档链接。

### 4.6 What Is Real

用 `Live / Deterministic Mock / Future` 三层表格代替散落的重复说明：

- Live：Agent 身份、技能、钱包签名、托管、状态、事件、奖励和 MON 提款；
- Deterministic Mock：Queen 任务规划、图片与文本输出；
- Future：真实模型/工具执行、多 Guard、争议机制、开放技能网络和可移植信誉。

Live 模式失败必须展示真实错误，不能静默回退并伪装成功。

### 4.7 Architecture

保留精简架构图和职责表：

- React 19 + Vite 8 Web App；
- `MockColonyDataSource` / `MonadColonyDataSource`；
- Monad Testnet `AntColony.sol`；
- Node.js + TypeScript + viem Agent Runtime；
- Vercel 仅托管静态前端，不托管 Agent 私钥。

### 4.8 Quick Start

覆盖：

- 全量校验；
- Web Mock 模式；
- Web Live Settlement；
- Agent Runner；
- Foundry 合约部署；
- 配置变量与安全说明。

命令、路径和变量必须来自当前 manifest、`.env.example`、Vite 配置和部署文件，不继承旧 README 中未经复核的说明。

### 4.9 Security & Limitations

保留并精简：

- 精确 Escrow；
- Worker、Verifier、Requester 与技能权限；
- Pull Payment；
- 超时与拒绝退款；
- Checks-Effects-Interactions 与 `ReentrancyGuard`；
- 私钥仅在本地未提交环境文件；
- Testnet 黑客松原型、未经审计；
- 单指定 Guard；
- 无 TPS / finality / 主网安全结论；
- 根目录没有项目级 `LICENSE`，许可证尚未声明。

## 5. 个人品牌模块

### 5.1 定位

模块标题使用 `Built by Neo.Yun`，定位为：

```text
AI × Web3 Builder · Protocol Designer
Building verifiable economies for autonomous agents.
```

个人说明强调使用第一性原理把新兴协议转化为可运行、可验证产品，不复制 GitHub Profile 的完整自述。

### 5.2 可信度证据

只保留与 AntForge 延续能力直接相关的项目：

- OPC Agent Treasury：AI × Web3 School Agentic Hackathon 赛道季军，链接官方公告；
- Monad Builder Camp：Monad 生态建设与 MOSS 贡献经历；
- NeoDeFi：链上资产管理协议实践；
- MotionSeal：Monad 上的 proof-of-movement commitment protocol。

这些内容描述为作者经历与相关作品，不暗示它们属于 AntForge 产品模块。

### 5.3 联系入口

使用：

- GitHub：`https://github.com/NeoWeb3Nova`；
- Website：`https://amshe.fun`；
- X：`https://x.com/NeoWeb3Nova`；
- YouTube：`https://www.youtube.com/@NeoWeb3Nova`；
- Telegram：`https://t.me/neo_web3_nova`。

Telegram 地址已由用户确认。项目 README 不嵌入个人微信二维码，以免项目主页变成个人 Profile 镜像。

## 6. 商业愿景与合作模块

使用三阶段结构，严格区分已完成与未来计划：

| 阶段 | 表达 |
| --- | --- |
| Today | 可运行的 Monad Testnet Agent 协作与 MON 结算 MVP |
| Next | 真实工具执行、结果可用性、更多 Guard 与挑战机制 |
| Vision | 开放的 Agent Swarm Execution Network：发现工作、证明技能、临时组队、积累可移植信誉 |

`Build With Us` 明确面向：

- Agent framework 团队；
- 结果验证与存储服务；
- Monad 生态项目；
- 愿意共创 Agent 工作流的 Design Partner。

不编造融资、客户、收入、合作伙伴或主网计划。

## 7. 内容压缩与保留原则

### 7.1 保留

- 真实链上交易证据；
- Mock / Live 真实性边界；
- Monad 原生机制；
- 架构、Quick Start、安全限制；
- 文档索引和贡献入口；
- 现有产品主视觉。

### 7.2 压缩或移位

- 过长目录；
- 多处重复的“已完成”说明；
- 重复的 Mock / Live 解释；
- 评委问答式文案；
- 首屏过多技术徽章；
- 过细环境变量对产品叙事的干扰。

详细配置可以保留在后半部分，不删除开发者复现所需信息。

### 7.3 禁止

- 不使用不稳定的 GitHub Stats、动态访客数或第三方项目卡片；
- 不显示虚假的 License 徽章；
- 不添加未经核验的性能、用户、合作或业务指标；
- 不把 Public Demo 自动称为完全自治的 Live AI 产品；
- 不把 deterministic mock 描述成真实模型执行；
- 不添加与项目无关的个人履历或营销素材。

## 8. 实施边界

本次只修改或新增：

- `README.md`；
- `README.zh-CN.md`。

设计规格与后续实施计划位于 `docs/superpowers/`。除非发现 README 引用的现有事实必须同步修正，否则不修改产品代码、合约、部署记录、Agent Runtime、前端、现有路演文档或静态资产。

现有未跟踪文件 `docs/08-antforge-3min-roadshow.html` 属于任务开始前的用户工作，不修改、不暂存、不提交。

## 9. 验收标准

### 9.1 文档机械检查

- 两个 README 均存在；
- 语言切换链接互相可达；
- Markdown 代码围栏成对；
- 所有仓库相对链接与图片存在；
- `git diff --check -- README.md README.zh-CN.md` 通过；
- 英文和中文版本的关键地址、交易与章节一致。

### 9.2 仓库事实检查

- React、Vite、wagmi、viem 等版本与当前 manifest 一致；
- 命令与 `package.json` scripts、Foundry 项目一致；
- 环境变量与 `.env.example`、Vite 配置和 Runner 读取方式一致；
- 合约地址、Chain ID、部署区块和交易哈希与 `deployments/monad-testnet.json` 一致；
- License 描述与根目录实际文件一致。

### 9.3 实际验证

在可用环境中执行：

- `forge fmt --check`、`forge build --sizes`、`forge test -vv`；
- Agent Runtime `npm run typecheck`、`npm run build`；
- Web `npm run lint`、`npm run build`；
- Monad Testnet RPC 合约字节码回读；
- 代表性成功与失败交易回执回读；
- Public Demo 匿名加载、可见模式与浏览器控制台检查。

若网络或第三方服务阻断验证，README 使用“Recorded, not freshly verified”口径，不把历史记录包装成新验证结果。

## 10. 成功标准

潜在合作方应能在第一次快速浏览中回答：

1. AntForge 解决什么 Agent 经济问题？
2. 为什么它不是普通 Agent Marketplace？
3. 为什么 Monad 对该设计有实际意义？
4. 哪些能力已经在 Testnet 上真实运行？
5. 哪些仍是 deterministic mock 或未来愿景？
6. Neo.Yun 为什么具备继续交付该产品的可信度？
7. 合作方可以从哪里开始体验、验证或联系？

技术读者继续向下阅读时，仍能复现项目、理解安全边界并核验链上证据。