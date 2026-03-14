import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerPauseCommand(program: Command) {
  program
    .command("pause <mint_address>")
    .description("Pause token operations")
    .action(async (mintAddress, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Pausing token activities...").start();

      try {
        const connection = getConnection(globalOpts.url);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const tx = await sdk.pause(new PublicKey(mintAddress));
        
        spinner.succeed(chalk.green("Token paused successfully!"));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);
      } catch (err: any) {
        spinner.fail(chalk.red(`Error pausing token: ${err.message}`));
        process.exit(1);
      }
    });
}
