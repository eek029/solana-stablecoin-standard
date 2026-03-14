import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';

const router = Router();

// POST /core/mint
router.post('/mint', async (req, res) => {
  try {
    const { mint, destination, amount } = req.body;
    const sdk = (req as any).sdk;
    const wallet = (req as any).wallet;

    const mintPubkey = new PublicKey(mint);
    const destinationPubkey = new PublicKey(destination);
    const amountBigInt = BigInt(amount);

    console.log(`[Core] Minting ${amount} tokens of ${mint} to ${destination}`);

    // In a production environment, you would verify fiat deposits here
    
    // Execute on-chain mint
    const signature = await sdk.mintTokens(mintPubkey, destinationPubkey, amountBigInt, { minterAuthority: wallet });
    
    res.json({ success: true, signature });
  } catch (error: any) {
    console.error('[Core] Mint Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /core/burn
router.post('/burn', async (req, res) => {
  try {
    const { mint, source, amount } = req.body;
    const sdk = (req as any).sdk;

    const mintPubkey = new PublicKey(mint);
    const sourcePubkey = new PublicKey(source);
    const amountBigInt = BigInt(amount);

    console.log(`[Core] Burning ${amount} tokens of ${mint} from ${source}`);

    // Execute on-chain burn
    const signature = await sdk.burnTokens(mintPubkey, sourcePubkey, amountBigInt);
    
    res.json({ success: true, signature });
  } catch (error: any) {
    console.error('[Core] Burn Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /core/freeze
router.post('/freeze', async (req, res) => {
  try {
    const { mint, account } = req.body;
    const sdk = (req as any).sdk;
    
    const signature = await sdk.freezeAccount(new PublicKey(mint), new PublicKey(account));
    res.json({ success: true, signature });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
