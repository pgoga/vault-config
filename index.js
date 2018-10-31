const axios = require('axios');
const fs = require('fs');
const configFile = process.env.CONFIG_FILE || "/tmp/vault.txt"
const env = process.env.ENV || "dev"
const vaultAddr = process.env.VAULT_ADDR || "http://127.0.0.1:8200"
const vaultToken = process.env.VAULT_TOKEN || ""
const project = process.env.PROJECT || "test"

console.log("VAULT_ADDR:", vaultAddr)
console.log("PROJECT:", project)
console.log("ENV:", env)
console.log("CONFIG_FILE:", configFile)
console.log("---------------------------")

const instance = axios.create({
  baseURL: vaultAddr+'/v1',
  timeout: 15000,
  headers: {'X-Vault-Token': vaultToken}
});

async function get(path){
  const response = await instance.get(path)
  return response.data.data
}

async function start (){
  const dataEnv = await get('/secret/'+project+'/'+env)
  const config_path = dataEnv.config_path
  const type = dataEnv.type
  const dataConfig = await get('/secret/'+project+'/'+env+'/config')
  const config = dataConfig.config
  const resultConfig = env + ":\n" + config
  console.log('type:', type)
  console.log('config_path:', config_path)
  console.log('config:\n', config)
  fs.writeFileSync(configFile, resultConfig)
}

;(async function(){
  try {
    await start()
  } catch (e) {
    console.log(e)
    console.log(e.response.status)
    console.log(e.response.data.errors)
  }
})();
