import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerUnpauseCommand(program: Command) {
  program
    .command("unpause <mint_address>")
    .description("Unpause token operations")
    .action(async (mintAddress, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Unpausing token activities...").start();

      try {
        const connection = getConnection(globalOpts.url);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const tx = await sdk.unpause(new PublicKey(mintAddress));
        
        spinner.succeed(chalk.green("Token unpaused successfully!"));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);
      } catch (err: any) {
        spinner.fail(chalk.red(`Error unpausing token: ${err.message}`));
        process.exit(1);
      }
    });
}
