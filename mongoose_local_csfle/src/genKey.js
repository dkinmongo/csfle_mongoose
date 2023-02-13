const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require("fs");
const { ClientEncryption } = require('mongodb-client-encryption');
const { Binary } = require('mongodb');

// const MONGO_URI = "mongodb+srv://admin:Manager1@cluster0.gmta9.mongodb.net/test?retryWrites=true&w=majority"
const MONGO_URI = "mongodb+srv://admin:Manager1@cluster0.gmta9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

function readMasterKey(path = "../master-key.txt") {
  return fs.readFileSync(path);
}

const genKey = async () => {
    try {
        let kmsProviders = {
          local: {
            key: readMasterKey()
          }           
        }
        const keyDB = "encryption";
        const keyColl = "__keyVault";
        const keyVaultNamespace = `${keyDB}.${keyColl}`;

        let conn = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoEncryption: {
                keyVaultNamespace,
                kmsProviders,
                extraOptions: {
                  mongocryptdSpawnPath: '/Users/dongq/dk/node/mongocryptd',
                  mongocryptdBypassSpawn: false
                }                
            }
        })
      
        const encryption = new ClientEncryption(mongoose.connection.client, {
            keyVaultNamespace,
            kmsProviders,
        });
      
        const key = await encryption.createDataKey('local');
        const base64DataKeyId = key.toString("base64");
        console.log("DataKeyId [base64]: ", base64DataKeyId);
        mongoose.set('debug', true)
    } catch (err) {
        console.log({err})
    }

}

genKey();