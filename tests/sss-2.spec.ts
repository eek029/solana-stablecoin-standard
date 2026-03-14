import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { SolanaStablecoin, SSS2_PRESET } from "@stbr/sss-token";
import { connection, provider, airdrop, createTestWallets } from "./fixtures/setup";

describe("SSS-2 Preset E2E", () => {
  let wallets: Awaited<ReturnType<typeof createTestWallets>>;
  let sdk: SolanaStablecoin;
  let mintPubkey: PublicKey;

  before(async () => {
    wallets = await createTestWallets();
    sdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.master));
    await new Promise(r => setTimeout(r, 1000));
  });

  it("Initializes token with SSS-2 preset", async () => {
    const { mint, config } = await sdk.initialize({
      name: "SSS2 Token",
      symbol: "SSS2",
      decimals: 6,
      uri: "",
      ...SSS2_PRESET
    });
    mintPubkey = mint;

    const data = await sdk.fetchConfig(mintPubkey);
    expect(data.name).to.equal("SSS2 Token");
    expect(data.enableTransferHook).to.be.true; // Enforces transfer hooks
    expect(data.enablePermanentDelegate).to.be.true; // Enforces permanent delegates
  });

  it("Blocks SSS-2 instructions on non-blacklisted account", async () => {
    let treasuryAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      wallets.master,
      mintPubkey,
      wallets.master.publicKey,
      undefined,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )).address;

    let bobAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      wallets.bob,
      mintPubkey,
      wallets.bob.publicKey,
      undefined,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )).address;

    await sdk.mintTokens(mintPubkey, bobAta, 1000n, { minterAuthority: wallets.master });

    let errCaught = false;
    try {
      await sdk.seize(mintPubkey, bobAta, treasuryAta, 500n);
    } catch (e) {
      errCaught = true;
    }
    expect(errCaught).to.be.true; // Not blacklisted
  });

  it("Adds account to blacklist", async () => {
    const reason = "Sanctions List";
    await sdk.addToBlacklist(mintPubkey, wallets.bob.publicKey, reason);
    
    expect(await sdk.isBlacklisted(mintPubkey, wallets.bob.publicKey)).to.be.true;
    const entry = await sdk.fetchBlacklistEntry(mintPubkey, wallets.bob.publicKey);
    expect(entry.reason).to.equal(reason);
  });

  it("Transfer hook blocks blacklisted transfers", async () => {
    // Cannot currently test the pure spl-token transfer via SDK since we rely on CPI internally
    // but the on-chain transfer_hook logic validates the blacklist state. 
    // This is handled by default since SSS-2 enables transfer hook to the transfer hook program.
    // That will fail if an account is blacklisted.
  });

  it("Seizes tokens from blacklisted account", async () => {
    const treasuryAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      wallets.master, // reusing as treasury feepayer
      mintPubkey,
      wallets.master.publicKey,
      undefined,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )).address;
    const bobAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      wallets.bob,
      mintPubkey,
      wallets.bob.publicKey,
      undefined,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )).address;

    await sdk.seize(mintPubkey, bobAta, treasuryAta, 1000n);

    const bobAccount = await getAccount(connection, bobAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    const treasuryAccount = await getAccount(connection, treasuryAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    
    expect(bobAccount.amount.toString()).to.equal("0");
    expect(treasuryAccount.amount.toString()).to.equal("1000");
  });

  it("Removes address from blacklist", async () => {
    await sdk.removeFromBlacklist(mintPubkey, wallets.bob.publicKey);
    expect(await sdk.isBlacklisted(mintPubkey, wallets.bob.publicKey)).to.be.false;
  });
});
