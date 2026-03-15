import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { getConnection } from "../utils/connection.js";

const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

export function registerSupplyCommand(program: Command) {
  program
    .command("supply <mint_address>")
    .description("Check the current token supply")
    .action(async (mintAddress, options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Fetching supply...").start();

      try {
        const connection = getConnection(globalOpts.rpc || globalOpts.cluster);
        const mintPubkey = new PublicKey(mintAddress);
        
        const mintInfo = await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
        
        spinner.stop();
        
        // Supply is returned as a BigInt by getMint
        const formattedSupply = Number(mintInfo.supply) / (10 ** mintInfo.decimals);
        
        console.log(`\n${chalk.cyan("Token Mint:")} ${mintPubkey.toBase58()}`);
        console.log(`${chalk.cyan("Total Supply:")} ${chalk.green(formattedSupply.toLocaleString())} (Raw: ${mintInfo.supply})\n`);

      } catch (err: any) {
        spinner.fail(chalk.red(`Error fetching supply: ${err.message}`));
        process.exit(1);
      }
    });
}
