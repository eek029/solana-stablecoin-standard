import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerThawCommand(program: Command) {
  program
    .command("thaw <mint_address> <account>")
    .description("Thaw a token account")
    .action(async (mintAddress, account, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Thawing account...").start();

      try {
        const connection = getConnection(globalOpts.rpc || globalOpts.cluster);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const tx = await sdk.thawAccount(new PublicKey(mintAddress), new PublicKey(account));
        
        spinner.succeed(chalk.green("Account thawed successfully!"));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);
      } catch (err: any) {
        spinner.fail(chalk.red(`Error thawing account: ${err.message}`));
        process.exit(1);
      }
    });
}
