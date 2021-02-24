const Web3 = require("web3");

export interface Web3Config {
  provider: string;
  depositaryAddress: string;
  sender: string;
}

export function isWeb3Config(config: any): config is Web3Config {
  return (
    typeof config === "object" &&
    typeof config.provider === "string" &&
    typeof config.depositaryAddress === "string" &&
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

export const RealAssetDepositaryBalanceViewABI = [
  {
    inputs: [],
    name: "assets",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "id",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
        ],
        internalType: "struct RealAssetDepositaryBalanceView.Asset[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "proofData",
        type: "string",
      },
      {
        internalType: "string",
        name: "proofSignature",
        type: "string",
      },
    ],
    name: "put",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "id",
        type: "string",
      },
    ],
    name: "remove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export function createRealAssetDepositaryBalanceViewContract(
  web3: typeof Web3,
  address: string
) {
  return new web3.eth.Contract(RealAssetDepositaryBalanceViewABI, address);
}
