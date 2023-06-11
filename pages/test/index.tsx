import { CreateAccount, LoginFromKeyStore, LoginFromMnemonic } from '@/utils/web3/accounts'
import { useState } from 'react'

export default function Test() {
  const [registerPassword, setRegisterPassword] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [keyStore, setKeyStore] = useState("")
  const [mnemonic, setMnemonic] = useState("")
  
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
        <label htmlFor="keystore">keyStore</label>
        <input id="keystore" value={keyStore} onChange={(e) => setKeyStore(e.target.value)}></input>
      </div>
      <div>
        <button onClick={() => LoginFromKeyStore(keyStore, loginPassword)}>登入</button>
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
    </main>
  )
}
