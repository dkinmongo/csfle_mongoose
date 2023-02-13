const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require("fs");
const { ClientEncryption } = require('mongodb-client-encryption');
const { Binary } = require('mongodb');

const MONGO_URI = "mongodb+srv://admin:Manager1@cluster1.gmta9.mongodb.net/aws?retryWrites=true&w=majority"

const ACCESS_KEY_ID = 'AKIAS6AZE5Y2V5PKTY6F';
const SECRET_ACCESS_KEY = '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';
const KMS_ARN = 'arn:aws:kms:ap-northeast-2:201916214837:key/0e347bfa-3668-4c5c-beb7-cabd0f494697';
const REGION = 'ap-northeast-2';

const genKey = async () => {
    try {
        let kmsProviders = {
          aws: {
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY,
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

        const key = await encryption.createDataKey("aws", {
            masterKey: {
              key: KMS_ARN, // e.g. "arn:aws:kms:us-east-2:111122223333:alias/test-key"
              region: REGION, // e.g. "us-east-2"
            },
         });
         const base64DataKeyId = key.toString("base64");
         console.log("DataKeyId [base64]: ", base64DataKeyId);

        mongoose.set('debug', true)
    } catch (err) {
        console.log({err})
    }

}

genKey();