const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require("fs");
const { ClientEncryption } = require('mongodb-client-encryption');

const { patientRouter } = require('./routes/patientRouter')

const MONGO_URI = "mongodb+srv://admin:Manager1@cluster1.gmta9.mongodb.net/aws?retryWrites=true&w=majority"

const ACCESS_KEY_ID = 'AKIAS6AZE5Y2V5PKTY6F';
const SECRET_ACCESS_KEY = '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';
const KMS_ARN = 'arn:aws:kms:ap-northeast-2:201916214837:key/0e347bfa-3668-4c5c-beb7-cabd0f494697';
const REGION = 'ap-northeast-2';

const server = async () => {
    try {
        let kmsProviders = {
            aws: {
                accessKeyId: ACCESS_KEY_ID,
                secretAccessKey: SECRET_ACCESS_KEY,
            },     
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