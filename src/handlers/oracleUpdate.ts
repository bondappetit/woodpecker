const Web3 = require("web3");

export const OracleABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_delay",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_allowUpdateAll",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "data",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "delay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "lastUpdate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_delay",
        type: "uint256",
      },
    ],
    name: "setDelay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nextUpdate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_allowUpdateAll",
        type: "bool",
      },
    ],
    name: "setAllowUpdateAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_allowUpdate",
        type: "bool",
      },
    ],
    name: "setAllowUpdateAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isUpdateAllowed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_data",
        type: "string",
      },
    ],
    name: "isDataEquals",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_data",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_lastUpdate",
        type: "uint256",
      },
    ],
    name: "update",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export interface Options {
  provider: string;
  from: string;
  contract: string;
}

export function oracleUpdate(
  { provider, from, contract }: Options,
  next: Function
) {
  return async (data: Promise<any>) => {
    const web3 = new Web3(provider);
    const oracle = new web3.eth.Contract(OracleABI, contract);
    const [currentBlock, lastUpdateBlock, nextUpdateBlock] = await Promise.all([
      web3.eth.getBlockNumber(),
      oracle.methods.lastUpdate().call(),
      oracle.methods.nextUpdate().call(),
    ]);
    if (currentBlock < nextUpdateBlock) return next(data);

    const newData = await data;
    const isDataEquals = await oracle.methods.isDataEquals(newData).call();
    if (isDataEquals) return next(data);

    const sender = web3.eth.accounts.privateKeyToAccount(from);
    const isUpdateAllowed = await oracle.methods
      .isUpdateAllowed(sender.address)
      .call();
    if (!isUpdateAllowed) throw new Error(`OracleUpdate: access denied`);

    const tx = {
        from: sender.address,
        to: contract,
        gas: 2000000,
        data: oracle.methods.update(newData, lastUpdateBlock).encodeABI()
    }
    const signedTx = await sender.signTransaction(tx);
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return next(data);
  };
}
