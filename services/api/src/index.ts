import express from 'express';
import cors from 'cors';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { SolanaStablecoin } from '@stbr/sss-token';
import fs from 'fs';

import coreRoutes from './routes/core';
import complianceRoutes from './routes/compliance';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const RPC_URL = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
const KEYPAIR_PATH = process.env.KEYPAIR_PATH || process.env.HOME + '/.config/solana/id.json';

// Initialize Solana Connection
const connection = new Connection(RPC_URL, 'confirmed');

// Load wallet
const secretKeyString = fs.readFileSync(KEYPAIR_PATH, 'utf8');
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
const keypair = Keypair.fromSecretKey(secretKey);
const wallet = new anchor.Wallet(keypair);

// Initialize SDK
const sdk = new SolanaStablecoin(connection, wallet);

// Inject SDK into request context
app.use((req, res, next) => {
  (req as any).sdk = sdk;
  (req as any).wallet = wallet;
  next();
});

// Routes
app.use('/core', coreRoutes);
app.use('/compliance', complianceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', pubkey: wallet.publicKey.toBase58() });
});

app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
  console.log(`[API] Wallet loaded: ${wallet.publicKey.toBase58()}`);
});
