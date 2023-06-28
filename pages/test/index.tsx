import { CreateAccount, LoginFromKeyStore, LoginFromMnemonic } from '@/utils/web3/accounts'
import { useState } from 'react'
import axios from 'axios'

export default function Test() {
  const [registerPassword, setRegisterPassword] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [keyStore, setKeyStore] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileBase, setFileBase] = useState("")
  const ipfsHash = "QmYojQxWx9gZeG8MvcHEpXLyGyDRFuMQeBx2ozbN9LV5L4"

  const upload = async (file: File) => {
    const url = URL.createObjectURL(file)
    const formData = new FormData()
    formData.append('file', file)
    const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
            'pinata_api_key': `a521d4dea7894a3011b4`,
            'pinata_secret_api_key': `9acff15fcc85f295c45caa859ff149630d0af4e7a41e63a7b53dbcb3d98e51cb`,
            "Content-Type": "multipart/form-data"
        },
    });

    console.log(resFile)
    setFileBase(URL.createObjectURL(file))
    // console.log(blob)
  }
  
  return (
    <main>
      <div>
        <label htmlFor="register-password">密碼</label>
        <input id="register-password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)}></input>
      </div>
      <div>
        <button onClick={() => CreateAccount(registerPassword)}>註冊</button>
      </div>
      <div>
        <label htmlFor="login-password">密碼</label>
        <input id="login-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}></input>
      </div>
      <div>
        <button onClick={() => LoginFromKeyStore(loginPassword)}>登入</button>
      </div>
      <div>
        <label htmlFor="login-password">密碼</label>
        <input id="login-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}></input>
        <label htmlFor="keystore">助記詞</label>
        <input id="keystore" value={mnemonic} onChange={(e) => setMnemonic(e.target.value)}></input>
      </div>
      <div>
        <button onClick={() =>LoginFromMnemonic(mnemonic, loginPassword)}>登入</button>
      </div>
      <div>
        <input type='file' onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}></input>
      </div>
      <div>
        <button onClick={() => { if (file) upload(file)}}>傳</button>
      </div>
      <div>
        <video src="https://ipfs.io/ipfs/QmYojQxWx9gZeG8MvcHEpXLyGyDRFuMQeBx2ozbN9LV5L4">
          
        </video>
      </div>
    </main>
  )
}
