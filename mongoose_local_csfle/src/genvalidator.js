const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require("fs");
const { ClientEncryption } = require('mongodb-client-encryption');
const { Binary } = require('mongodb');

const MONGO_URI = "mongodb+srv://admin:Manager1@cluster0.gmta9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

let dataKey = "CuoqKbOlScWbVmV2yqNDtA=="

function readMasterKey(path = "../master-key.txt") {
  return fs.readFileSync(path);
}

const genSchema = async () => {
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
      
        const csfleDB = mongoose.connection.useDb(keyDB);
        const csfleCol = csfleDB.collection(keyColl);
        const query_id = new Binary(Buffer.from(dataKey, "base64"), 4)
        const query = {_id: query_id}
        const key_id = await csfleCol.findOne(query)
        const key = key_id._id
        console.log("used key: ", key)      

        console.log('create collection patients')
        await mongoose.connection.createCollection('patients', {
            validator: {
                $jsonSchema: {
              bsonType: "object",
              properties: {
                insurance: {
                  bsonType: "object",
                  properties: {
                    policyNumber: {
                      encrypt: {
                        bsonType: "int",
                        keyId: [key],
                        algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                      },
                    },
                  },
                },
                medicalRecords: {
                  encrypt: {
                    bsonType: "array",
                    keyId: [key],
                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                  },
                },
                bloodType: {
                  encrypt: {
                    bsonType: "string",
                    keyId: [key],
                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                  },
                },
                ssn: {
                  encrypt: {
                    bsonType: "int",
                    keyId: [key],
                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                  },
                },
              },
                }
            }
        });
        mongoose.set('debug', true)
        console.log('MongoDB Connected')
    } catch (err) {
        console.log({err})
    }

}

genSchema();