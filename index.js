var argv = require('minimist')(process.argv.slice(2));
const axios = require('axios');
const fs = require('fs');

const configFile = argv["config-file"] || "/tmp/vault.txt"
const env = argv["env"] || "dev"
const vaultAddr = argv["vault-addr"] || "http://127.0.0.1:8200"
const vaultToken = argv["vault-token"] || ""
const project = argv["project"] || "test"
const toDo = argv["to-do"] || "config"

console.log("vault-addr:", vaultAddr)
console.log("project:", project)
console.log("env:", env)
console.log("config-file:", configFile)
console.log("to-do:", toDo)
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
  const dataHelm = await get('/secret/'+project+'/'+env+'/helm')
  const config_path = dataHelm.config_path
  const dataConfig = await get('/secret/'+project+'/'+env+'/config')
  const config = dataConfig.config
  const resultConfig = env + ":\n" + config
  console.log('config_path:', config_path)
  console.log('config:\n', config)
  fs.writeFileSync(configFile, resultConfig)
}


async function helmFileSave (){
  const dataHelm = await get('/secret/'+project+'/'+env+'/helm')
  const config_path = dataHelm.config_path
  const resultConfig = `
config_path: ${config_path}
stage: ${env}
  `
  console.log(resultConfig)
  fs.writeFileSync(configFile, resultConfig)
}

;(async function(){
  try {
    switch (toDo) {
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
