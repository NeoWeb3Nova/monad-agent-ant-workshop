# Monad 工具链与 Testnet 开发参考

> 文档性质：Monad 通用技术与工具参考，不包含旧项目源码或实现。<br>
> 目标网络：Monad Testnet。<br>
> Chain ID：`10143`。

## 1. 当前工具状态

本机已经安装 Monad 版本的 Foundry：

```text
forge 1.7.1-monad-v1.0.0
cast 1.7.1-monad-v1.0.0
anvil 1.7.1-monad-v1.0.0
```

可随时重新验证：

```bash
forge --version
cast --version
anvil --version
```

当前无需重新运行 Foundry 安装程序。

## 2. Monad Testnet 信息

| 项目 | 值 |
| --- | --- |
| Network | Monad Testnet |
| Chain ID | `10143` |
| RPC | `https://testnet-rpc.monad.xyz` |
| App Hub | <https://testnet.monad.xyz/> |
| Faucet | <https://faucet.monad.xyz> |
| Explorer | <https://testnet.monadexplorer.com/> |
| 备用 Explorer | <https://monad-testnet.socialscan.io/> |

RPC、Faucet 和 Explorer 可能发生变化。部署前应以 Monad 官方文档或现场 Workshop 信息为准。

## 3. 初始化 Monad Foundry 项目

正式参赛项目使用全新目录，不复制旧仓库合约源码：

```bash
forge init --template monad-developers/foundry-monad contracts
```

推荐结构：

```text
contracts/
├── foundry.toml
├── src/
├── test/
├── script/
└── lib/
```

`contracts/` 属于项目根仓库，不应初始化为独立 Git 仓库或子模块。

## 4. Foundry 配置

推荐的 `contracts/foundry.toml` 基础配置：

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
metadata = true
metadata_hash = "none"
use_literal_content = true

eth-rpc-url = "https://testnet-rpc.monad.xyz"
chain_id = 10143
```

配置目的：

- 默认连接 Monad Testnet；
- 保留合约验证所需 metadata；
- 在验证输入中使用源文件内容；
- 减少部署命令中的重复参数。

不要把私钥写入 `foundry.toml`。

## 5. 编译、格式化和测试

```bash
cd contracts

forge fmt
forge build
forge test -vvv
```

需要 Gas 报告时：

```bash
forge test --gas-report
forge snapshot
```

黑客松不要求严格 TDD，但资金、权限、状态机和失败路径必须有测试。

## 6. 本地节点

启动 Monad 语义的本地节点：

```bash
anvil --monad
```

Fork Monad Testnet：

```bash
anvil --fork-url https://testnet-rpc.monad.xyz
```

本地节点用于快速调试，不能替代最终 Testnet 部署。

## 7. 钱包与密钥

优先使用 Foundry keystore，不在命令历史、代码或文档中写入明文私钥。

导入已有部署账户：

```bash
cast wallet import monad-deployer
```

查看地址：

```bash
cast wallet address --account monad-deployer
```

安全规则：

- 不提交 `.env`；
- 不提交 keystore 文件；
- 不提交私钥或助记词；
- 不在终端输出中复制完整秘密；
- 部署地址可以公开，签名秘密不能公开。

## 8. 常用 Cast 命令

查看余额：

```bash
cast balance "$ADDRESS" \
  --rpc-url https://testnet-rpc.monad.xyz
```

检查合约是否存在字节码：

```bash
cast code "$CONTRACT_ADDRESS" \
  --rpc-url https://testnet-rpc.monad.xyz
```

调用只读函数：

```bash
cast call "$CONTRACT_ADDRESS" \
  "functionName()(uint256)" \
  --rpc-url https://testnet-rpc.monad.xyz
```

发送交易：

```bash
cast send "$CONTRACT_ADDRESS" \
  "functionName()" \
  --account monad-deployer \
  --rpc-url https://testnet-rpc.monad.xyz
```

查看交易回执：

```bash
cast receipt "$TX_HASH" \
  --rpc-url https://testnet-rpc.monad.xyz
```

## 9. 部署

简单合约部署示例：

```bash
cd contracts

forge create src/Example.sol:Example \
  --account monad-deployer \
  --broadcast
```

更复杂的部署应使用 `script/` 下的 Foundry Script，并通过：

```bash
forge script script/Deploy.s.sol:Deploy \
  --broadcast \
  --account monad-deployer
```

部署成功不能只依据命令返回。必须验证：

1. 记录部署交易哈希；
2. 使用 `cast receipt` 查询回执；
3. 使用 `cast code` 确认地址存在字节码；
4. 使用 `cast call` 回读关键状态；
5. 在 Explorer 打开交易和合约页面。

## 10. 合约验证

优先使用 Monad/Devnads 验证 API，一次验证多个 Explorer。验证数据包括：

- Chain ID；
- 合约地址；
- 完整合约名称；
- Solidity 编译器版本；
- Standard JSON Input；
- Foundry metadata；
- 可选构造参数。

生成 Standard JSON Input：

```bash
forge verify-contract "$CONTRACT_ADDRESS" \
  src/Example.sol:Example \
  --chain 10143 \
  --show-standard-json-input > /tmp/standard-input.json
```

读取 Foundry metadata：

```bash
jq '.metadata' \
  out/Example.sol/Example.json > /tmp/metadata.json
```

验证 API 失败时，使用 Sourcify 作为回退：

```bash
forge verify-contract "$CONTRACT_ADDRESS" \
  src/Example.sol:Example \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url "https://sourcify-api-monad.blockvision.org/"
```

最终必须在 Explorer 页面确认源码状态，不能只依据本地命令宣称验证成功。

## 11. Monad 性能参数

当前官方文档公开表述：

| 指标 | 值 |
| --- | --- |
| 吞吐量 | 约 10,000 TPS |
| 出块频率 | 400 ms |
| 投机性最终性 | 约 400 ms |
| 完整最终性 | 约 800 ms |
| Block Gas Limit | 200M |
| Transaction Gas Limit | 30M |
| 最大合约大小 | 128 KB |

对外文案统一使用 400 ms / 800 ms。除非现场官方提供更新信息，不使用旧材料中的其他参数。

## 12. 并行执行

Monad 使用乐观并行执行，但保持与串行 EVM 相同的确定性结果：

- 区块中的交易仍然线性排序；
- 节点可以提前并行执行后序交易；
- 系统跟踪交易的读取和写入；
- 如果前序交易修改了后序交易读取的状态，相关交易会重新执行；
- 开发者不需要改变 Solidity 语义。

开发建议：

- 不同任务尽量写入不同状态；
- 避免所有交易共同修改全局热点；
- 不要宣称应用能够控制底层 CPU 调度；
- 可以准确表述为「应用状态结构减少冲突并适合并行执行」。

## 13. Monad Gas 差异

### 13.1 按 Gas Limit 收费

Monad 按交易设置的 `gas_limit` 计费，而不是按实际 `gas_used` 计费：

```text
gas_paid = gas_limit × price_per_gas
```

因此：

- 不设置夸张的 Gas Limit；
- 估算后只增加小幅缓冲，默认不超过 10%；
- 固定成本交易使用明确、紧凑的 Gas Limit；
- 前端预计费用按照 Gas Limit 计算。

### 13.2 冷访问费用更高

Monad 对冷账户和冷存储访问重新定价：

| 访问类型 | Ethereum | Monad |
| --- | ---: | ---: |
| Cold account access | 2,600 | 10,100 |
| Cold storage access | 2,100 | 8,100 |
| Warm access | 100 | 100 |

避免：

- 一次交易遍历大量不同存储槽；
- 大量外部合约冷调用；
- 为了列表展示而在链上扫描全部记录。

优先使用映射、事件和前端聚合。

## 14. Reserve Balance 与账户时序

Monad 的异步执行带来部署和演示注意事项：

- EOA 存在 Reserve Balance 约束；
- 默认保留余额约为 10 MON；
- 新注资账户需要等待约 3 个区块，也就是约 1.2 秒，才能可靠发送后续交易；
- 低余额账户不适合连续发送高频交易。

多钱包演示前必须：

```text
[ ] 每个钱包已经提前领取 Testnet MON
[ ] 每个钱包余额高于演示需要
[ ] 充值后已经等待状态更新
[ ] 已使用 cast balance 逐个验证
[ ] 不在 Demo 现场临时创建和充值全部钱包
```

## 15. RPC 和实时数据

标准 WebSocket 可以订阅新区块和合约日志。Monad 还提供扩展实时数据接口，例如：

- `eth_subscribe`；
- `monadNewHeads`；
- `monadLogs`。

黑客松 P0 优先使用标准 RPC、交易回执和标准事件。扩展实时接口属于 P1，不应阻塞合约部署或核心前端。

发送多笔交易时：

- 多钱包比单钱包更适合展示独立 Agent；
- 单钱包交易仍受 nonce 顺序约束；
- 同一钱包高频发送时需要本地管理 nonce；
- 并发提交不同交易不等于可以宣称底层一定使用了不同 CPU 核心。

## 16. 官方参考

- Monad Documentation：<https://docs.monad.xyz/>
- Monad for Developers：<https://docs.monad.xyz/introduction/monad-for-developers>
- Parallel Execution：<https://docs.monad.xyz/monad-arch/execution/parallel-execution>
- Best Practices：<https://docs.monad.xyz/developer-essentials/best-practices>
- Monad Foundry：<https://docs.monad.xyz/tooling-and-infra/toolkits/monad-foundry>
- Foundry Book：<https://book.getfoundry.sh/>

如工具版本、RPC、Explorer 或验证接口发生变化，以 Monad 最新官方文档和现场 Workshop 信息为准。
