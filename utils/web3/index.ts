
import web3 from 'web3'
import { ITransaction, IEvaluateGas } from '@/types/web3'

const web3Connect = new web3(process.env.NEXT_PUBLIC_ETH_NODE_URL)
const OWNER_PRIVATE_KEY = process.env.NEXT_PUBLIC_OWNER_PRIVATE_KEY ?? ""

export const EvaluateGas = async (transaction: ITransaction): Promise<IEvaluateGas> => {
  console.log(transaction)
  const sourceGas = await web3Connect.eth.estimateGas(transaction)
  const sourceGasPrice= await web3Connect.eth.getGasPrice()
  const gas = BigInt(Math.round(Number(sourceGas) * 1.2))
  const gasPrice = BigInt(Math.round(Number(sourceGasPrice) * 1.2))
  const transactionCostString = web3Connect.utils.fromWei((gas * gasPrice).toString(), 'ether')
  const transactionCost = Number(transactionCostString)

  return { gas, gasPrice, transactionCost }
}

export const EnsureBalance = async (address: string, transactionCost: number) => {
  const balanceBigint = await web3Connect.eth.getBalance(address)
  const balance = Number(balanceBigint)
  console.log(balance, transactionCost)
  if (balance <= transactionCost) {
    await StoreBalance(address, transactionCost)
  }
}

export const StoreBalance = async (address: string, transactionCost: number) => {
  const ownerAddress = PrivateKeyToAddress(OWNER_PRIVATE_KEY)
  const nonce = await web3Connect.eth.getTransactionCount(ownerAddress);
  const transaction: ITransaction = {
    from: ownerAddress,
    to: address,
    nonce: nonce,
    value: web3Connect.utils.toWei(transactionCost * 1.1, 'ether')
  }
  const { gas, gasPrice } = await EvaluateGas(transaction)
  transaction.gas = gas
  transaction.gasPrice = gasPrice
  SendTradRequest(transaction, OWNER_PRIVATE_KEY)
}

export const SendTradRequest = async (transaction: ITransaction, privateKey: string) => {
  console.log(transaction, privateKey)
  web3Connect.eth.accounts.signTransaction(transaction, privateKey).then((signed) => {
    console.log(signed)
    web3Connect.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', receipt => {
      console.log(receipt.transactionHash)
    }).on('error', err => {
      console.log(err)
    })
  })
}

export const PrivateKeyToAddress = (privateKey: string): string => {
  const web3Account = require('web3-eth-accounts')
  const account = web3Account.privateKeyToAccount(privateKey)

  return account.address
}
