# Compliance Framework (SSS-2)

The SSS-2 preset is optimized explicitly for Regulatory Compliance, including Anti-Money Laundering (AML), Combating the Financing of Terrorism (CFT), and Know Your Customer (KYC).

## Program Design

### The On-Chain Blacklist

Unlike traditional SQL databases, SSS-2 uses on-chain PDAs (`BlacklistEntry`) to publicly and cryptographically prove the restriction state of an account. 

- This ensures immediate failure (via Transfer Hooks) for any transaction involving a blacklisted key.
- A `reason` string and a `timestamp` string are stored with the restriction to leave an auditable paper trail.
- Can be indexed easily by our Off-chain Compliance API (see PROMPT 6 docker compose implementation).

### Forced Seize Capability (Clawback)

In highly regulated fiat-backed tokens (like stablecoins in the EU, US, or BR), the issuer may be legally compelled to freeze and retrieve funds from a user.

Solana's **Token-2022 Permanent Delegate** allows a delegated key (like `stablecoin_config`) to bypass standard ownership rules and legally force the burn or transfer of tokens from an account.

By utilizing the `seize()` instruction, an issuer can:
1. Target any blacklisted ATA.
2. Transfer its balance to a designated Treasury ATA.
3. Automatically zero-out the illicit holdings in one atomic transaction.

## Operational Workflows

### 1. OFAC Sanctions Screening
Every off-chain transfer request should hit an OFAC screening API. If a hit is detected, the automated `compliance` service should immediately invoke the `sss-token blacklist add` routine.

### 2. KYC/AML Clearance
When users register on a stablecoin issuer dashboard, an API must orchestrate the creation of their ATA. Because `defaultAccountFrozen` is True under SSS-2, the ATA is unusable initially. Upon KYC pass, the `thaw()` command is executed.

### 3. Reporting and Analytics
All actions involving blacklisting, freezing, seizing, minting, and thawing generate signature logs that an `indexer` should store into an SQL ledger for internal auditing. 
