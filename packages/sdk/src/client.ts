import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
export type Wallet = anchor.Wallet;
import type { SssToken } from "./idl.js";
import {
  InitializeParams,
  StablecoinConfig,
  MinterConfig,
  BlacklistEntry,
  PROGRAM_ID,
  findStablecoinConfigPda,
  findMinterConfigPda,
  findBlacklistEntryPda,
} from "./types.js";

// We use the JSON IDL from the filesystem for now
import SSS_TOKEN_IDL_JSON from "./sss_token.json" assert { type: "json" };

const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

// ─── SolanaStablecoin Client ───────────────────────────────────────────────────

/**
 * Main SDK class for interacting with the Solana Stablecoin Standard programs.
 *
 * @example
 * ```ts
 * const sdk = new SolanaStablecoin(connection, wallet);
 * const { mint, config } = await sdk.initialize({
 *   name: "MyUSD", symbol: "MUSD", uri: "https://...", decimals: 6,
 *   ...SSS2_PRESET,
 * });
 * ```
 */
export class SolanaStablecoin {
  public program: anchor.Program<SssToken>;
  public readonly connection: Connection;
  public readonly wallet: Wallet;

  constructor(connection: Connection, wallet: Wallet) {
    this.connection = connection;
    this.wallet = wallet;

    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(provider);

    this.program = new anchor.Program(
      SSS_TOKEN_IDL_JSON as unknown as SssToken,
      provider
    );
  }

  // ─── getters ──────────────────────────────────────────────────────────────

  public get provider(): anchor.AnchorProvider {
    return this.program.provider as anchor.AnchorProvider;
  }

  // ─── initialize ───────────────────────────────────────────────────────────

  /**
   * Initialize a new stablecoin.
   * Returns the mint keypair and config PDA.
   */
  async initialize(
    params: InitializeParams,
    mintKeypair?: Keypair
  ): Promise<{ mint: PublicKey; config: PublicKey; txSignature: string }> {
    const mint = mintKeypair ?? Keypair.generate();
    const [stablecoinConfig] = findStablecoinConfigPda(mint.publicKey);

    const txSignature = await this.program.methods
      .initialize({
        name: params.name,
        symbol: params.symbol,
        uri: params.uri,
        decimals: params.decimals,
        enablePermanentDelegate: params.enablePermanentDelegate,
        enableTransferHook: params.enableTransferHook,
        defaultAccountFrozen: params.defaultAccountFrozen,
      })
      .accounts({
        masterAuthority: this.wallet.publicKey,
        mint: mint.publicKey,
        stablecoinConfig,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .signers([mint])
      .rpc();

    return {
      mint: mint.publicKey,
      config: stablecoinConfig,
      txSignature,
    };
  }

  // ─── mint ─────────────────────────────────────────────────────────────────

  /**
   * Mint tokens to a destination token account.
   */
  async mintTokens(
    mintAddress: PublicKey,
    destinationTokenAccount: PublicKey,
    amount: bigint | number,
    options?: { minterAuthority?: Keypair }
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);
    const minterPubkey =
      options?.minterAuthority?.publicKey ?? this.wallet.publicKey;
    const [minterConfig] = findMinterConfigPda(stablecoinConfig, minterPubkey);

    const txSignature = await this.program.methods
      .mint(new anchor.BN(amount.toString()))
      .accounts({
        stablecoinConfig,
        minter: minterPubkey,
        minterConfig,
        mintAccount: mintAddress,
        destination: destinationTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .signers(options?.minterAuthority ? [options.minterAuthority] : [])
      .rpc();

    return txSignature;
  }

  // ─── burn ─────────────────────────────────────────────────────────────────

  /**
   * Burn tokens from a source token account.
   */
  async burnTokens(
    mintAddress: PublicKey,
    sourceTokenAccount: PublicKey,
    amount: bigint | number,
    burner?: Keypair
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);

    return this.program.methods
      .burn(new anchor.BN(amount.toString()))
      .accounts({
        stablecoinConfig,
        burner: burner?.publicKey ?? this.wallet.publicKey,
        mintAccount: mintAddress,
        source: sourceTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .signers(burner ? [burner] : [])
      .rpc();
  }

  // ─── freeze / thaw ────────────────────────────────────────────────────────

  /** Freeze a token account. */
  async freezeAccount(
    mintAddress: PublicKey,
    tokenAccount: PublicKey
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);

    return this.program.methods
      .freezeAccount()
      .accounts({
        stablecoinConfig,
        authority: this.wallet.publicKey,
        mintAccount: mintAddress,
        tokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .rpc();
  }

  /** Thaw (unfreeze) a token account. */
  async thawAccount(
    mintAddress: PublicKey,
    tokenAccount: PublicKey
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);

    return this.program.methods
      .thawAccount()
      .accounts({
        stablecoinConfig,
        authority: this.wallet.publicKey,
        mintAccount: mintAddress,
        tokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .rpc();
  }

  // ─── pause / unpause ──────────────────────────────────────────────────────

  /** Pause all token operations. */
  async pause(mintAddress: PublicKey): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);

    return this.program.methods
      .pause()
      .accounts({
        stablecoinConfig,
        authority: this.wallet.publicKey,
      } as any)
      .rpc();
  }

  /** Unpause token operations. */
  async unpause(mintAddress: PublicKey): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);

    return this.program.methods
      .unpause()
      .accounts({
        stablecoinConfig,
        authority: this.wallet.publicKey,
      } as any)
      .rpc();
  }

  // ─── update minter ────────────────────────────────────────────────────────

  /**
   * Create or update a minter's quota.
   */
  async updateMinter(
    mintAddress: PublicKey,
    minterAddress: PublicKey,
    quota: bigint | number
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);
    const [minterConfig] = findMinterConfigPda(stablecoinConfig, minterAddress);

    return this.program.methods
      .updateMinter(minterAddress, new anchor.BN(quota.toString()))
      .accounts({
        stablecoinConfig,
        masterAuthority: this.wallet.publicKey,
        minterConfig,
        newMinterAddress: minterAddress,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
  }

  // ─── transfer authority ───────────────────────────────────────────────────

  /** Transfer master authority to a new address. */
  async transferAuthority(
    mintAddress: PublicKey,
    newAuthority: PublicKey
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);

    return this.program.methods
      .transferAuthority(newAuthority)
      .accounts({
        stablecoinConfig,
        currentAuthority: this.wallet.publicKey,
        newAuthority,
      } as any)
      .rpc();
  }

  // ─── SSS-2 compliance ─────────────────────────────────────────────────────

  /** Add an address to the blacklist (SSS-2 only). */
  async addToBlacklist(
    mintAddress: PublicKey,
    addressToBlacklist: PublicKey,
    reason: string
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);
    const [blacklistEntry] = findBlacklistEntryPda(
      stablecoinConfig,
      addressToBlacklist
    );

    return this.program.methods
      .addToBlacklist(reason)
      .accounts({
        stablecoinConfig,
        blacklister: this.wallet.publicKey,
        blacklistEntry,
        address: addressToBlacklist,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
  }

  /** Remove an address from the blacklist (SSS-2 only). */
  async removeFromBlacklist(
    mintAddress: PublicKey,
    addressToRemove: PublicKey
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);
    const [blacklistEntry] = findBlacklistEntryPda(
      stablecoinConfig,
      addressToRemove
    );

    return this.program.methods
      .removeFromBlacklist()
      .accounts({
        stablecoinConfig,
        blacklister: this.wallet.publicKey,
        blacklistEntry,
        address: addressToRemove,
      } as any)
      .rpc();
  }

  /**
   * Seize tokens from a blacklisted account (SSS-2 only).
   */
  async seize(
    mintAddress: PublicKey,
    sourceTokenAccount: PublicKey,
    treasuryTokenAccount: PublicKey,
    amount: bigint | number
  ): Promise<string> {
    const [stablecoinConfig] = findStablecoinConfigPda(mintAddress);

    // Derive the owner of the source token account to build the blacklist PDA
    const accountInfo = await this.connection.getAccountInfo(sourceTokenAccount);
    if (!accountInfo) {
      throw new Error(`Source token account not found: ${sourceTokenAccount}`);
    }
    // owner is at offset 32 in the SPL token account layout
    const ownerPubkey = new PublicKey(accountInfo.data.slice(32, 64));
    const [blacklistEntry] = findBlacklistEntryPda(stablecoinConfig, ownerPubkey);

    return this.program.methods
      .seize(new anchor.BN(amount.toString()))
      .accounts({
        stablecoinConfig,
        seizer: this.wallet.publicKey,
        mintAccount: mintAddress,
        source: sourceTokenAccount,
        blacklistEntry,
        treasury: treasuryTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .rpc();
  }

  // ─── fetch accounts ───────────────────────────────────────────────────────

  /** Fetch the StablecoinConfig account for a given mint. */
  async fetchConfig(mintAddress: PublicKey): Promise<StablecoinConfig> {
    const [pda] = findStablecoinConfigPda(mintAddress);
    const raw = await this.program.account.stablecoinConfig.fetch(pda);
    return raw as unknown as StablecoinConfig;
  }

  /** Fetch a MinterConfig account. */
  async fetchMinterConfig(
    mintAddress: PublicKey,
    minterAddress: PublicKey
  ): Promise<MinterConfig> {
    const [configPda] = findStablecoinConfigPda(mintAddress);
    const [pda] = findMinterConfigPda(configPda, minterAddress);
    const raw = await this.program.account.minterConfig.fetch(pda);
    return raw as unknown as MinterConfig;
  }

  /** Fetch a BlacklistEntry account. */
  async fetchBlacklistEntry(
    mintAddress: PublicKey,
    address: PublicKey
  ): Promise<BlacklistEntry> {
    const [configPda] = findStablecoinConfigPda(mintAddress);
    const [pda] = findBlacklistEntryPda(configPda, address);
    const raw = await this.program.account.blacklistEntry.fetch(pda);
    return raw as unknown as BlacklistEntry;
  }

  /** Check if an address is blacklisted. Returns false if account not found. */
  async isBlacklisted(
    mintAddress: PublicKey,
    address: PublicKey
  ): Promise<boolean> {
    try {
      await this.fetchBlacklistEntry(mintAddress, address);
      return true;
    } catch {
      return false;
    }
  }

  /** List all blacklisted addresses for a stablecoin. */
  async listBlacklist(mintAddress: PublicKey): Promise<BlacklistEntry[]> {
    const [configPda] = findStablecoinConfigPda(mintAddress);
    const entries = await this.program.account.blacklistEntry.all([
      {
        memcmp: {
          offset: 8, // skip discriminator
          bytes: configPda.toBase58(),
        },
      },
    ]);
    return entries.map((e) => e.account as unknown as BlacklistEntry);
  }
}
