import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { IDL, PROGRAM_ID } from '@stbr/sss-token';
import axios from 'axios';

const RPC_URL = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://127.0.0.1:3002/dispatch';

const connection = new Connection(RPC_URL, 'confirmed');
const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(anchor.web3.Keypair.generate()), { commitment: 'confirmed' });
const program = new anchor.Program(IDL, PROGRAM_ID, provider);

async function startIndexer() {
  console.log('[Indexer] Starting SSS-Token Event Indexer...');
  console.log(`[Indexer] RPC: ${RPC_URL}`);
  console.log(`[Indexer] Program ID: ${PROGRAM_ID}`);

  // Subscribe to BlacklistEntry account creations/updates
  connection.onProgramAccountChange(
    new PublicKey(PROGRAM_ID),
    async (accountInfo) => {
      try {
        // We look for accounts that match the size of BlacklistEntry (8 prefix + 32 (address) + 32 (stablecoin) + string)
        // For simplicity in this demo, we'll use anchor's coder to try and decode it
        const decoded = program.coder.accounts.decode('BlacklistEntry', accountInfo.accountInfo.data);
        
        console.log('[Indexer] Detected new/updated BlacklistEntry!', decoded);

        // Notify webhook service
        await axios.post(WEBHOOK_URL, {
          eventType: 'BLACKLIST_UPDATE',
          timestamp: new Date().toISOString(),
          data: {
            address: decoded.address.toBase58(),
            reason: decoded.reason,
            stablecoin: decoded.stablecoinConfig.toBase58()
          }
        });
      } catch (err) {
        // Account was likely not a BlacklistEntry, ignore
      }
    },
    'confirmed',
    [
      {
        dataSize: 100 // Approximation, in a real env you would filter by discriminator
      }
    ]
  );
  
  console.log('[Indexer] Listening for events...');
}

startIndexer().catch(console.error);
