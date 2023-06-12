// import web3Account from 'web3-eth-accounts'
import a from 'ethereumjs-util'
import web3 from 'web3'
import crypto from 'crypto'
import scrypt from 'scrypt-js'

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

  const keyStore = await web3Account.encrypt(privateKey, password)
  console.log("---------------------------keyStore---------------------------")
  localStorage.setItem("ks", JSON.stringify(keyStore))
  
  // @ts-ignore
  const request = contract.methods.register(mnemonic, encryptedMnemonic, "asd@asd.asd").encodeABI()
  sendRequestToContract(request, privateKey)
}

const sendRequestToContract = async (abiData: string, privateKey: string) => {
  const web3Connect = new web3('https://goerli.infura.io/v3/72b22d776e7740ee9f9331a7428933b9')
  const myAddress = getMyAddress()
  const nonce = await web3Connect.eth.getTransactionCount(myAddress);
  const transaction = {
    from: myAddress,
    to: CONTRACT_ADDRESS,
    gas: 1000000,
    gasPrice: 10000000000,
    data: abiData,
    nonce: nonce,
    value: 0
  }
  web3Connect.eth.accounts.signTransaction(transaction, '0xfe05ddeeaffc8da3e503790d506f79ff9c24f81b214c27c64eb4098d2a10e8b5').then((signed) => {
    console.log(signed)
    web3Connect.eth.sendSignedTransaction(signed.rawTransaction).on('receipt', receipt => {
      console.log(receipt.transactionHash)
    }).on('error', err => {
      console.log(err)
    })
  })
}

const getMyAddress = () => {
  const web3Account = require('web3-eth-accounts')
  const account = web3Account.privateKeyToAccount('0xfe05ddeeaffc8da3e503790d506f79ff9c24f81b214c27c64eb4098d2a10e8b5');
  return account.address
}

const mnemonicToPrivateKey = async (mnemonic: string, password: string): Promise<string> => {
  const bip39 = require('bip39')
  const ethUtil = require('ethereumjs-util');
  const hdKey = require('hdkey')

  const seed = await bip39.mnemonicToSeed(mnemonic)
  console.log("---------------------------seed---------------------------")
  console.log(seed)

  const key = hdKey.fromMasterSeed(seed)
  console.log("---------------------------key---------------------------")
  console.log(key)

  const privateKey = ethUtil.bufferToHex(key._privateKey)
  console.log("---------------------------privateKey---------------------------")
  console.log(privateKey)

  return privateKey
}

const privateKeyToAddress = (privateKey: string): string => {
  const ethUtil = require('ethereumjs-util');
  const address = ethUtil.privateToAddress(Buffer.from(privateKey.replace('0x', ''), 'hex'), true).toString('hex')
  console.log("---------------------------address---------------------------")
  console.log(address)

  return address
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