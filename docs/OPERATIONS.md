# Operations Runbook

This runbook covers best practices for deploying, monitoring, and troubleshooting the SSS platform.

## 1. Deploying the Contracts

### Devnet Operations
Ensure you have the latest `anchor-cli` installed. Also, we highly recommend reading about the underlying architecture in [ARCHITECTURE.md](./ARCHITECTURE.md) and [COMPLIANCE.md](./COMPLIANCE.md).

```bash
anchor build
anchor keys list
# IMPORTANT: Update both Anchor.toml and the lib.rs definitions with the new IDs
anchor deploy --provider.cluster devnet
```

For the Transfer Hook to activate, the final generated Program IDs **must** match the initial ones coded into your Token-2022 instructions.

## 2. Common Challenges & Resolutions

### ⚠️ Testing & Blockhash Sync Issues (Encountered during PROMPT 4)

During testing end-to-end integration flows (especially tests covering `SSS-1` vs `SSS-2`), developers might see the following cascading errors:
- `Transaction simulation failed: Blockhash not found.`
- `TypeError: Cannot read properties of undefined (reading 'toBuffer')` related to PDA generation.
- ATA race conditions when creating Associated Token Accounts sequentially.

**Resolution**:
1. **Concurrency**: When using `anchor test` with parallel runners or loops running extremely quickly, the local validator struggles to commit transaction blocks in sync. We solved this by using `await new Promise(r => setTimeout(r, 1000))` after test environment bootstraps to let the blockhash settle.
2. **Account Name Alignments**: Make sure `client.ts` mappings exactly map raw struct accounts in your program. During our tests, `mint` vs `mintAccount` and seeds mismatching (`stablecoin-config` instead of `stablecoin_config`) broke compilation silently. Keep your SDK parameters strictly mirrored to Anchor struct property names.
3. **Sequential funding vs Promise.all**: Always batch or sequence airdrops and token account creations sequentially (`await airdrop(...); await airdrop(...);`) instead of mapping them in parallel `Promise.all` clusters, because test validator rate limit/nonce overlaps can drop the transactions silently.

### ⚠️ Transaction simulation failed: Error processing Instruction 0: Provided owner is not allowed.

This occurs mostly in `compliance.spec.ts` when trying to execute `seize` or `blacklist` routines.
**Resolution**: Check your API call. Make sure you are using the Master Authority Keypair when executing actions intended solely for administrators. 

## 3. Monitoring

### On-chain Watchers
Implement the Dockerized Indexer Service (detailed in upcoming PROMPT 6) to connect via WebSockets to changes in the **BlacklistEntry PDA**.

### Alerting Triggers Example
- Rate spike on `seize()` instructions.
- Continuous unauthorized attempts by an admin role.
- Paging alerts if `Pause()` happens.
