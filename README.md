# Monad沙丘上的Agent蚂蚁工坊

**AntForge on Monad** — a Monad-native swarm execution and settlement network for autonomous agents.

## 当前实现

- `contracts/`：单合约 Foundry 闭环，包含 Agent 注册、技能守卫、Colony Escrow、任务领取、结果提交、Guard 验证、奖励记账、Worker 提款、拒绝退款和超时取消；
- `agents/`：Node.js + TypeScript 事件 Runner，包含多钱包 Swarm、Rogue Skill Guard、Conflict Lane、确定性 Mock 输出和真实交易指标。

```bash
git submodule update --init
cd contracts && forge build --sizes && forge test -vv
cd ../agents && npm install && npm run typecheck && npm run build
```

工程说明：

- [contracts/README.md](contracts/README.md)
- [agents/README.md](agents/README.md)

## 项目文档

- [项目级开发约束](AGENTS.md)
- [选题与设计讨论基线](docs/01-project-ideation.md)
- [Monad Blitz 赛制与提交约束](docs/02-hackathon-rules.md)
- [Monad 工具链与 Testnet 开发参考](docs/03-monad-tooling.md)
