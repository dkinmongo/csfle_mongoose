const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require("fs");
const { ClientEncryption } = require('mongodb-client-encryption');

const { patientRouter } = require('./routes/patientRouter')

const MONGO_URI = "mongodb+srv://admin:Manager1@cluster0.gmta9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

function readMasterKey(path = "./master-key.txt") {
  return fs.readFileSync(path);
}

const server = async () => {
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

        mongoose.set('debug', true)
        console.log('MongoDB Connected')

        app.use(express.json())
        app.use('/patient', patientRouter)

        app.listen(3000, async () => {
            console.log('server listening on port 3000')
        })

    } catch (err) {
        console.log({err})
    }
}

server();