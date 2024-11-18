const mongoose = require('mongoose');

const drfSchema = new mongoose.Schema({
    creator : {type : String, required: true},
    client: { type: String, required: true },
    project: { type: String, required: true },
    deliverable: { type: String, required: true },
    content: {
        contentLead: { type: String, required: true },
        version: { type: String, required: true },
        pages: { type: String, required: true },
    },
    design: {
        designLead: { type: String, required: true },
        version: { type: String, required: true },
        deliveredBy: { type: String, required: true },
    },
    authorizedBy: { type: String, required: true },
    projectManager: { type: String, required: true },
    completedOn: { type: Date, default: '' },
    drfs: [
        {
            sectionTitle: { type: String, required: true },
            slideTitle: { type: String, required: true },
            transcript: { type: String, required: true },
            notes: { type: String, required: true },
            imgRef: { type: String, default: '' },
        },
    ],
}, {
    timestamps: true
  });

const Drf = mongoose.model('Drf', drfSchema);

module.exports = Drf;
