import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { SolanaStablecoin, SSS1_PRESET } from "@stbr/sss-token";
import { connection, provider, airdrop, createTestWallets } from "./fixtures/setup";

describe("SSS-1 Preset E2E", () => {
  let wallets: Awaited<ReturnType<typeof createTestWallets>>;
  let sdk: SolanaStablecoin;
  let mintPubkey: PublicKey;
  let aliceAta: PublicKey;
  let minterAta: PublicKey;

  before(async () => {
    wallets = await createTestWallets();
    sdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.master));
    await new Promise(r => setTimeout(r, 1000));
  });

  it("Initializes token with SSS-1 preset", async () => {
    const { mint } = await sdk.initialize({
      name: "SSS1 Token",
      symbol: "SSS1",
      decimals: 6,
      uri: "https://example.com/metadata.json",
      ...SSS1_PRESET
    });
    mintPubkey = mint;

    const data = await sdk.fetchConfig(mintPubkey);
    expect(data.name).to.equal("SSS1 Token");
    expect(data.enableTransferHook).to.be.false;
    expect(data.enablePermanentDelegate).to.be.false;
    expect(data.defaultAccountFrozen).to.be.false;
  });

  it("Configures a minter with quota", async () => {
    const quota = 1000000n; // 1 SSS1
    await sdk.updateMinter(mintPubkey, wallets.minter1.publicKey, quota);
    
    const minterConfig = await sdk.fetchMinterConfig(mintPubkey, wallets.minter1.publicKey);
    expect(minterConfig.quota.toString()).to.equal(quota.toString());
    expect(minterConfig.minted.toString()).to.equal("0");
  });

  it("Mints tokens as minter with quota", async () => {
    const minterSdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.minter1));
    aliceAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      wallets.alice,
      mintPubkey,
      wallets.alice.publicKey,
      undefined,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )).address;
    
    await minterSdk.mintTokens(mintPubkey, aliceAta, 500000n, {
      minterAuthority: wallets.minter1
    });

    const account = await getAccount(connection, aliceAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    expect(account.amount.toString()).to.equal("500000");
  });

  it("Burns tokens", async () => {
    const aliceSdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.alice));
    await aliceSdk.burnTokens(mintPubkey, aliceAta, 100000n, wallets.alice);
    
    const account = await getAccount(connection, aliceAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    expect(account.amount.toString()).to.equal("400000");
  });

  it("Pauses and Unpauses the token", async () => {
    await sdk.pause(mintPubkey);
    let config = await sdk.fetchConfig(mintPubkey);
    expect(config.isPaused).to.be.true;
    
    let errorCaught = false;
    try {
      await sdk.mintTokens(mintPubkey, aliceAta, 10000n);
    } catch (e) {
      errorCaught = true;
    }
    expect(errorCaught).to.be.true; // Interaction blocked

    await sdk.unpause(mintPubkey);
    config = await sdk.fetchConfig(mintPubkey);
    expect(config.isPaused).to.be.false;
  });

  it("Freezes and Thaws an account", async () => {
    await sdk.freezeAccount(mintPubkey, aliceAta);
    let account = await getAccount(connection, aliceAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    expect(account.isFrozen).to.be.true;

    await sdk.thawAccount(mintPubkey, aliceAta);
    account = await getAccount(connection, aliceAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    expect(account.isFrozen).to.be.false;
  });

  it("Transfers Master Authority", async () => {
    await sdk.transferAuthority(mintPubkey, wallets.bob.publicKey);
    const config = await sdk.fetchConfig(mintPubkey);
    expect(config.masterAuthority.toBase58()).to.equal(wallets.bob.publicKey.toBase58());
  });
});
