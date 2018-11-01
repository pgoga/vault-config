const axios = require('axios');
const fs = require('fs');
const configFile = process.env.CONFIG_FILE || "/tmp/vault.txt"
const env = process.env.ENV || "dev"
const vaultAddr = process.env.VAULT_ADDR || "http://127.0.0.1:8200"
const vaultToken = process.env.VAULT_TOKEN || ""
const project = process.env.PROJECT || "test"
const toTO = process.env.TO_DO || "config"

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

async function configFileSave (){
  const dataEnv = await get('/secret/'+project+'/'+env)
  const config_path = dataEnv.config_path
  const config_type = dataEnv.config_type
  const dataConfig = await get('/secret/'+project+'/'+env+'/config')
  const config = dataConfig.config
  const resultConfig = env + ":\n" + config
  console.log('config_type:', config_type)
  console.log('config_path:', config_path)
  console.log('config:\n', config)
  fs.writeFileSync(configFile, resultConfig)
}


async function helmFileSave (){
  const dataEnv = await get('/secret/'+project+'/'+env)
  const config_path = dataEnv.config_path
  const resultConfig = `
config_path: ${config_path}
stage: ${env}
  `
  console.log(resultConfig)
  fs.writeFileSync(configFile, resultConfig)
}

;(async function(){
  try {
    switch (toTO) {
      case "helm":
        await helmFileSave()
        break;
      default:
        await configFileSave()
    }

  } catch (e) {
    console.log(e)
    console.log(e.response.status)
    console.log(e.response.data.errors)
  }
})();
