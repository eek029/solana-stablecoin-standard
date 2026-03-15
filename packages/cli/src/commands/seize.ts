import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerSeizeCommand(program: Command) {
  program
    .command("seize <mint_address> <account> <amount>")
    .description("Seize tokens from a blacklisted account (SSS-2 only)")
    .requiredOption("--treasury <address>", "Destination treasury token account")
    .action(async (mintAddress, account, amount, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Seizing tokens...").start();

      try {
        const connection = getConnection(globalOpts.rpc || globalOpts.cluster);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const tx = await sdk.seize(
          new PublicKey(mintAddress),
          new PublicKey(account),
          new PublicKey(options.treasury),
          BigInt(amount)
        );
        
        spinner.succeed(chalk.green("Tokens seized successfully!"));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);
      } catch (err: any) {
        spinner.fail(chalk.red(`Error seizing tokens: ${err.message}`));
        process.exit(1);
      }
    });
}
