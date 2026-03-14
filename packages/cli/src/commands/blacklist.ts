import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerBlacklistCommand(program: Command) {
  const blacklistCmd = program
    .command("blacklist")
    .description("Manage SSS-2 blacklist (add/remove)");

  blacklistCmd
    .command("add <mint_address> <address>")
    .description("Add an address to the blacklist")
    .option("--reason <reason>", "Reason for blacklisting", "Administrative")
    .action(async (mintAddress, address, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Adding address to blacklist...").start();

      try {
        const connection = getConnection(globalOpts.url);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const tx = await sdk.addToBlacklist(new PublicKey(mintAddress), new PublicKey(address), options.reason);
        
        spinner.succeed(chalk.green(`Address added to blacklist! (Reason: ${options.reason})`));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);
      } catch (err: any) {
        spinner.fail(chalk.red(`Error adding to blacklist: ${err.message}`));
        process.exit(1);
      }
    });

  blacklistCmd
    .command("remove <mint_address> <address>")
    .description("Remove an address from the blacklist")
    .action(async (mintAddress, address, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Removing address from blacklist...").start();

      try {
        const connection = getConnection(globalOpts.url);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const tx = await sdk.removeFromBlacklist(new PublicKey(mintAddress), new PublicKey(address));
        
        spinner.succeed(chalk.green("Address removed from blacklist!"));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);
      } catch (err: any) {
        spinner.fail(chalk.red(`Error removing from blacklist: ${err.message}`));
        process.exit(1);
      }
    });
}
