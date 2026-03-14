import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerBurnCommand(program: Command) {
  program
    .command("burn <mint_address> <source> <amount>")
    .description("Burn tokens from a source account")
    .action(async (mintAddress, source, amount, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Burning tokens...").start();

      try {
        const connection = getConnection(globalOpts.url);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const tx = await sdk.burnTokens(new PublicKey(mintAddress), new PublicKey(source), BigInt(amount));
        
        spinner.succeed(chalk.green("Tokens burned successfully!"));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);
      } catch (err: any) {
        spinner.fail(chalk.red(`Error burning tokens: ${err.message}`));
        process.exit(1);
      }
    });
}
