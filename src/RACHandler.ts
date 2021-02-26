import { resolve } from "path";
import { pathExists, readFile } from "fs-extra";
import { parse } from "ts-command-line-args";
import {
  isWeb3Config,
  createWeb3,
  Network,
} from "./Web3";
import { WiseWolves, isWiseWolvesConfig } from "./WiseWolves";

interface Args {
  config: string;
  network: string;
}
const args = parse<Args>({
  config: {
    type: String,
    alias: "c",
    description: "Path to config file",
    defaultValue: resolve(__dirname, "../config.json"),
  },
  network: {
    type: String,
    alias: "n",
    description: "Network name",
    defaultValue: "development",
  },
});

function exitError(message: string, code: number = 1) {
  console.error(message);
  process.exit(code);
}

(async () => {
  if (!(await pathExists(args.config))) {
    console.error(`Config file "${args.config}" not found`);
    process.exit(1);
  }

  try {
    const config = JSON.parse(await readFile(args.config, "utf8"));
    if (isWeb3Config(config.blockchain)) {
      const web3 = createWeb3(config.blockchain);
      const network = new Network(web3, args.network);
      const depositary = network.createContractById(config.blockchain.depositary);

      if (isWiseWolvesConfig(config.portfolio)) {
        const gateway = new WiseWolves(config.portfolio.options);
        try {
          await gateway.run(web3, depositary);
        } catch (e) {
          exitError(e);
        }
      } else {
        exitError("Undefined gateway or invalid gateway configuration");
      }
    } else {
      exitError("Invalid blockchain client configuration");
    }
  } catch (e) {
    exitError(`Invalid JSON structure on config file: ${e}`);
  }
})();
