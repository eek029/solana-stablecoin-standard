import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { SolanaStablecoin, SSS1_PRESET } from "@stbr/sss-token";
import { connection, provider, airdrop, createTestWallets } from "./fixtures/setup";

describe("RBAC & Quotas", () => {
  let wallets: Awaited<ReturnType<typeof createTestWallets>>;
  let sdk: SolanaStablecoin;
  let mintPubkey: PublicKey;
  let aliceAta: PublicKey;

  before(async () => {
    wallets = await createTestWallets();
    sdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.master));
    await new Promise(r => setTimeout(r, 1000));
    const { mint } = await sdk.initialize({
      name: "RBAC Token",
      symbol: "RBAC",
      decimals: 6,
      uri: "",
      ...SSS1_PRESET
    });
    mintPubkey = mint;

    aliceAta = (await getOrCreateAssociatedTokenAccount(
      connection,
      wallets.master,
      mintPubkey,
      wallets.alice.publicKey,
      undefined,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )).address;
  });

  it("Configures a minter with specific quota", async () => {
    const quota = 1000n;
    await sdk.updateMinter(mintPubkey, wallets.minter1.publicKey, quota);
    
    const minterConfig = await sdk.fetchMinterConfig(mintPubkey, wallets.minter1.publicKey);
    expect(minterConfig.quota.toString()).to.equal("1000");
    expect(minterConfig.minted.toString()).to.equal("0");
  });

  it("Allows minter to mint within quota", async () => {
    const minterSdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.minter1));
    await minterSdk.mintTokens(mintPubkey, aliceAta, 500n, { minterAuthority: wallets.minter1 });
    
    const minterConfig = await minterSdk.fetchMinterConfig(mintPubkey, wallets.minter1.publicKey);
    expect(minterConfig.minted.toString()).to.equal("500");
    
    const account = await getAccount(connection, aliceAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    expect(account.amount.toString()).to.equal("500");
  });

  it("Rejects minting attempting to exceed quota", async () => {
    const minterSdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.minter1));
    let errCaught = false;
    try {
      await minterSdk.mintTokens(mintPubkey, aliceAta, 501n, { minterAuthority: wallets.minter1 });
    } catch (e) {
      errCaught = true;
    }
    expect(errCaught).to.be.true;
  });

  it("Rejects unauthorized master role updates", async () => {
    const badSdk = new SolanaStablecoin(connection, new anchor.Wallet(wallets.badActor));
    let errCaught = false;
    try {
      await badSdk.updateMinter(mintPubkey, wallets.badActor.publicKey, 100000n);
    } catch (e) {
      errCaught = true;
    }
    expect(errCaught).to.be.true; // Unauthorized authority
  });
});
