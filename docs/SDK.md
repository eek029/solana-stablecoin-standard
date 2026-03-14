# TypeScript SDK Reference

The `@stbr/sss-token` SDK provides an easy-to-use Interface to interact with the Anchor Programs under the Solana Stablecoin Standard. It abstracts all PDA generations, Instruction building, and connection logic.

## Installation

```bash
npm install @stbr/sss-token @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

## Quick Start

```typescript
import { Connection, Keypair } from "@solana/web3.js";
import { SolanaStablecoin, SSS2_PRESET } from "@stbr/sss-token";
import * as anchor from "@coral-xyz/anchor";

const connection = new Connection("http://127.0.0.1:8899");
const wallet = new anchor.Wallet(Keypair.generate());

const sdk = new SolanaStablecoin(connection, wallet);
```

## Core API

### `initialize(params: InitializeParams)`

Initializes a new Stablecoin configuration and returns the `mint` publicKey.

**Parameters:**
- `name` (string)
- `symbol` (string)
- `uri` (string)
- `decimals` (number)
- `enablePermanentDelegate` (boolean)
- `enableTransferHook` (boolean)
- `defaultAccountFrozen` (boolean)

**Example:**
```typescript
const { mint, config } = await sdk.initialize({
  name: "My Token",
  symbol: "MTK",
  decimals: 6,
  uri: "...",
  ...SSS2_PRESET
});
```

### `updateMinter(mint, minter, quota)`

Updates (or creates) an authorized `minter` account with a specific `quota`.

### `mintTokens(mint, destination, amount, options?)`

Mints tokens to the final `destination` ATA. Deducts from minter's quota.

### `burnTokens(mint, source, amount, burner?)`

Burns tokens from the `source` ATA.

## Compliance API (SSS-2 Only)

### `addToBlacklist(mint, address, reason)`

Creates an on-chain Blacklist Entry that prevents transfers for the target `address` via Transfer Hooks.

### `removeFromBlacklist(mint, address)`

Re-authorizes transfers by closing the Blacklist Entry account.

### `seize(mint, source, treasury, amount)`

Requires `enablePermanentDelegate`. The admin forces the transfer of `amount` from a blocked/frozen `source` directly to a `treasury` account, bypassing user approval.

## Account/PDA Resolution

The SDK exports helper functions to find the relevant Program Derived Addresses (PDAs):

- `findStablecoinConfigPda(mint: PublicKey)`
- `findMinterConfigPda(stablecoinConfig: PublicKey, minterAuthority: PublicKey)`
- `findBlacklistEntryPda(stablecoinConfig: PublicKey, address: PublicKey)`
