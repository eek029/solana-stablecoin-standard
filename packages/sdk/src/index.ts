/**
 * @stbr/sss-token — Solana Stablecoin Standard TypeScript SDK
 *
 * @example
 * ```ts
 * import { SolanaStablecoin, SSS1_PRESET, SSS2_PRESET } from "@stbr/sss-token";
 * import { Connection } from "@solana/web3.js";
 *
 * const sdk = new SolanaStablecoin(connection, wallet);
 *
 * // Create SSS-1 minimal stablecoin
 * const { mint } = await sdk.initialize({ name: "MyUSD", symbol: "MUSD", uri: "...", decimals: 6, ...SSS1_PRESET });
 *
 * // Create SSS-2 compliant stablecoin
 * const { mint } = await sdk.initialize({ name: "CompUSD", symbol: "CUSD", uri: "...", decimals: 6, ...SSS2_PRESET });
 * ```
 */

export { SolanaStablecoin } from "./client.js";
export type { SssToken } from "./idl.js";
export {
  // Types
  type StablecoinConfig,
  type MinterConfig,
  type BlacklistEntry,
  type InitializeParams,
  type SssPreset,
  // Constants & Presets
  SSS1_PRESET,
  SSS2_PRESET,
  PROGRAM_ID,
  TRANSFER_HOOK_PROGRAM_ID,
  // PDA helpers
  findStablecoinConfigPda,
  findMinterConfigPda,
  findBlacklistEntryPda,
  // Utils
  detectPreset,
} from "./types.js";
