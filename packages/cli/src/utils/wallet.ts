import { Keypair } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import fs from "fs";
import os from "os";
import path from "path";
import 'dotenv/config';

export function getWallet(keypairPath?: string): Wallet {
  const keypair = getKeypair(keypairPath);
  return new Wallet(keypair);
}

export function getKeypair(keypairPath?: string): Keypair {
  const p = keypairPath || process.env.WALLET_PATH || path.join(os.homedir(), ".config", "solana", "id.json");
  
  if (!fs.existsSync(p)) {
    throw new Error(`Keypair file not found at ${p}. Please provide a valid path.`);
  }

  const raw = fs.readFileSync(p, "utf-8");
  return Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
}
