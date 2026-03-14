# SSS-1: Minimal Compliant Stablecoin

SSS-1 is designed to be a frictionless, fast, and minimal viable stablecoin layout. It relies heavily on standard Token-2022 functions but strips out any heavy compliance features like transfer hooks or seizing.

## When to use SSS-1?
- For highly decentralized stablecoins.
- For internal company points / fidelity tokens.
- When transfer restrictions are not needed, and composability is the maximum priority.

## Core Features
1. **Minting Quotas**: You can authorize multiple Minters with specific quotas.
2. **Burn Support**: Allows users to burn their own tokens.
3. **Freeze Accounts**: Admin can freeze specific user accounts.
4. **Pause/Unpause**: Admin can pause all token operations temporarily.
5. **Role-Based Access Control (RBAC)**: Master Authority can transfer ownership or add minters.

## Example Flow (SDK)

### Initialization

```typescript
import { SolanaStablecoin, SSS1_PRESET } from "@stbr/sss-token";

const sdk = new SolanaStablecoin(connection, wallet);

const { mint } = await sdk.initialize({
  name: "My Internal Token",
  symbol: "MIT",
  decimals: 6,
  uri: "https://meta.example.com/mit.json",
  ...SSS1_PRESET
});
```

### Adding a Minter

```typescript
// Authorize the minter to mint up to 10,000 tokens
await sdk.updateMinter(mint, minterPublicKey, 10_000n);
```

### Minting Tokens

```typescript
// The minter uses their keypair
const minterSdk = new SolanaStablecoin(connection, minterWallet);
await minterSdk.mintTokens(mint, recipientTokenAccount, 5_000n, { minterAuthority: minterWallet });
```

## Technical Specs

- **Permanent Delegate**: Disabled
- **Transfer Hook**: Disabled
- **Default Account State**: Initialized (Not frozen)
