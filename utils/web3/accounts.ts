// import web3Account from 'web3-eth-accounts'
import web3 from 'web3'
import crypto from 'crypto'
import scrypt from 'scrypt-js'
import { ITransaction, IEvaluateGas } from '@/types/web3'
import { EvaluateGas, EnsureBalance, SendTradRequest, PrivateKeyToAddress } from './index'

const KEY_PATH = "m/44'/60'/0'/0/0"
const CONTRACT_ADDRESS = "0xB7ee4b8b8FaA835c734562076D4e60Aec407dD78"
const CONTRACT_ABI = [
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

const web3Connect = new web3('https://goerli.infura.io/v3/72b22d776e7740ee9f9331a7428933b9')
const contract = new web3Connect.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)

export const CreateAccount = async (password: string) => {
  const bip39 = require('bip39')
  const web3Account = require('web3-eth-accounts')
  const iv = crypto.randomBytes(16).toString('hex').slice(0, 16);;
  const passwordBuffer = Buffer.from(password, 'utf-8')
  const saltBuffer = Buffer.from('salt', 'utf-8')
  console.log("password:", password)
  const passwordKey = scrypt.syncScrypt(passwordBuffer, saltBuffer, 16384, 8, 1, 32);

  const mnemonic = bip39.generateMnemonic()
  console.log("---------------------------mnemonic---------------------------")
  console.log(mnemonic)

  const cipher = crypto.createCipheriv('aes-256-cbc', passwordKey, iv)
  const encryptedMnemonic = `${cipher.update(mnemonic, 'utf-8', 'hex')}${cipher.final('hex')}`
  console.log("---------------------------encryptedMnemonic---------------------------")
  console.log(encryptedMnemonic)

  const privateKey = await mnemonicToPrivateKey(mnemonic, password)
  console.log("---------------------------privateKey---------------------------")
  console.log(privateKey)
  
  // @ts-ignore
  const request = contract.methods.register(mnemonic, encryptedMnemonic, "asd@asd.asd").encodeABI()
  toRegisterContract(request, privateKey)

  const keyStore = await web3Account.encrypt(privateKey, password)
  localStorage.setItem("ks", JSON.stringify(keyStore))
}

const toRegisterContract =  async (abiData: string, privateKey: string) => {
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
  // SendTradRequest(transaction, privateKey)
}

const sendRequestToContract = async (abiData: string, privateKey: string) => {
  // const myAddress = getOwnerAddress()
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
  // web3Connect.eth.accounts.signTransaction(transaction, '0xfe05ddeeaffc8da3e503790d506f79ff9c24f81b214c27c64eb4098d2a10e8b5').then((signed) => {
  // web3Connect.eth.accounts.signTransaction(transaction, privateKey).then((signed) => {
  //   console.log(signed)
  //   web3Connect.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', receipt => {
  //     console.log(receipt.transactionHash)
  //   }).on('error', err => {
  //     console.log(err)
  //   })
  // })
}
const mnemonicToPrivateKey = async (mnemonic: string, password: string): Promise<string> => {
  const bip39 = require('bip39')

  const seed = await bip39.mnemonicToSeed(mnemonic)
  console.log("---------------------------seed---------------------------")
  console.log(seed)

  const privateKey = seed.slice(0, 32).toString('hex')
  console.log("---------------------------privateKey---------------------------")
  console.log(privateKey)

  return `0x${privateKey}`
}

export const LoginFromKeyStore = async (password: string) => {
  const web3Account = require('web3-eth-accounts')
  const keyStoreString = localStorage.getItem("ks")
  const keyStore = keyStoreString ? JSON.parse(keyStoreString) : {}
  try {
    const account = await web3Account.decrypt(keyStore, password)
    console.log("---------------------------account---------------------------")
    console.log(account)
  } catch (err) {
    console.log(err)
  }
}

export const LoginFromMnemonic = async (mnemonic: string, password: string) => {
  // const web3 = require('web3')
  const web3Account = require('web3-eth-accounts')

  const privateKey = await mnemonicToPrivateKey(mnemonic, password)
  console.log("---------------------------privateKey---------------------------")
  console.log(privateKey)

  const keyStore = await web3Account.encrypt(privateKey, password)
  console.log("---------------------------keyStore---------------------------")
  localStorage.setItem("ks", JSON.stringify(keyStore))

  localStorage.setItem("ks", keyStore)
  const account = await web3Account.decrypt(keyStore, password)
  console.log("---------------------------account---------------------------")
  console.log(account)

  const transactionCount = await web3Connect.eth.getTransactionCount(account.address)
  console.log(Number(transactionCount))
  
  // const iv = crypto.randomBytes(16).toString('hex').slice(0, 16);;
  // const passwordBuffer = Buffer.from(password, 'utf-8')
  // const saltBuffer = Buffer.from('salt', 'utf-8')
  // console.log("password:", password)
  // const passwordKey = scrypt.syncScrypt(passwordBuffer, saltBuffer, 16384, 8, 1, 32);
  // const cipher = crypto.createCipheriv('aes-256-cbc', passwordKey, iv)
  // const encryptedMnemonic = `${cipher.update(mnemonic, 'utf-8', 'hex')}${cipher.final('hex')}`
  // console.log("---------------------------encryptedMnemonic---------------------------")
  // console.log(encryptedMnemonic)
  
  // // @ts-ignore
  // const request = contract.methods.login(mnemonic, encryptedMnemonic).encodeABI()
  // sendRequestToContract(request)
}