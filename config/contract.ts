export const UserContract = {
  address: process.env.NEXT_PUBLIC_USER_CONTRACT_ADDRESS ?? "",
  abi: [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "mnemonic",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "hashMnemonic",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        }
      ],
      "name": "register",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "mnemonic",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "hashMnemonic",
          "type": "string"
        }
      ],
      "name": "updateHashMnemonic",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "mnemonic",
          "type": "string"
        }
      ],
      "name": "getEmail",
      "outputs": [
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "mnemonic",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "hashMnemonic",
          "type": "string"
        }
      ],
      "name": "login",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isSuccess",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}