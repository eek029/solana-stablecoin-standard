import { Keypair } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import fs from "fs";
import os from "os";
import path from "path";
import 'dotenv/config';

export function getWallet(keypairPath?: string): Wallet {
  const p = keypairPath || process.env.WALLET_PATH || path.join(os.homedir(), ".config", "solana", "id.json");
  
  if (!fs.existsSync(p)) {
    throw new Error(`Wallet file not found at ${p}. Please provide a valid --wallet path or set WALLET_PATH.`);
  }

  const raw = fs.readFileSync(p, "utf-8");
  const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
  return new Wallet(keypair);
}
