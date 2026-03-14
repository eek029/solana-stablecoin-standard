import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { SolanaStablecoin, SSS2_PRESET } from "@stbr/sss-token";
import { connection, provider, airdrop, createTestWallets } from "./fixtures/setup";

describe("Compliance (Blacklist & Seize)", () => {
  let wallets: Awaited<ReturnType<typeof createTestWallets>>;
  let sdk: SolanaStablecoin;
  let mintPubkey: PublicKey;

  before(async () => {
    wallets = await createTestWallets();
    sdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.master));
    await new Promise(r => setTimeout(r, 1000)); // allow blocks to process
    const { mint } = await sdk.initialize({
      name: "Compliance Token",
      symbol: "COMP",
      decimals: 6,
      uri: "",
      ...SSS2_PRESET
    });
    mintPubkey = mint;
  });

  it("Blocks unauthorized blacklisting", async () => {
    let errCaught = false;
    const badSdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.badActor));
    try {
      await badSdk.addToBlacklist(mintPubkey, wallets.bob.publicKey, "Fake");
    } catch (e) {
      errCaught = true;
    }
    expect(errCaught).to.be.true; // Because badActor is not master authority
  });

  it("Successfully Adds and queries Blacklist entry", async () => {
    const reason = "Suspicious activity detected";
    await sdk.addToBlacklist(mintPubkey, wallets.bob.publicKey, reason);
    
    const isBlacklisted = await sdk.isBlacklisted(mintPubkey, wallets.bob.publicKey);
    expect(isBlacklisted).to.be.true;
    
    const entry = await sdk.fetchBlacklistEntry(mintPubkey, wallets.bob.publicKey);
    expect(entry.reason).to.equal(reason);
    expect(entry.address.toBase58()).to.equal(wallets.bob.publicKey.toBase58());
  });

  it("Cannot Seize unblacklisted accounts", async () => {
    const treasuryAta = (await getOrCreateAssociatedTokenAccount(
      connection, wallets.master, mintPubkey, wallets.master.publicKey, undefined, undefined, undefined, TOKEN_2022_PROGRAM_ID
    )).address;
    // Explicitly fund the alice account in before block via createTestWallets 
    const aliceAta = (await getOrCreateAssociatedTokenAccount(
      connection, wallets.alice, mintPubkey, wallets.alice.publicKey, undefined, undefined, undefined, TOKEN_2022_PROGRAM_ID
    )).address;
    
    let errCaught = false;
    try {
      await sdk.seize(mintPubkey, aliceAta, treasuryAta, 10n);
    } catch (e) {
      errCaught = true;
    }
    expect(errCaught).to.be.true; // Alice is not blacklisted
  });

  it.skip("Allows Authority to Seize tokens from Blacklisted account", async () => {
    const badActorAta = (await getOrCreateAssociatedTokenAccount(
      connection, wallets.badActor, mintPubkey, wallets.badActor.publicKey, undefined, undefined, undefined, TOKEN_2022_PROGRAM_ID
    )).address;
    const treasuryAta = (await getOrCreateAssociatedTokenAccount(
      connection, wallets.master, mintPubkey, wallets.master.publicKey, undefined, undefined, undefined, TOKEN_2022_PROGRAM_ID
    )).address;
    
    await new Promise(r => setTimeout(r, 1000));
    await sdk.updateMinter(mintPubkey, wallets.master.publicKey, 10000n);
    await sdk.mintTokens(mintPubkey, badActorAta, 5000n, { minterAuthority: wallets.master });
    
    await new Promise(r => setTimeout(r, 1000));
    // Blacklist badActor to be able to seize from him
    await sdk.addToBlacklist(mintPubkey, wallets.badActor.publicKey, "Suspect activity");
    
    await new Promise(r => setTimeout(r, 1000));
    await sdk.seize(mintPubkey, badActorAta, treasuryAta, 4000n);
    
    const badActorAccount = await getAccount(connection, badActorAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    const treasuryAccount = await getAccount(connection, treasuryAta, "confirmed", TOKEN_2022_PROGRAM_ID);

    expect(badActorAccount.amount.toString()).to.equal("1000"); // 5000 - 4000
    expect(treasuryAccount.amount.toString()).to.equal("4000");
  });

  it("Can remove active blacklist entry", async () => {
    await sdk.removeFromBlacklist(mintPubkey, wallets.bob.publicKey);
    const isBlacklisted = await sdk.isBlacklisted(mintPubkey, wallets.bob.publicKey);
    expect(isBlacklisted).to.be.false;
  });
});
