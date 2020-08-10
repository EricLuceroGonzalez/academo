const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const surveySchema = new Schema({
  personal: {
    genre: { type: String, required: true },
    ageRange: { type: String, required: true },
  },
  academic: {
    firstSemester: {
      subjects: { type: String, required: true },
      failed: { type: String, required: true },
      approvedPre: { type: Boolean, required: true },
    },
    secondSemester: {
      subjects: { type: String, required: true },
      firstTime: { type: Boolean, required: true },
    },
  },
  homeConnection: {
    conectionType: {
      data: { type: String, required: true },
      wifi: { type: String, required: true },
      mixed: { type: String, required: true },
    },
    equipmentAmount: { type: Number, required: true, default: 0 },
    equipmentUsers: { type: Number, required: true, default: 0 },
  },
  family: {
    students: { type: Number, required: true, default: 0 },
    habitants: { type: Number, required: true, default: 0 },
    telejob: { type: Number, required: true, default: 0 },
    bonosolidario: { type: Boolean, required: true },
    water: { type: Boolean, required: true },
    covid: { type: Boolean, required: true },
  },
});

module.exports = mongoose.model("Survey", surveySchema);
