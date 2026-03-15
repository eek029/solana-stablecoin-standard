import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { SolanaStablecoin, detectPreset } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";

export function registerStatusCommand(program: Command) {
  program
    .command("status <mint_address>")
    .description("Display stablecoin configuration and status")
    .action(async (mintAddress, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Fetching stablecoin status...").start();

      try {
        const connection = getConnection(globalOpts.rpc || globalOpts.cluster);
        // Status can be read without a real wallet, but we provide it for the SDK constructor
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        const mintPubkey = new PublicKey(mintAddress);
        const config = await sdk.fetchConfig(mintPubkey);
        const preset = detectPreset(config);
        
        spinner.stop();
        
        console.log(chalk.bold.blue(`\n=== Stablecoin Status ===`));
        console.log(`${chalk.cyan("Mint Address:")} ${mintPubkey.toBase58()}`);
        console.log(`${chalk.cyan("Name:")} ${config.name}`);
        console.log(`${chalk.cyan("Symbol:")} ${config.symbol}`);
        console.log(`${chalk.cyan("Decimals:")} ${config.decimals}`);
        console.log(`${chalk.cyan("Preset / Protocol:")} ${chalk.green(preset)}`);
        
        console.log(chalk.bold.blue(`\n=== Configuration ===`));
        console.log(`${chalk.cyan("Master Authority:")} ${config.masterAuthority.toBase58()}`);
        console.log(`${chalk.cyan("Is Paused:")} ${config.isPaused ? chalk.red("Yes") : chalk.green("No")}`);
        console.log(`${chalk.cyan("Default Account Frozen:")} ${config.defaultAccountFrozen ? "Yes" : "No"}`);
        console.log(`${chalk.cyan("Transfer Hook Enabled:")} ${config.enableTransferHook ? "Yes" : "No"}`);
        console.log(`${chalk.cyan("Permanent Delegate:")} ${config.enablePermanentDelegate ? "Yes" : "No"}`);

        if (preset === "SSS-2") {
          console.log(chalk.bold.blue(`\n=== Compliance (SSS-2) ===`));
          const blacklist = await sdk.listBlacklist(mintPubkey);
          console.log(`${chalk.cyan("Blacklisted Accounts:")} ${blacklist.length}`);
          if (blacklist.length > 0) {
            blacklist.forEach(entry => {
              console.log(`  - ${entry.address.toBase58()} (${entry.reason})`);
            });
          }
        }
        console.log("");

      } catch (err: any) {
        spinner.fail(chalk.red(`Error fetching status: ${err.message}`));
        process.exit(1);
      }
    });
}
