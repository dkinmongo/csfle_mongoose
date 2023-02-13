const { Types } = require('mongoose')
const { Schema, model } = require('mongoose')

const PatientSchema = new Schema({
        name: { type: String, required: true },
        ssn: { type: Number, required: true },
        bloodType: { type: String, required: true },
        medicalRecords: [{weight: Number, bloodPressure: String}],
        insurance: { provider: String, policyNumber: Number }
    }, { timestamps: true }
)

const Patient = model('patient', PatientSchema)

module.exports = { Patient }

