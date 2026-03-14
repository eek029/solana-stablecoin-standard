# On-Chain Anchor API Reference

This document maps all the Anchor Instructions implemented inside `programs/sss-token`. All interactions go through `client.ts` in the SDK natively.

## 1. Governance Instructions

### `initialize`
Initializes a new `StablecoinConfig` and sets the foundational rules (SSS-1 vs SSS-2 presets).
- Accounts: `mint`, `stablecoinConfig`, `authority`, `systemProgram`, `tokenProgram`.

### `transfer_authority`
Changes the master authority of the token.
- Accounts: `stablecoinConfig`, `authority`, `newAuthority`.

### `pause` / `unpause`
Changes the global lock flag to prevent or allow transfers/mints worldwide.
- Accounts: `stablecoinConfig`, `authority`.

## 2. Token Lifecycle

### `update_minter`
Adds or updates the capacity of a `MinterConfig` to print new tokens.
- Accounts: `stablecoinConfig`, `minterConfig`, `authority`.

### `mint`
Mints new tokens, depleting the specific `MinterConfig` quota.
- Accounts: `stablecoinConfig`, `minterConfig`, `mint`, `minterAuthority`, `destination`.

### `burn`
Destroys tokens in the user's token account.
- Accounts: `stablecoinConfig`, `mint`, `burner`, `source`.

## 3. Account Management

### `freeze_account` / `thaw_account`
Freezes or thaws a specific token account. Useful if `defaultAccountFrozen` requires explicit initialization.
- Accounts: `stablecoinConfig`, `mint`, `authority`, `tokenAccount`.

## 4. Compliance (SSS-2)

### `add_to_blacklist`
Initializes a `BlacklistEntry` for an address, providing a `reason` String.
- Accounts: `stablecoinConfig`, `blacklistEntry`, `authority`, `address`.

### `remove_from_blacklist`
Closes a `BlacklistEntry`, releasing the rent back to the authority.
- Accounts: `stablecoinConfig`, `blacklistEntry`, `authority`.

### `seize`
Transfers the balance from a blacklisted token account to the treasury. Requires `StablecoinConfig` via Permanent Delegate.
- Accounts: `stablecoinConfig`, `seizer`, `mint`, `source`, `blacklistEntry`, `treasury`.
