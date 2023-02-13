const { Router } = require('express')
const { isValidObjectId } = require('mongoose')
const patientRouter = Router()
const { Patient } = require('../models/Patient')

// input data
// {
//     "name": "Jon Doe",
//     "ssn": 241014209,
//     "bloodType": "AB+",
//     "medicalRecords": [
//         {
//             "weight": 180,
//             "bloodPressure": "120/80"
//         }
//     ],
//     "insurance": {
//         "provider": "MaestCare",
//         "policyNumber": 123142
//     }
// }
patientRouter.post('/', async (req, res) => {
    try {
        console.log(req.body)
        const { name, ssn, bloodType, medicalRecords, insurance } = req.body
        if (typeof name !== 'string') res.status(400).send({ err: "name(string) is required" })
        if (typeof ssn !== 'number') res.status(400).send({ err: "ssn(number) is required" })
        if (typeof bloodType !== 'string') res.status(400).send({ err: "bloodType(string) is required" })
       
        let patient = new Patient({ ...req.body })
        await patient.save()
        return res.send({patient})
    } catch (err) {
        console.log(err)
        return res.status(500).send({err: err.message})
    }
})

// All Data
patientRouter.get('/', async (req, res) => {
    try {
        const docs = await Patient.find({})
        return res.send({docs})
    } catch (err) {
        console.log(err)
        return res.status(500).send({err: err.message})
    }
})

// fields NOT encrypted 
patientRouter.get('/name/:name', async (req, res) => {
    try {
        const { name } = req.params
        if (typeof name !== 'string') res.status(400).send({ err: "name(string) is required" })
        const patient = await Patient.findOne({ name: name })
        return res.send({patient})
    } catch (err) {
        console.log(err)
        return res.status(500).send({err: err.message})
    }
})

// fields encrypted with the deterministic encryption algorithm
patientRouter.get('/ssn/:ssn', async (req, res) => {
    try {
        let { ssn } = req.params
        ssn = parseInt(ssn)

        if (typeof ssn !== 'number') res.status(400).send({ err: "ssn(number) is required" })
        const patient = await Patient.findOne({ ssn: ssn })
        return res.send({patient})
    } catch (err) {
        console.log(err)
        return res.status(500).send({err: err.message})
    }
})


// fields encrypted with the randomized encryption algorithm
patientRouter.get('/bloodType/:bloodType', async (req, res) => {
    try {
        const { bloodType } = req.params
        if (typeof bloodType !== 'string') res.status(400).send({ err: "bloodType(string) is required" })
        const patient = await Patient.findOne({ bloodType: bloodType })
        return res.send({patient})
    } catch (err) {
        console.log(err)
        return res.status(500).send({err: err.message})
    }
})

patientRouter.put('/name/:name', async (req, res) => {
    try {
        const { name } = req.params
        if (typeof name !== 'string') res.status(400).send({ err: "name(string) is required" })
        const { bloodType, ssn } = req.body
        if (typeof bloodType !== 'string') res.status(400).send({ err: "bloodType(string) is required" })
        if (typeof ssn !== 'number') res.status(400).send({ err: "ssn(number) is required" })

        const patient = await Patient.findOneAndUpdate({ name: name }, { $set: { bloodType: bloodType, ssn: ssn } }, { new: true })
        return res.send({patient})
    } catch (err) {
        console.log(err)
        return res.status(500).send({err: err.message})
    }
})

module.exports = { patientRouter }