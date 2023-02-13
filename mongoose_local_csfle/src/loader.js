const fs = require("fs");
const mongoose = require('mongoose')
const { Source_collection } = require('./models/Source_collection')

const MONGO_URI = "mongodb+srv://admin:Manager1@cluster0.gmta9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

function readMasterKey(path = "../master-key.txt") {
    return fs.readFileSync(path);
}
  
const loader = async () => {
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
        // mongoose.set('debug', true)
        const targetDB = mongoose.connection.useDb("test");
        const targetCollection = targetDB.collection("patients");

        var bulk = targetCollection.initializeUnorderedBulkOp()
        var ops = 0

        for await (const doc of Source_collection.find().cursor()) {
            try {
                bulk.insert(doc)
            } catch (err) {
                console.log({err})
            }
            if ((++ops % 1000) === 0){
                bulk.execute();
                console.log(ops +  ' committed dk')
                bulk = targetCollection.initializeUnorderedBulkOp()
            }
        }
       
        if (bulk && bulk.s && bulk.s.currentBatch
            && bulk.s.currentBatch.operations
            && bulk.s.currentBatch.operations.length > 0) {
                console.log(ops +  ' committed final')
                await bulk.execute();
        }
        console.log('Migration Complete!');

    } catch (err) {
        console.log({err})
    }
}

loader();
