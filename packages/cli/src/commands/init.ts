import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { SolanaStablecoin, SSS1_PRESET, SSS2_PRESET, InitializeParams } from "@stbr/sss-token";
import { getConnection } from "../utils/connection.js";
import { getWallet } from "../utils/wallet.js";
import { parseConfig } from "../utils/config.js";

export function registerInitCommand(program: Command) {
  program
    .command("init")
    .description("Initialize a new stablecoin")
    .option("--preset <type>", "Preset type: sss-1 or sss-2")
    .option("--name <val>", "Token name")
    .option("--symbol <val>", "Token symbol")
    .option("--decimals <val>", "Token decimals", parseInt)
    .option("--config <path>", "Path to TOML config file")
    .action(async (options, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const spinner = ora("Connecting to Solana...").start();

      try {
        const connection = getConnection(globalOpts.url);
        const wallet = getWallet(globalOpts.wallet);
        const sdk = new SolanaStablecoin(connection, wallet);
        
        let params: InitializeParams;

        if (options.config) {
          spinner.text = `Parsing config ${options.config}...`;
          params = parseConfig(options.config);
        } else {
          if (!options.preset || !options.name || !options.symbol || options.decimals === undefined) {
            throw new Error("Missing required flags when not using --config. Provide --preset, --name, --symbol, and --decimals.");
          }
          const presetOpts = options.preset.toLowerCase() === "sss-2" ? SSS2_PRESET : SSS1_PRESET;
          params = {
            name: options.name,
            symbol: options.symbol,
            decimals: options.decimals,
            uri: "",
            ...presetOpts
          };
        }

        spinner.text = `Initializing Stablecoin "${params.name}" (${params.symbol}) on ${connection.rpcEndpoint}...`;
        
        const { mint, config, txSignature } = await sdk.initialize(params);
        
        spinner.succeed(chalk.green(`Stablecoin initialized successfully!`));
        console.log(`\n${chalk.cyan("Mint Address:")} ${mint.toBase58()}`);
        console.log(`${chalk.cyan("Config PDA:")} ${config.toBase58()}`);
        console.log(`${chalk.cyan("Transaction:")} ${txSignature}`);

      } catch (err: any) {
        spinner.fail(chalk.red(`Error initializing stablecoin: ${err.message}`));
        process.exit(1);
      }
    });
}
