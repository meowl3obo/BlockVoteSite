export interface ITransaction {
  from: string,
  to: string,
  data?: string,
  nonce: bigint,
  gas?: bigint,
  gasPrice?: bigint,
  value?: string
}

export interface IEvaluateGas {
  gas: bigint,
  gasPrice: bigint,
  transactionCost: number
}