import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface StablecoinConfig {
  masterAuthority: PublicKey;
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  decimals: number;
  enablePermanentDelegate: boolean;
  enableTransferHook: boolean;
  defaultAccountFrozen: boolean;
  isPaused: boolean;
  bump: number;
}

export interface MinterConfig {
  stablecoinConfig: PublicKey;
  minter: PublicKey;
  quota: BN;
  minted: BN;
  bump: number;
}

export interface BlacklistEntry {
  stablecoinConfig: PublicKey;
  address: PublicKey;
  reason: string;
  timestamp: BN;
  blacklister: PublicKey;
  bump: number;
}

// ─── Instruction Params ────────────────────────────────────────────────────────

export interface InitializeParams {
  name: string;
  symbol: string;
  uri: string;
  decimals: number;
  enablePermanentDelegate: boolean;
  enableTransferHook: boolean;
  defaultAccountFrozen: boolean;
}

/** SSS-1: Minimal compliant stablecoin (no blacklist/seize) */
export const SSS1_PRESET: Pick<
  InitializeParams,
  "enablePermanentDelegate" | "enableTransferHook" | "defaultAccountFrozen"
> = {
  enablePermanentDelegate: false,
  enableTransferHook: false,
  defaultAccountFrozen: false,
};

/** SSS-2: Full compliance preset (blacklist, freeze, seize, transfer-hook) */
export const SSS2_PRESET: Pick<
  InitializeParams,
  "enablePermanentDelegate" | "enableTransferHook" | "defaultAccountFrozen"
> = {
  enablePermanentDelegate: true,
  enableTransferHook: true,
  defaultAccountFrozen: true,
};

// ─── PDA Helpers ───────────────────────────────────────────────────────────────

export const PROGRAM_ID = new PublicKey(
  "8YkrKuinMsuBwds8zU2unhSvV2oYqjgXyp2TCiTLYPiy"
);

export const TRANSFER_HOOK_PROGRAM_ID = new PublicKey(
  "55ahbn1dMDaGTMKGb3aRF2joihXL6zP1uv5npVtNpqAm"
);

export function findStablecoinConfigPda(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("stablecoin-config"), mint.toBuffer()],
    PROGRAM_ID
  );
}

export function findMinterConfigPda(
  stablecoinConfig: PublicKey,
  minterAuthority: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("minter"),
      stablecoinConfig.toBuffer(),
      minterAuthority.toBuffer(),
    ],
    PROGRAM_ID
  );
}

export function findBlacklistEntryPda(
  stablecoinConfig: PublicKey,
  address: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("blacklist"),
      stablecoinConfig.toBuffer(),
      address.toBuffer(),
    ],
    PROGRAM_ID
  );
}

// ─── SSS Preset Detection ─────────────────────────────────────────────────────

export type SssPreset = "SSS-1" | "SSS-2" | "Custom";

export function detectPreset(config: StablecoinConfig): SssPreset {
  if (config.enableTransferHook && config.enablePermanentDelegate) {
    return "SSS-2";
  }
  if (!config.enableTransferHook && !config.enablePermanentDelegate) {
    return "SSS-1";
  }
  return "Custom";
}
