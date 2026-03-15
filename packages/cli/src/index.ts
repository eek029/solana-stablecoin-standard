#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";

import { registerInitCommand } from "./commands/init.js";
import { registerMintCommand } from "./commands/mint.js";
import { registerBurnCommand } from "./commands/burn.js";
import { registerFreezeCommand } from "./commands/freeze.js";
import { registerThawCommand } from "./commands/thaw.js";
import { registerPauseCommand } from "./commands/pause.js";
import { registerUnpauseCommand } from "./commands/unpause.js";
import { registerBlacklistCommand } from "./commands/blacklist.js";
import { registerSeizeCommand } from "./commands/seize.js";
import { registerStatusCommand } from "./commands/status.js";
import { registerSupplyCommand } from "./commands/supply.js";

const program = new Command();

program
  .name("sss-token")
  .description(chalk.blue("Solana Stablecoin Standard CLI"))
  .version("0.1.0")
  .option("-c, --cluster <cluster>", "Solana cluster (devnet, mainnet-beta, localnet)", "devnet")
  .option("-r, --rpc <url>", "Custom RPC URL (overrides --cluster)")
  .option("-w, --wallet <path>", "Path to keypair file for the authority");

// Register commands
registerInitCommand(program);
registerMintCommand(program);
registerBurnCommand(program);
registerFreezeCommand(program);
registerThawCommand(program);
registerPauseCommand(program);
registerUnpauseCommand(program);
registerBlacklistCommand(program);
registerSeizeCommand(program);
registerStatusCommand(program);
registerSupplyCommand(program);

program.parse();
