import web3 from 'web3'
import crypto from 'crypto'
import scrypt from 'scrypt-js'
import { ToRegisterContract } from './contract/user'

const web3Connect = new web3(process.env.NEXT_PUBLIC_ETH_NODE_URL)

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

  const privateKey = await mnemonicToPrivateKey(mnemonic)
  console.log("---------------------------privateKey---------------------------")
  console.log(privateKey)

  ToRegisterContract(mnemonic, encryptedMnemonic, "asd@asd.asd", privateKey)

  const keyStore = await web3Account.encrypt(privateKey, password)
  localStorage.setItem("ks", JSON.stringify(keyStore))
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
  const web3Account = require('web3-eth-accounts')

  const privateKey = await mnemonicToPrivateKey(mnemonic)
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

const mnemonicToPrivateKey = async (mnemonic: string): Promise<string> => {
  const bip39 = require('bip39')

  const seed = await bip39.mnemonicToSeed(mnemonic)
  console.log("---------------------------seed---------------------------")
  console.log(seed)

  const privateKey = seed.slice(0, 32).toString('hex')
  console.log("---------------------------privateKey---------------------------")
  console.log(privateKey)

  return `0x${privateKey}`
}