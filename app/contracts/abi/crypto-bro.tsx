export const cryptoBroAbi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "premint",
        type: "uint256",
      },
    ],
    name: "deployErc20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "deployer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "deployedErc20s",
    outputs: [
      {
        internalType: "contract CustomErc20",
        name: "erc20s",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "deployer",
        type: "address",
      },
    ],
    name: "getDeployedErc20s",
    outputs: [
      {
        internalType: "contract CustomErc20[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
