import { Connection, clusterApiUrl } from "@solana/web3.js";
import 'dotenv/config';

export function getConnection(url?: string): Connection {
  const endpoint = url || process.env.RPC_URL || clusterApiUrl("devnet");
  return new Connection(endpoint, "confirmed");
}
