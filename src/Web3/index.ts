import Web3 from "web3";
import networks from "@bondappetit/networks";
import { Contract } from "web3-eth-contract";

export interface Web3Config {
  provider: string;
  depositary: string;
  sender: string;
}

export function isWeb3Config(config: any): config is Web3Config {
  return (
    typeof config === "object" &&
    typeof config.provider === "string" &&
    typeof config.depositary === "string" &&
    typeof config.sender === "string"
  );
}

export function createWeb3({ provider, sender }: Web3Config) {
  const web3 = new Web3(provider);
  const account = web3.eth.accounts.privateKeyToAccount(sender);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;

  return web3;
}

export function isNetwork(network: any): network is keyof typeof networks {
  return typeof network === "string" && networks.hasOwnProperty(network);
}

export class Network {
  constructor(
    public readonly web3: Web3 = web3,
    public readonly networkName: string = networkName
  ) {}

  get network() {
    if (!isNetwork(this.networkName)) {
      throw new Error(`Invalid network "${this.networkName}"`);
    }

    return networks[this.networkName];
  }

  findContract(address: string) {
    return Object.values(this.network.contracts).find(
      (contract) => address === contract.address
    );
  }

  findContractByName(name: string) {
    return this.network.contracts[name];
  }

  createContract(address: string) {
    const contract = this.findContract(address);
    if (contract === undefined) {
      throw new Error(`Contract "${address}" not found`);
    }

    return new this.web3.eth.Contract(contract.abi, address);
  }

  createContractByName(name: string) {
    const contractInfo = this.findContractByName(name);
    if (contractInfo === undefined) {
      throw new Error(`Contract "${name}" not found`);
    }

    return this.createContract(contractInfo.address);
  }

  createContractById(contractId: string) {
    return contractId.slice(0, 2) === "0x"
      ? this.createContract(contractId)
      : this.createContractByName(contractId);
  }
}