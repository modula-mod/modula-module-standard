# Crypto Wallet Module Example

Shell mode: `secure`

Surfaces:
- board
- route
- secure-settings
- marketplace

Permissions:
- wallet: required, high risk, reads balances and prepares transactions.
- network: required, high risk, queries chain/RPC data.
- clipboard: optional, medium risk, copies addresses.
- notifications: optional, medium risk, transaction alerts.

Navigation:
- `/module/crypto-wallet`
- secure settings route for permission and network configuration.

Actions:
- view balances
- receive
- prepare send
- export history

Data collections:
- accounts
- balances
- transactions
- networks

UI contract shape:
- secure overview.
- transaction history.
- send proposal flow with verification step.

Security risks:
- Money movement.
- Private keys must never be exposed to host-rendered UI.
- Sending must use proposal -> verification -> audit -> activation.

