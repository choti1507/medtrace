const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema(
  {
    medicineId: { type: String, required: true, trim: true },
    scanTimestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, default: "127.0.0.1" },
    city: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    scanResult: {
      type: String,
      enum: ["genuine", "suspicious", "counterfeit"],
      required: true,
    },
    proofsPassed: { type: Number, min: 0, max: 4, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ScanLog || mongoose.model("ScanLog", scanLogSchema);
