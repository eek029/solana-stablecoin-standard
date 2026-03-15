import { Connection, clusterApiUrl } from "@solana/web3.js";
import 'dotenv/config';

export type Cluster = "mainnet-beta" | "testnet" | "devnet" | "localnet";

export function getConnection(urlOrCluster?: string): Connection {
  let endpoint = urlOrCluster || process.env.RPC_URL || "devnet";
  
  if (endpoint === "mainnet-beta" || endpoint === "testnet" || endpoint === "devnet") {
    endpoint = clusterApiUrl(endpoint as any);
  } else if (endpoint === "localnet" || endpoint === "localhost") {
    endpoint = "http://localhost:8899";
  }
  
  return new Connection(endpoint, "confirmed");
}
