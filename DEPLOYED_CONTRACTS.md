# Deployed Contracts & On-Chain Evidence

All experiments were executed as **real transactions** on public testnets. The deployed
contracts and every recorded transaction hash are independently verifiable on the public
block explorers below.

## Deployed contracts

| Network | Chain ID | Contract address | Explorer |
|---------|----------|------------------|----------|
| zkSync Era Sepolia (L2) | 300 | `0x3D16641A759A4d524B5ec0a968595C7FF700C0cF` | [view contract](https://sepolia.explorer.zksync.io/address/0x3D16641A759A4d524B5ec0a968595C7FF700C0cF) |
| Ethereum Sepolia (L1) | 11155111 | `0xD56ABA43273f9080BCA0Ea6CfCb200Ac38deF549` | [view contract](https://sepolia.etherscan.io/address/0xD56ABA43273f9080BCA0Ea6CfCb200Ac38deF549) |

## How to verify a transaction

Every transaction hash is recorded in the machine-readable evidence files under
`results/final/experiment_pilot_*/raw/attempts.jsonl` (field `tx_hash`). To verify any one:

- **L2 (zkSync Era Sepolia):** `https://sepolia.explorer.zksync.io/tx/<tx_hash>`
- **L1 (Ethereum Sepolia):** `https://sepolia.etherscan.io/tx/<tx_hash>`

### Example transactions (mint)

| Network | Example tx | Explorer link |
|---------|-----------|---------------|
| L2 | `0xfeb982e765351bc55084be4f547092de09bff6a31bc34679778d9701ce1e228c` | [view tx](https://sepolia.explorer.zksync.io/tx/0xfeb982e765351bc55084be4f547092de09bff6a31bc34679778d9701ce1e228c) |
| L1 | `0x1a6ff161ee40d24a836fb80efb2c9166766df647ee09be95c28e88533e5d0865` | [view tx](https://sepolia.etherscan.io/tx/0x1a6ff161ee40d24a836fb80efb2c9166766df647ee09be95c28e88533e5d0865) |

## Extract all transaction hashes

```bash
# list every recorded tx hash for a given experiment
cat results/final/experiment_pilot_<id>/raw/attempts.jsonl \
  | python -c "import sys,json; [print(json.loads(l)['tx_hash']) for l in sys.stdin if l.strip()]"
```

## Faucets (to fund your own testnet wallet for re-execution)

- zkSync Era Sepolia: https://faucet.triangleplatform.com/zksync/sepolia (or bridge Sepolia ETH via https://portal.zksync.io/bridge)
- Ethereum Sepolia: https://sepoliafaucet.com or https://www.alchemy.com/faucets/ethereum-sepolia
