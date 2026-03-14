import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import * as anchor from "@coral-xyz/anchor";

export const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
export const connection = provider.connection;
const systemWallet = provider.wallet as anchor.Wallet;
const systemKeypair = systemWallet.payer;

export async function airdrop(to: PublicKey, amount = 100 * LAMPORTS_PER_SOL) {
  const sig = await connection.requestAirdrop(to, amount);
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction({
    signature: sig,
    ...latestBlockhash,
  });
}

export async function createTestWallets() {
  const wallets = {
    master: systemKeypair,
    alice: Keypair.generate(),
    bob: Keypair.generate(),
    minter1: Keypair.generate(),
    badActor: Keypair.generate(),
  };

  const amount = 50 * LAMPORTS_PER_SOL;
  let latestBlockhash = await connection.getLatestBlockhash("confirmed");
  
  const transaction = new anchor.web3.Transaction({ feePayer: wallets.master.publicKey, ...latestBlockhash }).add(
    anchor.web3.SystemProgram.transfer({ fromPubkey: wallets.master.publicKey, toPubkey: wallets.alice.publicKey, lamports: amount }),
    anchor.web3.SystemProgram.transfer({ fromPubkey: wallets.master.publicKey, toPubkey: wallets.bob.publicKey, lamports: amount }),
    anchor.web3.SystemProgram.transfer({ fromPubkey: wallets.master.publicKey, toPubkey: wallets.minter1.publicKey, lamports: amount }),
    anchor.web3.SystemProgram.transfer({ fromPubkey: wallets.master.publicKey, toPubkey: wallets.badActor.publicKey, lamports: amount })
  );
  
  transaction.sign(wallets.master);
  const sig = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });
  await connection.confirmTransaction({ signature: sig, ...latestBlockhash });

  return wallets;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
