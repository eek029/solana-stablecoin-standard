import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerFreezeCommand(program: Command) {
  program
    .command("freeze <mint_address> <account>")
    .description("Freeze a token account")
    .action(async (mintAddress, account, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Freezing account...").start();

      try {
        const connection = getConnection(globalOpts.url);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const tx = await sdk.freezeAccount(new PublicKey(mintAddress), new PublicKey(account));
        
        spinner.succeed(chalk.green("Account frozen successfully!"));
        console.log(`${chalk.cyan("Transaction:")} ${tx}`);
      } catch (err: any) {
        spinner.fail(chalk.red(`Error freezing account: ${err.message}`));
        process.exit(1);
      }
    });
}
