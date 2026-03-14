# SSS-Token CLI Reference

The CLI drastically minimizes the friction of executing operations against the SSS-1 or SSS-2 protocol. Operates directly on the devnet or specified RPC URL using your local `~/.config/solana/id.json`.

## Installation

If you're using this locally linked:

```bash
cd packages/cli
npm install
npm link
```

## Global Options

- `--url <url>`, `-u`: Custom RPC URL (default: http://127.0.0.1:8899)
- `--keypair <path>`, `-k`: Path to Keypair file (default: ~/.config/solana/id.json)

## Commands List

### `init`

Creates a new stablecoin mint and stores configuration.

```bash
# Basic SSS-1 initialization
sss-token init --preset sss-1 --name "Token" --symbol "TKN" --decimals 6

# Config-based initialization (SSS-2)
sss-token init --preset sss-2 --config config.toml
```

### `mint` & `burn`

Supply operations.

```bash
sss-token mint 9Wz...recipient 1000
sss-token burn 9Wz...source 500
```

### `freeze` & `thaw` & `pause`

Account-level and Global operational states.

```bash
sss-token freeze 9Wz...target    # Prevent transfers for a specific token account
sss-token thaw 9Wz...target      # Allow transfers again
sss-token pause                  # Globally halt all operations on the stablecoin
sss-token unpause                # Globally un-halt operations
```

### Compliance (SSS-2 Only)

Actions available exclusively for the SSS-2 Configured presets:

#### `blacklist add` / `remove`

```bash
sss-token blacklist add 4Zz...target --reason "Sanctions - User 123"
sss-token blacklist remove 4Zz...target
```

#### `seize`

Seize illicit funds directly from a target token account.

```bash
sss-token seize 4Zz...badActorAccount 5000 --treasury 9Wz...treasuryAccount
```

### Insights

```bash
sss-token status <mint>
sss-token supply <mint>
```
