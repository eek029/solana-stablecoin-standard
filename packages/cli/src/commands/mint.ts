import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerMintCommand(program: Command) {
  program
    .command("mint <mint_address> <destination> <amount>")
    .description("Mint tokens to a destination account")
    .action(async (mintAddress, destination, amount, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Minting tokens...").start();

      try {
        const connection = getConnection(globalOpts.rpc || globalOpts.cluster);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const mintPubkey = new PublicKey(mintAddress);
        const destPubkey = new PublicKey(destination);
        const bnAmount = BigInt(amount);

        const tx = await sdk.mintTokens(mintPubkey, destPubkey, bnAmount);
        
        spinner.succeed(chalk.green("Tokens minted successfully!"));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);

      } catch (err: any) {
        spinner.fail(chalk.red(`Error minting tokens: ${err.message}`));
        process.exit(1);
      }
    });
}
