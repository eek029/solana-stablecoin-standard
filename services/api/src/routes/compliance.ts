import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';

const router = Router();

// POST /compliance/blacklist/add
router.post('/blacklist/add', async (req, res) => {
  try {
    const { mint, address, reason } = req.body;
    const sdk = (req as any).sdk;

    const mintPubkey = new PublicKey(mint);
    const targetAddress = new PublicKey(address);

    console.log(`[Compliance] Blacklisting ${address} for reason: ${reason}`);

    // Off-chain AML / Sanctions screening could be triggered here
    
    const signature = await sdk.addToBlacklist(mintPubkey, targetAddress, reason);
    
    res.json({ success: true, signature, reason });
  } catch (error: any) {
    console.error('[Compliance] Blacklist Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /compliance/blacklist/remove
router.post('/blacklist/remove', async (req, res) => {
  try {
    const { mint, address } = req.body;
    const sdk = (req as any).sdk;

    const signature = await sdk.removeFromBlacklist(new PublicKey(mint), new PublicKey(address));
    res.json({ success: true, signature });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /compliance/seize
router.post('/seize', async (req, res) => {
  try {
    const { mint, source, treasury, amount } = req.body;
    const sdk = (req as any).sdk;

    const mintPubkey = new PublicKey(mint);
    const sourcePubkey = new PublicKey(source);
    const treasuryPubkey = new PublicKey(treasury);
    const amountBigInt = BigInt(amount);

    console.log(`[Compliance] Seizing ${amount} tokens from ${source} to ${treasury}`);

    const signature = await sdk.seize(mintPubkey, sourcePubkey, treasuryPubkey, amountBigInt);
    
    res.json({ success: true, signature });
  } catch (error: any) {
    console.error('[Compliance] Seize Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
