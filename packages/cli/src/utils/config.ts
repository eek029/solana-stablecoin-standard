import fs from "fs";
import toml from "toml";
import { SSS1_PRESET, SSS2_PRESET, InitializeParams } from "@stbr/sss-token";

export interface Config {
  presetType: "sss-1" | "sss-2";
  token: {
    name: string;
    symbol: string;
    decimals: number;
    uri?: string;
  };
}

export function parseConfig(filePath: string): InitializeParams {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = toml.parse(raw);

  const presetType = parsed.preset?.type?.toLowerCase();
  
  if (presetType !== "sss-1" && presetType !== "sss-2") {
    throw new Error(`Invalid or missing preset.type. Must be 'sss-1' or 'sss-2'. Found: ${presetType}`);
  }
  
  if (!parsed.token?.name || !parsed.token?.symbol || parsed.token?.decimals === undefined) {
    throw new Error(`Missing token config fields. Must have name, symbol and decimals in [token].`);
  }

  const presetOpts = presetType === "sss-2" ? SSS2_PRESET : SSS1_PRESET;

  return {
    name: parsed.token.name,
    symbol: parsed.token.symbol,
    decimals: parsed.token.decimals,
    uri: parsed.token.uri || "",
    ...presetOpts
  };
}
