import web3 from 'web3'
import { ITransaction } from '@/types/web3'
import { EvaluateGas, EnsureBalance, SendTradRequest, PrivateKeyToAddress } from '../index'
import { UserContract } from '@/config/contract'

const CONTRACT_ADDRESS = UserContract.address
const CONTRACT_ABI = UserContract.abi

const web3Connect = new web3(process.env.NEXT_PUBLIC_ETH_NODE_URL)
const contract = new web3Connect.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)

export const ToRegisterContract =  async (mnemonic: string, encryptedMnemonic: string, email: string, privateKey: string) => {
  // @ts-ignore
  const abiData = contract.methods.register(mnemonic, encryptedMnemonic, email).encodeABI()
  const requestAddress = PrivateKeyToAddress(privateKey)
  console.log(requestAddress)
  const nonce = await web3Connect.eth.getTransactionCount(requestAddress);
  const transaction: ITransaction = {
    from: requestAddress,
    to: CONTRACT_ADDRESS,
    data: abiData,
    nonce: nonce,
  }

  const { gas, gasPrice, transactionCost } = await EvaluateGas(transaction)
  transaction.gas = gas
  transaction.gasPrice = gasPrice

  await EnsureBalance(requestAddress, transactionCost)
  setTimeout(() => {
    SendTradRequest(transaction, privateKey)
  }, 60000)
}