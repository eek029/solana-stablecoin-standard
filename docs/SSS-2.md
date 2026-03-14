# SSS-2: Full Compliance Stablecoin

SSS-2 is the enterprise-grade preset built for regulated entities, CBDCs, and fully-backed fiat tokens. It prioritizes Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance.

## When to use SSS-2?
- For fiat-backed stablecoins (USDC, USDT model).
- If your jurisdiction requires the ability to clawback/seize funds.
- If you need strict control over who can send or receive tokens (Sanctions).

## Core Features (In addition to SSS-1)
1. **Permanent Delegate**: The issuer retains the ability to transfer or burn tokens from any account (useful for seizing funds from bad actors).
2. **Transfer Hook Validations**: Every single token transfer is checked by an Anchor program. If either the sender or receiver is on the Blacklist, the transaction reverts.
3. **Default Frozen Accounts (Optional)**: Can be configured so that new token accounts are frozen by default until they pass KYC.
4. **Blacklist Management**: Add or remove suspect addresses to/from the on-chain blacklist.
5. **Seize Funds**: Administratively pull funds out of a compromised or sanctioned account.

## Example Flow (SDK)

### Initialization

```typescript
import { SolanaStablecoin, SSS2_PRESET } from "@stbr/sss-token";

const sdk = new SolanaStablecoin(connection, wallet);

const { mint } = await sdk.initialize({
  name: "Compliant USD",
  symbol: "CUSD",
  decimals: 6,
  uri: "https://meta.example.com/cusd.json",
  ...SSS2_PRESET
});
```

### Blacklisting an Actor

```typescript
// Add to blacklist
await sdk.addToBlacklist(mint, badActorWallet.publicKey, "OFAC Sanctions");

// Now every transfer involving badActorWallet will fail!
```

### Seizing Funds

If a user gets hacked or sanctioned, you can rescue/seize their funds:

```typescript
// Moves 1,000 tokens from the bad actor's ATA back to the treasury ATA
await sdk.seize(
  mint,
  badActorAta,
  treasuryAta,
  1_000n
);
```

## Security & Composability Notes

- Because of the Transfer Hook, SSS-2 tokens cost slightly more Compute Units to transfer.
- SSS-2 tokens are fully compatible with DeFi applications that support Token-2022 Transfer Hooks, but older applications may throw errors if they don't provide the extra accounts required by the hook.
